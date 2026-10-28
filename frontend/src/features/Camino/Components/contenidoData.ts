export interface PreguntaKeys {
  id: number;
  tipo: "unica" | "verdadero-falso" | "multiple";
  enunciadoKey: string;
  opcionesKeys: string[];
  correctas: number[];
  retroCorrectaKey: string;
  retroIncorrectaKey: string;
}

export interface Pregunta {
  id: number;
  tipo: "unica" | "verdadero-falso" | "multiple";
  enunciado: string;
  opciones: string[];
  correctas: number[];
  retroCorrecta: string;
  retroIncorrecta: string;
}

export const leccionesPorNivelKeys: Record<number, { tituloKey: string; preguntas: PreguntaKeys[] }> = {
  1: {
    tituloKey: "level1Title",
    preguntas: [
      { id: 1, tipo: "unica", enunciadoKey: "l1_q1_enun", opcionesKeys: ["l1_q1_op0", "l1_q1_op1", "l1_q1_op2", "l1_q1_op3"], correctas: [1], retroCorrectaKey: "l1_q1_ok", retroIncorrectaKey: "l1_q1_bad" },
      { id: 2, tipo: "verdadero-falso", enunciadoKey: "l1_q2_enun", opcionesKeys: ["l1_q2_op0", "l1_q2_op1"], correctas: [1], retroCorrectaKey: "l1_q2_ok", retroIncorrectaKey: "l1_q2_bad" },
      { id: 3, tipo: "unica", enunciadoKey: "l1_q3_enun", opcionesKeys: ["l1_q3_op0", "l1_q3_op1", "l1_q3_op2"], correctas: [1], retroCorrectaKey: "l1_q3_ok", retroIncorrectaKey: "l1_q3_bad" },
      { id: 4, tipo: "multiple", enunciadoKey: "l1_q4_enun", opcionesKeys: ["l1_q4_op0", "l1_q4_op1", "l1_q4_op2", "l1_q4_op3"], correctas: [0, 1, 2], retroCorrectaKey: "l1_q4_ok", retroIncorrectaKey: "l1_q4_bad" }
    ]
  },
  2: {
    tituloKey: "level2Title",
    preguntas: [
      { id: 1, tipo: "unica", enunciadoKey: "l2_q1_enun", opcionesKeys: ["l2_q1_op0", "l2_q1_op1", "l2_q1_op2", "l2_q1_op3"], correctas: [1], retroCorrectaKey: "l2_q1_ok", retroIncorrectaKey: "l2_q1_bad" },
      { id: 2, tipo: "verdadero-falso", enunciadoKey: "l2_q2_enun", opcionesKeys: ["l2_q2_op0", "l2_q2_op1"], correctas: [1], retroCorrectaKey: "l2_q2_ok", retroIncorrectaKey: "l2_q2_bad" },
      { id: 3, tipo: "unica", enunciadoKey: "l2_q3_enun", opcionesKeys: ["l2_q3_op0", "l2_q3_op1", "l2_q3_op2"], correctas: [1], retroCorrectaKey: "l2_q3_ok", retroIncorrectaKey: "l2_q3_bad" },
      { id: 4, tipo: "multiple", enunciadoKey: "l2_q4_enun", opcionesKeys: ["l2_q4_op0", "l2_q4_op1", "l2_q4_op2", "l2_q4_op3"], correctas: [0, 1, 2], retroCorrectaKey: "l2_q4_ok", retroIncorrectaKey: "l2_q4_bad" }
    ]
  },
  3: {
    tituloKey: "level3Title",
    preguntas: [
      { id: 1, tipo: "unica", enunciadoKey: "l3_q1_enun", opcionesKeys: ["l3_q1_op0", "l3_q1_op1", "l3_q1_op2", "l3_q1_op3"], correctas: [1], retroCorrectaKey: "l3_q1_ok", retroIncorrectaKey: "l3_q1_bad" },
      { id: 2, tipo: "verdadero-falso", enunciadoKey: "l3_q2_enun", opcionesKeys: ["l3_q2_op0", "l3_q2_op1"], correctas: [0], retroCorrectaKey: "l3_q2_ok", retroIncorrectaKey: "l3_q2_bad" },
      { id: 3, tipo: "unica", enunciadoKey: "l3_q3_enun", opcionesKeys: ["l3_q3_op0", "l3_q3_op1", "l3_q3_op2"], correctas: [1], retroCorrectaKey: "l3_q3_ok", retroIncorrectaKey: "l3_q3_bad" },
      { id: 4, tipo: "multiple", enunciadoKey: "l3_q4_enun", opcionesKeys: ["l3_q4_op0", "l3_q4_op1", "l3_q4_op2", "l3_q4_op3"], correctas: [0, 1, 2, 3], retroCorrectaKey: "l3_q4_ok", retroIncorrectaKey: "l3_q4_bad" }
    ]
  },
  4: {
    tituloKey: "level4Title",
    preguntas: [
      { id: 1, tipo: "unica", enunciadoKey: "l4_q1_enun", opcionesKeys: ["l4_q1_op0", "l4_q1_op1", "l4_q1_op2", "l4_q1_op3"], correctas: [0], retroCorrectaKey: "l4_q1_ok", retroIncorrectaKey: "l4_q1_bad" },
      { id: 2, tipo: "verdadero-falso", enunciadoKey: "l4_q2_enun", opcionesKeys: ["l4_q2_op0", "l4_q2_op1"], correctas: [1], retroCorrectaKey: "l4_q2_ok", retroIncorrectaKey: "l4_q2_bad" },
      { id: 3, tipo: "unica", enunciadoKey: "l4_q3_enun", opcionesKeys: ["l4_q3_op0", "l4_q3_op1", "l4_q3_op2", "l4_q3_op3"], correctas: [2], retroCorrectaKey: "l4_q3_ok", retroIncorrectaKey: "l4_q3_bad" },
      { id: 4, tipo: "multiple", enunciadoKey: "l4_q4_enun", opcionesKeys: ["l4_q4_op0", "l4_q4_op1", "l4_q4_op2", "l4_q4_op3"], correctas: [0, 1, 3], retroCorrectaKey: "l4_q4_ok", retroIncorrectaKey: "l4_q4_bad" }
    ]
  },
  5: {
    tituloKey: "level5Title",
    preguntas: [
      { id: 1, tipo: "unica", enunciadoKey: "l5_q1_enun", opcionesKeys: ["l5_q1_op0", "l5_q1_op1", "l5_q1_op2", "l5_q1_op3"], correctas: [3], retroCorrectaKey: "l5_q1_ok", retroIncorrectaKey: "l5_q1_bad" },
      { id: 2, tipo: "verdadero-falso", enunciadoKey: "l5_q2_enun", opcionesKeys: ["l5_q2_op0", "l5_q2_op1"], correctas: [0], retroCorrectaKey: "l5_q2_ok", retroIncorrectaKey: "l5_q2_bad" },
      { id: 3, tipo: "unica", enunciadoKey: "l5_q3_enun", opcionesKeys: ["l5_q3_op0", "l5_q3_op1", "l5_q3_op2", "l5_q3_op3"], correctas: [0], retroCorrectaKey: "l5_q3_ok", retroIncorrectaKey: "l5_q3_bad" },
      { id: 4, tipo: "multiple", enunciadoKey: "l5_q4_enun", opcionesKeys: ["l5_q4_op0", "l5_q4_op1", "l5_q4_op2", "l5_q4_op3"], correctas: [0, 2, 3], retroCorrectaKey: "l5_q4_ok", retroIncorrectaKey: "l5_q4_bad" }
    ]
  },
  6: {
    tituloKey: "level6Title",
    preguntas: [
      { id: 1, tipo: "unica", enunciadoKey: "l6_q1_enun", opcionesKeys: ["l6_q1_op0", "l6_q1_op1", "l6_q1_op2", "l6_q1_op3"], correctas: [1], retroCorrectaKey: "l6_q1_ok", retroIncorrectaKey: "l6_q1_bad" },
      { id: 2, tipo: "verdadero-falso", enunciadoKey: "l6_q2_enun", opcionesKeys: ["l6_q2_op0", "l6_q2_op1"], correctas: [1], retroCorrectaKey: "l6_q2_ok", retroIncorrectaKey: "l6_q2_bad" },
      { id: 3, tipo: "unica", enunciadoKey: "l6_q3_enun", opcionesKeys: ["l6_q3_op0", "l6_q3_op1", "l6_q3_op2", "l6_q3_op3"], correctas: [3], retroCorrectaKey: "l6_q3_ok", retroIncorrectaKey: "l6_q3_bad" },
      { id: 4, tipo: "multiple", enunciadoKey: "l6_q4_enun", opcionesKeys: ["l6_q4_op0", "l6_q4_op1", "l6_q4_op2", "l6_q4_op3"], correctas: [0, 1, 3], retroCorrectaKey: "l6_q4_ok", retroIncorrectaKey: "l6_q4_bad" }
    ]
  },
  7: {
    tituloKey: "level7Title",
    preguntas: [
      { id: 1, tipo: "unica", enunciadoKey: "l7_q1_enun", opcionesKeys: ["l7_q1_op0", "l7_q1_op1", "l7_q1_op2", "l7_q1_op3"], correctas: [3], retroCorrectaKey: "l7_q1_ok", retroIncorrectaKey: "l7_q1_bad" },
      { id: 2, tipo: "verdadero-falso", enunciadoKey: "l7_q2_enun", opcionesKeys: ["l7_q2_op0", "l7_q2_op1"], correctas: [1], retroCorrectaKey: "l7_q2_ok", retroIncorrectaKey: "l7_q2_bad" },
      { id: 3, tipo: "unica", enunciadoKey: "l7_q3_enun", opcionesKeys: ["l7_q3_op0", "l7_q3_op1", "l7_q3_op2", "l7_q3_op3"], correctas: [1], retroCorrectaKey: "l7_q3_ok", retroIncorrectaKey: "l7_q3_bad" },
      { id: 4, tipo: "multiple", enunciadoKey: "l7_q4_enun", opcionesKeys: ["l7_q4_op0", "l7_q4_op1", "l7_q4_op2", "l7_q4_op3"], correctas: [0, 2], retroCorrectaKey: "l7_q4_ok", retroIncorrectaKey: "l7_q4_bad" }
    ]
  },
  8: {
    tituloKey: "level8Title",
    preguntas: [
      { id: 1, tipo: "unica", enunciadoKey: "l8_q1_enun", opcionesKeys: ["l8_q1_op0", "l8_q1_op1", "l8_q1_op2", "l8_q1_op3"], correctas: [2], retroCorrectaKey: "l8_q1_ok", retroIncorrectaKey: "l8_q1_bad" },
      { id: 2, tipo: "verdadero-falso", enunciadoKey: "l8_q2_enun", opcionesKeys: ["l8_q2_op0", "l8_q2_op1"], correctas: [1], retroCorrectaKey: "l8_q2_ok", retroIncorrectaKey: "l8_q2_bad" },
      { id: 3, tipo: "unica", enunciadoKey: "l8_q3_enun", opcionesKeys: ["l8_q3_op0", "l8_q3_op1", "l8_q3_op2", "l8_q3_op3"], correctas: [0], retroCorrectaKey: "l8_q3_ok", retroIncorrectaKey: "l8_q3_bad" },
      { id: 4, tipo: "multiple", enunciadoKey: "l8_q4_enun", opcionesKeys: ["l8_q4_op0", "l8_q4_op1", "l8_q4_op2", "l8_q4_op3"], correctas: [0, 1, 3], retroCorrectaKey: "l8_q4_ok", retroIncorrectaKey: "l8_q4_bad" }
    ]
  },
  9: {
    tituloKey: "level9Title",
    preguntas: [
      { id: 1, tipo: "unica", enunciadoKey: "l9_q1_enun", opcionesKeys: ["l9_q1_op0", "l9_q1_op1", "l9_q1_op2", "l9_q1_op3"], correctas: [1], retroCorrectaKey: "l9_q1_ok", retroIncorrectaKey: "l9_q1_bad" },
      { id: 2, tipo: "verdadero-falso", enunciadoKey: "l9_q2_enun", opcionesKeys: ["l9_q2_op0", "l9_q2_op1"], correctas: [0], retroCorrectaKey: "l9_q2_ok", retroIncorrectaKey: "l9_q2_bad" },
      { id: 3, tipo: "unica", enunciadoKey: "l9_q3_enun", opcionesKeys: ["l9_q3_op0", "l9_q3_op1", "l9_q3_op2", "l9_q3_op3"], correctas: [3], retroCorrectaKey: "l9_q3_ok", retroIncorrectaKey: "l9_q3_bad" },
      { id: 4, tipo: "multiple", enunciadoKey: "l9_q4_enun", opcionesKeys: ["l9_q4_op0", "l9_q4_op1", "l9_q4_op2", "l9_q4_op3"], correctas: [1], retroCorrectaKey: "l9_q4_ok", retroIncorrectaKey: "l9_q4_bad" }
    ]
  },
  10: {
    tituloKey: "level10Title",
    preguntas: [
      { id: 1, tipo: "unica", enunciadoKey: "l10_q1_enun", opcionesKeys: ["l10_q1_op0", "l10_q1_op1", "l10_q1_op2", "l10_q1_op3"], correctas: [1], retroCorrectaKey: "l10_q1_ok", retroIncorrectaKey: "l10_q1_bad" },
      { id: 2, tipo: "verdadero-falso", enunciadoKey: "l10_q2_enun", opcionesKeys: ["l10_q2_op0", "l10_q2_op1"], correctas: [1], retroCorrectaKey: "l10_q2_ok", retroIncorrectaKey: "l10_q2_bad" },
      { id: 3, tipo: "unica", enunciadoKey: "l10_q3_enun", opcionesKeys: ["l10_q3_op0", "l10_q3_op1", "l10_q3_op2", "l10_q3_op3"], correctas: [2], retroCorrectaKey: "l10_q3_ok", retroIncorrectaKey: "l10_q3_bad" },
      { id: 4, tipo: "multiple", enunciadoKey: "l10_q4_enun", opcionesKeys: ["l10_q4_op0", "l10_q4_op1", "l10_q4_op2", "l10_q4_op3"], correctas: [0, 2], retroCorrectaKey: "l10_q4_ok", retroIncorrectaKey: "l10_q4_bad" }
    ]
  },
  11: {
    tituloKey: "level11Title",
    preguntas: [
      { id: 1, tipo: "unica", enunciadoKey: "l11_q1_enun", opcionesKeys: ["l11_q1_op0", "l11_q1_op1", "l11_q1_op2", "l11_q1_op3"], correctas: [2], retroCorrectaKey: "l11_q1_ok", retroIncorrectaKey: "l11_q1_bad" },
      { id: 2, tipo: "verdadero-falso", enunciadoKey: "l11_q2_enun", opcionesKeys: ["l11_q2_op0", "l11_q2_op1"], correctas: [1], retroCorrectaKey: "l11_q2_ok", retroIncorrectaKey: "l11_q2_bad" },
      { id: 3, tipo: "unica", enunciadoKey: "l11_q3_enun", opcionesKeys: ["l11_q3_op0", "l11_q3_op1", "l11_q3_op2", "l11_q3_op3"], correctas: [1], retroCorrectaKey: "l11_q3_ok", retroIncorrectaKey: "l11_q3_bad" },
      { id: 4, tipo: "multiple", enunciadoKey: "l11_q4_enun", opcionesKeys: ["l11_q4_op0", "l11_q4_op1", "l11_q4_op2", "l11_q4_op3"], correctas: [0, 1, 3], retroCorrectaKey: "l11_q4_ok", retroIncorrectaKey: "l11_q4_bad" }
    ]
  },
  12: {
    tituloKey: "level12Title",
    preguntas: [
      { id: 1, tipo: "unica", enunciadoKey: "l12_q1_enun", opcionesKeys: ["l12_q1_op0", "l12_q1_op1", "l12_q1_op2", "l12_q1_op3"], correctas: [1], retroCorrectaKey: "l12_q1_ok", retroIncorrectaKey: "l12_q1_bad" },
      { id: 2, tipo: "verdadero-falso", enunciadoKey: "l12_q2_enun", opcionesKeys: ["l12_q2_op0", "l12_q2_op1"], correctas: [1], retroCorrectaKey: "l12_q2_ok", retroIncorrectaKey: "l12_q2_bad" },
      { id: 3, tipo: "unica", enunciadoKey: "l12_q3_enun", opcionesKeys: ["l12_q3_op0", "l12_q3_op1", "l12_q3_op2", "l12_q3_op3"], correctas: [2], retroCorrectaKey: "l12_q3_ok", retroIncorrectaKey: "l12_q3_bad" },
      { id: 4, tipo: "multiple", enunciadoKey: "l12_q4_enun", opcionesKeys: ["l12_q4_op0", "l12_q4_op1", "l12_q4_op2", "l12_q4_op3"], correctas: [0, 1, 3], retroCorrectaKey: "l12_q4_ok", retroIncorrectaKey: "l12_q4_bad" }
    ]
  },
  13: {
    tituloKey: "level13Title",
    preguntas: [
      { id: 1, tipo: "unica", enunciadoKey: "l13_q1_enun", opcionesKeys: ["l13_q1_op0", "l13_q1_op1", "l13_q1_op2", "l13_q1_op3"], correctas: [2], retroCorrectaKey: "l13_q1_ok", retroIncorrectaKey: "l13_q1_bad" },
      { id: 2, tipo: "verdadero-falso", enunciadoKey: "l13_q2_enun", opcionesKeys: ["l13_q2_op0", "l13_q2_op1"], correctas: [1], retroCorrectaKey: "l13_q2_ok", retroIncorrectaKey: "l13_q2_bad" },
      { id: 3, tipo: "unica", enunciadoKey: "l13_q3_enun", opcionesKeys: ["l13_q3_op0", "l13_q3_op1", "l13_q3_op2", "l13_q3_op3"], correctas: [0], retroCorrectaKey: "l13_q3_ok", retroIncorrectaKey: "l13_q3_bad" },
      { id: 4, tipo: "multiple", enunciadoKey: "l13_q4_enun", opcionesKeys: ["l13_q4_op0", "l13_q4_op1", "l13_q4_op2", "l13_q4_op3"], correctas: [0, 2], retroCorrectaKey: "l13_q4_ok", retroIncorrectaKey: "l13_q4_bad" }
    ]
  },
  14: {
    tituloKey: "level14Title",
    preguntas: [
      { id: 1, tipo: "unica", enunciadoKey: "l14_q1_enun", opcionesKeys: ["l14_q1_op0", "l14_q1_op1", "l14_q1_op2", "l14_q1_op3"], correctas: [3], retroCorrectaKey: "l14_q1_ok", retroIncorrectaKey: "l14_q1_bad" },
      { id: 2, tipo: "verdadero-falso", enunciadoKey: "l14_q2_enun", opcionesKeys: ["l14_q2_op0", "l14_q2_op1"], correctas: [0], retroCorrectaKey: "l14_q2_ok", retroIncorrectaKey: "l14_q2_bad" },
      { id: 3, tipo: "unica", enunciadoKey: "l14_q3_enun", opcionesKeys: ["l14_q3_op0", "l14_q3_op1", "l14_q3_op2", "l14_q3_op3"], correctas: [1], retroCorrectaKey: "l14_q3_ok", retroIncorrectaKey: "l14_q3_bad" },
      { id: 4, tipo: "multiple", enunciadoKey: "l14_q4_enun", opcionesKeys: ["l14_q4_op0", "l14_q4_op1", "l14_q4_op2", "l14_q4_op3"], correctas: [0, 1, 3], retroCorrectaKey: "l14_q4_ok", retroIncorrectaKey: "l14_q4_bad" }
    ]
  },
  15: {
    tituloKey: "level15Title",
    preguntas: [
      { id: 1, tipo: "unica", enunciadoKey: "l15_q1_enun", opcionesKeys: ["l15_q1_op0", "l15_q1_op1", "l15_q1_op2", "l15_q1_op3"], correctas: [1], retroCorrectaKey: "l15_q1_ok", retroIncorrectaKey: "l15_q1_bad" },
      { id: 2, tipo: "verdadero-falso", enunciadoKey: "l15_q2_enun", opcionesKeys: ["l15_q2_op0", "l15_q2_op1"], correctas: [1], retroCorrectaKey: "l15_q2_ok", retroIncorrectaKey: "l15_q2_bad" },
      { id: 3, tipo: "unica", enunciadoKey: "l15_q3_enun", opcionesKeys: ["l15_q3_op0", "l15_q3_op1", "l15_q3_op2", "l15_q3_op3"], correctas: [2], retroCorrectaKey: "l15_q3_ok", retroIncorrectaKey: "l15_q3_bad" },
      { id: 4, tipo: "multiple", enunciadoKey: "l15_q4_enun", opcionesKeys: ["l15_q4_op0", "l15_q4_op1", "l15_q4_op2", "l15_q4_op3"], correctas: [1], retroCorrectaKey: "l15_q4_ok", retroIncorrectaKey: "l15_q4_bad" }
    ]
  }
};

export const leccionesPorNivel: Record<number, { titulo: string; preguntas: Pregunta[] }> = leccionesPorNivelKeys as any;
