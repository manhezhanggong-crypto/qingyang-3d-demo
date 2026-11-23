(() => {
  const cover = document.getElementById('site-cover');
  const motionAllowed = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  const setOffset = (x, y) => {
    cover.style.setProperty('--near-x', (x * 14).toFixed(1) + 'px');
    cover.style.setProperty('--near-y', (y * 9).toFixed(1) + 'px');
    cover.style.setProperty('--far-x', (x * 4).toFixed(1) + 'px');
    cover.style.setProperty('--far-y', (y * 3).toFixed(1) + 'px');
  };
  cover.addEventListener('pointermove', event => {
    if (!motionAllowed.matches || event.pointerType !== 'mouse') return;
    const bounds = cover.getBoundingClientRect();
    setOffset(2 * (event.clientX - bounds.left) / bounds.width - 1,
              2 * (event.clientY - bounds.top) / bounds.height - 1);
  });
  cover.addEventListener('pointerleave', () => setOffset(0, 0));
  motionAllowed.addEventListener('change', () => setOffset(0, 0));
})();
