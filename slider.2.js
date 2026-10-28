// add library before code <link rel="stylesheet"
// href="https://unpkg.com/swiper/swiper-bundle.min.css" /> <script
// src="https://unpkg.com/swiper/swiper-bundle.min.js"></script>
//
// ─────────────────────────────────────────────────────────────────────────────
// v2 (2026-10-28): same look and timing as slider.js (4000 ms on each card, 700 ms
// transition, keeps going after the visitor touches it), cheaper to run:
//  - Swiper's Autoplay module is gone. In Swiper 14 it asks for a new animation
//    frame on every frame only to emit 'autoplayTimeLeft', which nothing here
//    listens to: ~60 requestAnimationFrame per second for as long as the page is
//    open. A setTimeout re-armed at the end of every transition does the same job.
//  - The timer stops while the carousel is off screen (IntersectionObserver) or the
//    tab is hidden, and does not run at all with prefers-reduced-motion.
//  - Removed the pagination block and the styles/handlers for .swiper-pagination-*,
//    .slide-image and .slide-content: none of those elements exist on the site.
//
// EFECTO: las tarjetas se SUPERPONEN en vez de empujarse en bloque.
//
// Antes usaba el efecto por defecto ('slide'): toda la tira se desplazaba
// lateralmente y las tarjetas se empujaban unas a otras. Ahora ocupan todas la
// misma posicion y la que sale se retira hacia la izquierda por encima,
// descubriendo la que ya estaba esperando debajo. Como una carta que se saca
// de un mazo.
//
// Hace falta gestionar el z-index a mano. Swiper siempre pone arriba al slide
// ACTIVO, y lo asigna al arrancar la transicion con los valores finales (el
// z-index no se anima). O sea: el entrante queda encima desde el primer frame,
// tapa por completo al saliente que se retira por debajo, y lo que se ve es un
// corte seco. Por eso, al avanzar, el script sube el z-index del saliente solo
// mientras dura la transicion (slideNextTransitionStart) y lo suelta al
// terminar. Al retroceder no hace falta: el que se mueve es el entrante, que
// ya viene arriba de serie.
//
// ── Por que 'creative' y no 'fade' ───────────────────────────────────────────
// El fundido cruzado ('effect: fade') se ve muy bien, pero AQUI NO SE PUEDE
// USAR. Swiper fuerza slidesPerView a 1 cuando el efecto es fade, y con un
// slidesPerView numerico updateSlides deja de leer el ancho de cada slide y
// pasa a ESCRIBIRLO en linea, en pixeles, copiando el ancho del carrusel.
// En escritorio no pasa nada porque la columna del hero mide 680px fijos. En
// movil el carrusel no tiene ancho propio: lo hereda de su contenido. Entonces
// Swiper mide, escribe, el contenedor crece, el ResizeObserver dispara, Swiper
// vuelve a medir mas grande... y el bucle se come el layout hasta el tope de
// Chromium (33.554.432 px). Medido en el sitio: scroll horizontal de 33 millones
// de pixeles a 390px de ancho.
//
// 'creative' es el unico efecto de superposicion que respeta slidesPerView
// 'auto': no escribe anchos, no hay realimentacion, y el apilado lo resuelve el
// z-index que el propio efecto asigna. Verificado a 390 y a 1440: desborde 0.
//
// perspective:false a proposito. Con true, Swiper anade la clase 'swiper-3d' al
// carrusel, pero la regla que necesita ('.swiper-3d .swiper-wrapper' con
// transform-style:preserve-3d) apunta a .swiper-wrapper y aqui el contenedor se
// llama .slider-list, asi que nunca matchea. La perspectiva quedaria a medias.
// ─────────────────────────────────────────────────────────────────────────────
$(document).ready(function () {

      // OBLIGATORIO para cualquier efecto de superposicion. Swiper mide el
      // offset de cada slide contra su offsetParent, no contra el carrusel.
      // Si .slider-wrapper esta en position:static (lo normal en una
      // Collection List de Webflow), el offsetParent acaba siendo el <body> y
      // todos los offsets llegan corridos por la distancia del carrusel al
      // borde de la pagina. El calculo de progreso queda desfasado un slide
      // entero, el efecto aplica el translate de 'prev' a todos, y el activo
      // se renderiza fuera del overflow:hidden: hero en blanco. Medido en el
      // sitio: transform -720px en el slide activo, con el carrusel a 720px
      // del borde. Con position:relative el offsetParent es el carrusel y
      // todo vuelve a 0. Solo se toca si estaba en static.
      document.querySelectorAll('.slider-wrapper').forEach(function (el) {
        if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
      });

      // Autoplay: 4000 ms (antes 3000): cada tarjeta queda 1 s mas, a pedido del usuario (2026-10-15).
      var DELAY = 4000, SPEED = 700;
      var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var onScreen = false, timer = 0, swiper = null;
      function stop() { clearTimeout(timer); timer = 0; }
      function arm() {
        stop();
        if (reduced || !onScreen || document.hidden || !swiper || swiper.destroyed) return;
        timer = setTimeout(function () { swiper.slideNext(SPEED); }, DELAY);
      }

      swiper = new Swiper(".slider-wrapper", {
          wrapperClass: "slider-list",
      slideClass: "slider-item",
      navigation: {
        nextEl: '.next-slide',
        prevEl: '.prev-slide'
      },
  speed: SPEED,
  slidesPerView: 'auto',
  loop: true,

  effect: 'creative',
  creativeEffect: {
    perspective: false,
    prev: { translate: ['-100%', 0, 0] },
    next: { translate: [0, 0, 0] },
  },

        on: {
          // Al avanzar, el saliente tiene que quedar POR ENCIMA del entrante
          // mientras se retira; si no, el entrante (que Swiper pone arriba) lo
          // tapa desde el primer frame y la transicion se ve como un corte.
          slideNextTransitionStart: function () {
            var saliente = this.slides[this.previousIndex];
            if (saliente) saliente.style.zIndex = this.slides.length + 1;
          },
          slideChangeTransitionEnd: function () {
            // Swiper reasigna su propio z-index en el siguiente setTranslate,
            // pero se limpia igualmente por si la proxima interaccion tarda.
            for (var i = 0; i < this.slides.length; i++) {
              if (+this.slides[i].style.zIndex > this.slides.length) {
                this.slides[i].style.zIndex = '';
              }
            }
            // Next card after the full delay, also after arrows or a swipe
            // (same as disableOnInteraction:false).
            arm();
          },
          // A finger on the carousel holds it; letting go restarts the delay.
          touchStart: stop,
          touchEnd: arm,
          init: function () {
              // Esta regla la trae Swiper en su hoja como
              // '.swiper-creative .swiper-slide{transition-property:transform,opacity,height}',
              // pero apunta a .swiper-slide y aqui el slide se llama .slider-item,
              // asi que no matchea. Sin ella los slides se quedan en
              // 'transition-property:all', y como setTransition les escribe
              // transition-duration:700ms en linea, TODO se anima. Cuando el modo
              // bucle reordena el DOM y cambian los offsets, ese salto se anima
              // como un deslizamiento lateral: exactamente lo que se queria quitar.
              var slider_item_transitionwe_style = document.createElement('style'); slider_item_transitionwe_style.type = 'text/css'; slider_item_transitionwe_style.innerHTML =
      ` .slider-item{   transition-property:transform,opacity;
   } `;
      document.getElementsByTagName('head')[0].appendChild(slider_item_transitionwe_style);
          },
        },
      });

      var el = document.querySelector('.slider-wrapper');
      if (el && 'IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          onScreen = entries[entries.length - 1].isIntersecting;
          if (onScreen) { if (!timer) arm(); } else stop();
        }).observe(el);
      } else {
        onScreen = true; arm();
      }
      document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else arm(); });
    });
