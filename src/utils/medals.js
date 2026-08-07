export const MEDALS = [
  {
    id: 'welcome_badge',
    name: 'Bun Venit',
    icon: '👋',
    description: 'Ai devenit cetățean HexGlobe.',
    condition: (pixels, conquered, special = []) => special.includes('welcome_badge')
  },
  {
    id: 'first_buy',
    name: 'Prima Achiziție',
    icon: '🎖️',
    description: 'Ai cumpărat primul tău pixel.',
    condition: (pixels, conquered) => pixels.length >= 1
  },
  {
    id: 'patriot',
    name: 'Patriot',
    icon: '🏅',
    description: 'Ai cumpărat 10 pixeli.',
    condition: (pixels, conquered) => pixels.length >= 10
  },
  {
    id: 'conqueror',
    name: 'Cuceritor',
    icon: '⚔️',
    description: 'Ai cucerit 1 țară.',
    condition: (pixels, conquered) => conquered >= 1
  },
  {
    id: 'empire',
    name: 'Imperiu',
    icon: '👑',
    description: 'Ai cucerit 3 țări.',
    condition: (pixels, conquered) => conquered >= 3
  },
  {
    id: 'explorer',
    name: 'Explorator',
    icon: '🌍',
    description: 'Ai pixeli în cel puțin 3 țări.',
    condition: (pixels, conquered) => {
      const countries = new Set(pixels.map(p => p.country || 'Unknown'));
      return countries.size >= 3;
    }
  },
  {
    id: 'veteran',
    name: 'Veteran',
    icon: '🎗️',
    description: 'Ai acumulat 50 de pixeli.',
    condition: (pixels, conquered) => pixels.length >= 50
  },
  {
    id: 'superpower',
    name: 'Superputere',
    icon: '💎',
    description: 'Ai acumulat 100 de pixeli.',
    condition: (pixels, conquered) => pixels.length >= 100
  },
  {
    id: 'legend',
    name: 'Legendă',
    icon: '🔥',
    description: 'Ai acumulat 500 de pixeli.',
    condition: (pixels, conquered) => pixels.length >= 500
  },
  {
    id: 'lucky_god',
    name: 'Zeu al Norocului',
    icon: '🍀',
    description: 'Câștigată la roata norocului.',
    condition: (pixels, conquered, special = []) => special.includes('lucky_god')
  },
  {
    id: 'diplomat',
    name: 'Diplomat',
    icon: '🤝',
    description: 'Ai vorbit în chatul internațional.',
    condition: (pixels, conquered, special = []) => special.includes('diplomat')
  },
  {
    id: 'night_owl',
    name: 'Bufniță de Noapte',
    icon: '🦉',
    description: 'Ai acționat noaptea târziu.',
    condition: (pixels, conquered, special = []) => special.includes('night_owl')
  },
  {
    id: 'survivor',
    name: 'Supraviețuitor',
    icon: '🛡️',
    description: 'Ai rezistat unui atac major.',
    condition: (pixels, conquered, special = []) => special.includes('survivor')
  },
  {
    id: 'whale',
    name: 'Balenă Cripto',
    icon: '🐳',
    description: 'Ai cheltuit o avere.',
    condition: (pixels, conquered, special = []) => special.includes('whale')
  }
];

export function checkMedals(pixels = [], conquered = 0, special = []) {
  return MEDALS.map(medal => ({
    ...medal,
    unlocked: medal.condition(pixels, conquered, special)
  }));
}
