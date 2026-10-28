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
  },
  3: {
    titulo: "El Mapa de los Números",
    preguntas: [
      {
        id: 1,
        tipo: "unica",
        enunciado: "Según las guías de monitoreo, ¿cuál es el rango de glucosa objetivo en ayunas o antes de las comidas?",
        opciones: [
          "Menos de 40 mg/dL.",
          "Entre 70 y 130 mg/dL.",
          "Entre 250 y 300 mg/dL.",
          "Exactamente 0 mg/dL."
        ],
        correctas: [1],
        retroCorrecta: "¡Exacto! Estar entre 70 y 130 mg/dL antes de comer indica que tu glucosa está en el rango normal deseado.",
        retroIncorrecta: "¡Sigue intentando! El rango meta antes de las comidas se ubica entre 70 y 130 mg/dL."
      },
      {
        id: 2,
        tipo: "verdadero-falso",
        enunciado: "¿Verdadero o Falso? Se considera Hipoglucemia (azúcar baja) cuando el nivel de glucosa es inferior a 70 mg/dL y puede causar síntomas como mareos o sudoración.",
        opciones: ["Verdadero", "Falso"],
        correctas: [0],
        retroCorrecta: "¡Así se hace! Una medición menor a 70 mg/dL significa hipoglucemia. Es la señal de tu cuerpo para consumir glucosa o carbohidratos y regresar a tu rango normal.",
        retroIncorrecta: "¡Revisemos la regla! Un valor por debajo de 70 mg/dL se define como hipoglucemia y requiere atención para corregirlo."
      },
      {
        id: 3,
        tipo: "unica",
        enunciado: "Estás jugando en el recreo y comienzas a sentir mareo y sudoración. Tu sensor o glucómetro marca 62 mg/dL. ¿Cuál es la acción correcta?",
        opciones: [
          "Salir corriendo a dar tres vueltas más a la cancha.",
          "Avisar a tu profesor/cuidador, hacer una pausa y tomar una fuente de azúcar o carbohidrato rápido para subir la glucosa.",
          "Irte a dormir sin avisarle a nadie ni medirte de nuevo."
        ],
        correctas: [1],
        retroCorrecta: "¡Decisión impecable! Ante un valor menor a 70 mg/dL con síntomas de hipoglucemia, debes pausar la actividad, avisar a un adulto y consumir glucosa de acción rápida para volver a tu rango seguro.",
        retroIncorrecta: "¡Cuidado! Continuar el ejercicio con 62 mg/dL bajará aún más tu glucosa. Debes hacer una pausa, avisar a un adulto y tomar azúcar de acción rápida."
      },
      {
        id: 4,
        tipo: "multiple",
        enunciado: "¿En cuáles de los siguientes momentos se recomienda revisar tus niveles de glucosa durante el día? (Selecciona todas las opciones recomendadas)",
        opciones: [
          "Antes de las comidas.",
          "A la hora de acostarse a dormir.",
          "Antes y después de hacer ejercicio físico.",
          "Si te sientes enfermo o con malestar."
        ],
        correctas: [0, 1, 2, 3],
        retroCorrecta: "¡Puntaje perfecto! Todas son correctas. Medir tu glucosa en estos momentos clave te ayuda a mantener el control y prevenir descompensaciones.",
        retroIncorrecta: "¡Revisa de nuevo! Recuerda que se recomienda medir la glucosa al menos 4 veces al día: antes de comer, al acostarte, con el ejercicio y si te sientes enfermo."
      }
    ]
  },
  4: {
    titulo: "El Escuadrón de la Hipoglucemia",
    preguntas: [
      {
        id: 1,
        tipo: "unica",
        enunciado: "¿Qué es la hipoglucemia y a partir de qué número de alerta en tu medidor o sensor se considera que la glucosa está baja?",
        opciones: [
          "Es cuando la glucosa en sangre cae por debajo de 70 mg/dL.",
          "Es cuando la glucosa sube a más de 200 mg/dL después de comer.",
          "Es cuando el páncreas produce demasiadas llaves de insulina de golpe.",
          "Es una medición especial que solo ocurre durante deportes extremos."
        ],
        correctas: [0],
        retroCorrecta: "¡Excelente! La hipoglucemia ocurre cuando la glucosa baja de 70 mg/dL. Es el aviso de tu cuerpo para cargar un poco de combustible rápido.",
        retroIncorrecta: "¡Inténtalo de nuevo! Recuerda que la cifra mágica de alerta para la hipoglucemia (azúcar baja) es cuando el nivel cae por debajo de 70 mg/dL."
      },
      {
        id: 2,
        tipo: "verdadero-falso",
        enunciado: "¿Verdadero o Falso? El chocolate o las golosinas con frutos secos son el alimento perfecto para subir rápidamente la glucosa durante una hipoglucemia.",
        opciones: ["Verdadero", "Falso"],
        correctas: [1],
        retroCorrecta: "¡Respuesta correcta! Los chocolates contienen grasas que hacen que el azúcar se absorba de forma muy lenta. Para subir la glucosa rápidamente se necesitan carbohidratos de acción rápida sin grasa (como 1/2 taza de jugo o tabletas de glucosa).",
        retroIncorrecta: "¡Cuidado con este mito! Aunque el chocolate es dulce, su grasa retrasa la absorción del azúcar. Para corregir una bajada se requieren carbohidratos de absorción rápida."
      },
      {
        id: 3,
        tipo: "unica",
        enunciado: "Estás en la clase de educación física y sientes sudor frío, temblor y mareo. Te mides y tu sensor indica 62 mg/dL. ¿Cuál es la decisión correcta aplicando la Regla de los 15?",
        opciones: [
          "Ignorar las señales y continuar corriendo para sudar el cansancio.",
          "Tomar agua de golpe e irte a dormir una siesta sin avisar a nadie.",
          "Pausar la actividad, tomar 15g de carbohidrato de acción rápida (como 1/2 taza de jugo), esperar 15 minutos en reposo y volver a medirte.",
          "Inyectarte una dosis extra de insulina para recuperar el equilibrio."
        ],
        correctas: [2],
        retroCorrecta: "¡Manejo de campeón! Aplicaste la Regla 15-15 de forma impecable: 15 gramos de carbohidrato rápido, 15 minutos de descanso y reevaluar la glucosa.",
        retroIncorrecta: "¡Revisemos la regla! Ante 62 mg/dL, debes hacer una pausa, tomar 15g de carbohidrato de absorción rápida, descansar 15 minutos y chequear nuevamente tu glucosa hasta que esté por encima de 70 mg/dL."
      },
      {
        id: 4,
        tipo: "multiple",
        enunciado: "La adrenalina se libera cuando la glucosa baja para avisarte que debes actuar. ¿Cuáles de los siguientes son síntomas reales de hipoglucemia? (Selecciona solo los correctos)",
        opciones: [
          "Temblor en las manos o nerviosismo.",
          "Sudoración fría, debilidad o mareo.",
          "Sed insaciable y ganas constantes de orinar todo el tiempo.",
          "Sensación de hambre intensa o irritabilidad."
        ],
        correctas: [0, 1, 3],
        retroCorrecta: "¡Identificación de 10! Reconociste los síntomas de hipoglucemia (temblor, sudor frío, mareo, hambre e irritabilidad) y descartaste las señales de glucosa alta.",
        retroIncorrecta: "¡Atención a los detalles! La sed excesiva y la necesidad frecuente de orinar corresponden a glucosa alta (hiperglucemia). Los síntomas de azúcar baja son temblor, sudor frío, hambre y mareo."
      }
    ]
  },
  5: {
    titulo: "La Sobrecarga de la Hiperglucemia",
    preguntas: [
      {
        id: 1,
        tipo: "unica",
        enunciado: "¿Cómo se define la hiperglucemia en el cuerpo?",
        opciones: [
          "Una bajada de energía causada por falta de alimentos durante el día.",
          "Una falta de agua en las células causada por hacer deporte bajo el sol.",
          "Una reacción alérgica temporal a las tiras reactivas.",
          "El exceso de glucosa acumulada en la sangre porque falta insulina o no actuó a tiempo."
        ],
        correctas: [3],
        retroCorrecta: "¡Respuesta exacta! \"Hiper\" significa alto: la hiperglucemia ocurre cuando la glucosa se acumula en la sangre debido a la falta de insulina.",
        retroIncorrecta: "¡Revisemos el concepto! La hiperglucemia se produce cuando el cuerpo no tiene suficiente insulina disponible, haciendo que la glucosa se acumule en el torrente sanguíneo."
      },
      {
        id: 2,
        tipo: "verdadero-falso",
        enunciado: "¿Verdadero o Falso? Beber suficiente agua durante un episodio de hiperglucemia ayuda a mantener el cuerpo hidratado y facilita que los riñones eliminen parte del exceso de glucosa a través de la orina.",
        opciones: ["Verdadero", "Falso"],
        correctas: [0],
        retroCorrecta: "¡Así se hace! El agua es fundamental durante la hiperglucemia para evitar la deshidratación y ayudar a procesar el exceso de azúcar.",
        retroIncorrecta: "¡Comprobación rápida! Es Verdadero. Tomar agua repone los líquidos que se pierden y ayuda al cuerpo a procesar la glucosa elevada."
      },
      {
        id: 3,
        tipo: "unica",
        enunciado: "En la tarde te mides y tu glucómetro indica 230 mg/dL. Tienes bastante sed y visión algo borrosa. ¿Cuál es la ruta de acción adecuada?",
        opciones: [
          "Avisar a tu tutor/profesor, beber agua para hidratarte y administrar la dosis de corrección de insulina según las indicaciones médicas.",
          "Comer un trozo de pastel para compensar el malestar.",
          "Salir a correr a máxima velocidad sin avisar a ningún adulto.",
          "Guardar el medidor y no volver a chequearte hasta el día siguiente."
        ],
        correctas: [0],
        retroCorrecta: "¡Decisión impecable! Comunicarlo a un adulto, hidratarte con agua y aplicar la dosis correctora de insulina es la forma correcta y segura de regresar al rango deseado.",
        retroIncorrecta: "¡Recuerda el protocolo! Con glucosa alta (230 mg/dL), debes avisar a un adulto, tomar agua para hidratarte y seguir la pauta médica para administrar insulina de corrección."
      },
      {
        id: 4,
        tipo: "multiple",
        enunciado: "¿Cuáles de los siguientes síntomas son avisos de que la glucosa está en hiperglucemia (alta)? (Selecciona solo las opciones correctas)",
        opciones: [
          "Sed intensa y sensación constante de boca seca.",
          "Sudoración fría, temblor de manos y mareo repentino.",
          "Ganas muy frecuentes de ir al baño a orinar.",
          "Sensación de cansancio, fatiga o visión borrosa."
        ],
        correctas: [0, 2, 3],
        retroCorrecta: "¡Gran trabajo de observación! Seleccionaste las señales de hiperglucemia (sed, orina frecuente, fatiga y visión borrosa) y dejaste fuera los síntomas de azúcar baja.",
        retroIncorrecta: "¡Revisa la lista! Recuerda que el temblor y la sudoración fría ocurren cuando la glucosa está baja. La hiperglucemia causa mucha sed, ganas frecuentes de orinar, fatiga y visión borrosa."
      }
    ]
  },
  6: {
    titulo: "Los Detectives de Cetonas",
    preguntas: [
      {
        id: 1,
        tipo: "unica",
        enunciado: "¿Qué son las cetonas y por qué las produce el organismo?",
        opciones: [
          "Azúcares naturales que se forman al comer muchas frutas.",
          "Ácidos químicos que se producen cuando el cuerpo quema grasa como combustible alternativo al no haber suficiente insulina.",
          "Minerales que genera el estómago cuando tomamos demasiada agua.",
          "Proteínas que ayudan a limpiar las tiras reactivas."
        ],
        correctas: [1],
        retroCorrecta: "¡Ganas la lupa de detective! Las cetonas son compuestos ácidos que se forman cuando las células no pueden usar glucosa por falta de insulina y tienen que recurrir a la grasa como energía.",
        retroIncorrecta: "¡Ajustemos la lupa! Cuando falta insulina, la glucosa no entra a las células. El cuerpo empieza a descomponer grasa para obtener energía y en ese proceso produce cetonas."
      },
      {
        id: 2,
        tipo: "verdadero-falso",
        enunciado: "¿Verdadero o Falso? Las cetonas en sangre u orina solo se deben medir cuando el nivel de glucosa en sangre está muy bajo (hipoglucemia).",
        opciones: ["Verdadero", "Falso"],
        correctas: [1],
        retroCorrecta: "¡Investigación acertada! Es Falso. Las cetonas se miden cuando la glucosa se mantiene alta (≥250 mg/dL) o si nos sentimos enfermos con náuseas o vómitos.",
        retroIncorrecta: "¡Atención, detective! Las cetonas aparecen por falta de insulina. Por eso se deben revisar cuando la glucosa está alta o si estás enfermo con malestar estomacal."
      },
      {
        id: 3,
        tipo: "unica",
        enunciado: "Te sientes mal del estómago, tienes náuseas y tu medidor de glucosa marca 260 mg/dL. ¿Cuál es la acción inmediata recomendada?",
        opciones: [
          "Tomar un refresco azucarado e irte a dormir.",
          "Salir a correr a toda velocidad para quemar el azúcar.",
          "Dejar de ponerte insulina hasta que se te pasen las náuseas.",
          "Avisar a un adulto, medir la presencia de cetonas (en sangre u orina), tomar agua y seguir el plan médico para la insulina de corrección."
        ],
        correctas: [3],
        retroCorrecta: "¡Excelente protocolo de seguridad! Con glucosa ≥250 mg/dL y malestar, debes chequear cetonas con la ayuda de un adulto, beber agua e inyectar la insulina correctora para prevenir la cetoacidosis.",
        retroIncorrecta: "¡Atención! Ante valores altos (≥250 mg/dL) con náuseas, nunca debes suspender la insulina. Debes avisar a un adulto, medir cetonas, tomar líquidos y aplicar la dosis de corrección indicada."
      },
      {
        id: 4,
        tipo: "multiple",
        enunciado: "Para evitar que las cetonas se acumulen en exceso y prevenir la cetoacidosis (CAD), ¿qué medidas debes poner en práctica? (Selecciona solo las opciones correctas)",
        opciones: [
          "Nunca saltarte o suspender las dosis de insulina pautadas por tu médico.",
          "Medir las cetonas si la glucosa está en 250 mg/dL o más, o si estás enfermo.",
          "Suspender el consumo de agua por completo para no ir tanto al baño.",
          "Mantenerte bien hidratado y buscar atención médica si hay vómitos continuos o dolor fuerte."
        ],
        correctas: [0, 1, 3],
        retroCorrecta: "¡Graduación con honores! Mantener las dosis de insulina, medir cetonas cuando el azúcar está alto e hidratarte bien son las claves para mantener tu cuerpo libre de cetoacidosis.",
        retroIncorrecta: "¡Cuidado con la hidratación! Cortar el agua es peligroso. Para prevenir la cetoacidosis debes tomar agua, mantener tus dosis de insulina y medir cetonas si la glucosa sube de 250 mg/dL o hay síntomas."
      }
    ]
  },
  7: {
    titulo: "El Radar de los Carbohidratos",
    preguntas: [
      {
        id: 1,
        tipo: "unica",
        enunciado: "¿Por qué es fundamental identificar con precisión qué alimentos contienen carbohidratos cuando gestionas la Diabetes Tipo 1?",
        opciones: [
          "Porque los carbohidratos son nutrientes prohibidos que dañan la salud y deben eliminarse por completo de la dieta.",
          "Porque únicamente las proteínas y las grasas hacen que la glucosa suba de forma inmediata tras comer.",
          "Porque los carbohidratos solo existen en las golosinas procesadas, refrescos y dulces industriales.",
          "Porque los carbohidratos son el nutriente principal que el cuerpo transforma en glucosa, haciendo que suba su nivel en sangre tras comer."
        ],
        correctas: [3],
        retroCorrecta: "¡Excelente activación del radar! Los carbohidratos son la fuente principal de energía que se convierte en glucosa. Identificarlos nos permite saber cuánta insulina necesita nuestro cuerpo para aprovechar esa energía.",
        retroIncorrecta: "¡Inténtalo de nuevo! Recuerda que los carbohidratos no son \"malos\" ni están prohibidos; son sencillamente el nutriente que se transforma directamente en glucosa en la sangre al digerirse."
      },
      {
        id: 2,
        tipo: "verdadero-falso",
        enunciado: "¿Verdadero o Falso? Comer una pechuga de pollo a la plancha con un huevo cocido y un chorrito de aceite de oliva eleva la glucosa de inmediato en la sangre y requiere contar gramos de carbohidratos.",
        opciones: ["Verdadero", "Falso"],
        correctas: [1],
        retroCorrecta: "¡Desmitificación absoluta! Las proteínas puras (pollo, huevo, pescado) y las grasas saludables (aceite de oliva) no contienen carbohidratos directos, por lo que no elevan la glucosa de forma rápida como las harinas o frutas.",
        retroIncorrecta: "¡Ojo con las apariencias! Las carnes, pescados, huevos y aceites puros aportan proteínas y grasas sin carbohidratos, de modo que no elevan directamente la glucosa en la sangre."
      },
      {
        id: 3,
        tipo: "unica",
        enunciado: "Te estás preparando un plato para almorzar que contiene: pechuga de pollo a la plancha, ensalada de lechuga y pepino, 1/3 de taza de arroz blanco cocido y un vaso de agua pura. Al activar tu \"Radar de Carbohidratos\", ¿en qué alimento debes enfocar tu conteo principal?",
        opciones: [
          "En la pechuga de pollo, porque es el alimento de mayor tamaño en el plato.",
          "En el 1/3 de taza de arroz cocido, ya que pertenece al grupo de los cereales y aporta los carbohidratos del plato.",
          "En el vaso de agua pura y la lechuga, porque alteran de inmediato los valores del sensor.",
          "En todos los ingredientes por igual, asignándoles la misma cantidad de carbohidratos."
        ],
        correctas: [1],
        retroCorrecta: "¡Decisión de súper explorador! El arroz es el cereal del plato que contiene los carbohidratos que elevan la glucosa. El pollo (proteína), la lechuga/pepino (verduras libres) y el agua no requieren conteo directo de carbohidratos.",
        retroIncorrecta: "¡Revisemos el radar! El pollo aporta proteínas y las verduras de hoja verde tienen un impacto glucémico mínimo. El arroz es el alimento del grupo de cereales que contiene los carbohidratos a contabilizar."
      },
      {
        id: 4,
        tipo: "multiple",
        enunciado: "Vas a organizar tu lista de alimentos para la semana. ¿Cuáles de los siguientes grupos contienen carbohidratos que debes contabilizar antes de comer? (Selecciona solo las opciones correspondientes)",
        opciones: [
          "Las frutas frescas (como manzana, banano o fresas) y los lácteos (como leche o yogur).",
          "Las carnes rojas magras, el pescado fresco y los huevos enteros.",
          "Los cereales y tubérculos (como pan, pasta, arroz, avena y papas).",
          "El aceite de oliva virgen extra, el aguacate y la mantequilla."
        ],
        correctas: [0, 2],
        retroCorrecta: "¡Identificación impecable! Marcaste las fuentes reales de carbohidratos: las frutas, la leche/yogur y los cereales o tubérculos (pan, arroz, pasta, papas).",
        retroIncorrecta: "¡Atención a los componentes! Las carnes, pescados, huevos y aceites aportan proteínas o grasas con cero carbohidratos. Los grupos que sí se contabilizan son las frutas, los lácteos, los cereales y los tubérculos."
      }
    ]
  },
  8: {
    titulo: "La Maestría del Conteo",
    preguntas: [
      {
        id: 1,
        tipo: "unica",
        enunciado: "Al revisar la tabla de información nutricional de un empaque de galletas, ¿cuál es el primer dato indispensable en el que debes fijarte antes de leer los gramos de carbohidratos?",
        opciones: [
          "En la fecha de vencimiento y el código de barras impreso.",
          "En la cantidad de sodio y calcio expresada por empaque completo.",
          "En el \"Tamaño de la porción\" (ejemplo: 3 galletas o 30 gramos), para saber a qué cantidad de alimento corresponden las cifras.",
          "En el orden del listado de ingredientes alérgicos al final de la etiqueta."
        ],
        correctas: [2],
        retroCorrecta: "¡Lectura de etiqueta maestra! Los gramos de carbohidratos que muestra la tabla están calculados para una porción específica. Identificar el \"Tamaño de la porción\" evita errores al calcular lo que vas a comer.",
        retroIncorrecta: "¡Atención a la etiqueta! Si miras los gramos de carbohidratos sin revisar el \"Tamaño de la porción\", podrías calcular menos o más carbohidratos de los que realmente consumirás."
      },
      {
        id: 2,
        tipo: "verdadero-falso",
        enunciado: "¿Verdadero o Falso? Pesar los alimentos cocinados (como pasta o arroz) en una balanza digital en gramos brinda exactamente la misma precisión que calcular la porción \"a ojo\" en el plato sin medidores.",
        opciones: ["Verdadero", "Falso"],
        correctas: [1],
        retroCorrecta: "¡Excelente precisión! Pesar con balanza digital o usar tazas medidoras es un método mucho más exacto que calcular \"a ojo\", evitando diferencias de gramos que cambien la dosis de insulina.",
        retroIncorrecta: "¡Ojo con la estimación! Calcular \"a ojo\" suele fallar fácilmente por el tamaño de los platos. La balanza digital en gramos es la herramienta más precisa para el conteo."
      },
      {
        id: 3,
        tipo: "unica",
        enunciado: "Estás almorzando en una excursión escolar sin balanza digital a la mano. Quieres servirte una porción equivalente a media taza de pasta cocida. Recordando la \"Guía de la mano\" de tus herramientas de explorador, ¿qué referencia visual utilizas?",
        opciones: [
          "El tamaño de tu puño cerrado.",
          "La longitud combinada de la punta de dos dedos pulgares.",
          "La superficie total de dos manos abiertas y juntas formando un cuenco.",
          "Únicamente la palma de la mano abierta sin incluir los dedos."
        ],
        correctas: [0],
        retroCorrecta: "¡Dominio visual impecable! En la guía práctica de porciones, la medida de un puño cerrado equivale aproximadamente a media taza (1 porción de cereales como pasta o arroz).",
        retroIncorrecta: "¡Repasemos las referencias! Dos manos juntas miden verduras, la palma mide la porción de proteína y el puño cerrado es la guía visual para medir media taza de pasta o arroz."
      },
      {
        id: 4,
        tipo: "multiple",
        enunciado: "Quieres calcular los carbohidratos de tu cena utilizando la información de un empaque. ¿Cuáles de los siguientes pasos son CORRECTOS para realizar un conteo preciso? (Selecciona las opciones correspondientes)",
        opciones: [
          "Localizar en la etiqueta el \"Tamaño de la porción\" y los gramos de \"Carbohidratos Totales\".",
          "Pesar en la balanza digital la cantidad exacta de alimento que te vas a servir.",
          "Restar el total de proteínas y grasas a la cifra de carbohidratos para reducir el número final.",
          "Calcular los gramos de carbohidratos finales en proporción al peso servido."
        ],
        correctas: [0, 1, 3],
        retroCorrecta: "¡Cálculo impecable! Revisar la porción, pesar la cantidad servida y calcular la proporción exacta te garantiza un conteo seguro sin restar nutrientes incorrectamente.",
        retroIncorrecta: "¡Atención con las operaciones! Las proteínas y grasas no se le restan a los carbohidratos. La regla consiste en verificar la porción en la etiqueta, pesar el alimento servido y hacer la regla de tres o cálculo proporcional."
      }
    ]
  },
  9: {
    titulo: "El Reloj de la Comida",
    preguntas: [
      {
        id: 1,
        tipo: "unica",
        enunciado: "¿En qué consiste la técnica del \"pre-bolus\" al utilizar insulina rápida o ultrarrápida antes de alimentarte?",
        opciones: [
          "En aplicar la dosis de insulina 2 horas después de haber terminado de comer.",
          "En administrar la dosis de insulina entre 15 y 20 minutos ANTES de dar el primer bocado a la comida.",
          "En disolver la insulina directamente en el agua que vas a tomar con el plato.",
          "En colocar la insulina únicamente si el sensor muestra una glucosa menor a 70 mg/dL."
        ],
        correctas: [1],
        retroCorrecta: "¡Sincronización de reloj! El pre-bolus consiste en inyectarse la insulina rápida entre 15 y 20 minutos antes de comer, permitiendo que empiece a actuar justo cuando la glucosa del alimento entra en la sangre.",
        retroIncorrecta: "¡Ajustemos el tiempo! El pre-bolus significa administrar la insulina rápida unos 15 a 20 minutos antes de empezar a comer, evitando picos altos de glucosa."
      },
      {
        id: 2,
        tipo: "verdadero-falso",
        enunciado: "¿Verdadero o Falso? Respetar el tiempo de \"pre-bolus\" ayuda a que el pico de acción de la insulina coincida con la absorción de los carbohidratos, evitando que la glucosa se eleve en exceso después de comer (pico postprandial).",
        opciones: ["Verdadero", "Falso"],
        correctas: [0],
        retroCorrecta: "¡Verdadero como el sol! Al sincronizar la insulina con la digestión de la comida, la curva de glucosa se mantiene suave y dentro del rango verde.",
        retroIncorrecta: "¡Cuidado con la prisa! Es Verdadero. Si comemos inmediatamente sin dar tiempo al pre-bolus, los carbohidratos pasan a la sangre antes de que la insulina trabaje, generando un pico elevado postprandial."
      },
      {
        id: 3,
        tipo: "unica",
        enunciado: "Te mides la glucosa antes de almorzar y tu medidor o sensor marca 65 mg/dL (hipoglucemia leve). Tienes servido tu plato con carbohidratos. ¿Cuál es la decisión correcta sobre el \"pre-bolus\"?",
        opciones: [
          "Inyectarte la insulina de inmediato y esperar 30 minutos sentado sin comer.",
          "Aplicarte el doble de dosis de insulina rápida y salir a correr inmediatamente.",
          "Aplicar la insulina y suspender el almuerzo hasta la noche.",
          "Tratar primero la baja de glucosa, recuperar un nivel seguro (≥70 mg/dL) y ajustar el momento de la insulina según las pautas de tu equipo médico."
        ],
        correctas: [3],
        retroCorrecta: "¡Estrategia de seguridad total! Nunca debes realizar un pre-bolus largo si tu glucosa está por debajo de 70 mg/dL. Primero resuelves la bajada y, una vez en nivel seguro, aplicas la insulina.",
        retroIncorrecta: "¡Alerta de seguridad! Si tu glucosa está en 65 mg/dL, inyectarte insulina y esperar causará una bajada más profunda. Primero debes remontar la glucosa por encima de 70 mg/dL antes de administrar la insulina de la comida."
      },
      {
        id: 4,
        tipo: "multiple",
        enunciado: "El tiempo de pre-bolus puede adaptarse según la situación. ¿Cuál de las siguientes condiciones exige acortar o retrasar la inyección antes de comer para evitar una bajada imprevista? (Selecciona la opción correcta)",
        opciones: [
          "El color de los cubiertos o platos utilizados en la mesa.",
          "Tener la glucosa rozando el límite bajo antes de comer o consumir un menú muy rico en grasas que se digiere despacio.",
          "El tipo de música que escuchas en la cocina.",
          "La marca del glucómetro utilizado en la lectura de la mañana."
        ],
        correctas: [1],
        retroCorrecta: "¡Atención a las variables! Si tu glucosa inicial está cerca del límite bajo o la comida contiene mucha grasa (que retrasa la absorción de los carbohidratos), el pre-bolus debe adaptarse para evitar una hipoglucemia previa.",
        retroIncorrecta: "¡Analiza los componentes! Ni los platos ni la música cambian la absorción. Lo que sí exige adaptar el pre-bolus es tener una glucosa inicial justa o un plato rico en grasas que ralentice la digestión."
      }
    ]
  },
  10: {
    titulo: "Las Dos Guardianas (Basal y Bolus)",
    preguntas: [
      {
        id: 1,
        tipo: "unica",
        enunciado: "En el equipo de la diabetes, la insulina basal actúa como una guardiana silenciosa. ¿Cuál es su función principal en tu cuerpo a lo largo de las 24 horas del día?",
        opciones: [
          "Actuar únicamente de forma relámpago cuando comemos un postre o dulce.",
          "Proporcionar un suministro constante y plano de insulina para mantener la glucosa estable entre comidas y mientras dormimos.",
          "Reemplazar la necesidad de beber agua pura y realizar actividad física.",
          "Elevar rápidamente los niveles de azúcar en la sangre cuando el sensor marca un valor bajo."
        ],
        correctas: [1],
        retroCorrecta: "¡Excelente conocimiento guardián! La insulina basal trabaja en segundo plano durante todo el día y la noche, manteniendo los niveles de glucosa estables en los momentos de ayuno.",
        retroIncorrecta: "¡Inténtalo de nuevo! Recuerda que la insulina basal no es para las comidas rápidas; su trabajo es dar un soporte continuo y plano durante las 24 horas."
      },
      {
        id: 2,
        tipo: "verdadero-falso",
        enunciado: "¿Verdadero o Falso? La insulina bolus (de acción rápida o ultrarrápida) se administra para mantener el nivel de insulina durante la noche y no tiene relación con la comida ni con la corrección de valores altos.",
        opciones: ["Verdadero", "Falso"],
        correctas: [1],
        retroCorrecta: "¡Respuesta perfecta! Es Falso. La insulina rápida o bolus se administra justamente antes de comer para procesar los carbohidratos de los alimentos o para corregir una hiperglucemia (azúcar alta).",
        retroIncorrecta: "¡Revisemos a las guardianas! La que actúa durante la noche es la insulina basal. La insulina bolus es la de acción rápida que entra en acción antes de las comidas o ante valores elevados de glucosa."
      },
      {
        id: 3,
        tipo: "unica",
        enunciado: "Estás a punto de cenar un plato de pasta y tu medidor o sensor marca una glucosa elevada de 210 mg/dL. ¿Qué tipo de insulina es la indicada para cubrir esa comida y corregir el nivel alto?",
        opciones: [
          "Solamente agua pura, porque ninguna insulina actúa sobre los alimentos.",
          "Insulina basal de acción prolongada, ya que actúa en menos de 1 minuto.",
          "Insulina bolus (acción rápida o ultrarrápida), porque comienza a actuar rápidamente para contrarrestar los carbohidratos y bajar la hiperglucemia.",
          "Esperar 24 horas sin aplicar ninguna dosis para ver si la glucosa baja sola."
        ],
        correctas: [2],
        retroCorrecta: "¡Decisión magistral! Usar la insulina de acción rápida (bolus) te permite cubrir los carbohidratos que vas a comer y realizar la corrección necesaria para volver a tu rango seguro.",
        retroIncorrecta: "¡Ojo con la elección! Ante una comida y un valor alto de glucosa (210 mg/dL), la guardiana correcta es la insulina rápida (bolus), que actúa en aproximadamente 15 minutos para contrarrestar la glucosa."
      },
      {
        id: 4,
        tipo: "multiple",
        enunciado: "Ambas guardianas trabajan en equipo para cuidar de tu salud. ¿Cuáles de las siguientes afirmaciones sobre la insulina basal y la rápida (bolus) son CORRECTAS? (Selecciona las opciones correspondientes)",
        opciones: [
          "La insulina basal se administra generalmente en un horario fijo cada día para asegurar un control constante.",
          "La insulina rápida se inyecta una sola vez a la semana porque su efecto dura 7 días.",
          "La insulina rápida o bolus empieza a actuar a los 15 minutos de inyectarse para controlar la subida de azúcar tras comer.",
          "La insulina basal se usa únicamente para tratar bajadas de azúcar (hipoglucemias)."
        ],
        correctas: [0, 2],
        retroCorrecta: "¡Súper selección! Reconociste que la basal se pone a un horario fijo para soporte constante y la rápida se activa a los 15 minutos de inyectarse para gestionar la comida.",
        retroIncorrecta: "¡Revisa el checklist! Ninguna insulina se pone semanalmente ni sirve para subir la glucosa. La basal es diaria y fija, mientras que la rápida actúa en 15 minutos al comer."
      }
    ]
  },
  11: {
    titulo: "El Arte de Aplicar",
    preguntas: [
      {
        id: 1,
        tipo: "unica",
        enunciado: "Antes de fijar tu dosis en la pluma de insulina, debes realizar el purgado o prueba de flujo (marcando 2 unidades al aire). ¿Por qué es un paso indispensable?",
        opciones: [
          "Para vaciar el cartucho completo de insulina antes de estrenarlo.",
          "Para desinfectar la aguja con la luz del espacio donde te encuentras.",
          "Para eliminar burbujas de aire y verificar que la insulina fluya correctamente, asegurando que recibas la dosis exacta.",
          "Para enfriar la punta de la aguja antes de que toque la piel."
        ],
        correctas: [2],
        retroCorrecta: "¡Técnica de artista! Purgar la pluma eliminando las burbujas de aire garantiza que cuando inyectes, la dosis marcada sea exactamente la que entra a tu cuerpo.",
        retroIncorrecta: "¡Atención al paso previo! Las burbujas de aire dentro de la pluma pueden robarte unidades de insulina. Purgar con 2 unidades al aire asegura una dosis precisa."
      },
      {
        id: 2,
        tipo: "verdadero-falso",
        enunciado: "¿Verdadero o Falso? Al inyectarte con la pluma de insulina, debes presionar el botón y retirar la aguja de la piel de inmediato sin esperar ningún segundo.",
        opciones: ["Verdadero", "Falso"],
        correctas: [1],
        retroCorrecta: "¡Excelente precisión! Es Falso. Al inyectar debes presionar el botón y mantener la aguja dentro contando 10 segundos antes de retirarla, evitando que la insulina gotee fuera de la piel.",
        retroIncorrecta: "¡Cuidado con la prisa! Si sacas la aguja inmediatamente, parte de la insulina saldrá disparada o goteará fuera de la piel, haciendo que la dosis llegue incompleta. ¡Cuenta siempre hasta 10!"
      },
      {
        id: 3,
        tipo: "unica",
        enunciado: "Estás aplicando tu dosis de insulina con pluma. Introduces la aguja perpendicular a 90° y presionas el botón por completo con tu dedo pulgar. ¿Qué debes hacer justo antes de retirar la aguja de tu piel?",
        opciones: [
          "Frotar en círculos fuertemente la zona mientras la aguja sigue dentro.",
          "Mantener el botón presionado y contar pausadamente hasta 10 segundos para asegurarte de que entra toda la dosis.",
          "Soltar el botón de golpe y retirar la pluma hacia un lado de forma rápida.",
          "Retirar la aguja al instante y soplar sobre la piel limpia."
        ],
        correctas: [1],
        retroCorrecta: "¡Procedimiento impecable! Sostener el émbolo y contar 10 segundos garantiza que el medicamento se absorba correctamente en el tejido subcutáneo sin fugas.",
        retroIncorrecta: "¡Ajustemos la técnica! Recuerda el secreto del reloj: presiona el botón, cuenta hasta 10 en silencio y recién ahí retira suavemente la aguja."
      },
      {
        id: 4,
        tipo: "multiple",
        enunciado: "Para dominar \"El Arte de Aplicar\" la insulina con pluma de forma segura y cómoda, ¿cuáles de los siguientes pasos son CORRECTOS? (Selecciona las opciones correspondientes)",
        opciones: [
          "Lavar tus manos con agua y jabón, y colocar una aguja nueva en cada aplicación.",
          "Purga la pluma apuntando hacia arriba con 2 unidades hasta ver una gota en la punta.",
          "Reutilizar la misma aguja durante dos semanas para no cambiarla tan seguido.",
          "Inyectar en ángulo de 90° (o con un ligero pellizco con dos dedos si la piel es delgada) y esperar 10 segundos."
        ],
        correctas: [0, 1, 3],
        retroCorrecta: "¡Súper checklist! Seleccionaste los tres pilares de la buena aplicación: manos limpias con aguja nueva, purgado e inyección a 90° sosteniendo 10 segundos.",
        retroIncorrecta: "¡Atención con las agujas! Nunca debes reutilizar las agujas, ya que se deforman al primer uso provocando dolor, lesiones y lipodistrofia. Una aplicación = una aguja nueva."
      }
    ]
  },
  12: {
    titulo: "La Rotación Fantástica",
    preguntas: [
      {
        id: 1,
        tipo: "unica",
        enunciado: "¿Qué es la lipodistrofia y por qué es tan importante evitarla en las zonas donde te aplicas la insulina?",
        opciones: [
          "Una alergia a las toallitas con alcohol que desaparece aplicando crema.",
          "Una acumulación de bultos o durezas de grasa provocada por inyectar en el mismo punto, lo que hace que la insulina se absorba mal de forma impredecible.",
          "Una marca natural que aparece únicamente cuando hacemos mucho deporte.",
          "Un tipo de vitamina que se genera en la piel cuando cambiamos la aguja."
        ],
        correctas: [1],
        retroCorrecta: "¡Ganas la insignia de cuidado de piel! La lipodistrofia ocurre cuando inyectamos repetidamente en el mismo sitio. Esos bultos impiden que la insulina se absorba bien.",
        retroIncorrecta: "¡Revisemos la piel! Inyectar siempre en el mismo punto crea bultos duros de grasa (lipodistrofia). Si aplican ahí, la insulina no se absorbe bien y la glucosa se descontrola."
      },
      {
        id: 2,
        tipo: "verdadero-falso",
        enunciado: "¿Verdadero o Falso? Para lograr que la insulina se absorba siempre igual, lo ideal es inyectarte exactamente en el mismo punto milimétrico de la barriga todos los días.",
        opciones: ["Verdadero", "Falso"],
        correctas: [1],
        retroCorrecta: "¡Respuesta perfecta! Es Falso. Inyectar en el mismo punto causa bultos de grasa. La regla de rotación exige moverte al menos 1 a 2 cm de distancia del pinchazo anterior.",
        retroIncorrecta: "¡Atención con la rotación! Repetir el punto exacto causa lipodistrofia. Debes rotar dentro de la zona moviéndote al menos 1-2 cm en cada inyección."
      },
      {
        id: 3,
        tipo: "unica",
        enunciado: "Al palpar tu abdomen antes de inyectarte, sientes una pequeña zona dura o bulto (lipodistrofia). ¿Qué medida debes tomar?",
        opciones: [
          "Inyectar la insulina justo en el centro del bulto duro para ablandarlo.",
          "Presionar fuertemente la aguja contra la dureza para que entre más rápido.",
          "Cambiar de zona e inyectar en un área de piel sana, dejando descansar el bulto y consultando con tu equipo médico.",
          "Suspender las dosis de insulina durante una semana sin avisarle a ningún adulto."
        ],
        correctas: [2],
        retroCorrecta: "¡Protección de explorador! Al detectar un bulto, debes cambiar a una zona limpia y sana para que la insulina se absorba correctamente.",
        retroIncorrecta: "¡Cuidado con los bultos! Nunca inyectes sobre lipodistrofias. Cambia a piel sana para asegurar la absorción y deja descansar el bulto informando a tu médico."
      },
      {
        id: 4,
        tipo: "multiple",
        enunciado: "Existen 4 zonas aprobadas en el cuerpo para la aplicación de insulina. ¿Cuáles de las siguientes áreas forman parte de este mapa de aplicación? (Selecciona las opciones correspondientes)",
        opciones: [
          "El abdomen o barriga (evitando dejar 5 cm alrededor del ombligo).",
          "La cara anterior y lateral externa de los muslos o piernas.",
          "La cara interna de la rodilla y el centro de la palma de la mano.",
          "La parte posterior externa del brazo y el cuadrante superior externo del glúteo."
        ],
        correctas: [0, 1, 3],
        retroCorrecta: "¡Mapa completado al 100%! Marcaste las 4 zonas oficiales: abdomen, muslos, brazos y glúteos. ¡Recordando siempre rotar entre ellas y evitar la cara interna de las articulaciones!",
        retroIncorrecta: "¡Revisa las zonas permitidas! Las articulaciones y palmas no son sitios de inyección. Las zonas oficiales aprobadas son abdomen, muslos, zona posterior del brazo y glúteos."
      }
    ]
  },
  13: {
    titulo: "Moverse con Estrategia",
    preguntas: [
      {
        id: 1,
        tipo: "unica",
        enunciado: "¿Qué ocurre en tu cuerpo durante y después de hacer ejercicio físico (como correr, nadar o jugar fútbol) y cómo influye en tu glucosa?",
        opciones: [
          "La actividad física bloquea por completo la acción de la insulina, haciendo que la glucosa suba sin control en todos los casos.",
          "El ejercicio detiene la absorción de energía en las células, por lo que nunca se deben consumir carbohidratos en el deporte.",
          "Aumenta la sensibilidad a la insulina y los músculos usan glucosa como energía, pudiendo bajar los niveles durante el deporte e incluso hasta 24-48 horas después.",
          "La glucosa solo puede bajar en los primeros 5 minutos del entrenamiento y luego permanece inmóvil por el resto del día."
        ],
        correctas: [2],
        retroCorrecta: "¡Respuesta de atleta profesional! Al hacer ejercicio, tus músculos consumen glucosa para moverse y la sensibilidad a la insulina aumenta. Esto puede bajar tus niveles durante la actividad e incluso hasta 24 o 48 horas después (hipoglucemia tardía).",
        retroIncorrecta: "¡Ajustemos la estrategia! Recuerda que el deporte hace que tu cuerpo use la glucosa como combustible y sea más sensible a la insulina, lo que puede provocar bajadas durante el entrenamiento o en las siguientes 24 a 48 horas."
      },
      {
        id: 2,
        tipo: "verdadero-falso",
        enunciado: "¿Verdadero o Falso? Para salir a entrenar o hacer deporte de forma segura, solo necesitas llevar tus tenis puestos y no hace falta revisar tu glucosa previa ni llevar snacks de respaldo.",
        opciones: ["Verdadero", "Falso"],
        correctas: [1],
        retroCorrecta: "¡Excelente prevención! Es Falso. Un atleta preparado siempre mide su glucosa antes de empezar y lleva en su mochila un kit de emergencia con carbohidratos de acción rápida (como jugos o tabletas de glucosa) por si necesita prevenir o corregir una bajada.",
        retroIncorrecta: "¡Ojo con el equipamiento! Antes de entrenar debes verificar tu nivel de glucosa e ir preparado con carbohidratos rápidos en tu mochila por si tus niveles bajan mientras te ejercitas."
      },
      {
        id: 3,
        tipo: "unica",
        enunciado: "Vas a tener un partido de fútbol muy intenso por la tarde. Antes de empezar, te mides y tu sensor indica 90 mg/dL, con una flecha que señala tendencia a bajar. ¿Qué medida de preparación es la adecuada?",
        opciones: [
          "Consumir un snack de carbohidratos antes de arrancar, avisar a tu entrenador y mantener carbohidratos de acción rápida a la mano.",
          "Inyectarte una dosis extra de insulina rápida para evitar cualquier cambio durante el partido.",
          "Cancelar toda tu actividad física y quedarte acostado sin avisarle a nadie.",
          "Beber tres refrescos azucarados con cafeína y salir corriendo a jugar sin medirte de nuevo."
        ],
        correctas: [0],
        retroCorrecta: "¡Estrategia de juego perfecta! Al estar en 90 mg/dL con tendencia a bajar antes de un deporte intenso, comer un snack de carbohidratos y comunicarlo a tu entrenador te mantiene seguro y con energía durante el partido.",
        retroIncorrecta: "¡Cuidado en la cancha! Con 90 mg/dL y tendencia a bajar, inyectarte más insulina o no comer provocará una bajada más rápida. Lo correcto es consumir un snack de carbohidratos, avisar a un adulto y monitorear tus números."
      },
      {
        id: 4,
        tipo: "multiple",
        enunciado: "Tu mochila deportiva es tu escudo de libertad. ¿Cuáles de las siguientes acciones forman parte de una preparación deportiva inteligente para una persona con Diabetes Tipo 1?",
        opciones: [
          "Medir tu nivel de glucosa antes de empezar y verificar la tendencia en tu sensor o medidor.",
          "Suspender por completo el consumo de agua durante el entrenamiento para no pausar el ejercicio.",
          "Llevar carbohidratos de acción rápida (jugos, geles o tabletas de glucosa) al alcance de la mano en el entrenamiento.",
          "Aplicar el triple de dosis de insulina bolus antes de correr sin consumir carbohidratos."
        ],
        correctas: [0, 2],
        retroCorrecta: "¡Mochila lista al 100%! Medir tu glucosa previa y llevar carbohidratos de respuesta rápida son las dos reglas de oro para disfrutar del deporte con total seguridad.",
        retroIncorrecta: "¡Revisa el equipo! Nunca debes cortar la hidratación con agua ni inyectar dosis excesivas de insulina sin comer antes del deporte. Lo correcto es medir la glucosa previa y llevar snacks rápidos a la mano."
      }
    ]
  },
  14: {
    titulo: "Días de Fiebre y Escudo Social",
    preguntas: [
      {
        id: 1,
        tipo: "unica",
        enunciado: "Si estás en casa con fiebre, resfrío o malestar estomacal y no tienes mucho apetito, ¿cuál es la regla de oro MÁS importante sobre el uso de tu insulina?",
        opciones: [
          "Suspender la insulina por completo hasta que te sientas 100% recuperado y comas normal.",
          "Duplicar la dosis de todas tus insulinas sin consultar con ningún médico.",
          "Reemplazar la insulina por té caliente sin medir la glucosa.",
          "NUNCA suspender la insulina; el cuerpo la sigue necesitando para funcionar y prevenir cetonas, ajustando dosis con orientación médica."
        ],
        correctas: [3],
        retroCorrecta: "¡Regla de oro aprendida! Aunque comas menos por estar enfermo, el cuerpo libera hormonas de estrés que elevan la glucosa. La insulina nunca se suspende; se ajusta con la guía de tus tutores o equipo médico.",
        retroIncorrecta: "¡Alerta de seguridad! Suspender la insulina durante una enfermedad es muy peligroso porque puede causar cetoacidosis. La insulina nunca se suspende, se monitorea y se ajusta con el médico."
      },
      {
        id: 2,
        tipo: "verdadero-falso",
        enunciado: "¿Verdadero o Falso? Es recomendable que tus profesores, el equipo escolar y tus amigos de confianza sepan que tienes Diabetes Tipo 1 y conozcan cómo ayudarte si te sientes mal.",
        opciones: ["Verdadero", "Falso"],
        correctas: [0],
        retroCorrecta: "¡Absolutamente Verdadero! Compartir tu condición con naturalidad crea un \"Escudo Social\". Profesores y amigos informados sabrán cómo apoyarte si tienes una bajada o necesitas hacer una pausa para medirte.",
        retroIncorrecta: "¡Recuerda tu red de apoyo! Es Verdadero. Explicar tu diabetes con naturalidad a tus profesores y amigos les permite ser tus aliados y brindarte ayuda rápida si la necesitas."
      },
      {
        id: 3,
        tipo: "unica",
        enunciado: "Estás en el colegio durante un examen y comienzas a sentir sudor frío, mareo y temblor de manos. ¿Cuál es la forma más segura y madura de actuar usando tu \"Escudo Social\"?",
        opciones: [
          "Aguantar el malestar en silencio sin decir nada a nadie para no interrumpir el examen.",
          "Avisar de inmediato a tu profesor, medir tu glucosa y tomar tus carbohidratos de respuesta rápida sin pena ni dudar.",
          "Salir corriendo del salón hacia la cancha sin avisarle a ningún adulto.",
          "Pedirle prestado un dulce a un compañero y guardarlo en el bolsillo sin comerlo."
        ],
        correctas: [1],
        retroCorrecta: "¡Actuación impecable! Tu salud es siempre lo primero. Avisar al profesor, medirte y tratar la bajada de inmediato es la decisión correcta y valiente.",
        retroIncorrecta: "¡Tu salud es la prioridad! Nunca debes guardar silencio o esperar ante una bajada de glucosa. Debes avisar al profesor, medir tu nivel y consumir tu carbohidrato rápido de inmediato."
      },
      {
        id: 4,
        tipo: "multiple",
        enunciado: "Cuando te sientes enfermo con fiebre o malestar en casa, ¿cuáles de las siguientes acciones debes realizar para cuidarte? (Selecciona solo las opciones correctas)",
        opciones: [
          "Mantener una hidratación constante bebiendo agua, caldos o líquidos frecuentes.",
          "Medir tu glucosa con mayor frecuencia y chequear cetonas si el nivel supera los 250 mg/dL.",
          "Dejar de tomar líquidos completamente si sientes dolor de cabeza.",
          "Ofrecer carbohidratos blandos o líquidos (jugos, gelatinas, sopas) si te cuesta comer alimentos sólidos."
        ],
        correctas: [0, 1, 3],
        retroCorrecta: "¡Atención médica perfecta! Hidratarte bien, medir la glucosa y cetonas seguido, y aportar carbohidratos en líquidos o gelatinas son los 3 pasos clave durante los días de enfermedad.",
        retroIncorrecta: "¡Cuidado con la deshidratación! Suspender los líquidos cuando estás enfermo empeora el malestar y acelera la aparición de cetonas. Debes mantenerte hidratado con agua o gelatinas mientras mides tu glucosa."
      }
    ]
  },
  15: {
    titulo: "El Kit Glucagón",
    preguntas: [
      {
        id: 1,
        tipo: "unica",
        enunciado: "¿Qué es el Glucagón y en qué momento extremo de emergencia debe utilizarse?",
        opciones: [
          "Es un tipo de insulina ultra-lenta que se aplica todos los días antes de ir a la escuela.",
          "Es una hormona de acción rápida (inyectable o nasal) que se usa en hipoglucemias graves cuando la persona pierde el conocimiento o no puede tragar.",
          "Es un jarabe dulce para la tos que se toma cuando tenemos dolor de garganta.",
          "Es una pastilla de vitaminas que sirve para reemplazar el almuerzo en los días de deporte."
        ],
        correctas: [1],
        retroCorrecta: "¡Conocimiento de rescate! El glucagón es la hormona de emergencia que le ordena al hígado liberar glucosa de inmediato cuando alguien tiene una hipoglucemia grave y no puede tragar.",
        retroIncorrecta: "¡Aclaración importante! El glucagón no es insulina ni vitamina; es el medicamento de emergencia (nasal o inyectable) para tratar una hipoglucemia grave cuando la persona no puede comer o tragar."
      },
      {
        id: 2,
        tipo: "verdadero-falso",
        enunciado: "¿Verdadero o Falso? El kit de glucagón de emergencia debe mantenerse guardado bajo llave en un lugar secreto donde nadie lo encuentre jamás.",
        opciones: ["Verdadero", "Falso"],
        correctas: [1],
        retroCorrecta: "¡Exacto! Es Falso. Tu familia, profesores y cuidadores deben saber exactamente dónde se guarda el kit de glucagón y cómo usarlo, para poder actuar en segundos ante una emergencia.",
        retroIncorrecta: "¡Acceso rápido salva vidas! Guardarlo bajo llave o en secreto impide que te ayuden. Tu entorno cercano (padres, profesores, entrenadores) debe saber exactamente dónde está y cómo aplicarlo."
      },
      {
        id: 3,
        tipo: "unica",
        enunciado: "Si una persona con diabetes sufre una hipoglucemia grave, pierde el conocimiento y no responde, ¿cuál es el procedimiento de auxilio que debe realizar su cuidador o familiar?",
        opciones: [
          "Intentar meterle alimentos sólidos o líquidos por la boca a la fuerza mientras está inconsciente.",
          "Dejar a la persona sentada en una silla, apagar las luces y esperar 2 horas.",
          "Aplicar el Glucagón de emergencia (nasal o inyectable), colocar a la persona de lado para proteger su respiración y llamar de inmediato a urgencias.",
          "Inyectar una dosis doble de insulina rápida y frotarle la frente con agua helada."
        ],
        correctas: [2],
        retroCorrecta: "¡Procedimiento de héroe! Aplicar el glucagón, acostar a la persona de lado (para evitar ahogamientos en caso de vómito) y llamar a urgencias es el protocolo exacto que salva vidas.",
        retroIncorrecta: "¡Alerta de atragantamiento! NUNCA debes introducir comida o bebida en la boca de alguien inconsciente. El protocolo correcto es administrar glucagón, colocar a la persona de lado y llamar a emergencias."
      },
      {
        id: 4,
        tipo: "multiple",
        enunciado: "¡Llegaste a la cumbre! ¿Cuáles de los siguientes mensajes resumen la filosofía del \"Graduado de Oro\" para vivir con Diabetes Tipo 1 con plenitud? (Selecciona solo las opciones correctas)",
        opciones: [
          "La diabetes te impide practicar deportes de alto rendimiento, viajar o cumplir tus sueños.",
          "La diabetes no es un límite ni un castigo: con conocimiento, monitoreo y preparación, puedes alcanzar cualquier meta, deporte o sueño que te propongas.",
          "Tener diabetes significa que debes aislarte de tus amigos y no ir a excursiones escolares.",
          "El monitoreo de glucosa es una nota de examen que determina si eres una buena o mala persona."
        ],
        correctas: [1],
        retroCorrecta: "¡Graduado de oro con honores! La diabetes no detiene tus metas. Con las herramientas, el conocimiento y tu actitud, tienes la libertad total para conquistar el mundo. ¡Felicidades, súper explorador!",
        retroIncorrecta: "¡Abre tus alas, explorador! La diabetes no te define ni te limita. Con tu Kit, tu conocimiento y el apoyo de tu equipo, puedes practicar cualquier deporte, viajar y cumplir todos tus sueños."
      }
    ]
  }
};