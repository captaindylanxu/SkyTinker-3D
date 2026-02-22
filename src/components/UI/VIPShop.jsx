import { useState } from 'react';
import useGameStore from '../../store/useGameStore';
import { useI18n } from '../../i18n/useI18n';
import './VIPShop.css';

export function VIPShop() {
  const { isVIP, setVIP, hasSeenPoster } = useGameStore();
  const { t } = useI18n();
  const [showModal, setShowModal] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  if (!hasSeenPoster) return null;

  const handlePurchase = () => {
    setPurchasing(true);
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
        <span>{t('vipMember')}</span>
      </div>
    );
  }

  return (
    <>
      <button className="vip-button" onClick={() => setShowModal(true)}>
        💎 {t('buyVip')}
      </button>

      {showModal && (
        <div className="shop-overlay" onClick={() => !purchasing && setShowModal(false)}>
          <div className="shop-modal" onClick={e => e.stopPropagation()}>
            <h2 className="shop-title">💎 {t('vipShop')}</h2>
            
            <div className="vip-benefits">
              <h3>{t('vipBenefits')}:</h3>
              <ul>
                <li>{t('benefit1')}</li>
                <li>{t('benefit2')}</li>
                <li>{t('benefit3')}</li>
                <li>{t('benefit4')}</li>
              </ul>
            </div>

            <button 
              className="purchase-button"
              onClick={handlePurchase}
              disabled={purchasing}
            >
              {purchasing ? '...' : `🎁 ${t('buyVip')}`}
            </button>
            
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
