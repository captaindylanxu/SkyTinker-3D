import { useState } from 'react';
import useGameStore from '../../store/useGameStore';
import './VIPShop.css';

export function VIPShop() {
  const { isVIP, setVIP } = useGameStore();
  const [showModal, setShowModal] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  const handlePurchase = () => {
    setPurchasing(true);
    // 模拟支付过程
    setTimeout(() => {
      setVIP(true);
      setPurchasing(false);
      setShowModal(false);
    }, 1500);
  };

  if (isVIP) {
    return (
      <div className="vip-badge">
        <span className="vip-icon">👑</span>
        <span>VIP 已激活</span>
      </div>
    );
  }

  return (
    <>
      <button className="vip-button" onClick={() => setShowModal(true)}>
        💎 成为 VIP
      </button>

      {showModal && (
        <div className="shop-overlay" onClick={() => !purchasing && setShowModal(false)}>
          <div className="shop-modal" onClick={e => e.stopPropagation()}>
            <h2 className="shop-title">💎 VIP 特权商店</h2>
            
            <div className="vip-benefits">
              <h3>解锁特权：</h3>
              <ul>
                <li>🏆 黄金零件 - 更轻、更强</li>
                <li>🚀 黄金引擎 - 2.5倍推力</li>
                <li>✈️ 黄金机翼 - 2倍升力</li>
                <li>🎯 障碍缝隙增大 2 倍</li>
                <li>🛡️ 抗撞击能力大幅提升</li>
              </ul>
            </div>

            <div className="price-tag">
              <span className="original-price">¥648</span>
              <span className="current-price">¥0.00</span>
              <span className="discount">限时免费体验</span>
            </div>

            <button 
              className="purchase-button"
              onClick={handlePurchase}
              disabled={purchasing}
            >
              {purchasing ? '处理中...' : '🎁 立即开通'}
            </button>

            <p className="shop-note">* 这是一个演示功能，不会产生真实扣费</p>
            
            <button className="close-button" onClick={() => setShowModal(false)}>
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default VIPShop;
