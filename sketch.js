// ============================================================
// LABORATORIO VIRTUAL DE CALOR ESPECÍFICO - p5.js
// Archivo: sketch.js
// ============================================================

const ETAPA = {
  PESAR_VASO: 0,
  LLENAR_AGUA: 1,
  PESAR_VASO_AGUA: 2,
  RETIRAR_VASO: 3,
  ELEGIR_ESTADO: 4,
  PESAR_MUESTRA: 5,
  CALENTAR_MUESTRA: 6,
  INTRODUCIR_MUESTRA: 7,
  INTERCAMBIO_CALOR: 8,
  INGRESAR_RESULTADO: 9,
  RESULTADO_FINAL: 10
};

const ANCHO = 1100;
const ALTO = 640;
const CP_AGUA = 4.184;
const NUMERO_PASOS = 10;

let canvas;
let iniciado = false;
let etapa = ETAPA.PESAR_VASO;

let masaRecipiente = 0;
let volumenAgua = 0;
let masaAgua = 0;
let masaRecipienteAgua = 0;
let masaMuestra = 0;

let temperaturaAguaInicial = 20;
let temperaturaMuestraInicial = 20;
let temperaturaMuestraFinal = 100;
let temperaturaActualMuestra = 20;
let temperaturaEquilibrio = 0;

let calorEspecificoExperimental = 0;
let respuestaUsuario = 0;
let porcentajeError = 0;
let resultadoCorrecto = false;
let notaFinal = 0;

let vasoPesado = false;
let vasoAguaPesado = false;
let muestraPesada = false;
let intercambioCompletado = false;

let estadoElegido = "";
let materialActual = null;

const materiales = {
  solido: [
    {
      material: "Aluminio",
      calor: 0.900,
      masaMin: 70,
      masaMax: 95,
      color: "#a9b7c0"
    },
    {
      material: "Cobre",
      calor: 0.385,
      masaMin: 70,
      masaMax: 100,
      color: "#c36c4c"
    },
    {
      material: "Hierro",
      calor: 0.449,
      masaMin: 70,
      masaMax: 100,
      color: "#64748b"
    }
  ],

  liquido: [
    {
      material: "Aceite",
      calor: 2.000,
      masaMin: 60,
      masaMax: 85,
      color: "#e7b84d"
    },
    {
      material: "Etanol",
      calor: 2.440,
      masaMin: 55,
      masaMax: 80,
      color: "#9ee5ee"
    },
    {
      material: "Glicerina",
      calor: 2.430,
      masaMin: 65,
      masaMax: 90,
      color: "#b9da76"
    }
  ],

  gas: [
    {
      material: "Aire",
      calor: 1.005,
      masaMin: 1,
      masaMax: 5,
      color: "#dcecf3"
    },
    {
      material: "Helio",
      calor: 5.193,
      masaMin: 1,
      masaMax: 5,
      color: "#f5a8d3"
    },
    {
      material: "Nitrógeno",
      calor: 1.040,
      masaMin: 1,
      masaMax: 5,
      color: "#9db9f2"
    }
  ]
};

// Dispensador arriba a la izquierda de la balanza
const balanza = {
  x: 255,
  y: 420,
  w: 235,
  h: 140
};

const dispensador = {
  x: 35,
  y: 155,
  w: 190,
  h: 220
};

const calentador = {
  x: 760,
  y: 420,
  w: 255,
  h: 140
};

const botonesEstado = {
  solido: {
    x: 300,
    y: 165,
    w: 165,
    h: 58,
    color: "#7042ad",
    texto: "SÓLIDO"
  },

  liquido: {
    x: 485,
    y: 165,
    w: 165,
    h: 58,
    color: "#147bad",
    texto: "LÍQUIDO"
  },

  gas: {
    x: 670,
    y: 165,
    w: 165,
    h: 58,
    color: "#16834a",
    texto: "GAS"
  }
};

const botonReiniciar = {
  x: 420,
  y: 475,
  w: 260,
  h: 52
};

let vaso = {};
let muestra = {};

let tiempoIntercambio = 0;
let graficaTiempo = [];
let graficaAgua = [];
let graficaMuestra = [];

function setup() {
  canvas = createCanvas(ANCHO, ALTO);

  canvas.parent("canvas-container");
  canvas.style("display", "block");

  textFont("Arial");

  generarNuevoExperimento();

  const botonInicio = document.getElementById("startButton");

  if (botonInicio) {
    botonInicio.addEventListener("click", () => {
      generarNuevoExperimento();
      iniciado = true;
      actualizarInterfaz();
    });
  }

  const botonEnviar = document.getElementById(
    "submitAnswerButton"
  );

  if (botonEnviar) {
    botonEnviar.addEventListener(
      "click",
      enviarResultadoUsuario
    );
  }

  actualizarInterfaz();
}

function draw() {
  dibujarEscenario();

  if (!iniciado) {
    dibujarPantallaInicio();
    return;
  }

  actualizarProcesos();

  dibujarBalanza();
  dibujarDispensador();
  dibujarCalentador();
  dibujarVaso();

  if (etapa === ETAPA.ELEGIR_ESTADO) {
    dibujarSelectorEstado();
  }

  if (
    etapa >= ETAPA.PESAR_MUESTRA &&
    etapa < ETAPA.RESULTADO_FINAL
  ) {
    dibujarMuestra();
  }

  if (etapa === ETAPA.INTERCAMBIO_CALOR) {
    dibujarGrafica();
  }

  if (etapa === ETAPA.INGRESAR_RESULTADO) {
    dibujarGrafica();
    dibujarAvisoCalculo();
  }

  if (etapa === ETAPA.RESULTADO_FINAL) {
    dibujarResultadoFinal();
  }

  dibujarBandaAyuda();
  actualizarCursor();
}

