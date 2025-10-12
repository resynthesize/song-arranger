/**
 * Song Arranger - Main App Component
 * Root component with retro terminal styling
 */

import { useAppSelector } from './store/hooks';
import './App.css';

function App() {
  const zoom = useAppSelector((state) => state.timeline.zoom);
  const isPlaying = useAppSelector((state) => state.timeline.isPlaying);

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title glow-text">SONG ARRANGER</h1>
        <div className="app-subtitle">
          Retro Terminal Timeline Editor
        </div>
      </header>

      <main className="app-main">
        <div className="status-bar">
          <span>ZOOM: {zoom}px/beat</span>
          <span className="separator">|</span>
          <span>STATUS: {isPlaying ? 'PLAYING' : 'STOPPED'}</span>
        </div>

        <div className="content-area">
          <p className="welcome-text">
            &gt; SYSTEM INITIALIZED
            <br />
            &gt; READY FOR ARRANGEMENT
          </p>
        </div>
      </main>

      <footer className="app-footer">
        <span>v0.1.0</span>
        <span className="separator">|</span>
        <span>FRAMEWORK SETUP COMPLETE</span>
      </footer>
    </div>
  );
}

export default App;
