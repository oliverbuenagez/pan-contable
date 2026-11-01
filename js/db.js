import { signInAnonymously } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";
import { auth, db } from "./firebase-config.js";

let promesaSesion = null;

export function iniciarSesionAnonima() {
  if (auth.currentUser) {
    return Promise.resolve(auth.currentUser);
  }

  if (!promesaSesion) {
    promesaSesion = signInAnonymously(auth)
      .then((credencial) => credencial.user)
      .catch((error) => {
        promesaSesion = null;
        throw error;
      });
  }

  return promesaSesion;
}

export async function probarFirestore() {
  const referencia = doc(db, "_pruebas", "conexion");
  const instantanea = await getDoc(referencia);
  return instantanea.exists();
}
