export const MISSION_TEMPLATES = [
  {
    id: 'buy_3',
    title: 'Cumpără 3 pixeli în orice țară',
    icon: '🎯',
    target: 3,
    reward: '2 Pixeli',
    checkProgress: (pixels) => Math.min(pixels.length, 3)
  },
  {
    id: 'visit_10',
    title: 'Vizitează 10 țări diferite',
    icon: '🌍',
    target: 10,
    reward: '5 Pixeli',
    checkProgress: () => {
      try {
        const visited = JSON.parse(localStorage.getItem('visitedCountries') || '[]');
        return Math.min(visited.length, 10);
      } catch (e) {
        return 0;
      }
    }
  },
  {
    id: 'buy_2_new',
    title: 'Cumpără pixeli în 2 țări noi',
    icon: '🚩',
    target: 2,
    reward: '3 Pixeli',
    checkProgress: (pixels) => {
        const countries = new Set(pixels.map(p => p.country));
        return Math.min(countries.size, 2); 
    }
  },
  {
    id: 'reach_captain',
    title: 'Atinge rangul de Căpitan (10 pixeli)',
    icon: '🏆',
    target: 1,
    reward: '10 Pixeli',
    checkProgress: (pixels) => pixels.length >= 10 ? 1 : 0
  },
  {
    id: 'spend_50',
    title: 'Acumulează 50 de pixeli',
    icon: '💰',
    target: 50,
    reward: '15 Pixeli',
    checkProgress: (pixels) => Math.min(pixels.length, 50)
  },
  {
    id: 'share_social',
    title: 'Distribuie pe Social Media',
    icon: '📱',
    target: 1,
    reward: '5 Pixeli',
    checkProgress: () => localStorage.getItem('hasShared_v2') === 'true' ? 1 : 0
  },
  {
    id: 'buy_europe',
    title: 'Cumpără un pixel în Europa (ex: Franța)',
    icon: '🏰',
    target: 1,
    reward: '2 Pixeli',
    checkProgress: (pixels) => pixels.some(p => ['France', 'Germany', 'Italy', 'Spain', 'Romania', 'United Kingdom'].includes(p.country)) ? 1 : 0
  },
  {
    id: 'veteran_100',
    title: 'Deține 100 de pixeli în total',
    icon: '💎',
    target: 100,
    reward: '50 Pixeli',
    checkProgress: (pixels) => Math.min(pixels.length, 100)
  },
  {
    id: 'first_blood',
    title: 'Cumpără primul tău pixel din sesiune',
    icon: '🔥',
    target: 1,
    reward: '1 Pixel',
    checkProgress: (pixels) => Math.min(pixels.length, 1)
  },
  {
    id: 'loyal_patriot',
    title: 'Cumpără 5 pixeli în aceeași țară',
    icon: '🛡️',
    target: 5,
    reward: '10 Pixeli',
    checkProgress: (pixels) => {
      const counts = {};
      pixels.forEach(p => { counts[p.country] = (counts[p.country] || 0) + 1; });
      const maxCount = Math.max(0, ...Object.values(counts));
      return Math.min(maxCount, 5);
    }
  },
  {
    id: 'globetrotter',
    title: 'Deține pixeli pe 3 continente (Mock: 3 țări)',
    icon: '✈️',
    target: 3,
    reward: '15 Pixeli',
    checkProgress: (pixels) => {
      const countries = new Set(pixels.map(p => p.country));
      return Math.min(countries.size, 3);
    }
  },
  {
    id: 'online_8h',
    title: '5 pixeli la fiecare 8 ore online',
    icon: '⏳',
    target: 480, // 480 minute
    reward: '5 Pixeli',
    checkProgress: () => Math.min(parseInt(localStorage.getItem('onlineTimeMinutes') || '0', 10), 480)
  }
];

export function generateDailyMissions(dateStr) {
  let seed = 0;
  for (let i = 0; i < dateStr.length; i++) {
    seed += dateStr.charCodeAt(i);
  }
  
  const numMissions = 7; 
  
  const specialMissions = MISSION_TEMPLATES.filter(m => m.id === 'share_social' || m.id === 'online_8h');
  const otherMissions = MISSION_TEMPLATES.filter(m => m.id !== 'share_social' && m.id !== 'online_8h');

  const shuffled = [...otherMissions].sort((a, b) => {
    return (a.id.length * seed % 7) - (b.id.length * seed % 7);
  });
  
  return [...specialMissions, ...shuffled.slice(0, numMissions - 2)];
}

export function getMissionDay() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

export function checkAndResetMissions(purchasedPixels) {
  const currentDay = getMissionDay();
  const savedStateStr = localStorage.getItem('hexglobe_mission_state');
  let savedState = null;

  try {
    if (savedStateStr) {
      savedState = JSON.parse(savedStateStr);
    }
  } catch (e) {
    console.error("Error parsing mission state", e);
  }

  if (!savedState) {
    localStorage.setItem('hexglobe_mission_state', JSON.stringify({ day: currentDay, allCompleted: false }));
    return generateDailyMissions(currentDay);
  }

  if (savedState.day !== currentDay && savedState.allCompleted) {
    localStorage.setItem('hexglobe_mission_state', JSON.stringify({ day: currentDay, allCompleted: false }));
    return generateDailyMissions(currentDay);
  }

  if (savedState.day !== currentDay && !savedState.allCompleted) {
    return generateDailyMissions(savedState.day);
  }

  return generateDailyMissions(savedState.day);
}
