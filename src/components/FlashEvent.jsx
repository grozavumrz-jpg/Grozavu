import React, { useState, useEffect, useRef } from 'react';
import { Timer, Zap, Gift, Sparkles, X } from 'lucide-react';
import { getRandomEvent } from '../utils/events';

const FlashEvent = () => {
  const [currentEvent, setCurrentEvent] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
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
      className={`fixed top-4 left-1/2 z-40 pointer-events-auto animate-in slide-in-from-top-4 duration-300`}
      style={{ transform: 'translateX(-50%)', width: '90%', maxWidth: '400px' }}
    >
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex flex-col gap-2 px-4 py-2 rounded-2xl border ${currentEvent.border} bg-black/90 backdrop-blur-md shadow-lg cursor-pointer transition-all duration-300`}
      >
        <div className="flex items-center gap-2">
          <span className={currentEvent.color}>
            {getIcon(currentEvent.type)}
          </span>
          <span className={`text-xs sm:text-sm font-bold ${currentEvent.color} truncate flex-1`}>
            {currentEvent.shortTitle}
          </span>
          <span className="text-white font-black text-xs font-mono tracking-wider ml-auto">
            {formatTime(timeLeft)}
          </span>
          
          <button 
            onClick={(e) => { e.stopPropagation(); setDismissed(true); }}
            className="ml-2 text-white/50 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isExpanded && (
          <div className="pt-2 mt-1 border-t border-white/10 animate-in slide-in-from-top-2">
            <h4 className={`text-sm font-bold ${currentEvent.color} mb-1`}>{currentEvent.title}</h4>
            <p className="text-xs text-gray-300 leading-relaxed">
              {currentEvent.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlashEvent;
