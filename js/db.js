import { signInAnonymously } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";
import { auth, db } from "./firebase-config.js";

export async function iniciarSesionAnonima() {
  if (auth.currentUser) {
    return auth.currentUser;
  }

  const credencial = await signInAnonymously(auth);
  return credencial.user;
}

export async function probarFirestore() {
  const referencia = doc(db, "_pruebas", "conexion");
  const instantanea = await getDoc(referencia);
  return instantanea.exists();
}
