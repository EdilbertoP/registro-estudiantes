// =============================================================
// Servidor LOCAL de pruebas (no necesita instalar nada).
// Ejecutar desde cmd:   node server.js
// Abrir:                http://localhost:3000
//
// Sirve las páginas HTML y redirige /api/estudiantes a la misma
// función que se publica en Vercel (api/estudiantes.js).
// Lee las variables del archivo .env
// =============================================================
const http = require("http");
const fs = require("fs");
const path = require("path");

// --- Cargar .env ---
const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, "utf8").split(/\r?\n/).forEach(linea => {
    const m = linea.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  });
}

const handler = require("./api/estudiantes.js");
const PUERTO = process.env.PORT || 3000;
const TIPOS = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "application/javascript", ".png": "image/png", ".ico": "image/x-icon" };

http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");

  // --- Web Service ---
  if (url.pathname === "/api/estudiantes") {
    let cuerpo = "";
    req.on("data", c => cuerpo += c);
    req.on("end", () => {
      if (cuerpo) { try { req.body = JSON.parse(cuerpo); } catch { req.body = cuerpo; } }
      handler(req, res);
    });
    return;
  }

  // --- Archivos estáticos (solo carpetas públicas) ---
  let ruta = url.pathname === "/" ? "/index.html" : url.pathname;
  const permitido = /^\/(index\.html|consulta\.html|css\/[\w.-]+|js\/[\w.-]+)$/.test(ruta);
  const archivo = path.join(__dirname, ruta);
  if (!permitido || !fs.existsSync(archivo)) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end("404 - No encontrado");
  }
  res.writeHead(200, { "Content-Type": TIPOS[path.extname(archivo)] || "application/octet-stream" });
  fs.createReadStream(archivo).pipe(res);
}).listen(PUERTO, () => {
  console.log(`Servidor listo en http://localhost:${PUERTO}`);
  if (!process.env.SUPABASE_URL) console.log("AVISO: falta configurar el archivo .env (ver .env.example)");
});