function generarNuevoExperimento() {
  masaRecipiente = redondear(random(48, 58), 2);
  volumenAgua = redondear(random(45, 85), 2);

  masaAgua = 0;
  masaRecipienteAgua = 0;
  masaMuestra = 0;

  temperaturaActualMuestra = temperaturaMuestraInicial;
  temperaturaEquilibrio = 0;

  calorEspecificoExperimental = 0;
  respuestaUsuario = 0;
  porcentajeError = 0;
  resultadoCorrecto = false;
  notaFinal = 0;

  vasoPesado = false;
  vasoAguaPesado = false;
  muestraPesada = false;
  intercambioCompletado = false;

  estadoElegido = "";
  materialActual = null;

  tiempoIntercambio = 0;
  graficaTiempo = [];
  graficaAgua = [];
  graficaMuestra = [];

  vaso = {
    x: 580,
    y: 475,
    arrastrando: false,
    enBalanza: false,
    enDispensador: false,
    nivelAgua: 0
  };

  muestra = {
    x: 665,
    y: 475,
    arrastrando: false,
    enBalanza: false,
    enCalentador: false,
    dentroDelVaso: false
  };

  etapa = ETAPA.PESAR_VASO;

  ocultarPanelRespuesta();
  actualizarInterfaz();
}

function actualizarProcesos() {
  if (
    etapa === ETAPA.LLENAR_AGUA &&
    vaso.enDispensador
  ) {
    vaso.nivelAgua += 0.008;

    if (vaso.nivelAgua >= 1) {
      vaso.nivelAgua = 1;
      vaso.enDispensador = false;

      masaAgua = volumenAgua;

      vaso.x = 580;
      vaso.y = 475;

      etapa = ETAPA.PESAR_VASO_AGUA;

      actualizarInterfaz();
    }
  }

  if (
    etapa === ETAPA.CALENTAR_MUESTRA &&
    muestra.enCalentador
  ) {
    temperaturaActualMuestra += 0.18;

    if (
      temperaturaActualMuestra >=
      temperaturaMuestraFinal
    ) {
      temperaturaActualMuestra =
        temperaturaMuestraFinal;

      etapa = ETAPA.INTRODUCIR_MUESTRA;

      actualizarInterfaz();
    }
  }

  if (etapa === ETAPA.INTERCAMBIO_CALOR) {
    actualizarIntercambio();
  }
}

function iniciarIntercambio() {
  tiempoIntercambio = 0;

  graficaTiempo = [0];
  graficaAgua = [temperaturaAguaInicial];
  graficaMuestra = [temperaturaMuestraFinal];

  const eficiencia = 0.965;

  temperaturaEquilibrio =
    (
      masaAgua *
        CP_AGUA *
        temperaturaAguaInicial +
      eficiencia *
        masaMuestra *
        materialActual.calor *
        temperaturaMuestraFinal
    ) /
    (
      masaAgua *
        CP_AGUA +
      eficiencia *
        masaMuestra *
        materialActual.calor
    );
}

function actualizarIntercambio() {
  tiempoIntercambio += deltaTime / 1000;

  const progreso = constrain(
    tiempoIntercambio / 12,
    0,
    1
  );

  const curva = 1 - exp(-progreso * 4);

  const temperaturaAgua = lerp(
    temperaturaAguaInicial,
    temperaturaEquilibrio,
    curva
  );

  const temperaturaMuestra = lerp(
    temperaturaMuestraFinal,
    temperaturaEquilibrio,
    curva
  );

  if (frameCount % 3 === 0) {
    graficaTiempo.push(tiempoIntercambio);
    graficaAgua.push(temperaturaAgua);
    graficaMuestra.push(temperaturaMuestra);
  }

  if (progreso >= 1) {
    intercambioCompletado = true;

    calcularCalorEspecifico();

    etapa = ETAPA.INGRESAR_RESULTADO;

    mostrarPanelRespuesta();
    actualizarInterfaz();
  }
}

function calcularCalorEspecifico() {
  const qAgua =
    masaAgua *
    CP_AGUA *
    (
      temperaturaEquilibrio -
      temperaturaAguaInicial
    );

  calorEspecificoExperimental =
    qAgua /
    (
      masaMuestra *
      (
        temperaturaMuestraFinal -
        temperaturaEquilibrio
      )
    );
}

function elegirEstado(estado) {
  estadoElegido = estado;

  const opciones = materiales[estado];

  materialActual = random(opciones);

  masaMuestra = redondear(
    random(
      materialActual.masaMin,
      materialActual.masaMax
    ),
    2
  );

  muestra.x = 665;
  muestra.y = 475;

  muestra.enBalanza = false;
  muestra.enCalentador = false;
  muestra.dentroDelVaso = false;

  etapa = ETAPA.PESAR_MUESTRA;

  actualizarInterfaz();
}

function enviarResultadoUsuario() {
  if (etapa !== ETAPA.INGRESAR_RESULTADO) {
    return;
  }

  const input = document.getElementById(
    "specificHeatInput"
  );

  if (!input || input.value.trim() === "") {
    actualizarTexto(
      "answer-message",
      "Escribe un valor numérico antes de enviarlo."
    );
    return;
  }

  respuestaUsuario = parseFloat(input.value);

  if (
    Number.isNaN(respuestaUsuario) ||
    respuestaUsuario <= 0
  ) {
    actualizarTexto(
      "answer-message",
      "El valor debe ser un número positivo."
    );
    return;
  }

  porcentajeError =
    abs(
      respuestaUsuario -
      materialActual.calor
    ) /
    materialActual.calor *
    100;

  resultadoCorrecto = porcentajeError <= 10;

  notaFinal = max(
    0,
    5 - porcentajeError / 20
  );

  notaFinal = redondear(notaFinal, 1);

  ocultarPanelRespuesta();

  etapa = ETAPA.RESULTADO_FINAL;

  actualizarInterfaz();
}

function mostrarPanelRespuesta() {
  const panel = document.getElementById(
    "answer-panel"
  );

  const input = document.getElementById(
    "specificHeatInput"
  );

  const mensaje = document.getElementById(
    "answer-message"
  );

  if (panel) {
    panel.classList.remove("hidden");
  }

  if (input) {
    input.value = "";
  }

  if (mensaje) {
    mensaje.textContent = "";
  }
}

