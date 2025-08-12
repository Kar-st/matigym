document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("clienteForm");
    const tableBody = document.getElementById("clientesTable");

    // Datos simulados (después vendrán de Google Sheets)
    let clientes = [
        { nombre: "Juan Pérez", telefono: "1123456789", servicio: "Musculación", inicio: "2025-08-01", vencimiento: "2025-08-31" },
        { nombre: "Ana López", telefono: "1198765432", servicio: "GAP", inicio: "2025-07-15", vencimiento: "2025-08-14" }
    ];

    // Función para determinar estado
    function calcularEstado(vencimiento) {
        const hoy = new Date();
        const fechaV = new Date(vencimiento);
        const diff = Math.ceil((fechaV - hoy) / (1000 * 60 * 60 * 24));

        if (diff < 0) return "vencido";
        if (diff <= 3) return "por-vencer";
        return "activo";
    }

    // Renderizar tabla
    function renderTabla() {
        tableBody.innerHTML = "";
        clientes.forEach((cliente, index) => {
            const estado = calcularEstado(cliente.vencimiento);
            const row = document.createElement("tr");
            row.classList.add(`estado-${estado}`);

            row.innerHTML = `
                <td>${cliente.nombre}</td>
                <td>${cliente.telefono}</td>
                <td>${cliente.servicio}</td>
                <td>${cliente.inicio}</td>
                <td>${cliente.vencimiento}</td>
                <td>${estado.toUpperCase()}</td>
                <td><button onclick="eliminarCliente(${index})">❌</button></td>
            `;

            tableBody.appendChild(row);
        });
    }

    // Agregar cliente
    form.addEventListener("submit", e => {
        e.preventDefault();
        const nuevoCliente = {
            nombre: document.getElementById("nombre").value,
            telefono: document.getElementById("telefono").value,
            servicio: document.getElementById("servicio").value,
            inicio: document.getElementById("inicio").value,
            vencimiento: document.getElementById("vencimiento").value
        };
        clientes.push(nuevoCliente);
        form.reset();
        renderTabla();
    });

    // Eliminar cliente (global para que funcione el onclick)
    window.eliminarCliente = (index) => {
        clientes.splice(index, 1);
        renderTabla();
    };

    renderTabla();
});
