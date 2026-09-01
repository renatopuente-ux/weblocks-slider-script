# Slider Swiper — script hospedado

Script de inicialización de un carrusel Swiper, generado con Weblocks y hospedado aquí para poder
llamarlo por URL desde cualquier proyecto.

**Demo:** https://renatopuente-ux.github.io/weblocks-slider-script/

## URL para usar

```html
<script src="https://renatopuente-ux.github.io/weblocks-slider-script/slider.js"></script>
```

Vía jsDelivr (CDN con caché, y permite fijar la versión por commit o tag):

```html
<script src="https://cdn.jsdelivr.net/gh/renatopuente-ux/weblocks-slider-script@main/slider.js"></script>
```

## Orden de carga — importa

El script hace `$(document).ready(...)` y llama a `new Swiper(...)`, así que **jQuery y Swiper
tienen que estar cargados antes**.

```html
<!-- 1 · Swiper -->
<link rel="stylesheet" href="https://renatopuente-ux.github.io/swiper-selfhosted/dist/swiper-bundle.min.css">
<script src="https://renatopuente-ux.github.io/swiper-selfhosted/dist/swiper-bundle.min.js"></script>

<!-- 2 · jQuery -->
<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>

<!-- 3 · este script -->
<script src="https://renatopuente-ux.github.io/weblocks-slider-script/slider.js"></script>
```

> El comentario original del archivo apunta a `unpkg.com/swiper/…` **sin versión fijada**, lo que
> resuelve siempre a la última. Un salto de versión mayor de Swiper puede romper el slider sin que
> toques nada. Arriba se usa el mirror propio, que está pinneado en 14.2.0.

## Markup que espera

El script **no usa los nombres de clase de Swiper**, los redefine. Si tu HTML no coincide
exactamente con estos, el slider no arranca.

| Clase | Rol | Equivalente en Swiper |
|---|---|---|
| `.slider-wrapper` | Raíz del slider | `.swiper` |
| `.slider-list` | Contenedor de slides (`wrapperClass`) | `.swiper-wrapper` |
| `.slider-item` | Cada slide (`slideClass`) | `.swiper-slide` |
| `.next-slide` / `.prev-slide` | Botones de navegación | — |
| `.pagination` | Contenedor de los bullets | — |
| `.slide-image` | Dentro del slide: escala a 1.1 en hover | — |
| `.slide-content` | Dentro del slide: baja a 0.8 de opacidad en hover | — |

Estructura mínima:

```html
<div class="slider-wrapper">
  <div class="slider-list">
    <div class="slider-item">
      <div class="slide-image"></div>
      <div class="slide-content">…</div>
    </div>
  </div>
  <button class="prev-slide"></button>
  <button class="next-slide"></button>
  <div class="pagination"></div>
</div>
```

## Configuración

Bucle infinito, autoplay cada 3 s que **no se detiene al interactuar**, transición de 700 ms,
`slidesPerView: 'auto'` y paginación de bullets clicables.

**`slidesPerView: 'auto'` significa que cada slide necesita su propio ancho por CSS.** Sin un
`width` en `.slider-item`, los slides colapsan y el carrusel no se ve.

### Efecto: las tarjetas se superponen

Desde el 1 de septiembre de 2026 el carrusel usa `effect: 'creative'` en vez del desplazamiento
lateral por defecto. Todas las tarjetas ocupan la misma posición y la que sale se retira hacia la
izquierda **por encima**, descubriendo la que ya estaba esperando debajo. Como una carta que se
saca de un mazo. La tira ya no se desplaza en bloque.

```js
effect: 'creative',
creativeEffect: {
  perspective: false,
  prev: { translate: ['-100%', 0, 0] },
  next: { translate: [0, 0, 0] },
},
```

**El script gestiona el `z-index` a mano, y no es opcional.** Swiper siempre pone arriba al slide
*activo*, y lo asigna al arrancar la transición con los valores finales — el `z-index` no se
anima. Es decir: el entrante queda encima desde el primer frame, tapa por completo al saliente que
se retira por debajo, y lo que se ve es un corte seco en vez de una superposición. Por eso, al
avanzar, el script sube el `z-index` del saliente en `slideNextTransitionStart` y lo limpia en
`slideChangeTransitionEnd`. Al retroceder no hace falta: el que se mueve es el entrante, que ya
viene arriba de serie.

`perspective: false` a propósito. Con `true`, Swiper añade la clase `swiper-3d` al carrusel, pero
la regla que la acompaña (`.swiper-3d .swiper-wrapper { transform-style: preserve-3d }`) apunta a
`.swiper-wrapper`, y aquí el contenedor se llama `.slider-list`. Nunca matchea, así que la
perspectiva quedaría a medias y cualquier rotación se vería aplastada.

