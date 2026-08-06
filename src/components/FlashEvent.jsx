import React, { useState, useEffect, useRef } from 'react';
import { Timer, Zap, Gift, Sparkles, X } from 'lucide-react';
import { getRandomEvent } from '../utils/events';

const FlashEvent = () => {
  const [currentEvent, setCurrentEvent] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    let nextEventTimer;
    let eventDurationTimer;
    
    const scheduleNextEvent = () => {
      if (!isMounted.current) return;
      const delayMinutes = Math.floor(Math.random() * (90 - 30 + 1) + 30);
      nextEventTimer = setTimeout(() => {
        startEvent();
      }, delayMinutes * 60 * 1000);
    };

    const startEvent = () => {
      if (!isMounted.current) return;
      const event = getRandomEvent();
      setCurrentEvent(event);
      setTimeLeft(event.duration);
      setDismissed(false);
      
      eventDurationTimer = setTimeout(() => {
        if (isMounted.current) {
          setCurrentEvent(null);
          scheduleNextEvent();
        }
      }, event.duration * 1000);
    };

    scheduleNextEvent();
    
    const initialDemoTimer = setTimeout(() => {
      startEvent();
    }, 2000);

    return () => {
      isMounted.current = false;
      clearTimeout(nextEventTimer);
      clearTimeout(eventDurationTimer);
      clearTimeout(initialDemoTimer);
    };
  }, []);

  useEffect(() => {
    let interval;
    if (currentEvent && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentEvent, timeLeft]);

  if (!currentEvent || timeLeft <= 0 || dismissed) return null;

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getIcon = (type) => {
    switch (type) {
      case 'discount': return <Sparkles className="w-4 h-4" />;
      case 'doubleXP': return <Zap className="w-4 h-4" />;
      case 'bonus': return <Gift className="w-4 h-4" />;
      case 'legendary': return <Sparkles className="w-4 h-4" />;
      default: return <Timer className="w-4 h-4" />;
    }
  };

  return (
    // Elegant slim pill banner - top center, never overlaps anything
    <div
      className={`fixed top-14 left-1/2 z-40 pointer-events-auto animate-in slide-in-from-top-4 duration-300`}
      style={{ transform: 'translateX(-50%)' }}
    >
      <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${currentEvent.border} bg-black/80 backdrop-blur-md shadow-lg`}>
        <span className={currentEvent.color}>
          {getIcon(currentEvent.type)}
        </span>
        <span className={`text-xs font-bold ${currentEvent.color} max-w-[180px] truncate`}>
          {currentEvent.title}
        </span>
        <span className="text-white font-black text-xs font-mono tracking-wider">
          {formatTime(timeLeft)}
        </span>
        <button
          onClick={() => setDismissed(true)}
          className="text-gray-500 hover:text-white transition-colors ml-1"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default FlashEvent;
