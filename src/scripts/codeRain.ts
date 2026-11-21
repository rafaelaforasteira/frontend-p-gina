/**
 * Chuva de código em <canvas>: colunas de caracteres caindo devagar, em laranja.
 * Roda a ~24fps, só enquanto o canvas está visível e a aba está ativa.
 */
const GLYPHS = '01{}[]<>/=;:+*#$&|_()=>constletfnvar.?!'.split('');
const FONT_PX = 14;
const COL_W = 20;
const FPS = 24;

export function initCodeRain(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let w = 0, h = 0, cols: { y: number; v: number }[] = [];
  let visible = true, raf = 0, last = 0;

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.font = `500 ${FONT_PX}px 'JetBrains Mono', ui-monospace, monospace`;
    ctx.textBaseline = 'top';
    const n = Math.ceil(w / COL_W);
    cols = Array.from({ length: n }, (_, i) => cols[i] ?? { y: Math.random() * -60, v: .25 + Math.random() * .55 });
  };

  const frame = (t: number) => {
    raf = requestAnimationFrame(frame);
    if (t - last < 1000 / FPS) return;
    last = t;

    // rastro: pinta o fundo por cima com pouca opacidade
    ctx.fillStyle = 'rgba(10, 10, 10, .14)';
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < cols.length; i++) {
      const c = cols[i];
      const x = i * COL_W, y = Math.floor(c.y) * FONT_PX * 1.25;
      const g = GLYPHS[(Math.random() * GLYPHS.length) | 0];
      ctx.fillStyle = Math.random() > .93 ? '#FFE3D9' : (Math.random() > .5 ? '#FF6A3D' : '#F03C1A');
      ctx.fillText(g, x, y);
      c.y += c.v;
      if (y > h && Math.random() > .97) { c.y = Math.random() * -20; c.v = .25 + Math.random() * .55; }
    }
  };

  const start = () => { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame); };
  const stop = () => { cancelAnimationFrame(raf); raf = 0; };

  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? start() : stop(); }).observe(canvas);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));

  resize();
  start();
}
