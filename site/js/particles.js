(function () {
  const container = document.getElementById('particles');

  const COLORS = [
    'rgba(56,189,248,0.3)',
    'rgba(14,165,233,0.25)',
    'rgba(129,140,248,0.2)',
    'rgba(74,240,160,0.15)'
  ];

  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.className = 'particle';

    const size  = (Math.random() * 4 + 1).toFixed(1);
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const dx    = ((Math.random() - 0.5) * 200).toFixed(0);
    const dur   = (Math.random() * 20 + 15).toFixed(1);
    const delay = -(Math.random() * 20).toFixed(1);

    p.style.cssText = [
      `width:${size}px`,
      `height:${size}px`,
      `background:${color}`,
      `left:${(Math.random() * 100).toFixed(1)}%`,
      `--dx:${dx}px`,
      `animation-duration:${dur}s`,
      `animation-delay:${delay}s`
    ].join(';');

    container.appendChild(p);
  }
})();
