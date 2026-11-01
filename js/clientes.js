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
  limpiarTexto,
  normalizarBusqueda
} from "./utilidades.js";

const formulario = document.querySelector("#formulario-cliente");
const clienteId = document.querySelector("#cliente-id");
const campoNombre = document.querySelector("#cliente-nombre");
const campoTelefono = document.querySelector("#cliente-telefono");
const campoDireccion = document.querySelector("#cliente-direccion");
const campoNotas = document.querySelector("#cliente-notas");
const mensaje = document.querySelector("#mensaje-cliente");
const tituloFormulario = document.querySelector("#titulo-formulario-cliente");
const botonGuardar = document.querySelector("#boton-guardar-cliente");
const botonCancelar = document.querySelector("#boton-cancelar-cliente");
const listaClientes = document.querySelector("#lista-clientes");
const contadorClientes = document.querySelector("#contador-clientes");
const buscador = document.querySelector("#buscador-clientes");

let clientes = [];
let filtro = "";

function mostrarMensaje(texto, tipo = "") {
  mensaje.textContent = texto;
  mensaje.className = `mensaje${tipo ? ` mensaje--${tipo}` : ""}`;
}

function limpiarFormulario() {
  formulario.reset();
  clienteId.value = "";
  tituloFormulario.textContent = "Nuevo cliente";
  botonGuardar.textContent = "Guardar cliente";
  botonCancelar.hidden = true;
  mostrarMensaje("");
}

function iniciarEdicion(id) {
  const cliente = clientes.find((item) => item.id === id);

  if (!cliente) {
    return;
  }

  clienteId.value = cliente.id;
  campoNombre.value = cliente.nombre ?? "";
  campoTelefono.value = cliente.telefono ?? "";
  campoDireccion.value = cliente.direccion ?? "";
  campoNotas.value = cliente.notas ?? "";
  tituloFormulario.textContent = "Editar cliente";
  botonGuardar.textContent = "Guardar cambios";
  botonCancelar.hidden = false;
  mostrarMensaje("");
  formulario.scrollIntoView({ behavior: "smooth", block: "start" });
  campoNombre.focus({ preventScroll: true });
}

function obtenerClientesFiltrados() {
  const consulta = normalizarBusqueda(filtro);
  const soloDigitos = String(filtro ?? "").replace(/\D/g, "");

  if (!consulta) {
    return clientes;
  }

  return clientes.filter((cliente) => {
    const nombre = normalizarBusqueda(cliente.nombre);
    const telefono = String(cliente.telefono ?? "");
    const telefonoTexto = normalizarBusqueda(telefono);
    const telefonoDigitos = telefono.replace(/\D/g, "");

    return (
      nombre.includes(consulta) ||
      telefonoTexto.includes(consulta) ||
      (soloDigitos !== "" && telefonoDigitos.includes(soloDigitos))
    );
  });
}

function renderizarClientes() {
  const filtrados = obtenerClientesFiltrados();
  const hayFiltro = normalizarBusqueda(filtro) !== "";
  contadorClientes.textContent = hayFiltro
    ? `${filtrados.length} de ${clientes.length}`
    : String(clientes.length);

  if (clientes.length === 0) {
    listaClientes.innerHTML = `
      <p class="vacio">Todavía no hay clientes registrados. Agrega el primero con el formulario.</p>
    `;
    return;
  }

  if (filtrados.length === 0) {
    listaClientes.innerHTML = `
      <p class="vacio">No hay clientes que coincidan con la búsqueda.</p>
    `;
    return;
  }

  listaClientes.innerHTML = filtrados
    .map((cliente) => {
      const estado = cliente.activo ? "Activo" : "Inactivo";
      const claseEstado = cliente.activo ? "badge--activo" : "badge--inactivo";
      const claseItem = cliente.activo ? "" : " item--inactivo";
      const accionEstado = cliente.activo ? "Desactivar" : "Activar";
      const telefono = limpiarTexto(cliente.telefono);
      const direccion = limpiarTexto(cliente.direccion);
      const notas = limpiarTexto(cliente.notas);

      return `
        <article class="item${claseItem}">
          <div class="item__info">
            <div class="item__linea">
              <h4 class="item__nombre">${escaparHTML(cliente.nombre)}</h4>
              <span class="badge ${claseEstado}">${estado}</span>
            </div>
            ${telefono ? `<p class="item__detalle">Tel: ${escaparHTML(telefono)}</p>` : ""}
            ${direccion ? `<p class="item__detalle">${escaparHTML(direccion)}</p>` : ""}
            ${notas ? `<p class="item__notas">${escaparHTML(notas)}</p>` : ""}
          </div>
          <div class="item__acciones">
            <button class="boton boton--secundario boton--pequeno" type="button" data-accion="editar" data-id="${escaparHTML(cliente.id)}">Editar</button>
            <button class="boton boton--secundario boton--pequeno" type="button" data-accion="estado" data-id="${escaparHTML(cliente.id)}">${accionEstado}</button>
          </div>
        </article>
      `;
    })
    .join("");
}

