import React from 'react';
import { Crosshair, Shield, Zap, Globe2 } from 'lucide-react';

export default function LandingPage({ onStart }) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 50,
      overflowY: 'auto',
      overflowX: 'hidden',
      background: 'rgba(5, 5, 16, 0.92)',
      backdropFilter: 'blur(12px)',
      WebkitOverflowScrolling: 'touch',
    }}>
      <div style={{
        minHeight: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        boxSizing: 'border-box',
      }}>
        <div style={{ maxWidth: '800px', width: '100%', margin: '0 auto', position: 'relative' }}>

          {/* Glow bg effects */}
          <div style={{
            position: 'absolute', top: '30%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400, height: 400,
            background: 'rgba(0,243,255,0.12)',
            borderRadius: '50%', filter: 'blur(80px)',
            pointerEvents: 'none',
          }} />

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>

            {/* Title */}
            <h1 style={{
              fontSize: 'clamp(2.5rem, 12vw, 5rem)',
              fontWeight: 900,
              color: 'white',
              margin: '0 0 12px',
              letterSpacing: '-2px',
              lineHeight: 1,
            }}>
              HEX<span style={{ color: '#00f3ff', textShadow: '0 0 20px rgba(0,243,255,0.8)' }}>GLOBE</span>
            </h1>

            <p style={{
              fontSize: 'clamp(0.95rem, 4vw, 1.2rem)',
              color: '#aaa',
              marginBottom: 32,
              lineHeight: 1.6,
              maxWidth: 520,
              margin: '0 auto 32px',
            }}>
              Lumea digitală se rescrie chiar acum. Fii printre primii care își lasă amprenta.{' '}
              <span style={{ color: 'white', fontWeight: 700 }}>Țara ta are nevoie de tine!</span>
            </p>

            {/* 3 steps - vertical on mobile, horizontal on desktop */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 16,
              marginBottom: 36,
              width: '100%',
            }}>

              {/* Step 1 */}
              <div style={{
                background: 'rgba(20, 20, 35, 0.6)',
                border: '1px solid rgba(0, 243, 255, 0.2)',
                borderRadius: 16,
                padding: '20px 16px',
                backdropFilter: 'blur(10px)',
              }}>
                <div style={{
                  width: 52, height: 52, margin: '0 auto 12px',
                  background: 'rgba(0,243,255,0.15)',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Globe2 style={{ width: 26, height: 26, color: '#00f3ff' }} />
                </div>
                <h3 style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                  1. Alege-ți Țara
                </h3>
                <p style={{ color: '#888', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>
                  Explorează globul 3D și selectează teritoriul pe care vrei să-l reprezinți.
                </p>
              </div>

              {/* Step 2 */}
              <div style={{
                background: 'rgba(20, 20, 35, 0.6)',
                border: '1px solid rgba(188, 19, 254, 0.2)',
                borderRadius: 16,
                padding: '20px 16px',
                backdropFilter: 'blur(10px)',
              }}>
                <div style={{
                  width: 52, height: 52, margin: '0 auto 12px',
                  background: 'rgba(188,19,254,0.15)',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Shield style={{ width: 26, height: 26, color: '#bc13fe' }} />
                </div>
                <h3 style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                  2. Recrutează Armata
                </h3>
                <p style={{ color: '#888', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>
                  Cu doar 1$, cumpără un Pixel Holografic. Numele tău va fi gravat pe hartă!
                </p>
              </div>

              {/* Step 3 */}
              <div style={{
                background: 'rgba(20, 20, 35, 0.6)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: 16,
                padding: '20px 16px',
                backdropFilter: 'blur(10px)',
              }}>
                <div style={{
                  width: 52, height: 52, margin: '0 auto 12px',
                  background: 'rgba(239,68,68,0.15)',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Crosshair style={{ width: 26, height: 26, color: '#ef4444' }} />
                </div>
                <h3 style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                  3. Dominație Globală
                </h3>
                <p style={{ color: '#888', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>
                  La 100 pixeli, țara ta devine <span style={{ color: '#f87171', fontWeight: 700 }}>Superputere</span> și deblochează modul de ATAC!
                </p>
              </div>

            </div>

            {/* CTA Button */}
            <button
              onClick={onStart}
              style={{
                position: 'relative',
                padding: '18px 40px',
                background: 'rgba(0, 243, 255, 0.15)',
                border: '2px solid #00f3ff',
                borderRadius: 14,
                cursor: 'pointer',
                boxShadow: '0 0 24px rgba(0,243,255,0.4)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12,
                width: '100%',
                maxWidth: 360,
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                WebkitTapHighlightColor: 'transparent',
              }}
              onTouchStart={e => e.currentTarget.style.boxShadow = '0 0 40px rgba(0,243,255,0.8)'}
              onTouchEnd={e => e.currentTarget.style.boxShadow = '0 0 24px rgba(0,243,255,0.4)'}
            >
              <Zap style={{ width: 24, height: 24, color: '#00f3ff' }} />
              <span style={{
                color: '#00f3ff',
                fontWeight: 900,
                fontSize: 'clamp(1rem, 5vw, 1.25rem)',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                textShadow: '0 0 10px rgba(0,243,255,1)',
              }}>
                Intră în Bătălie
              </span>
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}
