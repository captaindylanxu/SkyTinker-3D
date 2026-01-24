import { useState, useEffect } from 'react';
import useGameStore from '../../store/useGameStore';
import { useI18n } from '../../i18n/useI18n';
import { GAME_MODES } from '../../constants/gameConstants';
import './TutorialOverlay.css';

const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    title: 'tutorial.step1Title',
    desc: 'tutorial.step1Desc',
    highlight: null,
    mode: GAME_MODES.BUILD_MODE,
  },
  {
    id: 'select-part',
    title: 'tutorial.step2Title',
    desc: 'tutorial.step2Desc',
    highlight: '.toolbar',
    mode: GAME_MODES.BUILD_MODE,
    waitFor: 'part-selected',
  },
  {
    id: 'place-part',
    title: 'tutorial.step3Title',
    desc: 'tutorial.step3Desc',
    highlight: 'canvas',
    mode: GAME_MODES.BUILD_MODE,
    waitFor: 'part-placed',
  },
  {
    id: 'stack-parts',
    title: 'tutorial.step4Title',
    desc: 'tutorial.step4Desc',
    highlight: 'canvas',
    mode: GAME_MODES.BUILD_MODE,
    encouragement: 'tutorial.encouragement1',
  },
  {
    id: 'stability',
    title: 'tutorial.step5Title',
    desc: 'tutorial.step5Desc',
    highlight: '.stability-indicator',
    mode: GAME_MODES.BUILD_MODE,
  },
  {
    id: 'delete-mode',
    title: 'tutorial.step6Title',
    desc: 'tutorial.step6Desc',
    highlight: '.delete-mode-btn',
    mode: GAME_MODES.BUILD_MODE,
  },
  {
    id: 'start-flight',
    title: 'tutorial.step7Title',
    desc: 'tutorial.step7Desc',
    highlight: '.toggle-button',
    mode: GAME_MODES.BUILD_MODE,
    waitFor: 'flight-started',
  },
  {
    id: 'control-flight',
    title: 'tutorial.step8Title',
    desc: 'tutorial.step8Desc',
    highlight: null,
    mode: GAME_MODES.FLIGHT_MODE,
    encouragement: 'tutorial.encouragement2',
  },
  {
    id: 'complete',
    title: 'tutorial.step9Title',
    desc: 'tutorial.step9Desc',
    highlight: null,
    mode: null,
    encouragement: 'tutorial.encouragement3',
  },
];