function ocultarPanelRespuesta() {
  const panel = document.getElementById(
    "answer-panel"
  );

  if (panel) {
    panel.classList.add("hidden");
  }
}

function actualizarInterfaz() {
  const datos = obtenerTextoEtapa();

  actualizarTexto(
    "stepNumber",
    etapa === ETAPA.RESULTADO_FINAL
      ? "EXPERIMENTO FINALIZADO"
      : "PASO " +
        min(etapa + 1, NUMERO_PASOS) +
        " DE " +
        NUMERO_PASOS
  );

  actualizarTexto(
    "instructionTitle",
    datos.titulo
  );

  actualizarTexto(
    "instructionText",
    datos.instruccion
  );

  actualizarTexto(
    "status",
    datos.estado
  );

  actualizarTexto(
    "cupMass",
    vasoPesado
      ? nf(masaRecipiente, 1, 2) + " g"
      : "0.00 g"
  );

  actualizarTexto(
    "cupWaterMass",
    vasoAguaPesado
      ? nf(masaRecipienteAgua, 1, 2) + " g"
      : "0.00 g"
  );

  actualizarTexto(
    "waterMass",
    vasoAguaPesado
      ? nf(masaAgua, 1, 2) + " g"
      : "0.00 g"
  );

  actualizarTexto(
    "sampleMass",
    muestraPesada
      ? nf(masaMuestra, 1, 2) + " g"
      : "0.00 g"
  );

  actualizarTexto(
    "finalTemperature",
    intercambioCompletado
      ? nf(temperaturaEquilibrio, 1, 2) + " °C"
      : "0.00 °C"
  );

  actualizarTexto(
    "materialName",
    muestraPesada
      ? "Desconocido"
      : "--"
  );

  const pasosCompletados =
    etapa === ETAPA.RESULTADO_FINAL
      ? NUMERO_PASOS
      : min(etapa, NUMERO_PASOS);

  const porcentaje =
    pasosCompletados /
    NUMERO_PASOS *
    100;

  const barra = document.getElementById(
    "progressBar"
  );

  if (barra) {
    barra.style.width = porcentaje + "%";
  }

  actualizarTexto(
    "progressText",
    pasosCompletados +
      " / " +
      NUMERO_PASOS
  );
}

function obtenerTextoEtapa() {
  switch (etapa) {
    case ETAPA.PESAR_VASO:
      return {
        titulo: "Pesar el vaso",
        instruccion:
          "Arrastra el vaso de precipitados hasta la balanza digital y registra su masa vacía.",
        estado:
          "Paso 1: pesa el vaso vacío"
      };

    case ETAPA.LLENAR_AGUA:
      return {
        titulo: "Agregar agua",
        instruccion:
          "Lleva el vaso al dispensador ubicado arriba a la izquierda de la balanza. El agua se agregará automáticamente.",
        estado:
          "Paso 2: llena el vaso con agua"
      };

    case ETAPA.PESAR_VASO_AGUA:
      return {
        titulo: "Pesar vaso con agua",
        instruccion:
          "Devuelve el vaso lleno a la balanza para registrar la masa total.",
        estado:
          "Paso 3: pesa el vaso con agua"
      };

    case ETAPA.RETIRAR_VASO:
      return {
        titulo:
          "Retirar el vaso de la balanza",
        instruccion:
          "La masa de vaso + agua ya fue registrada. Arrastra el vaso fuera de la balanza para liberarla antes de elegir y pesar la muestra.",
        estado:
          "Paso 4: retira el vaso de la balanza"
      };

    case ETAPA.ELEGIR_ESTADO:
      return {
        titulo:
          "Elegir estado de la muestra",
        instruccion:
          "La balanza está libre. Selecciona el estado físico de la muestra desconocida.",
        estado:
          "Paso 5: selecciona el estado de la muestra"
      };

    case ETAPA.PESAR_MUESTRA:
      return {
        titulo:
          "Pesar muestra desconocida",
        instruccion:
          "Arrastra la muestra desconocida a la balanza para registrar su masa.",
        estado:
          "Paso 6: pesa la muestra desconocida"
      };

    case ETAPA.CALENTAR_MUESTRA:
      return {
        titulo:
          "Calentar a 100 °C",
        instruccion:
          "Lleva la muestra a la placa calefactora y espera hasta que alcance 100 °C.",
        estado:
          "Paso 7: calentando la muestra"
      };

    case ETAPA.INTRODUCIR_MUESTRA:
      return {
        titulo:
          "Introducir en el agua",
        instruccion:
          "Retira la muestra caliente e introdúcela dentro del vaso con agua para iniciar el intercambio térmico.",
        estado:
          "Paso 8: introduce la muestra en el agua"
      };

    case ETAPA.INTERCAMBIO_CALOR:
      return {
        titulo:
          "Intercambio térmico",
        instruccion:
          "Observa la gráfica: el agua parte de 20 °C y la muestra de 100 °C, hasta alcanzar la temperatura de equilibrio.",
        estado:
          "Paso 9: registrando temperaturas"
      };

    case ETAPA.INGRESAR_RESULTADO:
      return {
        titulo:
          "Calcular calor específico",
        instruccion:
          "Usa los datos registrados y la temperatura de equilibrio para calcular el calor específico. Ingresa tu respuesta en el formulario.",
        estado:
          "Ingresa tu resultado en el formulario"
      };

    case ETAPA.RESULTADO_FINAL:
      return {
        titulo:
          "Resultado final",
        instruccion:
          "Compara tu respuesta con el valor real, descubre el material desconocido y revisa tu nota.",
        estado:
          "Experimento finalizado"
      };

    default:
      return {
        titulo: "Laboratorio",
        instruccion: "",
        estado: "Listo"
      };
  }
}

function plataformaBalanza() {
  return {
    x: balanza.x + 18,
    y: balanza.y - 55,
    w: balanza.w - 36,
    h: 105
  };
}

