import React, { useState, useEffect } from 'react';

const messages = [
  "TERRITORIUL ESTE O ILUZIE",
  "RĂZBOAIELE VOASTRE SUNT NEÎNSEMNATE",
  "PIXEL CU PIXEL, PLANETA CADE",
  "SUNTEM AICI",
  "UNIVERSUL NU IARTĂ",
  "TIMPUL VĂ EXPIRĂ",
  "NU SUNTEȚI SINGURI",
  "OBSERVĂM FIECARE MIȘCARE",
  "INUTIL SĂ VĂ OPUNEȚI",
  "CINE VA FI URMĂTORUL?",
  "FIECARE PIXEL CONTEAZĂ",
  "O NOUĂ ERĂ SE APROPIE",
  "SISTEMELE VĂ SUNT COMPROMISE",
  "CE ESTE AL VOSTRU E ȘI AL NOSTRU",
  "PRIVIM DIN UMBRĂ"
];

export default function AlienFleet() {
  const [ship, setShip] = useState({ top: 15, msg: "PIXEL CU PIXEL, PLANETA CADE", key: 0 });

  useEffect(() => {
    let timeoutId;
    
    const scheduleNext = () => {
      // Random interval between 5 and 30 minutes
      const min = 5 * 60 * 1000;
      const max = 30 * 60 * 1000;
      const delay = Math.floor(Math.random() * (max - min + 1)) + min;
      
      timeoutId = setTimeout(() => {
        setShip(prev => ({
          top: Math.random() * 10 + 10,
          msg: messages[Math.floor(Math.random() * messages.length)],
          key: prev.key + 1 
        }));
        scheduleNext();
      }, delay);
    };

    scheduleNext();

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden hidden md:block">
      <div 
        key={ship.key}
        className="absolute flex items-center animate-fly-slow"
        style={{ top: `${ship.top}%`, left: '-50%' }}
      >
        {/* UFO Body - Make it metallic and very visible against black space */}
        <div className="w-16 h-5 bg-gradient-to-b from-gray-300 to-gray-600 rounded-full shadow-[0_0_40px_#bc13fe] border-2 border-neonCyan flex items-center justify-center relative shrink-0">
          {/* Glass Dome */}
          <div className="absolute w-8 h-8 bg-neonCyan/30 rounded-full -top-4 backdrop-blur-md border-t border-neonCyan/80 shadow-[0_0_15px_#00f3ff]"></div>
          {/* Engine Core */}
          <div className="absolute w-4 h-4 bg-white rounded-full animate-ping shadow-[0_0_20px_#ffffff]"></div>
          {/* Side lights */}
          <div className="absolute w-2 h-1 bg-red-500 rounded-full left-2 animate-pulse shadow-[0_0_5px_#ff0000]"></div>
          <div className="absolute w-2 h-1 bg-red-500 rounded-full right-2 animate-pulse shadow-[0_0_5px_#ff0000]"></div>
        </div>
        
        {/* Trail Message - perfectly synced with the ship */}
        <div className="ml-8 px-4 py-1.5 border-2 border-white/80 bg-white/10 backdrop-blur-sm rounded-lg text-white font-mono uppercase tracking-widest text-sm shadow-[0_0_15px_rgba(255,255,255,0.5)]">
          {ship.msg}
        </div>
      </div>
    </div>
  );
}
