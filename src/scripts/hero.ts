/**
 * Hero: título digitado como máquina de escrever, glitch no DEV,
 * terminal digitando e rabisco entrando em sequência.
 */
import { gsap } from 'gsap';
import { initCodeRain } from './codeRain';
import { navIntro } from './navIntro';

// só em desenvolvimento: deixa o GSAP acessível no console para depurar a abertura
if (import.meta.env.DEV) (window as unknown as { gsap: typeof gsap }).gsap = gsap;

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const $ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => root.querySelector<T>(s);

/** Quebra o texto em <span class="ch"> com largura travada (em em) para nada "pular" enquanto digita. */
function split(el: HTMLElement) {
  const text = el.dataset.scramble ?? el.textContent ?? '';
  el.textContent = '';
  const chars = [...text].map((c) => {
    const s = document.createElement('span');
    s.className = 'ch';
    s.textContent = c;
    el.appendChild(s);
    return s;
  });
  const fs = parseFloat(getComputedStyle(el).fontSize);
  chars.forEach((s) => (s.style.width = `${s.getBoundingClientRect().width / fs}em`));
  return chars;
}

/** Máquina de escrever (só na entrada): as letras aparecem uma a uma, sem cursor no título. */
async function typeChars(chars: HTMLElement[], speed = 90) {
  for (const c of chars) {
    c.textContent = c.dataset.final ?? '';
    await wait(speed + Math.random() * speed * 0.5);
  }
}

/** Largura real do texto = soma das letras (o bloco em si estica até a largura do título). */
const textWidth = (el: HTMLElement) => [...el.children].reduce((w, c) => w + c.getBoundingClientRect().width, 0);

/** Aumenta o DEV até fechar exatamente a largura do FRONT-END (mesma borda nos dois lados). */
function fit(dev: HTMLElement, fe: HTMLElement) {
  dev.style.fontSize = '';
  const fs = parseFloat(getComputedStyle(dev).fontSize);
  const parentFs = parseFloat(getComputedStyle(dev.parentElement!).fontSize);
  dev.style.fontSize = `${(fs * textWidth(fe)) / textWidth(dev) / parentFs}em`;
}

async function type(el: HTMLElement, text: string, speed = 60) {
  for (let i = 1; i <= text.length; i++) { el.textContent = text.slice(0, i); await wait(speed + Math.random() * speed * 0.6); }
}

/**
 * ABERTURA (~2,8s até o texto):
 *   0,0  tela toda preta (cortina), rolagem travada
 *   0,2  cortina some → foto aparece CENTRALIZADA, desfocada, e vai ganhando nitidez
 *   1,3  foto desliza pro lugar dela (desktop: pra direita · celular: sobe)
 *   2,1  foto "puxa pra trás" (afasta até o tamanho final)
 *   2,8  neons acendem → resolve a promessa (o texto começa); o menu só entra no fim do texto
 */
function intro(hero: HTMLElement) {
  return new Promise<void>((textStart) => {
    const root = document.documentElement;
    const curtain = $('[data-curtain]');
    const stage = $('.hero__stage', hero)!;
    const photo = $('.hero__photo', hero)!;
    const desk = matchMedia('(min-width: 1024px)').matches;

    root.classList.add('intro-live', 'intro-lock');
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    scrollTo(0, 0);

    // deslocamento que coloca o ROSTO no centro da tela (rosto ≈ 50% × 40% da foto)
    const r = stage.getBoundingClientRect();
    const fy = desk ? 0.4 : 0.36;
    const off = { x: desk ? innerWidth / 2 - (r.left + r.width * 0.5) : 0, y: innerHeight / 2 - (r.top + r.height * fy) };

    const unlock = () => { root.classList.remove('intro-lock'); curtain?.remove(); };
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: unlock });

    tl.set(stage, { x: off.x, y: off.y, scale: 1.18, transformOrigin: `50% ${fy * 100}%` }, 0)
      .set($('.hero__term', hero), { autoAlpha: 0 }, 0)
      .fromTo(photo, { filter: 'blur(16px)' }, { filter: 'blur(0px)', duration: 1.4, ease: 'expo.out' }, 0.2)
      .to(curtain, { opacity: 0, duration: 0.9, ease: 'power2.out' }, 0.2)
      // puxa pro lado…
      .to(stage, { x: 0, y: 0, duration: 0.9, ease: 'expo.inOut' }, 1.3)
      // …e depois puxa pra trás
      .to(stage, { scale: 1, duration: 0.75, ease: 'expo.inOut' }, 2.1)
      .from(hero.querySelectorAll('.hero__neon'), { opacity: 0, duration: 1, ease: 'power2.out', stagger: 0.12 }, 2.8)
      .to($('.hero__term', hero), { autoAlpha: 1, duration: 0.2 }, 2.8)
      .add(() => textStart(), 2.8);

    // o menu fica escondido até o texto todo terminar (ver initHero)
    gsap.set('.nav__bar', { autoAlpha: 0 });

    // se a janela mudar de tamanho no meio da abertura, pula pro fim
    addEventListener('resize', () => { if (tl.isActive()) tl.progress(1); }, { once: true });
  });
}

