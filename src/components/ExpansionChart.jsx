import React, { useMemo } from 'react';
import { TrendingUp } from 'lucide-react';

const days = ['Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm', 'Dum'];

const ExpansionChart = ({ purchasedPixels = 0, countryName = 'România' }) => {
  const data = useMemo(() => {
    let current = Math.max(10, Math.floor(purchasedPixels / 2));
    return days.map(day => {
      const growth = Math.floor(Math.random() * 20);
      current += growth;
      return { day, value: current };
    });
  }, [purchasedPixels]);

  const maxVal = Math.max(...data.map(d => d.value));

  return (
    <div className="bg-black/60 border border-[#bc13fe]/30 rounded-lg p-3 glass-panel">
      <div className="flex items-center gap-2 mb-4 text-[#bc13fe]">
        <TrendingUp size={16} />
        <h3 className="text-sm font-bold uppercase tracking-wider">Expansiune: {countryName}</h3>
      </div>
      
      <div className="relative h-32 flex items-end gap-2 px-2 pb-6 border-b border-white/10">
        <div className="absolute left-0 bottom-6 w-full border-t border-white/5" style={{ bottom: '25%' }}></div>
        <div className="absolute left-0 bottom-6 w-full border-t border-white/5" style={{ bottom: '50%' }}></div>
        <div className="absolute left-0 bottom-6 w-full border-t border-white/5" style={{ bottom: '75%' }}></div>
        
        {data.map((item, i) => {
          const heightPct = maxVal > 0 ? (item.value / maxVal) * 100 : 0;
          return (
            <div key={i} className="flex-1 flex flex-col items-center group relative z-10 h-full justify-end">
              <div className="absolute -top-8 bg-black/90 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-[#00f3ff]/50 z-20">
                {item.value} pixeli
              </div>
              
              <div 
                className="w-full bg-gradient-to-t from-[#bc13fe]/20 to-[#00f3ff]/80 rounded-t-sm transition-all duration-500 ease-out group-hover:shadow-[0_0_10px_#00f3ff] group-hover:brightness-125"
                style={{ height: `${Math.max(5, heightPct)}%` }}
              ></div>
              
              <div className="absolute -bottom-6 text-[10px] text-gray-400 group-hover:text-white transition-colors">
                {item.day}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExpansionChart;
