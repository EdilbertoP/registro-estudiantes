// =============================================================
// Lógica del formulario de registro
// =============================================================
const form = document.getElementById("formRegistro");
const btnEnviar = document.getElementById("btnEnviar");
const mensaje = document.getElementById("mensaje");

const CAMPOS = ["carne", "nombres", "apellidos", "correo", "carrera", "telefono", "fechaNacimiento", "genero"];
const tocados = {};          // para mostrar errores solo cuando el usuario ya interactuó
let captchaToken = "";       // token devuelto por reCAPTCHA
let widgetId = null;

// Fecha máxima permitida en el calendario = hoy - 16 años
(function limitarFecha() {
  const h = new Date();
  const max = new Date(h.getFullYear() - 16, h.getMonth(), h.getDate());
  const f = d => d.toISOString().slice(0, 10);
  document.getElementById("fechaNacimiento").max = f(max);
})();

// ---------- reCAPTCHA ----------
// Google llama a esta función cuando termina de cargar api.js
function renderCaptcha() {
  if (!window.grecaptcha || !grecaptcha.render) { setTimeout(renderCaptcha, 300); return; }
  widgetId = grecaptcha.render("recaptcha", {
    sitekey: CONFIG.RECAPTCHA_SITE_KEY,
    callback: token => { captchaToken = token; document.getElementById("error-captcha").textContent = ""; actualizarBoton(); },
    "expired-callback": () => { captchaToken = ""; actualizarBoton(); },
    "error-callback": () => { captchaToken = ""; actualizarBoton(); }
  });
}
window.addEventListener("load", renderCaptcha);

// ---------- Lectura de valores ----------
function valor(campo) {
  if (campo === "genero") {
    const r = form.querySelector('input[name="genero"]:checked');
    return r ? r.value : "";
  }
  return document.getElementById(campo).value.trim();
}

function obtenerDatos() {
  const d = {};
  CAMPOS.forEach(c => d[c] = valor(c));
  // Normaliza espacios dobles en nombres/apellidos
  d.nombres = d.nombres.replace(/\s+/g, " ");
  d.apellidos = d.apellidos.replace(/\s+/g, " ");
  d.correo = d.correo.toLowerCase();
  return d;
}

// ---------- Validación ----------
function validarCampo(campo, mostrar) {
  const err = VALIDADORES[campo](valor(campo));
  if (mostrar) {
    document.getElementById("error-" + campo).textContent = err;
    if (campo !== "genero") {
      const el = document.getElementById(campo);
      el.classList.toggle("invalido", !!err);
      el.classList.toggle("valido", !err);
    }
  }
  return err === "";
}

function formularioValido() {
  return CAMPOS.every(c => validarCampo(c, !!tocados[c]));
}

// El botón solo se habilita si TODOS los campos son válidos y el captcha está resuelto
function actualizarBoton() {
  const ok = formularioValido();
  btnEnviar.disabled = !(ok && captchaToken);
}

// ---------- Eventos ----------
CAMPOS.forEach(campo => {
  if (campo === "genero") {
    form.querySelectorAll('input[name="genero"]').forEach(r =>
      r.addEventListener("change", () => { tocados.genero = true; actualizarBoton(); }));
    return;
  }
  const el = document.getElementById(campo);
  const evento = el.tagName === "SELECT" || el.type === "date" ? "change" : "input";
  el.addEventListener(evento, () => { tocados[campo] = true; actualizarBoton(); });
  el.addEventListener("blur", () => { tocados[campo] = true; actualizarBoton(); });
});

// Máscara de teléfono: agrega el guion automáticamente (####-####)
document.getElementById("telefono").addEventListener("input", e => {
  let n = e.target.value.replace(/\D/g, "").slice(0, 8);
  if (n.length > 4) n = n.slice(0, 4) + "-" + n.slice(4);
  e.target.value = n;
});

// ---------- Envío por POST al Web Service ----------
form.addEventListener("submit", async e => {
  e.preventDefault();
  CAMPOS.forEach(c => tocados[c] = true);
  if (!formularioValido()) { actualizarBoton(); return; }
  if (!captchaToken) {
    document.getElementById("error-captcha").textContent = "Confirme que no es un robot.";
    return;
  }

  btnEnviar.disabled = true;
  btnEnviar.textContent = "Enviando...";
  mostrarMensaje("", "");

  try {
    const resp = await fetch(CONFIG.API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...obtenerDatos(), captchaToken })
    });
    const data = await resp.json().catch(() => ({}));

    if (resp.ok) {
      mostrarMensaje("✔ Estudiante registrado correctamente.", "ok");
      form.reset();
      CAMPOS.forEach(c => {
        delete tocados[c];
        document.getElementById("error-" + c).textContent = "";
        const el = document.getElementById(c);
        if (el) el.classList.remove("valido", "invalido");
      });
    } else {
      const detalle = data.errores ? " " + Object.values(data.errores).join(" ") : "";
      mostrarMensaje("✖ " + (data.mensaje || "No se pudo registrar.") + detalle, "fallo");
    }
  } catch (err) {
    mostrarMensaje("✖ No se pudo conectar con el Web Service.", "fallo");
  } finally {
    // El token de reCAPTCHA solo sirve una vez: se reinicia
    if (widgetId !== null) grecaptcha.reset(widgetId);
    captchaToken = "";
    btnEnviar.textContent = "Registrar estudiante";
    actualizarBoton();
  }
});

function mostrarMensaje(texto, tipo) {
  mensaje.textContent = texto;
  mensaje.className = "mensaje " + tipo;
}
