/**
 * Song Arranger - Main App Component
 * Root component with retro terminal styling
 */

import { useState } from 'react';
import { useAppSelector } from './store/hooks';
import BootSequence from './components/BootSequence';
import MenuBar from './components/MenuBar';
import Timeline from './components/Timeline';
import CRTEffects from './components/CRTEffects';
import TerminalNoise from './components/TerminalNoise';
import { MouseCursor } from './components/MouseCursor';
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
      <MenuBar />
      <Timeline />
      <CRTEffects />
      <TerminalNoise />
      <MouseCursor enabled={crtEffectsEnabled} />
    </div>
  );
}

export default App;
