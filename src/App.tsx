/**
 * Song Arranger - Main App Component
 * Root component with retro terminal styling and keyboard shortcuts
 */

import { useState } from 'react';
import { useAppSelector } from './store/hooks';
import BootSequence from './components/organisms/BootSequence';
import { TimelinePage } from './components/pages';
import CRTEffects from './components/atoms/CRTEffects';
import ModernEffects from './components/atoms/ModernEffects';
import TerminalNoise from './components/atoms/TerminalNoise';
import './App.css';

function App() {
  const [showBootSequence, setShowBootSequence] = useState(true);
  const crtEffectsEnabled = useAppSelector(
    (state) => state.crtEffects.enabled
  );
  const currentTheme = useAppSelector((state) => state.theme.current);

  const handleBootComplete = () => {
    setShowBootSequence(false);
  };

  if (showBootSequence) {
    return <BootSequence onComplete={handleBootComplete} />;
  }

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
