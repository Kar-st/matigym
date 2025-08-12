// Generador de WOD con animación
document.getElementById('generate-wod').addEventListener('click', async () => {
  const wodCard = document.querySelector('.card-wod');
  wodCard.classList.add('animate-shake'); // Agrega efecto de vibración
  
  // Simula carga
  document.getElementById('wod-content').textContent = "Generando...";
  
  // Obtiene datos reales de Google Sheets
  const clientes = await getClientes();
  const randomWOD = generarWOD(clientes); // Usa tu función generadora
  
  setTimeout(() => {
    wodCard.classList.remove('animate-shake');
    document.getElementById('wod-content').textContent = randomWOD;
  }, 1000);
});

// Temporizador con sonido
const timer = new Temporizador();
document.getElementById('start-timer').addEventListener('click', () => {
  timer.start(60, (seconds) => {
    document.getElementById('timer').textContent = 
      `${Math.floor(seconds / 60)}:${seconds % 60 < 10 ? '0' : ''}${seconds % 60}`;
    if (seconds === 0) new Audio('sound/beep.mp3').play();
  });
});