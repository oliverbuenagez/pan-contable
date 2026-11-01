import { initializeApp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAjdb8K3I-w1cHOMIiwmUmKv1vmIm5PLsU",
  authDomain: "contabilidad-de-ventas.firebaseapp.com",
  projectId: "contabilidad-de-ventas",
  storageBucket: "contabilidad-de-ventas.firebasestorage.app",
  messagingSenderId: "339940013522",
  appId: "1:339940013522:web:a7bb3394bca551c691440b"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
