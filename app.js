const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const spinBtn = document.getElementById('spinBtn');
const levelSelect = document.getElementById('levelSelect');
const modeSelect = document.getElementById('modeSelect');

const resultCard = document.getElementById('resultCard');
const projectTitle = document.getElementById('projectTitle');
const projectProblem = document.getElementById('projectProblem');
const techStack = document.getElementById('techStack');
const coreFeatures = document.getElementById('coreFeatures');

const slices = ['Full-Stack', 'APIs', 'Security', 'DevOps', 'CLI Tool', 'Database'];
const colors = ['#0284c7', '#0d9488', '#16a34a', '#ca8a04', '#dc2626', '#9333ea'];

let currentAngle = 0;
let isSpinning = false;

function drawWheel() {
  const numSlices = slices.length;
  const sliceAngle = (2 * Math.PI) / numSlices;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < numSlices; i++) {
    const angle = currentAngle + i * sliceAngle;
    ctx.beginPath();
    ctx.fillStyle = colors[i % colors.length];
    ctx.moveTo(160, 160);
    ctx.arc(160, 160, 160, angle, angle + sliceAngle);
    ctx.lineTo(160, 160);
    ctx.fill();

    // Draw text on slices
    ctx.save();
    ctx.translate(160, 160);
    ctx.rotate(angle + sliceAngle / 2);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(slices[i], 140, 5);
    ctx.restore();
  }
}

drawWheel();

spinBtn.addEventListener('click', async () => {
  if (isSpinning) return;
  isSpinning = true;
  resultCard.style.display = 'none';

  const level = levelSelect.value;
  const mode = modeSelect.value;

  // Wheel Spin Animation
  let speed = Math.random() * 0.2 + 0.3;
  let duration = 2500;
  let start = Date.now();

  const animate = setInterval(() => {
    currentAngle += speed;
    drawWheel();

    if (Date.now() - start > duration) {
      clearInterval(animate);
      isSpinning = false;
      fetchProject(level, mode);
    }
  }, 16);
});

async function fetchProject(level, mode) {
  try {
    const response = await fetch(`https://dev-idea-generator.onrender.com/api/projects/spin?level=${level}&mode=${mode}`);
    const result = await response.json();

    if (!result.success) {
      alert('Error fetching project: ' + (result.message || result.error || 'No project available for this combination.'));
      return;
    }

    const data = result.data;

    projectTitle.textContent = data.title;
    projectProblem.textContent = data.problem_statement;

    // Helper function to safely handle string or array data
    const parseArrayData = (input) => {
      if (Array.isArray(input)) return input;
      if (typeof input === 'string') {
        try {
          const parsed = JSON.parse(input);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {
          return input.split(',').map(item => item.trim());
        }
      }
      return [];
    };

    // Render Tech Stack Tags
    techStack.innerHTML = '';
    const stack = parseArrayData(data.recommended_tech_stack);
    stack.forEach(tech => {
      const span = document.createElement('span');
      span.className = 'tag';
      span.textContent = tech;
      techStack.appendChild(span);
    });

    // Render Core Features List
    coreFeatures.innerHTML = '';
    const features = parseArrayData(data.core_features);
    features.forEach(feat => {
      const li = document.createElement('li');
      li.textContent = feat;
      coreFeatures.appendChild(li);
    });

    resultCard.style.display = 'block';

  } catch (err) {
    console.error(err);
    alert('Failed to connect to backend server: ' + err.message);
  }
}