function dibujarEscenario() {
  background("#eaf1f5");

  noStroke();

  fill("#123047");
  rect(0, 0, width, 78);

  fill("#26a6b8");
  rect(0, 74, width, 4);

  fill("#ffffff");
  textStyle(BOLD);
  textSize(23);
  text("LABORATORIO VIRTUAL", 28, 34);

  fill("#b8d7e5");
  textStyle(NORMAL);
  textSize(14);
  text(
    "Calorimetría · medición e intercambio térmico",
    28,
    57
  );

  if (iniciado) {
    fill("#d9f6fa");

    textAlign(RIGHT, BASELINE);
    textSize(14);

    text(
      etapa === ETAPA.RESULTADO_FINAL
        ? "FINALIZADO"
        : "PASO " +
          min(etapa + 1, NUMERO_PASOS) +
          " / " +
          NUMERO_PASOS,
      width - 28,
      44
    );

    textAlign(LEFT, BASELINE);
  }

  fill("#dfeaf0");
  rect(0, 78, width, 450);

  dibujarVentana(930, 112);
  dibujarRepisa(310, 290);

  fill(22, 37, 48, 38);
  rect(215, 538, 840, 16, 8);

  fill("#d39a67");
  rect(215, 530, 840, 24, 4);

  fill("#efbd87");
  rect(215, 530, 840, 6, 4);

  fill("#78513a");
  rect(215, 554, 840, 86);

  stroke("#66412e");
  strokeWeight(2);

  for (let y = 578; y < 640; y += 24) {
    line(235, y, 1035, y);
  }

  noStroke();

  fill("#523728");
  rect(265, 610, 45, 30);
  rect(960, 610, 45, 30);
}

function dibujarPantallaInicio() {
  dibujarTarjeta(
    290,
    150,
    520,
    245,
    "#ffffff",
    "#d6e2e8",
    20
  );

  fill("#123047");

  textAlign(CENTER, BASELINE);
  textStyle(BOLD);
  textSize(28);

  text(
    "LISTO PARA EXPERIMENTAR",
    width / 2,
    222
  );

  fill("#486581");

  textStyle(NORMAL);
  textSize(17);

  text(
    "Pulsa “Iniciar / reiniciar laboratorio”",
    width / 2,
    268
  );

  text(
    "para comenzar la simulación.",
    width / 2,
    296
  );

  fill("#0c7c86");
  rect(
    width / 2 - 160,
    325,
    320,
    42,
    10
  );

  fill("#ffffff");

  textStyle(BOLD);
  textSize(15);

  text(
    "USA EL BOTÓN DEL PANEL IZQUIERDO",
    width / 2,
    352
  );

  textAlign(LEFT, BASELINE);
  textStyle(NORMAL);
}

function dibujarVentana(x, y) {
  dibujarTarjeta(
    x,
    y,
    130,
    98,
    "#cbe9f4",
    "#a7d2e0",
    14
  );

  noStroke();

  fill("#83c6de");
  rect(x + 10, y + 10, 110, 78, 10);

  stroke(255, 255, 255, 175);
  strokeWeight(3);

  line(x + 65, y + 14, x + 65, y + 84);
  line(x + 14, y + 49, x + 116, y + 49);

  noStroke();
}

function dibujarRepisa(x, y) {
  fill("#78909c");
  rect(x, y, 355, 10, 4);

  dibujarFrasco(
    x + 35,
    y - 48,
    "#7ad6cb",
    "H₂O"
  );

  dibujarFrasco(
    x + 130,
    y - 56,
    "#ffd080",
    "NaCl"
  );

  dibujarFrasco(
    x + 230,
    y - 44,
    "#d9a7e8",
    "Cu"
  );
}

function dibujarBalanza() {
  noStroke();

  fill(20, 35, 45, 46);
  rect(
    balanza.x + 7,
    balanza.y + 8,
    balanza.w,
    balanza.h,
    18
  );

  fill("#334e68");
  rect(
    balanza.x,
    balanza.y,
    balanza.w,
    balanza.h,
    18
  );

  const plataforma = plataformaBalanza();

  fill("#dce7ec");
  rect(
    plataforma.x,
    plataforma.y + 18,
    plataforma.w,
    42,
    9
  );

  fill("#b6cad4");
  rect(
    plataforma.x + 12,
    plataforma.y + 28,
    plataforma.w - 24,
    12,
    5
  );

  fill("#15212d");
  rect(
    balanza.x + 38,
    balanza.y + 63,
    159,
    42,
    7
  );

  const vasoSobreBalanza =
    vaso.enBalanza ||
    dentroRect(
      vaso.x,
      vaso.y,
      plataforma
    );

  const muestraSobreBalanza =
    muestra.enBalanza ||
    dentroRect(
      muestra.x,
      muestra.y,
      plataforma
    );

  let lectura = 0;
  let objetoEnBalanza = false;

  if (vasoSobreBalanza) {
    objetoEnBalanza = true;

    if (
      etapa === ETAPA.PESAR_VASO ||
      vasoPesado
    ) {
      lectura = masaRecipiente;
    }

    if (
      etapa === ETAPA.PESAR_VASO_AGUA ||
      etapa === ETAPA.RETIRAR_VASO ||
      vasoAguaPesado
    ) {
      lectura = masaRecipiente + masaAgua;
    }
  }

  if (muestraSobreBalanza) {
    objetoEnBalanza = true;

    if (
      etapa === ETAPA.PESAR_MUESTRA ||
      muestraPesada
    ) {
      lectura = masaMuestra;
    }
  }

  fill("#a7f3d0");

  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(21);

  text(
    nf(lectura, 1, 2) + " g",
    balanza.x + balanza.w / 2,
    balanza.y + 84
  );

  fill("#ffffff");
  textSize(13);

  text(
    objetoEnBalanza
      ? "LECTURA ACTIVA"
      : "BALANZA DIGITAL",
    balanza.x + balanza.w / 2,
    balanza.y + 123
  );

  textAlign(LEFT, BASELINE);
  textStyle(NORMAL);
}

