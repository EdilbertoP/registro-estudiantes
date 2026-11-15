// =============================================================
// Configuración del FRONTEND
// =============================================================
// RECAPTCHA_SITE_KEY: llave PÚBLICA (Site key) de Google reCAPTCHA v2.
//   La que está puesta es la llave de PRUEBA oficial de Google
//   (siempre aprueba). Para entregar/producción reemplácela por la
//   suya, generada en https://www.google.com/recaptcha/admin
//
// API_URL: dirección del Web Service.
//   "/api/estudiantes" funciona tanto en Vercel (nube) como en
//   local con "node server.js" porque el frontend y el API están
//   en el mismo dominio.
// =============================================================
const CONFIG = {
  RECAPTCHA_SITE_KEY: "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI",
  API_URL: "/api/estudiantes"
};