export function TutorialOverlay() {
  const { 
    tutorialStep, 
    setTutorialStep, 
    completeTutorial, 
    skipTutorial,
    gameMode,
    vehicleParts,
    selectedPartType,
  } = useGameStore();
  
  const { t } = useI18n();
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [highlightRect, setHighlightRect] = useState(null);

  const currentStep = TUTORIAL_STEPS[tutorialStep] || null;

  // 动态获取高亮元素的位置
  useEffect(() => {
    if (!currentStep || !currentStep.highlight) {
      setHighlightRect(null);
      return;
    }

    const updateHighlightPosition = () => {
      let element = null;
      
      if (currentStep.highlight === '.toolbar') {
        element = document.querySelector('.toolbar');
      } else if (currentStep.highlight === '.stability-indicator') {
        element = document.querySelector('.stability-indicator');
      } else if (currentStep.highlight === '.delete-mode-btn') {
        // 高亮整个工具栏（因为删除按钮在工具栏内）
        element = document.querySelector('.toolbar');
      } else if (currentStep.highlight === '.toggle-button') {
        element = document.querySelector('.mode-toggle');
      } else if (currentStep.highlight === 'canvas') {
        // 画布高亮：从顶部到工具栏上方的区域
        const toolbar = document.querySelector('.toolbar');
        if (toolbar) {
          const toolbarRect = toolbar.getBoundingClientRect();
          const topOffset = 80; // 顶部留白
          const bottomGap = 20; // 与工具栏的间距
          
          setHighlightRect({
            top: topOffset,
            left: window.innerWidth * 0.05, // 左右各留 5%
            width: window.innerWidth * 0.9,
            height: toolbarRect.top - topOffset - bottomGap,
          });
          return;
        }
      }

      if (element) {
        const rect = element.getBoundingClientRect();
        setHighlightRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });
      }
    };

    // 初始获取位置
    updateHighlightPosition();

    // 监听窗口大小变化
    window.addEventListener('resize', updateHighlightPosition);
    
    // 延迟更新（等待DOM渲染）
    const timer = setTimeout(updateHighlightPosition, 100);

    return () => {
      window.removeEventListener('resize', updateHighlightPosition);
      clearTimeout(timer);
    };
  }, [currentStep?.highlight]);

  // 自动检测进度
  useEffect(() => {
    if (!currentStep || !currentStep.waitFor) return;

    // 检测零件选择
    if (currentStep.waitFor === 'part-selected' && selectedPartType) {
      setTimeout(() => setTutorialStep(tutorialStep + 1), 500);
    }

    // 检测零件放置
    if (currentStep.waitFor === 'part-placed' && vehicleParts.length > 0) {
      setShowEncouragement(true);
      setTimeout(() => {
        setShowEncouragement(false);
        setTutorialStep(tutorialStep + 1);
      }, 2000);
    }

    // 检测飞行模式
    if (currentStep.waitFor === 'flight-started' && gameMode === GAME_MODES.FLIGHT_MODE) {
      setTimeout(() => setTutorialStep(tutorialStep + 1), 1000);
    }
  }, [currentStep, selectedPartType, vehicleParts.length, gameMode, tutorialStep, setTutorialStep]);

  // 如果教程已完成或没有当前步骤，不显示
  if (tutorialStep === -1 || !currentStep) return null;

  const handleNext = () => {
    if (tutorialStep === TUTORIAL_STEPS.length - 1) {
      completeTutorial();
    } else {
      setTutorialStep(tutorialStep + 1);
    }
  };

  const handlePrev = () => {
    if (tutorialStep > 0) {
      setTutorialStep(tutorialStep - 1);
    }
  };

  const handleSkip = () => {
    skipTutorial();
  };

  // 根据高亮位置决定卡片位置
  const getCardPositionClass = () => {
    if (!currentStep.highlight) return '';
    
    if (currentStep.highlight === '.toolbar' || currentStep.highlight === '.delete-mode-btn' || currentStep.highlight === '.stability-indicator') {
      return 'highlight-bottom';
    }
    if (currentStep.highlight === '.toggle-button') {
      return 'highlight-top';
    }
    if (currentStep.highlight === 'canvas') {
      return 'highlight-center';
    }
    return '';
  };

  return (
    <>
      {/* 遮罩层 */}
      <div className="tutorial-overlay">
        {currentStep.highlight && highlightRect && (
          <div 
            className="tutorial-highlight" 
            data-highlight={currentStep.highlight}
            style={{
              top: `${highlightRect.top}px`,
              left: `${highlightRect.left}px`,
              width: `${highlightRect.width}px`,
              height: `${highlightRect.height}px`,
            }}
          />
        )}
      </div>

      {/* 提示卡片 */}
      <div className={`tutorial-card ${currentStep.highlight ? 'with-highlight' : ''} ${getCardPositionClass()}`}>
        <div className="tutorial-header">
          <div className="tutorial-progress">
            {tutorialStep + 1} / {TUTORIAL_STEPS.length}
          </div>
          <button className="tutorial-skip" onClick={handleSkip}>
            {t('tutorial.skip')}
          </button>
        </div>

        <h3 className="tutorial-title">{t(currentStep.title)}</h3>
        <p className="tutorial-desc">{t(currentStep.desc)}</p>

        {currentStep.encouragement && (
          <div className="tutorial-encouragement">
            ✨ {t(currentStep.encouragement)}
          </div>
        )}

        <div className="tutorial-actions">
          {tutorialStep > 0 && !currentStep.waitFor && (
            <button className="tutorial-btn secondary" onClick={handlePrev}>
              ← {t('tutorial.prev')}
            </button>
          )}
          
          {!currentStep.waitFor && (
            <button className="tutorial-btn primary" onClick={handleNext}>
              {tutorialStep === TUTORIAL_STEPS.length - 1 
                ? t('tutorial.finish') 
                : t('tutorial.next')} →
            </button>
          )}

          {currentStep.waitFor && (
            <div className="tutorial-waiting">
              <div className="tutorial-spinner"></div>
              <span>{t('tutorial.waiting')}</span>
            </div>
          )}
        </div>
      </div>

      {/* 鼓励动画 */}
      {showEncouragement && (
        <div className="tutorial-encouragement-popup">
          🎉 {t('tutorial.greatJob')}
        </div>
      )}
    </>
  );
}

export default TutorialOverlay;
