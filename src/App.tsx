/**
 * Song Arranger - Main App Component
 * Root component with retro terminal styling
 */

import MenuBar from './components/MenuBar';
import Timeline from './components/Timeline';
import './App.css';

function App() {
  return (
    <div className="app">
      <MenuBar />
      <Timeline />
    </div>
  );
}

export default App;
