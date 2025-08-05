// Datos iniciales (se guardan en localStorage)
let clients = JSON.parse(localStorage.getItem('topforce-clients')) || [];

// Elementos del DOM
const clientForm = document.getElementById('clientForm');
const clientTableBody = document.getElementById('clientTableBody');

// Guardar cliente
clientForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const newClient = {
    id: Date.now(),
    name: document.getElementById('name').value,
    phone: document.getElementById('phone').value,
    email: document.getElementById('email').value,
    startDate: document.getElementById('startDate').value,
    endDate: document.getElementById('endDate').value
  };

  clients.push(newClient);
  saveClients();
  renderClients();
  clientForm.reset();
});

// Renderizar clientes
function renderClients() {
  clientTableBody.innerHTML = '';
  const today = new Date().toISOString().split('T')[0];

  clients.forEach(client => {
    const status = client.endDate >= today ? 
      '<span class="status-active">AL DÍA</span>' : 
      '<span class="status-expired">VENCIDO</span>';

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${client.name}</td>
      <td>${client.phone}</td>
      <td>${client.endDate}</td>
      <td>${status}</td>
      <td>
        <button onclick="deleteClient(${client.id})">Eliminar</button>
      </td>
    `;
    clientTableBody.appendChild(row);
  });
}

// Eliminar cliente
window.deleteClient = (id) => {
  clients = clients.filter(client => client.id !== id);
  saveClients();
  renderClients();
};

// Guardar en localStorage
function saveClients() {
  localStorage.setItem('topforce-clients', JSON.stringify(clients));
}

// Inicializar
document.addEventListener('DOMContentLoaded', renderClients);