/**
 * ENTRADA DO MENU (no fim da abertura) — mesma lógica do portfólio de social media:
 *  1) O menu desce minimizado, só com a bolinha de fogo, no centro.
 *  2) A bolinha vai para o lado e "puxa" FORASTEIRA (a palavra se revela da direita para a esquerda).
 *  3) O menu abre em toda a largura e o logo vai para o canto.
 *  4) Entram os links e o botão do WhatsApp.
 * Técnica: a barra é recortada com clip-path (janela que cresce do centro); o logo é deslocado
 * para ficar centralizado dentro da janela em cada etapa. Tudo medido no tamanho real da tela.
 */
import { gsap } from 'gsap';

export function navIntro(): gsap.core.Timeline | null {
  const bar = document.querySelector<HTMLElement>('.nav__bar');
  const logo = bar?.querySelector<HTMLElement>('.nav__logo');
  const word = bar?.querySelector<HTMLElement>('.nav__word');
  const fire = bar?.querySelector<SVGElement>('.nav__fire');
  if (!bar || !logo || !word || !fire) return null;
  const extras = [
    ...bar.querySelectorAll<HTMLElement>('.nav__links li'),
    ...bar.querySelectorAll<HTMLElement>('.nav__cta'),
  ].filter((el) => el.offsetParent !== null);

  // medidas (sem deslocamentos)
  gsap.set([bar, logo, word], { clearProps: 'transform,clipPath' });
  const b = bar.getBoundingClientRect();
  const l = logo.getBoundingClientRect();
  const f = fire.getBoundingClientRect();
  const W = b.width, H = b.height, cx = b.left + W / 2;
  const R = parseFloat(getComputedStyle(bar).borderTopLeftRadius) || 18;

  const winA = H;                  // etapa 1: quadradinho só com a bolinha
  const winB = l.width + 48;       // etapa 2: logo inteiro
  const dxA = cx - (f.left + f.width / 2);
  const dxB = cx - (l.left + l.width / 2);

  // a janela é animada por um número (o navegador simplifica o texto do clip-path e quebraria a transição)
  const win = { w: winA };
  const applyClip = () => { bar.style.clipPath = `inset(0px ${(W - win.w) / 2}px 0px ${(W - win.w) / 2}px round ${R}px)`; };

  const tl = gsap.timeline({
    onComplete: () => {
      gsap.set([bar, logo, word, fire, ...extras], { clearProps: 'transform,clipPath' });
      gsap.set([bar, ...extras], { autoAlpha: 1 });
    },
  });
  tl.set(bar, { autoAlpha: 1, y: -90 }, 0)
    .add(() => { win.w = winA; applyClip(); }, 0)
    .set(logo, { x: dxA }, 0)
    .set(word, { clipPath: 'inset(0% 0% 0% 100%)' }, 0)
    .set(extras, { autoAlpha: 0, y: -8 }, 0)
    // 1) desce só com a bolinha (ela gira e cresce, tipo faísca acendendo)
    .to(bar, { y: 0, duration: 0.6, ease: 'power3.out' }, 0)
    .fromTo(fire, { scale: 0.3, rotation: -25 }, { scale: 1, rotation: 0, duration: 0.6, ease: 'back.out(2.2)', transformOrigin: '50% 60%' }, 0.1)
    // 2) a bolinha vai para o lado e puxa FORASTEIRA
    .to(logo, { x: dxB, duration: 0.7, ease: 'power3.inOut' }, 0.75)
    .to(word, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.7, ease: 'power3.inOut' }, 0.75)
    .to(win, { w: winB, duration: 0.7, ease: 'power3.inOut', onUpdate: applyClip }, 0.75)
    // 3) abre em toda a largura (logo vai para o canto)
    .to(win, { w: W, duration: 0.85, ease: 'expo.inOut', onUpdate: applyClip }, 1.6)
    .to(logo, { x: 0, duration: 0.85, ease: 'expo.inOut' }, 1.6)
    // 4) links e botão do WhatsApp
    .to(extras, { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power3.out', stagger: 0.06 }, 2.15);
  return tl;
}