function dibujarDispensador() {
  dibujarTarjeta(
    dispensador.x,
    dispensador.y,
    dispensador.w,
    dispensador.h,
    "#ffffff",
    "#b6d8e5",
    18
  );

  noStroke();

  fill("#86c5df");
  rect(
    dispensador.x + 40,
    dispensador.y + 26,
    110,
    72,
    14
  );

  fill(255, 255, 255, 85);
  ellipse(
    dispensador.x + 76,
    dispensador.y + 51,
    28,
    41
  );

  fill("#123047");

  textAlign(CENTER, BASELINE);
  textStyle(BOLD);
  textSize(15);

  text(
    "DISPENSADOR",
    dispensador.x + dispensador.w / 2,
    dispensador.y + 126
  );

  noStroke();

  fill("#627d98");
  rect(
    dispensador.x + 80,
    dispensador.y + 140,
    33,
    21,
    5
  );

  rect(
    dispensador.x + 91,
    dispensador.y + 158,
    12,
    25,
    4
  );

  if (
    vaso.enDispensador &&
    etapa === ETAPA.LLENAR_AGUA
  ) {
    stroke("#35a6df");
    strokeWeight(8);

    line(
      dispensador.x + 97,
      dispensador.y + 183,
      dispensador.x + 97,
      dispensador.y + 215
    );

    noStroke();

    fill("#35a6df");
    circle(
      dispensador.x + 97,
      dispensador.y + 218,
      9
    );
  }

  fill("#45606f");
  rect(
    dispensador.x + 26,
    dispensador.y + 194,
    139,
    15,
    6
  );

  textAlign(LEFT, BASELINE);
  textStyle(NORMAL);
}

function dibujarCalentador() {
  noStroke();

  fill(20, 35, 45, 46);
  rect(
    calentador.x + 7,
    calentador.y + 8,
    calentador.w,
    calentador.h,
    18
  );

  fill("#455a64");
  rect(
    calentador.x,
    calentador.y,
    calentador.w,
    calentador.h,
    18
  );

  fill("#263238");
  rect(
    calentador.x + 27,
    calentador.y + 38,
    calentador.w - 54,
    57,
    12
  );

  fill("#172129");
  ellipse(
    calentador.x + calentador.w / 2,
    calentador.y + 68,
    138,
    42
  );

  const activo =
    muestra.enCalentador &&
    etapa === ETAPA.CALENTAR_MUESTRA;

  fill(activo ? "#ff7043" : "#90a4ae");
  circle(
    calentador.x + 32,
    calentador.y + 114,
    12
  );

  if (muestra.enCalentador) {
    noFill();

    stroke(255, 255, 255, 170);
    strokeWeight(3);

    for (let i = 0; i < 3; i++) {
      const ox =
        calentador.x +
        92 +
        i * 30;

      const oy =
        calentador.y +
        29 -
        sin(frameCount * 0.08 + i) * 6;

      arc(
        ox,
        oy,
        16,
        26,
        PI,
        TWO_PI
      );
    }

    noStroke();
  }

  fill("#ffffff");

  textAlign(CENTER, BASELINE);
  textStyle(BOLD);
  textSize(15);

  text(
    "PLACA CALEFACTORA",
    calentador.x + calentador.w / 2,
    calentador.y + 123
  );

  textAlign(LEFT, BASELINE);
  textStyle(NORMAL);
}

function dibujarVaso() {
  push();

  translate(vaso.x, vaso.y);

  noStroke();

  fill(20, 35, 45, 38);
  ellipse(0, 57, 92, 15);

  if (vaso.nivelAgua > 0) {
    const altura =
      78 *
      vaso.nivelAgua;

    fill("#36a7df");
    rect(
      -37,
      40 - altura,
      74,
      altura,
      3
    );

    fill(255, 255, 255, 70);
    ellipse(
      -12,
      28 - altura / 2,
      11,
      altura * 0.74
    );
  }

  if (muestra.dentroDelVaso) {
    fill(materialActual.color);
    ellipse(0, 20, 35, 22);

    fill(255, 255, 255, 80);
    circle(-8, 12, 8);
  }

  stroke("#486779");
  strokeWeight(4);

  fill(255, 255, 255, 42);
  rect(-44, -45, 88, 92, 4);

  stroke("#344e5d");
  line(-47, -45, 47, -45);
  line(-38, -51, 38, -51);

  stroke("#78909c");
  strokeWeight(1.5);

  for (let y = -20; y <= 30; y += 12) {
    line(25, y, 38, y);
  }

  noStroke();

  fill("#253c4b");

  textAlign(CENTER, BASELINE);
  textStyle(BOLD);
  textSize(13);

  text("VASO", 0, 76);

  pop();

  textAlign(LEFT, BASELINE);
  textStyle(NORMAL);
}

function dibujarMuestra() {
  if (muestra.dentroDelVaso) {
    return;
  }

  push();

  translate(muestra.x, muestra.y);

  noStroke();

  fill(20, 35, 45, 38);
  ellipse(3, 37, 58, 12);

  const colorMuestra = materialActual
    ? materialActual.color
    : "#8e44ad";

  if (estadoElegido === "gas") {
    fill(colorMuestra);

    circle(-18, 3, 32);
    circle(0, -8, 42);
    circle(20, 4, 30);

    fill(255, 255, 255, 105);
    circle(-5, -15, 12);

  } else if (
    estadoElegido === "liquido"
  ) {
    fill("#d9edf6");
    rect(-23, -30, 46, 62, 8);

    fill(colorMuestra);
    rect(-18, -2, 36, 28, 5);

    fill("#6f8794");
    rect(-15, -38, 30, 10, 3);

  } else {
    fill(colorMuestra);

    stroke("#485861");
    strokeWeight(2);

    beginShape();

    vertex(-25, -10);
    vertex(-6, -29);
    vertex(24, -15);
    vertex(20, 18);
    vertex(-17, 27);
    vertex(-30, 9);

    endShape(CLOSE);
  }

  if (muestra.enCalentador) {
    noStroke();

    fill("#e74c3c");

    textAlign(CENTER, BASELINE);
    textStyle(BOLD);
    textSize(16);

    text(
      nf(
        temperaturaActualMuestra,
        1,
        1
      ) + " °C",
      0,
      -57
    );
  }

  pop();

  textAlign(LEFT, BASELINE);
  textStyle(NORMAL);
}

