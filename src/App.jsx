import { useEffect } from 'react';
import Scene from './components/Scene';
import ModeToggle from './components/UI/ModeToggle';
import Toolbar from './components/UI/Toolbar';
import GameOverModal from './components/UI/GameOverModal';
import VIPShop from './components/UI/VIPShop';
import AccountModal from './components/UI/AccountModal';
import Leaderboard from './components/UI/Leaderboard';
import TutorialOverlay from './components/UI/TutorialOverlay';
import UserBadge from './components/UI/UserBadge';
import WelcomePoster from './components/UI/WelcomePoster';
import useGameStore from './store/useGameStore';
import { getReferralLives } from './services/referral';
import './App.css';

function App() {
  const playerId = useGameStore((s) => s.playerId);
  const setReferralLives = useGameStore((s) => s.setReferralLives);

  // 加载邀请续命次数
  useEffect(() => {
    if (playerId) {
      getReferralLives(playerId).then((lives) => {
        setReferralLives(lives);
      });
    }
  }, [playerId, setReferralLives]);

  return (
    <div className="app">
      <Scene />
      <ModeToggle />
      <Toolbar />
      <VIPShop />
      <Leaderboard />
      <UserBadge />
      <GameOverModal />
      <AccountModal />
      <TutorialOverlay />
      <WelcomePoster />
    </div>
  );
}

export default App;
