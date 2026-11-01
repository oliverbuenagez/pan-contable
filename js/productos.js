import {
  addDoc,
  collection,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";
import { db } from "./firebase-config.js";
import { iniciarSesionAnonima } from "./db.js";
import {
  describirError,
  escaparHTML,
  formatearCOP,
  limpiarTexto,
  normalizarPrecio
} from "./utilidades.js";

const formulario = document.querySelector("#formulario-producto");
const productoId = document.querySelector("#producto-id");
const campoNombre = document.querySelector("#producto-nombre");
const campoPrecio = document.querySelector("#producto-precio");
const mensaje = document.querySelector("#mensaje-producto");
const tituloFormulario = document.querySelector("#titulo-formulario-producto");
const botonGuardar = document.querySelector("#boton-guardar-producto");
const botonCancelar = document.querySelector("#boton-cancelar-producto");
const listaProductos = document.querySelector("#lista-productos");
const contadorProductos = document.querySelector("#contador-productos");

let productos = [];

function mostrarMensaje(texto, tipo = "") {
  mensaje.textContent = texto;
  mensaje.className = `mensaje${tipo ? ` mensaje--${tipo}` : ""}`;
}

function limpiarFormulario() {
  formulario.reset();
  productoId.value = "";
  tituloFormulario.textContent = "Nuevo pan";
  botonGuardar.textContent = "Guardar pan";
  botonCancelar.hidden = true;
  mostrarMensaje("");
}

function iniciarEdicion(id) {
  const producto = productos.find((item) => item.id === id);

  if (!producto) {
    return;
  }

  productoId.value = producto.id;
  campoNombre.value = producto.nombre;
  campoPrecio.value = producto.precio.toLocaleString("es-CO");
  tituloFormulario.textContent = "Editar pan";
  botonGuardar.textContent = "Guardar cambios";
  botonCancelar.hidden = false;
  mostrarMensaje("");
  formulario.scrollIntoView({ behavior: "smooth", block: "start" });
  campoNombre.focus({ preventScroll: true });
}

function renderizarProductos() {
  contadorProductos.textContent = String(productos.length);

  if (productos.length === 0) {
    listaProductos.innerHTML = `
      <p class="vacio">Todavía no hay panes registrados. Agrega el primero con el formulario.</p>
    `;
    return;
  }

  listaProductos.innerHTML = productos
    .map((producto) => {
      const estado = producto.activo ? "Activo" : "Inactivo";
      const claseEstado = producto.activo ? "badge--activo" : "badge--inactivo";
      const claseItem = producto.activo ? "" : " item--inactivo";
      const accionEstado = producto.activo ? "Desactivar" : "Activar";

      return `
        <article class="item${claseItem}">
          <div class="item__info">
            <div class="item__linea">
              <h4 class="item__nombre">${escaparHTML(producto.nombre)}</h4>
              <span class="badge ${claseEstado}">${estado}</span>
            </div>
            <p class="item__precio">${formatearCOP(producto.precio)}</p>
          </div>
          <div class="item__acciones">
            <button class="boton boton--secundario boton--pequeno" type="button" data-accion="editar" data-id="${escaparHTML(producto.id)}">Editar</button>
            <button class="boton boton--secundario boton--pequeno" type="button" data-accion="estado" data-id="${escaparHTML(producto.id)}">${accionEstado}</button>
          </div>
        </article>
      `;
    })
    .join("");
}

async function cargarProductos() {
  try {
    await iniciarSesionAnonima();
    const instantanea = await getDocs(collection(db, "productos"));

    productos = instantanea.docs
      .map((documento) => ({ id: documento.id, ...documento.data() }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

    renderizarProductos();
  } catch (error) {
    console.error("No se pudieron cargar los panes.", error);
    contadorProductos.textContent = "—";
    listaProductos.innerHTML = `
      <p class="vacio">No se pudieron cargar los panes. ${escaparHTML(describirError(error))}</p>
    `;
  }
}

async function guardarProducto(evento) {
  evento.preventDefault();

  const id = productoId.value;
  const nombre = limpiarTexto(campoNombre.value);
  const precio = normalizarPrecio(campoPrecio.value);

  if (!nombre) {
    mostrarMensaje("Escribe el nombre del pan.", "error");
    campoNombre.focus();
    return;
  }

  if (!Number.isInteger(precio) || precio <= 0) {
    mostrarMensaje("Escribe un precio válido en pesos, sin centavos.", "error");
    campoPrecio.focus();
    return;
  }

  const mensajeExito = id ? "Pan actualizado." : "Pan guardado.";
  botonGuardar.disabled = true;
  botonGuardar.textContent = id ? "Guardando cambios..." : "Guardando...";

  try {
    await iniciarSesionAnonima();

    if (id) {
      await updateDoc(doc(db, "productos", id), { nombre, precio });
    } else {
      await addDoc(collection(db, "productos"), {
        nombre,
        precio,
        activo: true,
        creadoEn: serverTimestamp()
      });
    }

    limpiarFormulario();
    mostrarMensaje(mensajeExito, "exito");
    campoNombre.focus();
    await cargarProductos();
  } catch (error) {
    console.error("No se pudo guardar el pan.", error);
    mostrarMensaje(describirError(error), "error");
  } finally {
    botonGuardar.disabled = false;
    botonGuardar.textContent = productoId.value ? "Guardar cambios" : "Guardar pan";
  }
}

async function cambiarEstado(id, boton) {
  const producto = productos.find((item) => item.id === id);

  if (!producto) {
    return;
  }

  boton.disabled = true;
  boton.textContent = "Guardando...";

  try {
    await iniciarSesionAnonima();
    await updateDoc(doc(db, "productos", id), { activo: !producto.activo });
    mostrarMensaje(producto.activo ? "Pan desactivado." : "Pan activado.", "exito");
    await cargarProductos();
  } catch (error) {
    console.error("No se pudo cambiar el estado del pan.", error);
    mostrarMensaje(describirError(error), "error");
    boton.disabled = false;
    boton.textContent = producto.activo ? "Desactivar" : "Activar";
  }
}

formulario.addEventListener("submit", guardarProducto);
botonCancelar.addEventListener("click", () => {
  limpiarFormulario();
  campoNombre.focus();
});

campoPrecio.addEventListener("blur", () => {
  const precio = normalizarPrecio(campoPrecio.value);

  if (precio > 0) {
    campoPrecio.value = precio.toLocaleString("es-CO");
  }
});

listaProductos.addEventListener("click", (evento) => {
  const boton = evento.target.closest("button[data-accion]");

  if (!boton) {
    return;
  }

  const { accion, id } = boton.dataset;

  if (accion === "editar") {
    iniciarEdicion(id);
  }

  if (accion === "estado") {
    cambiarEstado(id, boton);
  }
});

cargarProductos();
