/** Dados de contato centralizados — usados em nav, contato e menu. */
export const PHONE_E164 = '5532998830969';
export const PHONE_DISPLAY = '+55 (32) 99883-0969';
export const EMAIL = 'raffaelaforasteira@gmail.com';

const wa = (msg: string) => `https://wa.me/${PHONE_E164}?text=${encodeURIComponent(msg)}`;

/*
 * Uma mensagem diferente por botão: pela frase que chega no WhatsApp dá para saber
 * de onde a pessoa clicou, sem o texto dizer isso.
 *  - Seção de contato (fim da página): "Acabei de ver o seu currículo…"
 *  - Menu (topo / menu do celular):    "Conheci o seu trabalho agora…"
 */
export const WHATSAPP_MESSAGE = 'Oi, Raffaela, tudo bem? Eu acabei de ver o seu currículo. Achei muito legal, estou interessado. Podemos conversar?';
/** Número só com DDD e dígitos (o que vai para a área de transferência no botão de copiar). */
export const PHONE_LOCAL = '32998830969';
export const PHONE_SHORT = '(32) 99883-0969';
export const WHATSAPP_URL = wa(WHATSAPP_MESSAGE);

export const WHATSAPP_MESSAGE_MENU = 'Oi, Raffaela! Tudo bem? Conheci o seu trabalho agora e gostaria de conversar com você.';
export const WHATSAPP_URL_MENU = wa(WHATSAPP_MESSAGE_MENU);
