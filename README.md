# Seashell

Espiral interactiva de cambios y hallazgos de SCuLPTER, con una bitácora para registrar el estudio de visión por computador. Los hitos se leen desde el centro hacia afuera y se pueden explorar por área, búsqueda y relevancia.

## Abrir

```sh
python3 -m http.server 8768
```

Abre `http://localhost:8768`. El proyecto es estático y no requiere instalar dependencias.

`npm run build` prepara `dist/` para Sites.

## Organización

- `index.html`: estructura de la vista.
- `src/tokens.css`: colores, tipografía y escalas del sistema visual.
- `src/styles.css`: composición, estados y diseño adaptable.
- `src/data.js`: hitos y vínculos a su evidencia.
- `src/app.js`: geometría de la espiral, filtros, búsqueda, ampliación y navegación.
- `src/journal-data.js`: referencias de la playlist de OpenCV vinculadas a hitos.
- `src/journal.js`: edición, guardado, importación y exportación de la bitácora.
- `tests/data.test.mjs`: integridad básica del registro.
- `tests/journal.test.mjs`: integridad de las referencias de la bitácora.
- `scripts/build.mjs`: prepara la versión estática publicada.

## Añadir un hito

Agrega un objeto al arreglo `events` de `src/data.js`, manteniendo el orden cronológico. Cada hito necesita un identificador único, fecha, área, estado, título, resumen, cambio, relevancia de 1 a 5 con justificación y al menos una fuente. Usa `built` para implementación, `tested` solo cuando hay verificación de software y `pending` para una validación física sin cerrar.

El tamaño de cada punto expresa relevancia editorial. El grosor del tramo se calcula con el número de archivos modificados en el commit asociado. Si un hito comparte commit con otro, `fileScope` delimita el recuento a una carpeta. Si no hay commit cerrado, `filesChanged` debe ser `null` y el tramo aparece discontinuo. Ni relevancia ni tamaño del diff equivalen a validación física.

## Bitácora

La bitácora incluye una selección de videos de la playlist de Kevin Wood y preguntas de investigación para SCuLPTER. Las preguntas son propuestas de estudio; no representan resultados verificados de los videos ni del montaje.

Las notas y páginas nuevas se guardan en el almacenamiento local del navegador. No se sincronizan entre equipos ni se incorporan al repositorio. Usa **Exportar** para descargar una copia JSON e **Importar** para recuperarla en otro navegador. La importación reemplaza las notas existentes después de pedir confirmación.

## Verificar

```sh
npm test
```

Este atlas es una curaduría inicial. No reemplaza un registro completo de sesiones experimentales, capturas de cámaras, datasets etiquetados o mediciones físicas.