function dibujarSelectorEstado() {
  dibujarTarjeta(
    260,
    110,
    610,
    145,
    "#ffffff",
    "#d6e2e8",
    16
  );

  fill("#123047");

  textAlign(CENTER, BASELINE);
  textStyle(BOLD);
  textSize(20);

  text(
    "¿EN QUÉ ESTADO ESTÁ LA MUESTRA?",
    565,
    147
  );

  dibujarBotonEstado(
    botonesEstado.solido
  );

  dibujarBotonEstado(
    botonesEstado.liquido
  );

  dibujarBotonEstado(
    botonesEstado.gas
  );

  textAlign(LEFT, BASELINE);
  textStyle(NORMAL);
}

function dibujarBotonEstado(boton) {
  const encima = dentroRect(
    mouseX,
    mouseY,
    boton
  );

  noStroke();

  fill(20, 35, 45, 55);
  rect(
    boton.x,
    boton.y + 5,
    boton.w,
    boton.h,
    12
  );

  fill(boton.color);
  rect(
    boton.x,
    boton.y,
    boton.w,
    boton.h,
    12
  );

  fill(255, 255, 255, encima ? 52 : 25);
  rect(
    boton.x + 2,
    boton.y + 2,
    boton.w - 4,
    10,
    8
  );

  fill(255, 255, 255, 190);
  circle(
    boton.x + 25,
    boton.y + boton.h / 2,
    16
  );

  fill("#ffffff");

  textAlign(LEFT, BASELINE);
  textStyle(BOLD);
  textSize(17);

  text(
    boton.texto,
    boton.x + 45,
    boton.y + 37
  );

  textStyle(NORMAL);
}

function dibujarGrafica() {
  const x = 245;
  const y = 100;
  const w = 465;
  const h = 280;

  dibujarTarjeta(
    x,
    y,
    w,
    h,
    "#ffffff",
    "#d6e2e8",
    16
  );

  fill("#123047");
  textStyle(BOLD);
  textSize(17);

  text(
    "INTERCAMBIO DE CALOR",
    x + 20,
    y + 31
  );

  fill("#607d8b");
  textStyle(NORMAL);
  textSize(12);

  text(
    "Temperatura (°C) frente al tiempo",
    x + 20,
    y + 50
  );

  const gx = x + 50;
  const gy = y + 68;
  const gw = w - 72;
  const gh = h - 104;

  stroke("#e1eaef");
  strokeWeight(1);

  for (let i = 0; i <= 5; i++) {
    const yy =
      gy +
      gh / 5 * i;

    line(
      gx,
      yy,
      gx + gw,
      yy
    );
  }

  for (let i = 0; i <= 6; i++) {
    const xx =
      gx +
      gw / 6 * i;

    line(
      xx,
      gy,
      xx,
      gy + gh
    );
  }

  stroke("#78909c");
  strokeWeight(2);

  line(
    gx,
    gy,
    gx,
    gy + gh
  );

  line(
    gx,
    gy + gh,
    gx + gw,
    gy + gh
  );

  noStroke();

  fill("#607d8b");
  textSize(10);

  text(
    "100",
    gx - 31,
    gy + 4
  );

  text(
    "20",
    gx - 31,
    gy +
      gh -
      gh * 0.2 +
      4
  );

  text(
    "0",
    gx - 18,
    gy + gh + 4
  );

  text(
    "12 s",
    gx + gw - 21,
    gy + gh + 20
  );

  if (graficaTiempo.length > 1) {
    noFill();

    stroke("#1d9bf0");
    strokeWeight(3);

    beginShape();

    for (
      let i = 0;
      i < graficaTiempo.length;
      i++
    ) {
      const px = map(
        graficaTiempo[i],
        0,
        12,
        gx,
        gx + gw
      );

      const py = map(
        graficaAgua[i],
        0,
        100,
        gy + gh,
        gy
      );

      vertex(px, py);
    }

    endShape();

    stroke("#e85d4a");
    strokeWeight(3);

    beginShape();

    for (
      let i = 0;
      i < graficaTiempo.length;
      i++
    ) {
      const px = map(
        graficaTiempo[i],
        0,
        12,
        gx,
        gx + gw
      );

      const py = map(
        graficaMuestra[i],
        0,
        100,
        gy + gh,
        gy
      );

      vertex(px, py);
    }

    endShape();
  }

  noStroke();

  fill("#1d9bf0");
  circle(
    x + 275,
    y + 31,
    8
  );

  fill("#334e68");
  textSize(12);

  text(
    "Agua",
    x + 286,
    y + 35
  );

  fill("#e85d4a");
  circle(
    x + 345,
    y + 31,
    8
  );

  fill("#334e68");

  text(
    "Muestra",
    x + 356,
    y + 35
  );

  if (graficaTiempo.length > 0) {
    const puntoX =
      gx + gw;

    const puntoY = map(
      temperaturaEquilibrio,
      0,
      100,
      gy + gh,
      gy
    );

    fill("#0c7c86");
    circle(
      puntoX,
      puntoY,
      11
    );

    fill("#064e55");
    textStyle(BOLD);
    textSize(13);

    text(
      "Tf = " +
        nf(
          temperaturaEquilibrio,
          1,
          2
        ) +
        " °C",
      puntoX - 140,
      puntoY - 14
    );

    textStyle(NORMAL);
  }
}

function dibujarAvisoCalculo() {
  dibujarTarjeta(
    740,
    118,
    270,
    155,
    "#fff8e1",
    "#f4c95d",
    16
  );

  fill("#7c4a03");
  textStyle(BOLD);
  textSize(17);

  text(
    "DATOS REGISTRADOS",
    767,
    155
  );

  fill("#7c5d1b");
  textStyle(NORMAL);
  textSize(14);

  text(
    "Masa agua: " +
      nf(
        masaAgua,
        1,
        2
      ) +
      " g",
    767,
    188
  );

  text(
    "Masa muestra: " +
      nf(
        masaMuestra,
        1,
        2
      ) +
      " g",
    767,
    210
  );

  text(
    "Tf: " +
      nf(
        temperaturaEquilibrio,
        1,
        2
      ) +
      " °C",
    767,
    232
  );

  text(
    "Usa Q ganado = Q perdido",
    767,
    258
  );
}