async function cargarClientes() {
  try {
    await iniciarSesionAnonima();
    const instantanea = await getDocs(collection(db, "clientes"));

    clientes = instantanea.docs
      .map((documento) => ({ id: documento.id, ...documento.data() }))
      .sort((a, b) => String(a.nombre ?? "").localeCompare(String(b.nombre ?? ""), "es"));

    renderizarClientes();
  } catch (error) {
    console.error("No se pudieron cargar los clientes.", error);
    contadorClientes.textContent = "—";
    listaClientes.innerHTML = `
      <p class="vacio">No se pudieron cargar los clientes. ${escaparHTML(describirError(error))}</p>
    `;
  }
}

async function guardarCliente(evento) {
  evento.preventDefault();

  const id = clienteId.value;
  const nombre = limpiarTexto(campoNombre.value);
  const telefono = limpiarTexto(campoTelefono.value);
  const direccion = limpiarTexto(campoDireccion.value);
  const notas = limpiarTexto(campoNotas.value);

  if (!nombre) {
    mostrarMensaje("Escribe el nombre del cliente.", "error");
    campoNombre.focus();
    return;
  }

  const digitosTelefono = telefono.replace(/\D/g, "").length;

  if (telefono && (digitosTelefono < 7 || digitosTelefono > 15)) {
    mostrarMensaje("Escribe un teléfono válido: entre 7 y 15 dígitos.", "error");
    campoTelefono.focus();
    return;
  }

  const mensajeExito = id ? "Cliente actualizado." : "Cliente guardado.";
  botonGuardar.disabled = true;
  botonGuardar.textContent = id ? "Guardando cambios..." : "Guardando...";

  try {
    await iniciarSesionAnonima();

    if (id) {
      await updateDoc(doc(db, "clientes", id), {
        nombre,
        telefono,
        direccion,
        notas
      });
    } else {
      await addDoc(collection(db, "clientes"), {
        nombre,
        telefono,
        direccion,
        notas,
        activo: true,
        creadoEn: serverTimestamp()
      });
    }

    limpiarFormulario();
    mostrarMensaje(mensajeExito, "exito");
    campoNombre.focus();
    await cargarClientes();
  } catch (error) {
    console.error("No se pudo guardar el cliente.", error);
    mostrarMensaje(describirError(error), "error");
  } finally {
    botonGuardar.disabled = false;
    botonGuardar.textContent = clienteId.value ? "Guardar cambios" : "Guardar cliente";
  }
}

async function cambiarEstado(id, boton) {
  const cliente = clientes.find((item) => item.id === id);

  if (!cliente) {
    return;
  }

  boton.disabled = true;
  boton.textContent = "Guardando...";

  try {
    await iniciarSesionAnonima();
    await updateDoc(doc(db, "clientes", id), { activo: !cliente.activo });
    mostrarMensaje(cliente.activo ? "Cliente desactivado." : "Cliente activado.", "exito");
    await cargarClientes();
  } catch (error) {
    console.error("No se pudo cambiar el estado del cliente.", error);
    mostrarMensaje(describirError(error), "error");
    boton.disabled = false;
    boton.textContent = cliente.activo ? "Desactivar" : "Activar";
  }
}

formulario.addEventListener("submit", guardarCliente);
botonCancelar.addEventListener("click", () => {
  limpiarFormulario();
  campoNombre.focus();
});

buscador.addEventListener("input", () => {
  filtro = buscador.value;
  renderizarClientes();
});

listaClientes.addEventListener("click", (evento) => {
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

cargarClientes();
