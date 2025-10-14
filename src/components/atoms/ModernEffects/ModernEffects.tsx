/**
 * Cyclone - ModernEffects Component
 * Overlay component providing modern visual effects with glassmorphism and subtle animations
 */

import { useAppSelector } from '@/store/hooks';
import './ModernEffects.css';

const ModernEffects = () => {
  const currentTheme = useAppSelector((state) => state.theme.current);
  const enabled = currentTheme === 'modern';

  if (!enabled) {
    return null;
  }

  return (
    <div
      className="modern-effects"
      data-testid="modern-effects"
      aria-hidden="true"
    >
      {/* Ambient gradient overlay - subtle animated background */}
      <div className="modern-effects__ambient-gradient" data-testid="modern-ambient-gradient" />

      {/* Glassmorphism depth layer - creates frosted glass effect */}
      <div className="modern-effects__glass-layer" data-testid="modern-glass-layer" />

      {/* Subtle light particles - ambient atmosphere */}
      <div className="modern-effects__particles" data-testid="modern-particles">
        <div className="particle particle-1" />
        <div className="particle particle-2" />
        <div className="particle particle-3" />
        <div className="particle particle-4" />
        <div className="particle particle-5" />
      </div>

      {/* Ambient glow overlay - subtle lighting */}
      <div className="modern-effects__ambient-glow" data-testid="modern-ambient-glow" />

      {/* Vignette - subtle darkening at edges */}
      <div className="modern-effects__vignette" data-testid="modern-vignette" />
    </div>
  );
};

export default ModernEffects;
