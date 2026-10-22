// --- MODALES DE SERVICIOS ---
function abrirModal(titulo, descripcion, imagen) {
  const modal = document.getElementById('modal-servicio');
  if (!modal) return;
  document.getElementById('modal-titulo').innerText = titulo;
  document.getElementById('modal-descripcion').innerText = descripcion;
  document.getElementById('modal-imagen').src = imagen;
  modal.classList.add('activo');
}

function cerrarModal() {
  const modal = document.getElementById('modal-servicio');
  if (modal) modal.classList.remove('activo');
}

// --- EVALUADOR DE SIGNOS VITALES ---
function evaluarSignos() {
  const sis = parseFloat(document.getElementById('sistolica')?.value) || 0;
  const dia = parseFloat(document.getElementById('diastolica')?.value) || 0;
  const pulso = parseFloat(document.getElementById('pulso')?.value) || 0;
  const temp = parseFloat(document.getElementById('temp')?.value) || 0;
  const oxigeno = parseFloat(document.getElementById('oxigeno')?.value) || 0;

  const contResultado = document.getElementById('resultado-vitales');
  if (!contResultado) return;

  let observaciones = [];

  if (sis < 90 || dia < 60) {
    observaciones.push({ texto: 'Presión Arterial: Hipotensión', tipo: 'badge-advertencia' });
  } else if (sis <= 120 && dia <= 80) {
    observaciones.push({ texto: 'Presión Arterial: Normal', tipo: 'badge-normal' });
  } else if (sis <= 139 || dia <= 89) {
    observaciones.push({ texto: 'Presión Arterial: Prehipertensión', tipo: 'badge-advertencia' });
  } else {
    observaciones.push({ texto: 'Presión Arterial: Alta / Hipertensión', tipo: 'badge-alerta' });
  }

  if (pulso < 60) {
    observaciones.push({ texto: 'Frecuencia Cardíaca: Bradicardia (<60 lpm)', tipo: 'badge-advertencia' });
  } else if (pulso <= 100) {
    observaciones.push({ texto: 'Frecuencia Cardíaca: Normal (60-100 lpm)', tipo: 'badge-normal' });
  } else {
    observaciones.push({ texto: 'Frecuencia Cardíaca: Taquicardia (>100 lpm)', tipo: 'badge-alerta' });
  }

  if (temp < 35.5) {
    observaciones.push({ texto: 'Temperatura: Hipotermia (<35.5°C)', tipo: 'badge-alerta' });
  } else if (temp <= 37.5) {
    observaciones.push({ texto: 'Temperatura: Normal (36°C-37.5°C)', tipo: 'badge-normal' });
  } else if (temp <= 38.0) {
    observaciones.push({ texto: 'Temperatura: Febrícula (37.6°C-38°C)', tipo: 'badge-advertencia' });
  } else {
    observaciones.push({ texto: 'Temperatura: Fiebre (>38°C)', tipo: 'badge-alerta' });
  }

  if (oxigeno >= 95) {
    observaciones.push({ texto: 'Saturación SpO2: Normal (95-100%)', tipo: 'badge-normal' });
  } else if (oxigeno >= 90) {
    observaciones.push({ texto: 'Saturación SpO2: Hipoxia Leve (90-94%)', tipo: 'badge-advertencia' });
  } else {
    observaciones.push({ texto: 'Saturación SpO2: Hipoxia Severa (<90%)', tipo: 'badge-alerta' });
  }

  contResultado.innerHTML = '<strong>Resumen Clínico de Referencia:</strong><br>' +
    observaciones.map(o => `<span class="resultado-badge ${o.tipo}">${o.texto}</span> `).join('');
}

// --- RELOJ POSTURAL / ROTACIÓN ---
const posiciones = [
  { nombre: "Decúbito Supino (Boca arriba)", desc: "Revisar puntos de presión: Nuca, omóplatos, codos, zona sacra y talones. Colocar almohada bajo las pantorrillas." },
  { nombre: "Decúbito Lateral Derecho", desc: "Apoyo en el costado derecho. Colocar almohadas entre las rodillas, apoyando el brazo izquierdo sobre cojín." },
  { nombre: "Decúbito Lateral Izquierdo", desc: "Apoyo en el costado izquierdo. Colocar almohada entre las piernas y proteger maléolo e ilíaco." },
  { nombre: "Posición Fowler (Sentado/Semisentado)", desc: "Elevar la cabecera 45°-60°. Proteger zona sacra y colocar soporte bajo las rodillas." }
];

let indicePosicion = 0;
let tiempoRestante = 7200; // 2 Horas en segundos
let intervaloReloj = null;

