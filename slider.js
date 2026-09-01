// add library before code <link rel="stylesheet"
// href="https://unpkg.com/swiper/swiper-bundle.min.css" /> <script
// src="https://unpkg.com/swiper/swiper-bundle.min.js"></script>
//
// ─────────────────────────────────────────────────────────────────────────────
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
      var slider_wrapper = new Swiper(".slider-wrapper", {
          wrapperClass: "slider-list",
      slideClass: "slider-item",
      navigation: {
        nextEl: '.next-slide',
        prevEl: '.prev-slide'
      },
      pagination: {
          type: 'bullets',
    el: '.pagination',
    clickable: true,

      },
  autoplay: {
          delay: 3000,
    disableOnInteraction: false,

      },
  speed: 700,
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
          },
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
      document.getElementsByTagName('head')[0].appendChild(slider_item_transitionwe_style);var swiper_pagination_bulletwe_style = document.createElement('style'); swiper_pagination_bulletwe_style.type = 'text/css'; swiper_pagination_bulletwe_style.innerHTML =
      ` .swiper-pagination-bullet{   background:#fff;
    margin-right:8px;
    transition:.2s;
   } `;
      document.getElementsByTagName('head')[0].appendChild(swiper_pagination_bulletwe_style);var swiper_pagination_bullethoverwe_style = document.createElement('style'); swiper_pagination_bullethoverwe_style.type = 'text/css'; swiper_pagination_bullethoverwe_style.innerHTML =
      ` .swiper-pagination-bullet:hover{   opacity:.7;
   } `;
      document.getElementsByTagName('head')[0].appendChild(swiper_pagination_bullethoverwe_style);var swiper_pagination_bullet_activehoverwe_style = document.createElement('style'); swiper_pagination_bullet_activehoverwe_style.type = 'text/css'; swiper_pagination_bullet_activehoverwe_style.innerHTML =
      ` .swiper-pagination-bullet-active:hover{   opacity:1;
   } `;
      document.getElementsByTagName('head')[0].appendChild(swiper_pagination_bullet_activehoverwe_style);var swiper_pagination_fractionwe_style = document.createElement('style'); swiper_pagination_fractionwe_style.type = 'text/css'; swiper_pagination_fractionwe_style.innerHTML =
      ` .swiper-pagination-fraction{   font-size:16px;
   } `;
      document.getElementsByTagName('head')[0].appendChild(swiper_pagination_fractionwe_style);var slide_imagewe_style = document.createElement('style'); slide_imagewe_style.type = 'text/css'; slide_imagewe_style.innerHTML =
      ` .slide-image{   transition:transform .2s;
   } `;
      document.getElementsByTagName('head')[0].appendChild(slide_imagewe_style);var slide_contentwe_style = document.createElement('style'); slide_contentwe_style.type = 'text/css'; slide_contentwe_style.innerHTML =
      ` .slide-content{   transition:opacity .2s;
   } `;
      document.getElementsByTagName('head')[0].appendChild(slide_contentwe_style);$('.slider-item').on('mouseover',function() {
    $(this).find('.slide-image').css({
      'transform':'scale(1.1)',
    });
    $(this).find('.slide-content').css({
      'opacity':'.8',
    });
  });
  $('.slider-item').on('mouseout',function() {
    $(this).find('.slide-image').css({
      'transform':'scale(1)',
    });
    $(this).find('.slide-content').css({
      'opacity':'1',
    });
  });

          },
        },
      });
    });
