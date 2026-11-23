(() => {
  const canvas = document.querySelector('.cover-particles');
  const context = canvas?.getContext('2d');
  if (!context) return;
  const image = new Image();
  image.src = 'assets/qingyang-panorama-repaired.png';
  image.onload = () => {
    const sample = document.createElement('canvas');
    sample.width = 420;
    sample.height = Math.round(420 * image.naturalHeight / image.naturalWidth);
    const source = sample.getContext('2d', { willReadFrequently: true });
    source.drawImage(image, 0, 0, sample.width, sample.height);
    const { width, height } = sample;
    const { data } = source.getImageData(0, 0, width, height);
    const index = (x, y) => (y * width + x) * 4;
    const particles = [];
    let seed = 519;
    const random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
    for (let y = 3; y < height - 3; y += 2) {
      for (let x = 3; x < width - 3; x += 2) {
        const i = index(x, y);
        if (data[i + 3] < 155) continue;
        const dx = data[index(x - 3, y) + 3] - data[index(x + 3, y) + 3];
        const dy = data[index(x, y - 3) + 3] - data[index(x, y + 3) + 3];
        if (Math.hypot(dx, dy) < 100) continue;
        const angle = Math.atan2(dy, dx);
        const color = [data[i], data[i + 1], data[i + 2]].join(',');
        for (let n = 0; n < 12; n++) {
          const direction = angle + (random() - .5) * 1.8;
          const distance = 2 + 31 * random() ** 1.65;
          particles.push({
            x: (x + Math.cos(direction) * distance) / width,
            y: (y + Math.sin(direction) * distance) / height,
            color,
            size: .55 + random() * 1.15,
            alpha: (.32 + random() * .54) * (1 - distance / 39)
          });
        }
      }
    }
    const paint = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (!w || !h) return;
      const dpr = Math.min(devicePixelRatio, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      const narrow = matchMedia('(max-width: 900px)').matches;
      const iw = w * (narrow ? 1.15 : 1);
      const ih = iw * height / width;
      const left = narrow ? (w - iw) / 2 : 0;
      for (const p of particles) {
        context.fillStyle = 'rgba(' + p.color + ',' + p.alpha + ')';
        context.beginPath();
        context.arc(left + p.x * iw, (h - ih) / 2 + p.y * ih, p.size, 0, Math.PI * 2);
        context.fill();
      }
    };
    const resize = new ResizeObserver(paint);
    resize.observe(canvas);
    paint();
  };
})();
