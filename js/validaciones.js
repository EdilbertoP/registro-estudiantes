// =============================================================
// Reglas de validación (las mismas se repiten en el servidor)
// =============================================================
const CARRERAS = [
  "Ingeniería en Sistemas",
  "Ingeniería Industrial",
  "Administración de Empresas",
  "Contaduría Pública",
  "Psicología",
  "Ingeniería Civil"
];
const GENEROS = ["Masculino", "Femenino", "Otro"];

const REGEX = {
  carne: /^[A-Za-z0-9]{8,}$/,                       // mínimo 8, solo alfanumérico
  letras: /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]+$/,              // solo letras y espacios
  correo: /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/,         // formato de email
  telefono: /^\d{4}-\d{4}$/                          // formato guatemalteco ####-####
};

// Calcula la edad exacta a partir de "AAAA-MM-DD"
function calcularEdad(fechaTexto) {
  const partes = fechaTexto.split("-").map(Number);
  const nac = new Date(partes[0], partes[1] - 1, partes[2]);
  const hoy = new Date();
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad;
}

// Cada función devuelve "" si es válido o el mensaje de error
const VALIDADORES = {
  carne(v) {
    if (!v) return "El carné es requerido.";
    if (v.length < 8) return "Debe tener al menos 8 caracteres.";
    if (!REGEX.carne.test(v)) return "Solo se permiten letras y números (sin espacios ni símbolos).";
    return "";
  },
  nombres(v) {
    if (!v) return "Los nombres son requeridos.";
    if (!REGEX.letras.test(v)) return "Solo se permiten letras y espacios.";
    return "";
  },
  apellidos(v) {
    if (!v) return "Los apellidos son requeridos.";
    if (!REGEX.letras.test(v)) return "Solo se permiten letras y espacios.";
    return "";
  },
  correo(v) {
    if (!v) return "El correo es requerido.";
    if (!REGEX.correo.test(v)) return "Ingrese un correo válido (ej. usuario@dominio.com).";
    return "";
  },
  carrera(v) {
    if (!v) return "Seleccione una carrera.";
    if (!CARRERAS.includes(v)) return "Carrera no válida.";
    return "";
  },
  telefono(v) {
    if (!v) return "El teléfono es requerido.";
    if (!REGEX.telefono.test(v)) return "Formato guatemalteco: ####-#### (8 dígitos).";
    return "";
  },
  fechaNacimiento(v) {
    if (!v) return "La fecha de nacimiento es requerida.";
    const edad = calcularEdad(v);
    if (isNaN(edad)) return "Fecha no válida.";
    if (edad < 16) return "El estudiante debe tener al menos 16 años.";
    if (edad > 100) return "Fecha no válida.";
    return "";
  },
  genero(v) {
    if (!v) return "Seleccione un género.";
    if (!GENEROS.includes(v)) return "Género no válido.";
    return "";
  }
};

// Permite reutilizar este archivo en Node (servidor)
if (typeof module !== "undefined") {
  module.exports = { VALIDADORES, CARRERAS, GENEROS, calcularEdad };
}