### Por qué no es un fundido cruzado

`effect: 'fade'` se ve mejor, pero **rompe el layout en móvil**. Swiper fuerza `slidesPerView: 1`
cuando el efecto es fade, y con un valor numérico `updateSlides` deja de *leer* el ancho de cada
slide y pasa a *escribirlo* en píxeles, copiando el del carrusel.

En escritorio no se nota, porque la columna del hero mide 680 px fijos. En móvil el carrusel no
tiene ancho propio: lo hereda de su contenido. Entonces se realimenta — Swiper mide, escribe, el
contenedor crece, el `ResizeObserver` dispara, Swiper vuelve a medir más grande. Medido en el
sitio real a 390 px: scroll horizontal de **33 554 432 px**, el tope de layout de Chromium, y el
hero en blanco.

`creative` es el único efecto de superposición que respeta `slidesPerView: 'auto'`: no escribe
anchos, no hay realimentación, y el apilado lo resuelve el `z-index` que el propio efecto asigna.
Verificado a 390 y a 1440 px: desborde 0.

### El script fuerza `position: relative` en `.slider-wrapper`

Swiper mide el offset de cada slide contra su `offsetParent`, no contra el carrusel. Si
`.slider-wrapper` queda en `position: static` —lo normal en una Collection List de Webflow— el
`offsetParent` acaba siendo el `<body>`, todos los offsets llegan corridos por la distancia del
carrusel al borde de la página y el cálculo de progreso queda desfasado un slide entero: el
efecto aplica el translate de `prev` a todos los slides y el activo se renderiza fuera del
`overflow: hidden`. Resultado medido en el sitio: `transform: -720px` en el slide activo con el
carrusel a 720 px del borde, hero en blanco.

Por eso el script pone `position: relative` en el carrusel antes de instanciar Swiper, y solo si
estaba en `static`. No afecta a los controles: en el markup de Weblocks las flechas viven en su
propio contenedor.

### La regla de CSS que el script tiene que inyectar

Swiper trae en su hoja `.swiper-creative .swiper-slide { transition-property: transform, opacity,
height }`, pero apunta a `.swiper-slide` y aquí el slide se llama `.slider-item`. No matchea.

Sin esa regla los slides se quedan en `transition-property: all`, y como `setTransition` les
escribe `transition-duration: 700ms` en línea, **todo** se anima. Cuando el modo bucle reordena el
DOM y cambian los offsets, ese salto se anima como un deslizamiento lateral: exactamente lo que se
quería quitar. Por eso el script inyecta `.slider-item { transition-property: transform, opacity }`
en su callback `init`, junto a los estilos que ya inyectaba.

Es el mismo problema en el resto de la hoja de Swiper: el script renombra `.swiper` → `.slider-wrapper`,
`.swiper-wrapper` → `.slider-list` y `.swiper-slide` → `.slider-item`, así que **ninguna regla de
Swiper que apunte a esas tres clases se aplica**. Las que usan clases de estado
(`.swiper-slide-active`, `.swiper-pagination-bullet`) sí, porque esas no se renombran.

## Observaciones

El archivo está **sin modificar**, tal como lo genera Weblocks. Estas notas son para que no
sorprendan, no correcciones aplicadas.

1. **Inyecta seis elementos `<style>` en el `<head>`** dentro del callback `init`, uno por regla.
   Funciona, pero si el slider se destruye y se reinicializa —por ejemplo al cambiar de breakpoint—
   los estilos se duplican. Un solo bloque CSS en la hoja del proyecto haría lo mismo sin ensuciar
   el head.
2. **`mouseover` / `mouseout` en vez de `mouseenter` / `mouseleave`.** Los primeros burbujean: al
   mover el cursor entre los hijos del slide el efecto se vuelve a disparar. Con cinco slides no se
   nota; con contenido anidado, sí.
3. **El hover se resuelve con estilos inline por JavaScript** aunque el script ya inyecta las
   transiciones. Un par de reglas `:hover` en CSS haría lo mismo, sin jQuery y sin tocar el DOM.
4. **Regla muerta:** inyecta `font-size` para `.swiper-pagination-fraction`, pero la paginación
   está configurada como `bullets`, así que ese elemento nunca existe.
5. **La variable `slider_wrapper` no se usa.** Si en algún momento necesitas controlar el slider
   desde fuera, la instancia también queda accesible en `document.querySelector('.slider-wrapper').swiper`.

Si en algún momento quieres una versión limpia con esos puntos resueltos y el mismo comportamiento,
se puede agregar como archivo aparte sin tocar este.
