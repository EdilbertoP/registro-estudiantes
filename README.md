# Examen Parcial – Registro de Estudiantes

Aplicación web completa para registrar estudiantes y consultarlos, con un **Web Service tipo POST publicado en la nube**.

**Estudiante:** Edilberto Natanael Pérez Díaz

## Enlaces del proyecto

| | URL |
|---|---|
| Aplicación (formulario) | https://registro-estudiantes-xi.vercel.app |
| Ventana de consulta | https://registro-estudiantes-xi.vercel.app/consulta.html |
| Web Service (POST / GET) | https://registro-estudiantes-xi.vercel.app/api/estudiantes |
| Código fuente | https://github.com/EdilbertoP/registro-estudiantes |

## 1. Herramientas utilizadas

| Herramienta | Para qué se usa | Costo |
|---|---|---|
| **HTML5, CSS3 y JavaScript** (sin frameworks) | Formulario de registro y ventana de consulta | — |
| **Node.js 18 o superior** | Ejecutar el proyecto en local (`node server.js`) | Gratis |
| **Vercel** (vercel.com) | Nube donde se publica el sitio y el Web Service (`/api/estudiantes`) como función *serverless* | Plan gratuito |
| **Supabase** (supabase.com) | Base de datos PostgreSQL en la nube donde se guardan los estudiantes | Plan gratuito |
| **Google reCAPTCHA v2** | Validador "No soy un robot" contra llenado con bots | Gratis |
| **GitHub** | Repositorio del código, conectado a Vercel | Gratis |

## 2. Estructura del proyecto

```
registro-estudiantes/
├── index.html            Formulario de registro
├── consulta.html         Ventana de consulta (tabla + buscador + Actualizar)
├── css/styles.css        Estilos
├── js/config.js          Llave pública de reCAPTCHA y URL del Web Service
├── js/validaciones.js    Reglas de validación (las usa el navegador Y el servidor)
├── js/registro.js        Lógica del formulario y envío por POST
├── js/consulta.js        Carga de la tabla, buscador y botón Actualizar
├── api/estudiantes.js    WEB SERVICE (POST registra / GET lista)
├── server.js             Servidor local para pruebas (sin dependencias)
├── database/supabase.sql Script para crear la tabla
├── .env.example          Plantilla de variables de entorno
└── package.json
```

## 3. Web Service

**URL:** `https://registro-estudiantes-xi.vercel.app/api/estudiantes`

### POST – registrar estudiante
Cuerpo (JSON):
```json
{
  "carne": "0905202312",
  "nombres": "Juan Carlos",
  "apellidos": "Pérez López",
  "correo": "juan@gmail.com",
  "carrera": "Ingeniería en Sistemas",
  "telefono": "5555-5555",
  "fechaNacimiento": "2000-05-20",
  "genero": "Masculino",
  "captchaToken": "<token de reCAPTCHA>"
}
```
Respuestas:
| Código | Significado |
|---|---|
| 201 | Estudiante registrado |
| 400 | reCAPTCHA inválido o JSON mal formado |
| 409 | Carné o correo ya registrado |
| 422 | Algún campo no cumple las validaciones (se devuelve el detalle en `errores`) |
| 500/502 | Error del servidor o de la base de datos |

### GET – listar estudiantes
Devuelve `{ "total": N, "estudiantes": [ ... ] }` ordenado del más reciente al más antiguo.

## 4. Validaciones implementadas

Se validan **en el navegador** (mensajes en tiempo real) y **otra vez en el servidor** (el Web Service rechaza datos inválidos aunque alguien se salte el formulario). Además la base de datos tiene restricciones `CHECK` y `UNIQUE`.

| Campo | Input | Validación |
|---|---|---|
| Carné | text | Requerido, mínimo 8 caracteres, solo alfanumérico |
| Nombres | text | Requerido, solo letras y espacios (acepta tildes y ñ) |
| Apellidos | text | Requerido, solo letras y espacios |
| Correo | email | Requerido, formato válido de email |
| Carrera | select | Requerido, solo carreras del catálogo |
| Teléfono | tel | Requerido, formato guatemalteco `####-####` (el guion se pone solo) |
| Fecha de nacimiento | date | Requerido, edad mínima 16 años |
| Género | radio | Requerido (Masculino / Femenino / Otro) |

Requerimientos adicionales:
- El botón **Registrar** permanece **deshabilitado** hasta que todos los campos son válidos **y** se marcó el reCAPTCHA.
- **reCAPTCHA v2**: el token se verifica en el servidor contra Google antes de guardar.

## 5. Cómo levantar el proyecto

### Paso 1 – Base de datos en Supabase
1. Crear cuenta en https://supabase.com y un **New project**.
2. Ir a **SQL Editor → New query**, pegar el contenido de `database/supabase.sql` y presionar **Run**.
3. Ir a **Project Settings → API** (o *API Keys*) y copiar:
   - **Project URL** → será `SUPABASE_URL`
   - La llave **secret / service_role** → será `SUPABASE_KEY` (¡nunca ponerla en el HTML!)

### Paso 2 – Llaves de reCAPTCHA
1. Entrar a https://www.google.com/recaptcha/admin y registrar un sitio tipo **reCAPTCHA v2 → "No soy un robot"**.
2. En dominios agregar `localhost` y el dominio de Vercel (`registro-estudiantes-xi.vercel.app`).
3. Copiar la **Site key** en `js/config.js` y la **Secret key** en la variable `RECAPTCHA_SECRET`.

> El proyecto ya trae las **llaves de prueba oficiales de Google**, que funcionan en cualquier dominio y siempre aprueban. Sirven para probar, pero el widget muestra un aviso de "solo para pruebas".

### Paso 3 – Probar en local (opcional)
Requiere Node.js 18+. Desde **cmd**:
```
cd registro-estudiantes
copy .env.example .env
notepad .env          (llenar SUPABASE_URL y SUPABASE_KEY)
node server.js
```
Abrir http://localhost:3000

### Paso 4 – Publicar en la nube (Vercel)
1. Subir la carpeta a un repositorio de **GitHub** (sin el archivo `.env`).
2. En https://vercel.com → **Add New → Project** → importar el repositorio. Framework: **Other**. No requiere comando de build.
3. En **Settings → Environment Variables** agregar `SUPABASE_URL`, `SUPABASE_KEY` y `RECAPTCHA_SECRET`.
4. **Deploy**. El sitio queda en `https://registro-estudiantes-xi.vercel.app` y el Web Service en `https://registro-estudiantes-xi.vercel.app/api/estudiantes`.

### Probar el Web Service sin el formulario (cmd)
```
curl https://registro-estudiantes-xi.vercel.app/api/estudiantes
```
Un POST sin token de reCAPTCHA debe responder **400**, lo que demuestra que la protección anti-bots funciona.

## 6. Seguridad
- La llave secreta de Supabase y la de reCAPTCHA solo viven en el servidor (variables de entorno).
- La tabla tiene **RLS activado** sin políticas públicas: nadie puede leer o escribir directo desde el navegador.
- Los datos se muestran en la tabla escapando HTML (evita inyección de código).
