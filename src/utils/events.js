export const EVENT_TYPES = {
  DISCOUNT: { type: 'discount', shortTitle: 'HAPPY HOUR', title: '🔥 HAPPY HOUR: Pixeli la 50% reducere!', description: 'Cumpără pixeli acum la jumătate de preț și extinde-ți teritoriul mai rapid!', color: 'text-[#bc13fe]', border: 'border-[#bc13fe]' },
  DOUBLE_XP: { type: 'doubleXP', shortTitle: 'DUBLU XP', title: '⚡ DUBLU XP: Fiecare pixel contează dublu!', description: 'Orice pixel plasat acum adaugă puncte duble la scorul țării tale!', color: 'text-[#00f3ff]', border: 'border-[#00f3ff]' },
  BONUS: { type: 'bonus', shortTitle: 'PIXELI BONUS', title: '🎯 TERITORIU BONUS: +2 pixeli gratis!', description: 'Cumperi 1, primești 3! Profită acum pentru a domina harta.', color: 'text-green-400', border: 'border-green-400' },
  LEGENDARY: { type: 'legendary', shortTitle: 'PIXEL DE AUR', title: '💎 PIXEL DE AUR: Șansă legendară!', description: 'Plasează pixeli acum și poți descoperi un Pixel Legendar ce oferă protecție bonus 24h.', color: 'text-yellow-400', border: 'border-yellow-400' }
};

export function getRandomEvent() {
  const keys = Object.keys(EVENT_TYPES);
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  const event = EVENT_TYPES[randomKey];
  const duration = Math.floor(Math.random() * (20 - 10 + 1) + 10) * 60; // 10-20 minutes in seconds
  return { ...event, duration };
}
