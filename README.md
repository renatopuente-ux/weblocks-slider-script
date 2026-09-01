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
