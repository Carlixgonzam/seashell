export const playlistUrl = 'https://www.youtube.com/playlist?list=PLSK7NtBWwmpQwSUi53XUK5o6-b9H3ABrO';

export const references = [
  {
    id: 'camera-calibration',
    title: 'Calibración de cámaras',
    videoUrl: 'https://www.youtube.com/watch?v=H5qbRTikxI4',
    question: '¿Qué error de reproyección obtenemos con las webcams y el tablero reales?',
    relatedEventId: 'calibration'
  },
  {
    id: 'pose-estimation',
    title: 'Estimación de pose',
    videoUrl: 'https://www.youtube.com/watch?v=bs81DNsMrnM',
    question: '¿Cómo situamos cada cámara respecto a la mesa sin mover el montaje?',
    relatedEventId: 'calibration'
  },
  {
    id: 'epipolar-geometry',
    title: 'Geometría epipolar',
    videoUrl: 'https://www.youtube.com/watch?v=VoJy8Xbo9Uo',
    question: '¿Qué correspondencias entre webcams sobreviven cuando una ficha queda tapada?',
    relatedEventId: 'multicamera'
  },
  {
    id: 'stereo-depth',
    title: 'Profundidad estéreo',
    videoUrl: 'https://www.youtube.com/watch?v=gffZ3S9pBUE',
    question: '¿Cuándo bastan dos webcams y cuándo hace falta la profundidad de Kinect o RealSense?',
    relatedEventId: 'first-vision'
  },
  {
    id: 'optical-flow',
    title: 'Flujo óptico',
    videoUrl: 'https://www.youtube.com/watch?v=HrliyOsZEQE',
    question: '¿Podemos distinguir el movimiento de una mano de un bloque que ya quedó quieto?',
    relatedEventId: 'multicamera'
  },
  {
    id: 'template-matching',
    title: 'Comparación de plantillas',
    videoUrl: 'https://www.youtube.com/watch?v=BNXu20ToDl4',
    question: '¿Qué símbolos reales funcionan con plantillas y cuáles requieren otra representación?',
    relatedEventId: 'references'
  },
  {
    id: 'orb-features',
    title: 'Puntos y descriptores ORB',
    videoUrl: 'https://www.youtube.com/watch?v=0sPlnrEMyYk',
    question: '¿Mejora ORB la lectura de fichas giradas o parcialmente ocultas frente a las plantillas?',
    relatedEventId: 'references'
  },
  {
    id: 'homography',
    title: 'Homografía',
    videoUrl: 'https://www.youtube.com/watch?v=DKkDVHhJ8_M',
    question: '¿Podemos rectificar cada vista del tablero antes de asociar símbolos y posiciones?',
    relatedEventId: 'calibration'
  }
];
