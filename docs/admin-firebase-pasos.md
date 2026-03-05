# Conectar el panel Admin con Firebase – Paso a paso

## Resumen

1. **Reglas Firestore**: crear colección `admins` y dar permisos a esos usuarios.
2. **Marcarte como admin**: agregar tu UID en la colección `admins` (desde la consola de Firebase).
3. **Servicio admin**: funciones para leer/escribir ofertas, rubros, empresas, clientes y cupones.
4. **Proteger `/admin`**: solo usuarios autenticados que estén en `admins` pueden entrar.
5. **AdminDashboard**: cargar datos desde Firebase y guardar cambios (estado ofertas, rubros, etc.).

---

## Paso 1: Actualizar reglas de Firestore

En el archivo `firestore.rules` se agrega:

- Colección **`admins`**: documentos con ID = UID del usuario admin. Solo ese usuario puede leer su propio doc.
- Para **rubros, empresas, ofertas, clientes, cupones**: si el usuario está en `admins`, puede leer y escribir (según lo que necesite el panel).

Después hay que **publicar las reglas** en Firebase Console → Firestore → Reglas → Publicar.

---

## Paso 2: Crear tu usuario admin en Firebase

1. Entrá a [Firebase Console](https://console.firebase.google.com/) → tu proyecto.
2. **Authentication**: si no tenés usuario, creá uno (registro desde la app o “Add user”).
3. Copiá el **UID** de ese usuario (ej. `abc123...`).
4. **Firestore Database** → “Start collection” o “Add collection”.
5. ID de la colección: **`admins`**.
6. Agregá un documento con **Document ID** = ese UID (pegá el UID tal cual).
7. Podés dejar el documento vacío o con un campo `role: 'admin'`. Guardar.
8. **Publicar reglas**: en Firestore → pestaña **Reglas**, pegá el contenido de `firestore.rules` del proyecto y hacé clic en **Publicar**.

Desde ese momento ese UID tiene permisos de admin. Para entrar a `/admin` tenés que estar logueado con ese usuario.

---

## Paso 3: Servicio de administración

Se crea `src/services/adminService.js` con:

- **isAdmin(uid)**: leer `admins/{uid}`; si existe, es admin.
- **getOfertasTodas()**: leer toda la colección `ofertas`.
- **updateOfertaEstado(id, estado)**: actualizar `estado` de una oferta (ej. aprobada/rechazada).
- **getRubros()**, **addRubro(datos)**, **updateRubro(id, datos)**.
- **getEmpresas()** (ya existe en ofertasService; se puede reutilizar o llamar desde admin).
- **getClientesTodos()**: leer toda la colección `clientes`.
- **getCuponesTodos()**: leer toda la colección `cupones`.

El panel usa estos métodos en lugar de los mock.

---

## Paso 4: Proteger la ruta `/admin`

- Si el usuario **no está logueado** → redirigir a iniciar sesión (o registro).
- Si está logueado pero **no es admin** (`isAdmin(uid)` falso) → redirigir al inicio o a “no autorizado”.
- Solo si está logueado **y** es admin → mostrar `CuponiaAdminDashboard`.

Se puede hacer con un componente `AdminRoute` que use `useAuth()` y `adminService.isAdmin(uid)`.

---

## Paso 5: AdminDashboard con datos reales

- **Estado**: listas para ofertas, rubros, empresas, clientes, cupones + `loading` y `error`.
- **Al montar** (y al cambiar pestaña si hace falta): llamar a las funciones del admin service y guardar en el estado.
- **Mapear** los datos de Firestore al formato que usa el panel:
  - **Ofertas**: `empresaId`/`rubroId` → resolver con empresas y rubros para mostrar nombre de empresa y rubro.
  - **Clientes**: `nombres` + `apellidos` → `nombre`; doc id = uid.
  - **Cupones**: `fechaLimiteUso` → “vence”; opcionalmente resolver oferta y cliente para mostrar nombres.
- **Aprobar/Rechazar oferta**: llamar `updateOfertaEstado(id, 'aprobada' | 'rechazada')` y actualizar el estado local.
- **Rubros**: al agregar o editar, llamar `addRubro` / `updateRubro` y refrescar la lista.

Con esto el panel queda conectado a Firebase de punta a punta.
