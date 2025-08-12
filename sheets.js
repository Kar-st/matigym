const API_KEY = 'TU_API_KEY'; // Reemplázala
const SHEET_ID = 'ID_DE_TU_HOJA'; // Ej: "1A2b3C4d..."

// Obtener datos
async function getClientes() {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Clientes?key=${API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  return data.values.slice(1); // Ignora la fila de encabezados
}

// Guardar un nuevo PR
async function savePR(nombre, ejercicio, valor) {
  const range = `Clientes!${ejercicio}_Columna`; // Ej: "PR_Burpees"
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}?valueInputOption=USER_ENTERED&key=${API_KEY}`;
  
  await fetch(url, {
    method: 'PUT',
    body: JSON.stringify({ values: [[valor]] }),
    headers: { 'Content-Type': 'application/json' }
  });
}