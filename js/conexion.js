import { iniciarSesionAnonima, probarFirestore } from "./db.js";

const estado = document.querySelector("#estado-conexion");
const textoEstado = estado.querySelector(".estado__texto");

function mostrarEstado(mensaje, conectado) {
  textoEstado.textContent = mensaje;
  estado.classList.toggle("estado--conectado", conectado);
}

async function conectar() {
  mostrarEstado("Conectando...", false);

  try {
    await iniciarSesionAnonima();
    mostrarEstado("Conectado", true);

    try {
      await probarFirestore();
    } catch (error) {
      console.warn("Firestore sin permisos. Revisa las reglas de seguridad.", error);
      mostrarEstado("Conectado sin permisos", false);
    }
  } catch (error) {
    console.error("No se pudo conectar con Firebase.", error);
    mostrarEstado("Sin conexión", false);
  }
}

conectar();
