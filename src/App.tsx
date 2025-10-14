/**
 * Cyclone - Main App Component
 * Root component with retro terminal styling and keyboard shortcuts
 */

import { useAppSelector } from './store/hooks';
import { TimelinePage } from './components/pages';
import CRTEffects from './components/atoms/CRTEffects';
import ModernEffects from './components/atoms/ModernEffects';
import TerminalNoise from './components/atoms/TerminalNoise';
import './App.css';

function App() {
  const crtEffectsEnabled = useAppSelector(
    (state) => state.crtEffects.enabled
  );
  const currentTheme = useAppSelector((state) => state.theme.current);

  return (
    <div className={`app theme-${currentTheme} ${crtEffectsEnabled ? '' : 'no-crt-effects'}`}>
      <TimelinePage />
      <CRTEffects />
      <ModernEffects />
      <TerminalNoise />
    </div>
  );
}

export default App;
