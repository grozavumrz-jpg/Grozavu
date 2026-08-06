export const EVENT_TYPES = {
  DISCOUNT: { type: 'discount', title: '🔥 HAPPY HOUR: Pixeli la 50% reducere!', color: 'text-[#bc13fe]', border: 'border-[#bc13fe]' },
  DOUBLE_XP: { type: 'doubleXP', title: '⚡ DUBLU XP: Fiecare pixel contează dublu!', color: 'text-[#00f3ff]', border: 'border-[#00f3ff]' },
  BONUS: { type: 'bonus', title: '🎯 TERITORIU BONUS: +2 pixeli gratis la fiecare achiziție!', color: 'text-green-400', border: 'border-green-400' },
  LEGENDARY: { type: 'legendary', title: '💎 PIXEL DE AUR: Șansa de a primi un pixel legendar!', color: 'text-yellow-400', border: 'border-yellow-400' }
};

export function getRandomEvent() {
  const keys = Object.keys(EVENT_TYPES);
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  const event = EVENT_TYPES[randomKey];
  const duration = Math.floor(Math.random() * (20 - 10 + 1) + 10) * 60; // 10-20 minutes in seconds
  return { ...event, duration };
}
