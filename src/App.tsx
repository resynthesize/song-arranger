/**
 * Song Arranger - Main App Component
 * Root component with retro terminal styling
 */

import { useAppSelector } from './store/hooks';
import MenuBar from './components/MenuBar';
import Timeline from './components/Timeline';
import CRTEffects from './components/CRTEffects';
import './App.css';

function App() {
  const crtEffectsEnabled = useAppSelector(
    (state) => state.crtEffects.enabled
  );

  return (
    <div className={`app ${crtEffectsEnabled ? '' : 'no-crt-effects'}`}>
      <MenuBar />
      <Timeline />
      <CRTEffects />
    </div>
  );
}

export default App;