function dibujarResultadoFinal() {
  noStroke();

  fill(10, 28, 42, 145);
  rect(
    0,
    0,
    width,
    height
  );

  dibujarTarjeta(
    235,
    75,
    630,
    490,
    "#ffffff",
    "#d6e2e8",
    22
  );

  fill(
    resultadoCorrecto
      ? "#0c7c86"
      : "#c2410c"
  );

  textAlign(CENTER, BASELINE);
  textStyle(BOLD);
  textSize(28);

  text(
    resultadoCorrecto
      ? "¡RESULTADO CORRECTO!"
      : "RESULTADO POR AJUSTAR",
    width / 2,
    135
  );

  fill("#123047");
  textSize(22);

  text(
    "Material desconocido: " +
      materialActual.material,
    width / 2,
    185
  );

  fill("#334e68");
  textStyle(NORMAL);
  textSize(17);

  text(
    "Tu respuesta: " +
      nf(
        respuestaUsuario,
        1,
        3
      ) +
      " J/(g·°C)",
    width / 2,
    235
  );

  text(
    "Valor experimental: " +
      nf(
        calorEspecificoExperimental,
        1,
        3
      ) +
      " J/(g·°C)",
    width / 2,
    273
  );

  text(
    "Valor real: " +
      nf(
        materialActual.calor,
        1,
        3
      ) +
      " J/(g·°C)",
    width / 2,
    311
  );

  text(
    "Error respecto al valor real: " +
      nf(
        porcentajeError,
        1,
        2
      ) +
      " %",
    width / 2,
    349
  );

  fill(
    notaFinal >= 3.0
      ? "#0c7c86"
      : "#c2410c"
  );

  textStyle(BOLD);
  textSize(23);

  text(
    "NOTA FINAL: " +
      nf(
        notaFinal,
        1,
        1
      ) +
      " / 5.0",
    width / 2,
    401
  );

  fill("#0c7c86");
  rect(
    botonReiniciar.x,
    botonReiniciar.y,
    botonReiniciar.w,
    botonReiniciar.h,
    12
  );

  fill("#ffffff");
  textSize(16);

  text(
    "NUEVO EXPERIMENTO",
    width / 2,
    botonReiniciar.y + 33
  );

  textAlign(LEFT, BASELINE);
  textStyle(NORMAL);
}

function dibujarBandaAyuda() {
  if (
    etapa === ETAPA.RESULTADO_FINAL
  ) {
    return;
  }

  noStroke();

  fill(18, 48, 70, 210);
  rect(
    230,
    588,
    795,
    34,
    9
  );

  fill("#ffffff");
  textSize(14);

  text(
    "Consejo: arrastra el objeto indicado hacia el equipo solicitado en la instrucción.",
    251,
    610
  );
}

function mousePressed() {
  if (!iniciado) {
    return;
  }

  if (
    etapa === ETAPA.RESULTADO_FINAL
  ) {
    if (
      dentroRect(
        mouseX,
        mouseY,
        botonReiniciar
      )
    ) {
      generarNuevoExperimento();

      iniciado = true;

      actualizarInterfaz();
    }

    return;
  }

  if (
    etapa === ETAPA.ELEGIR_ESTADO
  ) {
    if (
      dentroRect(
        mouseX,
        mouseY,
        botonesEstado.solido
      )
    ) {
      elegirEstado("solido");
      return;
    }

    if (
      dentroRect(
        mouseX,
        mouseY,
        botonesEstado.liquido
      )
    ) {
      elegirEstado("liquido");
      return;
    }

    if (
      dentroRect(
        mouseX,
        mouseY,
        botonesEstado.gas
      )
    ) {
      elegirEstado("gas");
      return;
    }
  }

  const puedeTomarVaso =
    etapa === ETAPA.PESAR_VASO ||
    etapa === ETAPA.LLENAR_AGUA ||
    etapa === ETAPA.PESAR_VASO_AGUA ||
    etapa === ETAPA.RETIRAR_VASO;

  if (
    puedeTomarVaso &&
    dist(
      mouseX,
      mouseY,
      vaso.x,
      vaso.y
    ) < 70
  ) {
    vaso.arrastrando = true;
    vaso.enBalanza = false;
    vaso.enDispensador = false;
  }

  const puedeTomarMuestra =
    etapa === ETAPA.PESAR_MUESTRA ||
    etapa === ETAPA.CALENTAR_MUESTRA ||
    etapa === ETAPA.INTRODUCIR_MUESTRA;

  if (
    puedeTomarMuestra &&
    !muestra.dentroDelVaso &&
    dist(
      mouseX,
      mouseY,
      muestra.x,
      muestra.y
    ) < 58
  ) {
    muestra.arrastrando = true;
    muestra.enBalanza = false;

    if (
      etapa === ETAPA.INTRODUCIR_MUESTRA
    ) {
      muestra.enCalentador = false;
    }
  }
}

function mouseDragged() {
  if (!iniciado) {
    return;
  }

  if (vaso.arrastrando) {
    vaso.x = mouseX;
    vaso.y = mouseY;
  }

  if (muestra.arrastrando) {
    muestra.x = mouseX;
    muestra.y = mouseY;
  }
}

