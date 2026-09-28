export const categories = [
  { id: 'all', label: 'Todos' },
  { id: 'language', label: 'Lenguaje' },
  { id: 'vision', label: 'Visión' },
  { id: 'interface', label: 'Interfaz' },
  { id: 'finding', label: 'Hallazgos' }
];

export const categoryNames = {
  language: 'Lenguaje',
  vision: 'Visión',
  interface: 'Interfaz',
  finding: 'Hallazgo'
};

export const stateNames = {
  built: 'Construido',
  tested: 'Verificado en software',
  pending: 'Pendiente en físico'
};

const commit = (hash) => ({ label: `Commit ${hash}`, href: `https://github.com/FLAGlab/SCuLPTER/commit/${hash}` });
const file = (path) => ({ label: path, href: `https://github.com/FLAGlab/SCuLPTER/blob/main/${path}` });

export const events = [
  {
    id: 'language-semantics',
    date: '2025-05-21',
    category: 'language',
    state: 'tested',
    impact: 5,
    impactReason: 'Define reglas que condicionan toda ejecución del lenguaje.',
    filesChanged: 2,
    title: 'El lenguaje fija sus reglas',
    summary: 'La semántica de CMP y del operador de pregunta se corrige para valores negativos.',
    change: 'El intérprete Scala establece el comportamiento que el prototipo visual debe consultar al ejecutar programas.',
    sources: [commit('d027a1e'), commit('338a616')]
  },
  {
    id: 'first-vision',
    date: '2026-08-31',
    category: 'vision',
    state: 'built',
    impact: 4,
    impactReason: 'Abre una nueva capa de lectura física del programa.',
    filesChanged: 29,
    title: 'La visión entra al proyecto',
    summary: 'Comienza el prototipo para leer bloques y relacionar la captura con el intérprete.',
    change: 'Aparece una primera ruta de reconocimiento visual. Su existencia en código todavía no demuestra una lectura física completa.',
    sources: [commit('77ed529')]
  },
  {
    id: 'calibration',
    date: '2026-09-01',
    category: 'vision',
    state: 'tested',
    impact: 4,
    impactReason: 'La geometría común es necesaria para combinar cámaras.',
    filesChanged: 3,
    title: 'Dos vistas, un espacio',
    summary: 'La calibración y la triangulación reúnen observaciones de dos cámaras en puntos 3D.',
    change: 'El prototipo obtiene una base geométrica para asociar observaciones. La calibración con el montaje real sigue pendiente.',
    sources: [commit('080b322')]
  },
  {
    id: 'adjacency',
    date: '2026-09-02',
    category: 'vision',
    state: 'tested',
    impact: 5,
    impactReason: 'Conecta posiciones físicas con estructura de programa.',
    filesChanged: 11,
    title: 'La posición se vuelve programa',
    summary: 'Los puntos 3D se organizan en relaciones de adyacencia entre bloques.',
    change: 'La geometría deja de ser solo una nube de puntos y pasa a proponer una estructura de instrucciones.',
    sources: [commit('e34547d')]
  },
  {
    id: 'operation-capture',
    date: '2026-09-09',
    category: 'vision',
    state: 'built',
    impact: 2,
    impactReason: 'Añade una herramienta local para preparar el reconocimiento.',
    filesChanged: 3,
    title: 'Las fichas ganan identidad',
    summary: 'Se incorporan herramientas para capturar referencias de operaciones.',
    change: 'El reconocimiento puede apoyarse en fotografías de símbolos concretos en lugar de depender solo de formas genéricas.',
    sources: [commit('1a3cceb')]
  },
  {
    id: 'references',
    date: '2026-09-13',
    category: 'vision',
    state: 'built',
    impact: 3,
    impactReason: 'Amplía la capacidad del clasificador, aún sin cubrir el vocabulario.',
    filesChanged: 2,
    title: 'Un vocabulario visual inicial',
    summary: 'Se agregan referencias fotográficas para parte del catálogo de símbolos.',
    change: 'El conjunto de plantillas sigue incompleto para leer todos los parámetros y operaciones de un programa físico.',
    sources: [commit('5896848'), file('vision-prototype/simbolos.json')]
  },
  {
    id: 'parameters',
    date: '2026-09-13',
    category: 'vision',
    state: 'tested',
    impact: 4,
    impactReason: 'Afecta la reconstrucción de instrucciones con parámetros y ciclos.',
    filesChanged: 8,
    title: 'Parámetros, sentido y ciclos',
    summary: 'La reconstrucción vincula parámetros con bloques y resuelve la dirección de lectura.',
    change: 'Las cadenas físicas pueden incluir giros y bucles. El algoritmo incorpora reglas para interpretarlos.',
    sources: [commit('0b983d2')]
  },
  {
    id: 'dataset-tool',
    date: '2026-09-13',
    category: 'vision',
    state: 'built',
    impact: 3,
    impactReason: 'Permite medir el reconocimiento con datos etiquetados.',
    filesChanged: 11,
    title: 'Medir el reconocimiento',
    summary: 'Se añade una herramienta para evaluar imágenes etiquetadas.',
    change: 'Existe el mecanismo para medir aciertos y errores. Hace falta un dataset físico suficiente para obtener cifras de desempeño.',
    sources: [commit('0479c57'), file('vision-prototype/herramientas/evaluar_dataset.py')]
  },
  {
    id: 'architecture',
    date: '2026-09-14',
    category: 'finding',
    state: 'built',
    impact: 2,
    impactReason: 'Hace trazables decisiones técnicas sin cambiar la ejecución.',
    filesChanged: 5,
    title: 'La arquitectura se hace visible',
    summary: 'Un informe y diagramas ordenan las decisiones del prototipo.',
    change: 'El proyecto empieza a registrar su razonamiento además de su implementación, algo importante para la tesis.',
    sources: [commit('c386b83')]
  },
  {
    id: 'unread-tile',
    date: '2026-09-26',
    category: 'finding',
    state: 'tested',
    impact: 4,
    impactReason: 'Evita confirmar programas que omiten fichas inciertas.',
    filesChanged: 42,
    title: 'Una ficha incierta no desaparece',
    summary: 'La lectura incompleta se conserva como incertidumbre en el programa candidato.',
    change: 'Se evita que una ficha sin símbolo reconocido produzca silenciosamente un programa diferente al construido.',
    sources: [commit('451080a')]
  },
  {
    id: 'multicamera',
    date: '2026-09-27',
    category: 'vision',
    state: 'tested',
    impact: 5,
    impactReason: 'Integra observaciones parciales de varias cámaras en un estado.',
    filesChanged: 6,
    fileScope: 'plataforma/',
    title: 'Las cámaras aportan a un estado común',
    summary: 'La fusión multicámara reúne observaciones antes de aceptar un programa.',
    change: 'Una vista puede aportar geometría y otra un símbolo visible. La corroboración física entre vistas aún debe medirse.',
    sources: [commit('e519d67'), file('vision-prototype/plataforma/fusion.py')]
  },
  {
    id: 'interactive-ide',
    date: '2026-09-27',
    category: 'interface',
    state: 'tested',
    impact: 4,
    impactReason: 'Permite explorar y ejecutar programas construidos con bloques.',
    filesChanged: 27,
    fileScope: 'simulador_3d/',
    title: 'El programa se puede tocar',
    summary: 'El simulador y la mesa 3D permiten montar ejemplos y explorar su ejecución.',
    change: 'La interfaz combina bloques, reconstrucción de texto y visualización del comportamiento del programa.',
    sources: [commit('e519d67'), file('vision-prototype/simulador_3d/index.html')]
  },
  {
    id: 'reorganization',
    date: '2026-09-28',
    category: 'interface',
    state: 'tested',
    impact: 2,
    impactReason: 'Mejora la mantenibilidad y la cobertura automatizada.',
    filesChanged: 44,
    title: 'Una base más ordenada',
    summary: 'El repositorio reorganiza componentes y amplía sus pruebas automatizadas.',
    change: 'La separación de responsabilidades facilita continuar con la visión, el simulador y la integración.',
    sources: [commit('77483fa')]
  },
  {
    id: 'current-work',
    date: '2026-09-28',
    category: 'interface',
    state: 'built',
    impact: 3,
    impactReason: 'Profundiza la lectura de la ejecución, pendiente de cierre en commit.',
    filesChanged: null,
    metricNote: 'Trabajo local sin commit',
    title: 'La ejecución sigue evolucionando',
    summary: 'El árbol de trabajo local contiene mejoras de traza, consola, ejemplos y sonidos.',
    change: 'Estos cambios aún no están asociados a un commit en el corte documentado; deben verificarse de nuevo cuando Claude termine.',
    sources: [{ label: 'Trabajo local sin commit · corte del 28 sep 2026' }]
  },
  {
    id: 'physical-validation',
    date: '2026-09-28',
    category: 'finding',
    state: 'pending',
    impact: 5,
    impactReason: 'Bloquea la demostración física de extremo a extremo.',
    filesChanged: null,
    metricNote: 'No aplica a un commit',
    title: 'El mundo físico es la siguiente prueba',
    summary: 'Faltan fichas fotografiadas, medidas reales, escenas etiquetadas y una ejecución capturada con cámaras.',
    change: 'La tubería de software está escrita, pero todavía no hay evidencia de extremo a extremo con un programa armado sobre la mesa.',
    sources: [file('vision-prototype/docs/FUSION_CAMARAS.md'), file('vision-prototype/simbolos.json')]
  }
];
