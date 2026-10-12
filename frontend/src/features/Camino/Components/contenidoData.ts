export interface Pregunta {
  id: number;
  tipo: "unica" | "verdadero-falso" | "multiple";
  enunciado: string;
  opciones: string[];
  correctas: number[]; // Índices de las opciones correctas (ej: [1] o [0, 1, 2])
  retroCorrecta: string;
  retroIncorrecta: string;
}

export const leccionesPorNivel: Record<number, { titulo: string; preguntas: Pregunta[] }> = {
  1: {
    titulo: "La llave perdida del páncreas",
    preguntas: [
      {
        id: 1,
        tipo: "unica",
        enunciado: "¿Cuál es la función principal de la insulina en nuestro cuerpo?",
        opciones: [
          "Es el combustible que nos da hambre.",
          'Es la "llave" que permite que la glucosa entre a las células para darnos energía.',
          "Es un tipo de azúcar que flota en la sangre.",
          "Es una hormona que fabrica el estómago para digerir agua."
        ],
        correctas: [1],
        retroCorrecta: "¡Correcto! La insulina actúa exactamente como una llave que abre las puertas de las células para que la glucosa pueda entrar y transformarse en energía.",
        retroIncorrecta: "¡Inténtalo de nuevo! Recuerda la metáfora: la glucosa es el combustible y la insulina es la llave que abre la puerta de tus células."
      },
      {
        id: 2,
        tipo: "verdadero-falso",
        enunciado: "¿Verdadero o Falso? Tener Diabetes Tipo 1 significa que cometiste un error en tu alimentación o comiste demasiados dulces.",
        opciones: ["Verdadero", "Falso"],
        correctas: [1],
        retroCorrecta: "¡Exacto! La Diabetes Tipo 1 no ocurre por comer dulces ni por nada que hayas hecho mal. Está relacionada con factores genéticos; el páncreas simplemente dejó de producir insulina.",
        retroIncorrecta: "¡No te preocupes! Es un mito común. La Diabetes Tipo 1 no es culpa tuya ni de lo que comiste; sencillamente el páncreas dejó de hacer insulina y ahora nosotros le ayudamos administrándola."
      },
      {
        id: 3,
        tipo: "unica",
        enunciado: 'Tu amigo en el parque te pregunta por qué necesitas ponerte insulina antes de comer. ¿Qué respuesta empoderadora le darías?',
        opciones: [
          '"Porque estoy castigado y no puedo comer normal."',
          '"Porque la insulina es la llave que le da a mi cuerpo la energía para jugar y seguir explorando contigo."',
          '"Porque la insulina hace que la glucosa se borre de mi cuerpo para siempre."'
        ],
        correctas: [1],
        retroCorrecta: "¡Súper respuesta! Es la forma perfecta de explicarlo con confianza. La insulina le da a tu cuerpo las llaves necesarias para aprovechar la energía de la comida.",
        retroIncorrecta: "¡Cerca! Recuerda que la diabetes no es un castigo ni te frena; colocarte insulina te da la llave para transformar los alimentos en energía y vivir con plenitud."
      },
      {
        id: 4,
        tipo: "multiple",
        enunciado: "Cuando la glucosa no puede entrar a las células porque faltan \"llaves\" de insulina, ¿qué señales puede mostrar el cuerpo? (Selecciona todas las opciones correctas)",
        opciones: [
          "Tener mucha sed y tomar agua con frecuencia.",
          "Ganas de orinar muy seguido.",
          "Sentir mucho cansancio o fatiga.",
          "Sentir que tienes superpoderes de visión nocturna."
        ],
        correctas: [0, 1, 2],
        retroCorrecta: "¡Excelente observación! Al no poder entrar la glucosa a las células, el cuerpo intenta eliminar el exceso por la orina, lo que causa sed, cansancio y mucha hambre.",
        retroIncorrecta: "¡Revisa bien! Cuando falta insulina, el cuerpo se cansa porque no recibe energía, eliminando el exceso de azúcar mediante la orina y provocando mucha sed."
      }
    ]
  },
  2: {
    titulo: "El Kit del Explorador",
    preguntas: [
      {
        id: 1,
        tipo: "unica",
        enunciado: "¿Por qué es fundamental lavarse las manos con agua y jabón y secarlas completamente antes de usar el glucómetro?",
        opciones: [
          "Para que el glucómetro se encienda más rápido.",
          "Porque los restos de comida, azúcar o humedad en los dedos pueden alterar la lectura de la glucosa.",
          "Para ablandar las tiras reactivas antes de introducirlas.",
          "Para evitar que el botón del glucómetro se trabe."
        ],
        correctas: [1],
        retroCorrecta: "¡Correcto! Los residuos de alimentos, azúcar o agua en la piel diluyen la muestra o cambian el resultado. ¡Manos limpias y secas siempre!",
        retroIncorrecta: "¡Inténtalo de nuevo! Recuerda que cualquier residuo de comida o humedad en tus dedos puede modificar el valor de la glucosa en el glucómetro."
      },
      {
        id: 2,
        tipo: "verdadero-falso",
        enunciado: "¿Verdadero o Falso? La mejor zona para realizar la punción con el lancetero es el centro de la yema del dedo y se debe reutilizar la misma lanceta varias veces.",
        opciones: ["Verdadero", "Falso"],
        correctas: [1],
        retroCorrecta: "¡Excelente! Para reducir el dolor se debe pinchar en los costados de la yema del dedo. Además, se debe usar una lanceta nueva en cada medición para evitar molestias e infecciones.",
        retroIncorrecta: "¡Revisa la técnica! Pinchar en el centro genera mayor molestia. Lo recomendado es pinchar en los laterales y cambiar la lanceta en cada control."
      },
      {
        id: 3,
        tipo: "unica",
        enunciado: "Vas a aplicarte un nuevo Sensor Continuo de Glucosa (CGM) en el brazo. ¿Cuál de las siguientes acciones de preparación de la piel es la adecuada?",
        opciones: [
          "Aplicar crema humectante o aceite en la zona justo antes de pegarlo.",
          "Lavar la zona con agua y jabón, asegurando que la piel quede totalmente limpia y seca antes de la aplicación.",
          "Soplar con la boca sobre la piel húmeda para secarla rápidamente."
        ],
        correctas: [1],
        retroCorrecta: "¡Magistral! Para que el adhesivo del sensor se fije correctamente y no se desprenda antes de tiempo, la piel debe estar limpia y libre de humedad o cremas.",
        retroIncorrecta: "¡Atención! Las cremas o la humedad impiden que el adhesivo pegue bien. Asimismo, nunca debes soplar sobre la piel limpia porque puedes transmitir gérmenes o humedad."
      },
      {
        id: 4,
        tipo: "multiple",
        enunciado: "El Sensor de Monitoreo Continuo (CGM) es un gran aliado en tu mochila de herramientas. ¿Cuáles de las siguientes afirmaciones sobre su funcionamiento son CORRECTAS? (Selecciona todas las opciones que apliquen)",
        opciones: [
          "Mide la glucosa de forma continua en el líquido debajo de la piel.",
          "Envía los datos y lecturas directamente a una aplicación de smartphone o receptor compatible.",
          "Debe aplicarse sobre una zona de piel plana, limpia y seca para asegurar una buena adhesión.",
          "Reemplaza la necesidad de usar insulina o llevar una alimentación equilibrada."
        ],
        correctas: [0, 1, 2],
        retroCorrecta: "¡Súper selección! Has marcado las características clave: el CGM mide constantemente en el líquido bajo la piel, envía datos al dispositivo y requiere piel limpia y seca para mantenerse adherido.",
        retroIncorrecta: "¡Revisa tus selecciones! El sensor CGM te ayuda a rastrear la glucosa en tiempo real midiendo el líquido bajo la piel, pero no sustituye la necesidad de administrar insulina ni de llevar una alimentación equilibrada."
      }
    ]
  }
};