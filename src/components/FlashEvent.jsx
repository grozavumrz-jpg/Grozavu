import React, { useState, useEffect, useRef } from 'react';
import { Timer, Zap, Gift, Sparkles } from 'lucide-react';
import { getRandomEvent } from '../utils/events';

const FlashEvent = () => {
  const [currentEvent, setCurrentEvent] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
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
      
      eventDurationTimer = setTimeout(() => {
        if (isMounted.current) {
          setCurrentEvent(null);
          scheduleNextEvent();
        }
      }, event.duration * 1000);
    };

    // schedule the first real event
    scheduleNextEvent();
    
    // start one soon for testing/demo purposes
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

  if (!currentEvent || timeLeft <= 0) return null;

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getIcon = (type) => {
    switch (type) {
      case 'discount': return <Sparkles className="w-5 h-5" />;
      case 'doubleXP': return <Zap className="w-5 h-5" />;
      case 'bonus': return <Gift className="w-5 h-5" />;
      case 'legendary': return <Sparkles className="w-5 h-5" />;
      default: return <Timer className="w-5 h-5" />;
    }
  };

  return (
    <div className={`fixed top-24 right-6 z-40 glass-panel rounded-xl p-4 border ${currentEvent.border} bg-black/85 backdrop-blur-md shadow-lg`}>
      <style>{`
        @keyframes pulseBorder {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-border-pulse {
          animation: pulseBorder 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
      <div className={`flex flex-col items-center gap-3 animate-border-pulse ${currentEvent.color}`}>
        <div className="flex items-center gap-2 font-bold text-sm text-center max-w-[200px]">
          {getIcon(currentEvent.type)}
          <span>{currentEvent.title}</span>
        </div>
        <div className="flex items-center gap-2 text-3xl font-black font-mono tracking-wider">
          <Timer className="w-7 h-7" />
          {formatTime(timeLeft)}
        </div>
      </div>
    </div>
  );
};

export default FlashEvent;
