/**
 * Cyclone - CRTEffects Component
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

      {/* Vignette - darker corners */}
      <div className="crt-vignette" data-testid="crt-vignette" />

      {/* RGB separation - chromatic aberration */}
      <div className="crt-rgb-separation" data-testid="crt-rgb-separation" />

      {/* Rolling interference - horizontal line effect */}
      <div className="crt-interference" data-testid="crt-interference" />

      {/* Brightness variation - center brighter */}
      <div className="crt-brightness" data-testid="crt-brightness" />

      {/* Burn-in simulation - ghost images */}
      <div className="crt-burnin" data-testid="crt-burnin" />
    </div>
  );
};

export default CRTEffects;
