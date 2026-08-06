export const getRank = (dollars) => {
  if (dollars >= 1000) return { title: 'President', color: 'text-yellow-400', bg: 'bg-yellow-400/20', border: 'border-yellow-400', icon: '👑' };
  if (dollars >= 500) return { title: 'Guvernator', color: 'text-purple-400', bg: 'bg-purple-400/20', border: 'border-purple-400', icon: '🏛️' };
  if (dollars >= 100) return { title: 'General', color: 'text-red-500', bg: 'bg-red-500/20', border: 'border-red-500', icon: '⭐' };
  if (dollars >= 70) return { title: 'Căpitan', color: 'text-orange-500', bg: 'bg-orange-500/20', border: 'border-orange-500', icon: '⚔️' };
  if (dollars >= 50) return { title: 'Locotenent', color: 'text-blue-400', bg: 'bg-blue-400/20', border: 'border-blue-400', icon: '🎖️' };
  return { title: 'Soldat', color: 'text-gray-300', bg: 'bg-white/10', border: 'border-gray-500', icon: '🪖' };
};