export async function initHero() {
  const hero = $('.hero');
  const dev = $('[data-scramble="DEV"]');
  const fe = $('[data-fit]');
  if (!hero || !dev || !fe) return;

  const motion = document.documentElement.classList.contains('js-anim');

  // espera as fontes do título de verdade (as larguras das letras dependem delas)
  await Promise.all([
    document.fonts.load('900 1em "Big Shoulders Display"'),
    document.fonts.load('700 1em "JetBrains Mono"'),
  ]).catch(() => {});
  await document.fonts.ready;
  // se a aba ainda não tem layout (largura 0), espera o próximo quadro
  while (!dev.getBoundingClientRect().width) await wait(50);

  const devChars = split(dev);
  const feChars = split(fe);
  fit(dev, fe);
  const title = $('.hero__title', hero);
  addEventListener('resize', () => fit(dev, fe), { passive: true });

  if (!motion) {
    // sem animação: tudo já vem escrito no HTML, só mostra
    title?.classList.add('is-ready');
    return;
  }

  // prepara: terminal vazio e letras do título em branco (guardando a letra final de cada uma)
  const termParts = [...hero.querySelectorAll<HTMLElement>('.hero__term [data-type]')];
  termParts.forEach((p) => (p.textContent = ''));
  [...devChars, ...feChars].forEach((c) => { c.dataset.final = c.textContent ?? ''; c.textContent = ' '; });

  // ---------- Abertura ----------
  await intro(hero);

  // ---------- Texto, um atrás do outro ----------
  const rain = $<HTMLCanvasElement>('[data-rain]', hero);
  if (rain) initCodeRain(rain);

  // 1) terminal digita a linha inteira (rápido)
  for (const p of termParts) await type(p, p.dataset.type ?? '', 16);
  await wait(120);
  // 2) DEV digitado (o cursor fica só no terminal, depois do "npm run dev")
  title?.classList.add('is-ready');
  await typeChars(devChars, 130);
  await wait(160);
  // 3) FRONT-END digitado
  await typeChars(feChars, 70);
  // 4) ready
  await wait(250);
  $('[data-ok]', hero)?.classList.add('is-on');
  // 5) no fim de tudo, o grafite sublinha o FRONT-END
  await wait(500);
  $('.hero__strike', hero)?.classList.add('is-on');
  // 6) só depois do texto todo: o menu desce com a bolinha de fogo → puxa FORASTEIRA → abre inteiro
  //    (medido agora, no tamanho atual da tela)
  await wait(650);
  navIntro();

  // glitch de tempos em tempos e ao passar o mouse no título
  const glitch = () => { dev.classList.add('is-glitch'); setTimeout(() => dev.classList.remove('is-glitch'), 450); };
  const loop = () => setTimeout(() => { glitch(); loop(); }, 4000 + Math.random() * 4000);
  setTimeout(glitch, 1200); loop();

  $('.hero__title', hero)?.addEventListener('pointerenter', glitch);
}
