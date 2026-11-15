// =============================================================
// WEB SERVICE EN LA NUBE  →  /api/estudiantes
// Función serverless de Vercel (Node.js). Sin dependencias.
//
//   POST /api/estudiantes  → registra un estudiante (JSON)
//   GET  /api/estudiantes  → devuelve todos los estudiantes
//
// Base de datos: tabla "estudiantes" en Supabase (PostgreSQL),
// accedida por su API REST.
//
// Variables de entorno necesarias (en Vercel o en el archivo .env):
//   SUPABASE_URL          https://xxxxx.supabase.co
//   SUPABASE_KEY          llave secreta (service_role / secret key)
//   RECAPTCHA_SECRET      llave secreta de reCAPTCHA v2
// =============================================================
const { VALIDADORES } = require("../js/validaciones.js");

const CAMPOS = ["carne", "nombres", "apellidos", "correo", "carrera", "telefono", "fechaNacimiento", "genero"];

function responder(res, status, cuerpo) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(cuerpo));
}

function headersSupabase() {
  const key = process.env.SUPABASE_KEY;
  const h = { apikey: key, "Content-Type": "application/json" };
  // Las llaves antiguas (JWT, empiezan con "eyJ") también van en Authorization
  if (key && key.startsWith("eyJ")) h.Authorization = "Bearer " + key;
  return h;
}

// Verifica el token del captcha con los servidores de Google
async function verificarCaptcha(token, ip) {
  if (!token) return false;
  const params = new URLSearchParams({ secret: process.env.RECAPTCHA_SECRET || "", response: token });
  if (ip) params.append("remoteip", ip);
  const r = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params
  });
  const data = await r.json();
  return data.success === true;
}

function leerBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") { try { return JSON.parse(req.body); } catch { return null; } }
  return null;
}

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") return responder(res, 204, {});

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
    return responder(res, 500, { mensaje: "Faltan las variables SUPABASE_URL / SUPABASE_KEY en el servidor." });
  }
  const urlTabla = process.env.SUPABASE_URL.replace(/\/$/, "") + "/rest/v1/estudiantes";

  try {
    // ------------------------ GET: listar ------------------------
    if (req.method === "GET") {
      const r = await fetch(urlTabla + "?select=*&order=fecha_registro.desc", { headers: headersSupabase() });
      const data = await r.json();
      if (!r.ok) return responder(res, 502, { mensaje: "Error en la base de datos.", detalle: data });
      return responder(res, 200, { total: data.length, estudiantes: data });
    }

    // ------------------------ POST: registrar ------------------------
    if (req.method === "POST") {
      const body = leerBody(req);
      if (!body) return responder(res, 400, { mensaje: "El cuerpo debe ser JSON válido." });

      // 1) Anti-bots: reCAPTCHA
      const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim();
      const humano = await verificarCaptcha(body.captchaToken, ip);
      if (!humano) return responder(res, 400, { mensaje: "Verificación reCAPTCHA inválida o vencida." });

      // 2) Validación en el servidor (nunca confiar solo en el navegador)
      const datos = {};
      const errores = {};
      CAMPOS.forEach(c => {
        datos[c] = typeof body[c] === "string" ? body[c].trim().replace(/\s+/g, " ") : "";
        const e = VALIDADORES[c](datos[c]);
        if (e) errores[c] = e;
      });
      if (Object.keys(errores).length) {
        return responder(res, 422, { mensaje: "Datos inválidos.", errores });
      }

      // 3) Guardar en Supabase
      const registro = {
        carne: datos.carne.toUpperCase(),
        nombres: datos.nombres,
        apellidos: datos.apellidos,
        correo: datos.correo.toLowerCase(),
        carrera: datos.carrera,
        telefono: datos.telefono,
        fecha_nacimiento: datos.fechaNacimiento,
        genero: datos.genero
      };
      const r = await fetch(urlTabla, {
        method: "POST",
        headers: { ...headersSupabase(), Prefer: "return=representation" },
        body: JSON.stringify(registro)
      });
      const data = await r.json().catch(() => ({}));

      if (r.status === 409 || data.code === "23505") {
        return responder(res, 409, { mensaje: "Ya existe un estudiante con ese carné o correo." });
      }
      if (!r.ok) return responder(res, 502, { mensaje: "Error en la base de datos.", detalle: data });

      return responder(res, 201, { mensaje: "Estudiante registrado.", estudiante: data[0] });
    }

    return responder(res, 405, { mensaje: "Método no permitido. Use GET o POST." });
  } catch (err) {
    return responder(res, 500, { mensaje: "Error interno del servidor.", detalle: err.message });
  }
};
