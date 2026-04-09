(function () {
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');
  let wavePhase = 0;

  function initCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function drawWater() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    wavePhase += 0.015; 
    
    drawWave(0.5, "rgba(0, 63, 85, 0.5)", wavePhase); 
    drawWave(0.52, "rgba(2, 125, 165, 0.4)", wavePhase * 0.8);

    requestAnimationFrame(drawWater);
  }

  function drawWave(heightFactor, color, phase) {
    ctx.beginPath();
    const baseline = canvas.height * heightFactor;
    const amplitude = 20;
    const frequency = 0.01;

    ctx.moveTo(0, canvas.height);
    ctx.lineTo(0, baseline);

    for (let x = 0; x <= canvas.width; x += 5) {
      const y = baseline + Math.sin(x * frequency + phase) * amplitude;
      ctx.lineTo(x, y);
    }

    ctx.lineTo(canvas.width, canvas.height);
    ctx.fillStyle = color;
    ctx.fill();
  }

  initCanvas();
  drawWater();

  window.addEventListener('resize', initCanvas);
})();