// Generador de WODs
const wodExercises = {
  cardio: ["Burpees", "Box Jumps", "Double Unders", "400m Run"],
  strength: ["Thrusters", "Deadlifts", "Power Cleans", "Kettlebell Swings"],
  core: ["Toes-to-Bar", "Sit-ups", "Russian Twists", "Plank"]
};

function generateRandomWOD() {
  const formats = ["AMRAP 15 min", "EMOM 12 min", "Tabata (8 rounds)", "For Time"];
  const selectedFormat = formats[Math.floor(Math.random() * formats.length)];
  
  const getRandomExercise = (type) => {
    const exercises = wodExercises[type];
    const count = Math.floor(Math.random() * 10) + 5;
    return `${count} ${exercises[Math.floor(Math.random() * exercises.length)]}`;
  };
  
  const exercises = [
    getRandomExercise("cardio"),
    getRandomExercise("strength"),
    getRandomExercise("core")
  ];
  
  return {
    format: selectedFormat,
    exercises: exercises
  };
}

// Temporizador
class Timer {
  constructor(display) {
    this.display = display;
    this.time = 720; // 12 minutos en segundos
    this.interval = null;
  }
  
  start() {
    if (this.interval) return;
    
    this.interval = setInterval(() => {
      this.time--;
      this.updateDisplay();
      
      if (this.time <= 0) {
        clearInterval(this.interval);
        new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3').play();
      }
    }, 1000);
  }
  
  reset() {
    clearInterval(this.interval);
    this.interval = null;
    this.time = 720;
    this.updateDisplay();
  }
  
  updateDisplay() {
    const minutes = Math.floor(this.time / 60);
    const seconds = this.time % 60;
    this.display.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  // WOD Generator
  const wodDisplay = document.getElementById('wodDisplay');
  const generateBtn = document.getElementById('generateBtn');
  
  generateBtn.addEventListener('click', () => {
    generateBtn.classList.add('animate__animated', 'animate__rubberBand');
    setTimeout(() => {
      generateBtn.classList.remove('animate__animated', 'animate__rubberBand');
    }, 1000);
    
    const wod = generateRandomWOD();
    wodDisplay.innerHTML = `
      <p>${wod.format}:</p>
      <ul>
        ${wod.exercises.map(ex => `<li>${ex}</li>`).join('')}
      </ul>
    `;
  });
  
  // Timer
  const timerDisplay = document.getElementById('timer');
  const timer = new Timer(timerDisplay);
  
  document.getElementById('startTimer').addEventListener('click', () => {
    timer.start();
  });
  
  document.getElementById('resetTimer').addEventListener('click', () => {
    timer.reset();
  });
});