function mouseReleased() {
  if (!iniciado) {
    return;
  }

  const plataforma =
    plataformaBalanza();

  if (vaso.arrastrando) {
    vaso.arrastrando = false;
    vaso.enBalanza = false;
    vaso.enDispensador = false;

    if (
      dentroRect(
        mouseX,
        mouseY,
        plataforma
      )
    ) {
      vaso.x =
        balanza.x +
        balanza.w / 2;

      vaso.y =
        balanza.y -
        12;

      vaso.enBalanza = true;

      if (
        etapa === ETAPA.PESAR_VASO
      ) {
        vasoPesado = true;

        etapa = ETAPA.LLENAR_AGUA;
      }

      else if (
        etapa === ETAPA.PESAR_VASO_AGUA
      ) {
        masaRecipienteAgua =
          masaRecipiente +
          masaAgua;

        vasoAguaPesado = true;

        etapa = ETAPA.RETIRAR_VASO;
      }

      actualizarInterfaz();
      return;
    }

    if (
      etapa === ETAPA.LLENAR_AGUA &&
      dentroRect(
        mouseX,
        mouseY,
        dispensador
      )
    ) {
      vaso.x =
        dispensador.x +
        dispensador.w / 2;

      vaso.y =
        dispensador.y +
        dispensador.h +
        24;

      vaso.enDispensador = true;

      actualizarInterfaz();
      return;
    }

    if (
      etapa === ETAPA.RETIRAR_VASO
    ) {
      vaso.enBalanza = false;
      vaso.enDispensador = false;

      etapa = ETAPA.ELEGIR_ESTADO;

      actualizarInterfaz();
    }
  }

  if (muestra.arrastrando) {
    muestra.arrastrando = false;
    muestra.enBalanza = false;

    if (
      etapa === ETAPA.PESAR_MUESTRA &&
      dentroRect(
        mouseX,
        mouseY,
        plataforma
      )
    ) {
      muestra.x =
        balanza.x +
        balanza.w / 2;

      muestra.y =
        balanza.y -
        20;

      muestra.enBalanza = true;
      muestraPesada = true;

      etapa = ETAPA.CALENTAR_MUESTRA;

      actualizarInterfaz();
      return;
    }

    if (
      etapa === ETAPA.CALENTAR_MUESTRA &&
      dentroRect(
        mouseX,
        mouseY,
        calentador
      )
    ) {
      muestra.x =
        calentador.x +
        calentador.w / 2;

      muestra.y =
        calentador.y +
        55;

      muestra.enCalentador = true;

      temperaturaActualMuestra =
        temperaturaMuestraInicial;

      actualizarInterfaz();
      return;
    }

    if (
      etapa === ETAPA.INTRODUCIR_MUESTRA &&
      dist(
        mouseX,
        mouseY,
        vaso.x,
        vaso.y
      ) < 85
    ) {
      muestra.x = vaso.x;
      muestra.y = vaso.y + 12;

      muestra.enCalentador = false;
      muestra.dentroDelVaso = true;

      iniciarIntercambio();

      etapa = ETAPA.INTERCAMBIO_CALOR;

      actualizarInterfaz();
    }
  }
}

function actualizarCursor() {
  let activo = false;

  const puedeTomarVaso =
    etapa === ETAPA.PESAR_VASO ||
    etapa === ETAPA.LLENAR_AGUA ||
    etapa === ETAPA.PESAR_VASO_AGUA ||
    etapa === ETAPA.RETIRAR_VASO;

  if (
    puedeTomarVaso &&
    dist(
      mouseX,
      mouseY,
      vaso.x,
      vaso.y
    ) < 70
  ) {
    activo = true;
  }

  const puedeTomarMuestra =
    etapa === ETAPA.PESAR_MUESTRA ||
    etapa === ETAPA.CALENTAR_MUESTRA ||
    etapa === ETAPA.INTRODUCIR_MUESTRA;

  if (
    puedeTomarMuestra &&
    !muestra.dentroDelVaso &&
    dist(
      mouseX,
      mouseY,
      muestra.x,
      muestra.y
    ) < 58
  ) {
    activo = true;
  }

  if (
    etapa === ETAPA.ELEGIR_ESTADO
  ) {
    activo =
      dentroRect(
        mouseX,
        mouseY,
        botonesEstado.solido
      ) ||
      dentroRect(
        mouseX,
        mouseY,
        botonesEstado.liquido
      ) ||
      dentroRect(
        mouseX,
        mouseY,
        botonesEstado.gas
      );
  }

  if (
    etapa === ETAPA.RESULTADO_FINAL &&
    dentroRect(
      mouseX,
      mouseY,
      botonReiniciar
    )
  ) {
    activo = true;
  }

  cursor(
    activo
      ? HAND
      : ARROW
  );
}

function dibujarTarjeta(
  x,
  y,
  w,
  h,
  colorFondo,
  colorBorde,
  radio
) {
  noStroke();

  fill(20, 35, 45, 30);
  rect(
    x + 5,
    y + 6,
    w,
    h,
    radio
  );

  stroke(colorBorde);
  strokeWeight(1.4);

  fill(colorFondo);
  rect(
    x,
    y,
    w,
    h,
    radio
  );

  noStroke();
}

function dibujarFrasco(
  x,
  y,
  colorLiquido,
  etiqueta
) {
  noStroke();

  fill("#7b8d97");
  rect(
    x + 12,
    y - 12,
    28,
    9,
    3
  );

  fill("#e8f2f5");
  rect(
    x,
    y,
    52,
    55,
    8
  );

  fill(colorLiquido);
  rect(
    x + 5,
    y + 27,
    42,
    22,
    5
  );

  fill("#46606f");

  textAlign(CENTER, BASELINE);
  textSize(11);

  text(
    etiqueta,
    x + 26,
    y + 21
  );

  textAlign(LEFT, BASELINE);
}

function dentroRect(
  px,
  py,
  rectangulo
) {
  return (
    px >= rectangulo.x &&
    px <=
      rectangulo.x +
      rectangulo.w &&
    py >= rectangulo.y &&
    py <=
      rectangulo.y +
      rectangulo.h
  );
}

function redondear(
  numero,
  decimales
) {
  const factor =
    Math.pow(
      10,
      decimales
    );

  return (
    Math.round(
      numero *
      factor
    ) /
    factor
  );
}

function actualizarTexto(
  id,
  valor
) {
  const elemento =
    document.getElementById(id);

  if (elemento) {
    elemento.textContent = valor;
  }
}