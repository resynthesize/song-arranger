/**
 * Cyclone - TerminalNoise Component
 * Subtle character noise/glitches for authentic terminal aesthetic
 * Very rare, 1-2 glitches per second
 */

import { useEffect, useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import './TerminalNoise.css';

// Random terminal characters for glitch effect
const GLITCH_CHARS = ['░', '▒', '▓', '█', '▄', '▀', '■', '□', '▪', '▫'];

interface GlitchInstance {
  id: number;
  char: string;
  x: number;
  y: number;
  opacity: number;
}

const TerminalNoise = () => {
  const [glitches, setGlitches] = useState<GlitchInstance[]>([]);
  const crtEnabled = useAppSelector((state) => state.crtEffects.enabled);

  useEffect(() => {
    if (!crtEnabled) return;

    // Create a glitch every 500-1500ms
    const createGlitch = () => {
      const id = Date.now() + Math.random();
      const char = GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)] || '█';
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const opacity = 0.1 + Math.random() * 0.2;

      setGlitches((prev) => [
        ...prev,
        { id, char, x, y, opacity },
      ]);

      // Remove glitch after short duration
      setTimeout(() => {
        setGlitches((prev) => prev.filter((g) => g.id !== id));
      }, 100 + Math.random() * 200);
    };

    const scheduleNextGlitch = () => {
      const delay = 500 + Math.random() * 1000;
      return setTimeout(createGlitch, delay);
    };

    let timer = scheduleNextGlitch();

    const intervalId = setInterval(() => {
      clearTimeout(timer);
      timer = scheduleNextGlitch();
    }, 1500);

    return () => {
      clearTimeout(timer);
      clearInterval(intervalId);
    };
  }, [crtEnabled]);

  if (!crtEnabled) return null;

  return (
    <div className="terminal-noise" aria-hidden="true" data-testid="terminal-noise">
      {glitches.map((glitch) => (
        <div
          key={glitch.id}
          className="terminal-noise__glitch"
          style={{
            left: `${glitch.x.toString()}%`,
            top: `${glitch.y.toString()}%`,
            opacity: glitch.opacity,
          }}
        >
          {glitch.char}
        </div>
      ))}
    </div>
  );
};

export default TerminalNoise;
