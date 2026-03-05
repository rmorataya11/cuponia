import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Comprueba si el usuario con uid está en la colección admins.
 * Si Firestore deniega (reglas no publicadas o sin permiso), devuelve false.
 */
export async function isAdmin(uid) {
  if (!uid) return false;
  try {
    const ref = doc(db, 'admins', uid);
    const snap = await getDoc(ref);
    return snap.exists();
  } catch (err) {
    if (err?.code === 'permission-denied' || err?.message?.includes('permission')) {
      return false;
    }
    throw err;
  }
}

// --- Ofertas ---

export async function getOfertasTodas() {
  const snap = await getDocs(collection(db, 'ofertas'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function updateOfertaEstado(id, estado) {
  const ref = doc(db, 'ofertas', id);
  await updateDoc(ref, { estado });
}

// --- Rubros (getRubros está en ofertasService; aquí añadimos write) ---

export async function getRubros() {
  const snap = await getDocs(collection(db, 'rubros'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function addRubro(data) {
  const ref = await addDoc(collection(db, 'rubros'), {
    nombre: data.nombre || '',
    ...(data.icono != null && { icono: data.icono }),
    ...(data.activo != null && { activo: data.activo }),
  });
  return ref.id;
}

export async function updateRubro(id, data) {
  const ref = doc(db, 'rubros', id);
  const update = {};
  if (data.nombre !== undefined) update.nombre = data.nombre;
  if (data.activo !== undefined) update.activo = data.activo;
  if (data.icono !== undefined) update.icono = data.icono;
  if (Object.keys(update).length) await updateDoc(ref, update);
}

// --- Empresas (solo lectura para el panel; ya existe getEmpresas en ofertasService) ---

export async function getEmpresas() {
  const snap = await getDocs(collection(db, 'empresas'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// --- Clientes (solo admin puede leer todos) ---

export async function getClientesTodos() {
  const snap = await getDocs(collection(db, 'clientes'));
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    nombre: [d.data().nombres, d.data().apellidos].filter(Boolean).join(' ') || d.id,
  }));
}

// --- Cupones (solo admin puede leer todos) ---

export async function getCuponesTodos() {
  const snap = await getDocs(collection(db, 'cupones'));
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    vence: d.data().fechaLimiteUso,
    fecha: d.data().fechaCompra,
  }));
}
