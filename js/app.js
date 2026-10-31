const botones = Array.from(document.querySelectorAll(".navegacion__boton"));
const secciones = Array.from(document.querySelectorAll(".seccion"));
const nombresValidos = botones.map((boton) => boton.dataset.seccion);

function activarSeccion(nombre, moverFoco = false) {
  botones.forEach((boton) => {
    const activo = boton.dataset.seccion === nombre;
    boton.classList.toggle("navegacion__boton--activo", activo);
    boton.setAttribute("aria-selected", String(activo));
    boton.tabIndex = activo ? 0 : -1;
    if (activo && moverFoco) {
      boton.focus();
    }
  });

  secciones.forEach((seccion) => {
    seccion.hidden = seccion.id !== `seccion-${nombre}`;
  });
}

function actualizarHash(nombre) {
  try {
    history.replaceState(null, "", `#${nombre}`);
  } catch (error) {
    location.hash = nombre;
  }
}

function nombreDesdeHash() {
  const nombre = location.hash.replace("#", "");
  return nombresValidos.includes(nombre) ? nombre : "ventas";
}

botones.forEach((boton, indice) => {
  boton.addEventListener("click", () => {
    const nombre = boton.dataset.seccion;
    activarSeccion(nombre);
    actualizarHash(nombre);
  });

  boton.addEventListener("keydown", (evento) => {
    let destino = null;

    if (evento.key === "ArrowRight") {
      destino = (indice + 1) % botones.length;
    }

    if (evento.key === "ArrowLeft") {
      destino = (indice - 1 + botones.length) % botones.length;
    }

    if (evento.key === "Home") {
      destino = 0;
    }

    if (evento.key === "End") {
      destino = botones.length - 1;
    }

    if (destino === null) {
      return;
    }

    evento.preventDefault();
    const nombre = botones[destino].dataset.seccion;
    activarSeccion(nombre, true);
    actualizarHash(nombre);
  });
});

window.addEventListener("hashchange", () => {
  const nombre = location.hash.replace("#", "");
  if (nombresValidos.includes(nombre)) {
    activarSeccion(nombre);
  }
});

activarSeccion(nombreDesdeHash());
