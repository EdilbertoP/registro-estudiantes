// =============================================================
// Ventana de consulta: tabla, buscador y botón Actualizar
// =============================================================
const tbody = document.querySelector("#tablaEstudiantes tbody");
const buscador = document.getElementById("buscador");
const btnActualizar = document.getElementById("btnActualizar");
const contador = document.getElementById("contador");

let estudiantes = [];   // datos traídos del Web Service

async function cargarEstudiantes() {
  btnActualizar.disabled = true;
  btnActualizar.textContent = "Cargando...";
  try {
    const resp = await fetch(CONFIG.API_URL, { method: "GET", cache: "no-store" });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.mensaje || "Error al consultar");
    estudiantes = data.estudiantes || [];
    pintarTabla();
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="10" class="centro">✖ ${escapar(err.message)}</td></tr>`;
    contador.textContent = "";
  } finally {
    btnActualizar.disabled = false;
    btnActualizar.textContent = "⟳ Actualizar";
  }
}

function pintarTabla() {
  const q = normalizar(buscador.value.trim());
  const filtrados = estudiantes.filter(e =>
    !q || normalizar(Object.values(e).join(" ")).includes(q));

  contador.textContent = `Mostrando ${filtrados.length} de ${estudiantes.length} estudiante(s).`;

  if (filtrados.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" class="centro">No hay estudiantes para mostrar.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtrados.map((e, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${escapar(e.carne)}</td>
      <td>${escapar(e.nombres)}</td>
      <td>${escapar(e.apellidos)}</td>
      <td>${escapar(e.correo)}</td>
      <td>${escapar(e.carrera)}</td>
      <td>${escapar(e.telefono)}</td>
      <td>${formatoFecha(e.fecha_nacimiento)}</td>
      <td>${escapar(e.genero)}</td>
      <td>${formatoFechaHora(e.fecha_registro)}</td>
    </tr>`).join("");
}

// Búsqueda sin importar mayúsculas ni tildes
function normalizar(t) {
  return String(t ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}
// Evita inyección de HTML en la tabla
function escapar(t) {
  return String(t ?? "").replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function formatoFecha(f) {
  if (!f) return "";
  const [a, m, d] = f.slice(0, 10).split("-");
  return `${d}/${m}/${a}`;
}
function formatoFechaHora(f) {
  if (!f) return "";
  return new Date(f).toLocaleString("es-GT", { dateStyle: "short", timeStyle: "short" });
}

buscador.addEventListener("input", pintarTabla);
btnActualizar.addEventListener("click", cargarEstudiantes);
cargarEstudiantes();
