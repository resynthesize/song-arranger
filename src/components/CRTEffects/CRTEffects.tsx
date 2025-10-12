/**
 * Song Arranger - CRTEffects Component
 * Overlay component providing authentic CRT monitor effects
 */

import { useAppSelector } from '@/store/hooks';
import './CRTEffects.css';

const CRTEffects = () => {
  const enabled = useAppSelector((state) => state.crtEffects.enabled);

  return (
    <div
      className={`crt-effects ${enabled ? 'crt-enabled' : 'crt-disabled'}`}
      data-testid="crt-effects"
      aria-hidden="true"
    >
      {/* Scanline overlay - horizontal lines across screen */}
      <div className="crt-scanlines" data-testid="crt-scanlines" />

      {/* Flicker effect - subtle brightness variation */}
      <div className="crt-flicker" data-testid="crt-flicker" />

      {/* Curvature overlay - barrel distortion effect */}
      <div className="crt-curvature" data-testid="crt-curvature" />
    </div>
  );
};

export default CRTEffects;
