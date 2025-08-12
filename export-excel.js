import { loadClients } from "./db.js";

document.getElementById("exportExcel").addEventListener("click", async () => {
  const clientes = await loadClients();
  
  // Crear contenido CSV (compatible con Excel)
  let csvContent = "Nombre, Teléfono, Servicio, Vencimiento, Estado de Pago\n"; // Encabezados

  clientes.forEach(cliente => {
    csvContent += `${cliente.nombre}, ${cliente.telefono}, ${cliente.servicio}, ${cliente.vencimiento}, ${cliente.estadoPago}\n`;
  });

  // Generar y descargar el archivo
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "clientes_gimnasio.csv";  // Nombre del archivo
  link.click();  // Descarga automática

  // Limpiar
  URL.revokeObjectURL(url);
});