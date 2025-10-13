/**
 * Song Arranger - Main App Component
 * Root component with retro terminal styling and keyboard shortcuts
 */

import { useState } from 'react';
import { useAppSelector } from './store/hooks';
import BootSequence from './components/organisms/BootSequence';
import { TimelinePage } from './components/pages';
import CRTEffects from './components/atoms/CRTEffects';
import TerminalNoise from './components/atoms/TerminalNoise';
import './App.css';

function App() {
  const [showBootSequence, setShowBootSequence] = useState(true);
  const crtEffectsEnabled = useAppSelector(
    (state) => state.crtEffects.enabled
  );

  const handleBootComplete = () => {
    setShowBootSequence(false);
  };

  if (showBootSequence) {
    return <BootSequence onComplete={handleBootComplete} />;
  }

  return (
    <div className={`app ${crtEffectsEnabled ? '' : 'no-crt-effects'}`}>
      <TimelinePage />
      <CRTEffects />
      <TerminalNoise />
    </div>
  );
}

export default App;
