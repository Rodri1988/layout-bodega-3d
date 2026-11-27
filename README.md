# Layout 3D de bodega

Visor 3D con recorrido por los pasillos y un modo de prueba de inventario.

## Cómo abrirlo

Abre `index.html` en el navegador, manteniendo las carpetas `css` y `js` a su lado.
Se necesita internet, porque Three.js, Tailwind, el lector de Excel y la fuente se cargan desde la web.

## Estructura

| Archivo | Contenido |
|---|---|
| `index.html` | Estructura de la pantalla y carga de archivos |
| `css/styles.css` | Estilos |
| `js/base/estado.js` | Variables globales, capas, vistas de cámara y materiales |
| `js/base/ayudantes.js` | Extintores, textos y etiquetas |
| `js/escena/modulo-rack.js` | Cómo se dibuja un módulo de rack |
| `js/escena/piso-muros.js` | Piso y muros perimetrales |
| `js/escena/racks.js` | Posición de los racks y pasillos |
| `js/escena/zonas.js` | Bodega 70 y zonas especiales |
| `js/escena/segundo-piso.js` | Segundo piso (Bodega 29 y oficina) |
| `js/escena/pasillos-extintores.js` | Rótulos de pasillos, medidas y extintores |
| `js/escena/detalle-fotos.js` | Portón de entrada, escalera, fachada y zona de trabajo |
| `js/escena/sector-bano.js` | Baño, losa superior, pilares y pared del fondo |
| `js/ui/interfaz.js` | Botones, vistas, selección y ficha del elemento |
| `js/recorrido/movimiento.js` | Colisiones y alturas al caminar |
| `js/recorrido/senaletica.js` | Placas visibles al caminar |
| `js/recorrido/recorrido-automatico.js` | Puntos de salto y recorrido automático |
| `js/recorrido/modo-caminar.js` | Entrar y salir del modo caminar, ubicación actual |
| `js/recorrido/minimapa.js` | Minimapa |
| `js/recorrido/controles.js` | Teclado, joystick y actualización por cuadro |
| `js/inventario/lector-excel.js` | Lee el Excel y relaciona códigos con el 3D (modo prueba) |
| `js/inventario/panel-inventario.js` | Panel de inventario, colores y búsqueda (modo prueba) |
| `js/inventario/hileras-vacias.js` | Flechas en las hileras sin productos |
| `js/inventario/posiciones-libres.js` | Espacios libres por nivel para ubicar pallets nuevos |
| `js/main.js` | Arranque: crea la escena e inicia la animación. Se carga al final |

## Reglas para editar

- Los scripts comparten el mismo espacio global. No cambies su orden en `index.html`.
- `js/main.js` va siempre al final.
- Después de cada cambio, recarga la página y revisa la consola (F12).

## Datos

No subas archivos de stock. El `.gitignore` excluye Excel y CSV cuando se usa Git; la carga manual desde la web de GitHub no aplica esa exclusión.
El Excel del modo de prueba se lee en el navegador.
