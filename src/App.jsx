import Scene from './components/Scene';
import ModeToggle from './components/UI/ModeToggle';
import Toolbar from './components/UI/Toolbar';
import GameOverModal from './components/UI/GameOverModal';
import VIPShop from './components/UI/VIPShop';
import AccountModal from './components/UI/AccountModal';
import Leaderboard from './components/UI/Leaderboard';
import TutorialOverlay from './components/UI/TutorialOverlay';
import EnvDebug from './components/EnvDebug';
import './App.css';

function App() {
  return (
    <div className="app">
      <Scene />
      <ModeToggle />
      <Toolbar />
      <VIPShop />
      <Leaderboard />
      <GameOverModal />
      <AccountModal />
      <TutorialOverlay />
      {/* 临时调试组件 - 部署后可以删除 */}
      <EnvDebug />
    </div>
  );
}

export default App;
