import Scene from './components/Scene';
import ModeToggle from './components/UI/ModeToggle';
import Toolbar from './components/UI/Toolbar';
import GameOverModal from './components/UI/GameOverModal';
import VIPShop from './components/UI/VIPShop';
import './App.css';

function App() {
  return (
    <div className="app">
      <Scene />
      <ModeToggle />
      <Toolbar />
      <VIPShop />
      <GameOverModal />
    </div>
  );
}

export default App;
