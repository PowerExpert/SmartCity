// js/starfield.js — анимация звёздного неба на canvas

(function () {
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');
  let stars = [];

  function initStars() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    stars = [];

    for (let i = 0; i < 220; i++) {
      stars.push({
        x:     Math.random() * canvas.width,
        y:     Math.random() * canvas.height,
        r:     Math.random() * 1.5 + 0.2,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.005 + 0.002
      });
    }
  }

  function drawStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    stars.forEach(s => {
      s.phase += s.speed;
      const alpha = 0.3 + 0.7 * Math.abs(Math.sin(s.phase));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,230,255,${alpha.toFixed(2)})`;
      ctx.fill();
    });

    requestAnimationFrame(drawStars);
  }

  initStars();
  drawStars();

  window.addEventListener('resize', initStars);
})();