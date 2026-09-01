// add library before code <link rel="stylesheet"
// href="https://renatopuente-ux.github.io/swiper-selfhosted/dist/swiper-bundle.min.css" /> <script
// src="https://renatopuente-ux.github.io/swiper-selfhosted/dist/swiper-bundle.min.js"></script>
//
// ─────────────────────────────────────────────────────────────────────────────
// EFECTO: los slides se SUPERPONEN en vez de empujarse en bloque.
//
// Antes usaba el efecto por defecto ('slide'): toda la tira se desplazaba
// lateralmente. Ahora las tarjetas ocupan la misma posicion y se cruzan por
// opacidad, asi que la nueva aparece encima de la anterior.
//
// Dos cambios, y solo dos:
//   1. effect + fadeEffect  → el fundido cruzado.
//   2. slidesPerView: 1     → OBLIGATORIO. El efecto 'fade' no funciona con
//      'auto'; necesita saber que hay exactamente un slide por vista. No cambia
//      nada visualmente porque cada tarjeta ya medía el ancho del contenedor.
//
// crossFade:true importa. Sin el, la tarjeta saliente se queda opaca debajo
// mientras la entrante aparece, y en el cruce se ve un parpadeo.
//
// ── ALTERNATIVA: que una se deslice POR ENCIMA de la otra ────────────────────
// Si prefieres que la tarjeta saliente se retire hacia la izquierda descubriendo
// la siguiente, como una carta que sale de un mazo, sustituye las dos lineas de
// 'effect' y 'fadeEffect' por estas:
//
//   effect: 'creative',
//   creativeEffect: {
//     prev: { translate: ['-100%', 0, 0] },
//     next: { translate: [0, 0, -1], opacity: 1 },
//   },
//
// Va en ese orden a proposito: Swiper asigna el z-index segun el progreso y el
// slide activo siempre queda arriba, asi que el que se mueve tiene que ser el
// saliente. Al reves, el entrante pasaria por debajo y no se leeria la
// superposicion.
// ─────────────────────────────────────────────────────────────────────────────
$(document).ready(function () {

      // El fundido apila los slides restandoles su propio offsetLeft. Y
      // offsetLeft se mide contra el offsetParent, no contra el carrusel: si
      // .slider-wrapper es 'static', el offsetParent acaba siendo el <body> y
      // cada slide se desplaza tantos pixeles a la izquierda como diste del
      // borde de la pagina. Con overflow:hidden encima, la tarjeta desaparece.
      // Con position:relative el carrusel pasa a ser el offsetParent, el
      // offset vuelve a 0 y las tarjetas se apilan donde deben.
      // Solo se toca si estaba en 'static', para no pisar ningun layout.
      document.querySelectorAll('.slider-wrapper').forEach(function (el) {
        if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
      });

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
  slidesPerView: 1,
  loop: true,

  effect: 'fade',
  fadeEffect: {
    crossFade: true,
  },

        on: {
          init: function () {
              var swiper_pagination_bulletwe_style = document.createElement('style'); swiper_pagination_bulletwe_style.type = 'text/css'; swiper_pagination_bulletwe_style.innerHTML =
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
