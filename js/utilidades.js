const formateadorCOP = new Intl.NumberFormat("es-CO", {
  maximumFractionDigits: 0
});

export function formatearCOP(valor) {
  const numero = Number(valor);
  return `$${formateadorCOP.format(Number.isFinite(numero) ? numero : 0)}`;
}

export function normalizarPrecio(valor) {
  const texto = String(valor ?? "").trim();

  if (!texto || texto.includes("-")) {
    return 0;
  }

  const soloDigitos = texto.replace(/\D/g, "");
  return soloDigitos ? Number.parseInt(soloDigitos, 10) : 0;
}

export function limpiarTexto(valor) {
  return String(valor ?? "").trim().replace(/\s+/g, " ");
}

export function escaparHTML(valor) {
  const reemplazos = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  };

  return String(valor ?? "").replace(/[&<>"']/g, (caracter) => reemplazos[caracter]);
}

export function describirError(error) {
  const codigo = String(error?.code ?? "");

  if (codigo.includes("permission-denied")) {
    return "No hay permisos para acceder a Firestore. Revisa las reglas.";
  }

  if (codigo.includes("unavailable") || codigo.includes("network")) {
    return "Sin conexión. Revisa tu internet e intenta de nuevo.";
  }

  return "Ocurrió un error. Intenta de nuevo.";
}