function iniciarReloj() {
  if (intervaloReloj) clearInterval(intervaloReloj);
  intervaloReloj = setInterval(() => {
    if (tiempoRestante > 0) {
      tiempoRestante--;
      actualizarPantallaReloj();
    } else {
      siguientePosicion();
    }
  }, 1000);
}

function actualizarPantallaReloj() {
  const elemTexto = document.getElementById('posicion-actual-texto');
  const elemTemp = document.getElementById('temporizador-reloj');
  const elemTitulo = document.getElementById('titulo-posicion');
  const elemDesc = document.getElementById('desc-posicion');

  if (!elemTexto) return;

  const pos = posiciones[indicePosicion];
  elemTexto.innerText = pos.nombre.split(' ')[1] || pos.nombre;
  elemTitulo.innerText = pos.nombre;
  elemDesc.innerText = pos.desc;

  const horas = Math.floor(tiempoRestante / 3600);
  const minutos = Math.floor((tiempoRestante % 3600) / 60);
  const segundos = tiempoRestante % 60;

  if (elemTemp) {
    elemTemp.innerText = `Sig. en: ${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
  }
}

function siguientePosicion() {
  indicePosicion = (indicePosicion + 1) % posiciones.length;
  reiniciarTemporizador();
}

function reiniciarTemporizador() {
  tiempoRestante = 7200;
  actualizarPantallaReloj();
  iniciarReloj();
}

// --- EMERGENCIA Y GUION 911 ---
let sintomasSeleccionados = [];
let audioContext = null;
let oscilador = null;
let sirenaActiva = false;
let intervaloSirena = null;

function toggleSintoma(elemento, sintoma) {
  elemento.classList.toggle('seleccionado');
  if (sintomasSeleccionados.includes(sintoma)) {
    sintomasSeleccionados = sintomasSeleccionados.filter(s => s !== sintoma);
  } else {
    sintomasSeleccionados.push(sintoma);
  }
  actualizarGuion();
}

function actualizarGuion() {
  const nombre = document.getElementById('em-nombre')?.value || '[Nombre Paciente]';
  const direccion = document.getElementById('em-direccion')?.value || '[Dirección Exacta]';
  const texto = document.getElementById('texto-guion');
  if (!texto) return;

  const listaSintomas = sintomasSeleccionados.length > 0 ? sintomasSeleccionados.join(', ') : 'síntomas no especificados aún';

  texto.innerText = `“Urgencias, necesito asistencia médica inmediata. Mi nombre es ${nombre} y me encuentro en ${direccion}. Tengo un paciente que presenta: ${listaSintomas}. Por favor envíen una ambulancia rápidamente.”`;
}

function conmutarSirena() {
  const btn = document.getElementById('btn-sirena');
  if (!sirenaActiva) {
    sirenaActiva = true;
    if (btn) btn.innerText = "🛑 Detener Alarma";
    
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    oscilador = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscilador.type = 'sine';
    oscilador.frequency.setValueAtTime(440, audioContext.currentTime);
    
    if (intervaloSirena) clearInterval(intervaloSirena);
    let subida = true;
    intervaloSirena = setInterval(() => {
      if (!sirenaActiva || !oscilador) return;
      if (subida) {
        oscilador.frequency.linearRampToValueAtTime(880, audioContext.currentTime + 0.5);
        subida = false;
      } else {
        oscilador.frequency.linearRampToValueAtTime(440, audioContext.currentTime + 0.5);
        subida = true;
      }
    }, 500);

    oscilador.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscilador.start();
  } else {
    sirenaActiva = false;
    if (btn) btn.innerText = "🚨 Activar Alarma / Sirena";
    if (intervaloSirena) {
      clearInterval(intervaloSirena);
      intervaloSirena = null;
    }
    if (oscilador) {
      try {
        oscilador.stop();
        oscilador.disconnect();
      } catch(e) {}
    }
    if (audioContext) audioContext.close();
  }
}

function reproducirVozGuion() {
  const texto = document.getElementById('texto-guion')?.innerText;
  if (!texto) return;
  
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const locucion = new SpeechSynthesisUtterance(texto);
    locucion.lang = 'es-ES';
    locucion.rate = 0.9;
    window.speechSynthesis.speak(locucion);
  } else {
    alert("Tu navegador no soporta la lectura por voz sintetizada.");
  }
}

// --- FORMULARIO DE CITAS ---
function procesarCita(e) {
  e.preventDefault();
  const msg = document.getElementById('mensaje-cita');
  if (msg) {
    msg.style.display = 'block';
    document.getElementById('form-cita').reset();
    setTimeout(() => { msg.style.display = 'none'; }, 5000);
  }
}

// Carga Inicial
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('resultado-vitales')) evaluarSignos();
  if (document.getElementById('temporizador-reloj')) {
    actualizarPantallaReloj();
    iniciarReloj();
  }
  if (document.getElementById('texto-guion')) actualizarGuion();
});