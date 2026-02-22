import { PART_TYPES, PART_STATS, PART_TIERS } from '../constants/gameConstants';

/**
 * 智能游戏建议系统
 * 根据飞机配置、飞行表现、历史分数等生成个性化建议和鼓励
 */

// 分析飞机配置
function analyzeVehicle(parts) {
  const engines = parts.filter(p => p.type === PART_TYPES.ENGINE);
  const wings = parts.filter(p => p.type === PART_TYPES.WING);
  const fuselages = parts.filter(p => p.type === PART_TYPES.FUSELAGE);
  const cockpits = parts.filter(p => p.type === PART_TYPES.COCKPIT);

  const totalWeight = parts.reduce((sum, p) => {
    const stats = PART_STATS[p.type]?.[p.tier || PART_TIERS.NORMAL];
    return sum + (stats?.weight || 1);
  }, 0);

  const totalPower = engines.reduce((sum, p) => {
    const stats = PART_STATS[p.type]?.[p.tier || PART_TIERS.NORMAL];
    return sum + (stats?.power || 0);
  }, 0);

  const powerToWeightRatio = totalWeight > 0 ? totalPower / totalWeight : 0;

  return {
    engineCount: engines.length,
    wingCount: wings.length,
    fuselageCount: fuselages.length,
    cockpitCount: cockpits.length,
    totalParts: parts.length,
    totalWeight,
    totalPower,
    powerToWeightRatio,
  };
}

// 生成建议（返回数组，最多2条）
export function generateGameTips(parts, score, highScore, t) {
  const analysis = analyzeVehicle(parts);
  const tips = [];

  // === 新纪录鼓励 ===
  if (score >= highScore && score > 0) {
    if (score >= 500) {
      tips.push({ type: 'record', icon: '🏆', text: t('tips.epicRecord') });
    } else if (score >= 200) {
      tips.push({ type: 'record', icon: '🌟', text: t('tips.greatRecord') });
    } else {
      tips.push({ type: 'record', icon: '🎉', text: t('tips.newRecord') });
    }
  }

  // === 分数段鼓励 ===
  if (score > 0 && score < highScore) {
    const ratio = score / highScore;
    if (ratio >= 0.8) {
      tips.push({ type: 'encourage', icon: '💪', text: t('tips.almostRecord') });
    } else if (score >= 300) {
      tips.push({ type: 'encourage', icon: '✈️', text: t('tips.niceDistance') });
    }
  }

  // === 配置建议（最多补1条） ===
  if (tips.length < 2) {
    // 没有引擎
    if (analysis.engineCount === 0) {
      tips.push({ type: 'config', icon: '🔧', text: t('tips.noEngine') });
    }
    // 只有1个引擎，太重
    else if (analysis.engineCount === 1 && analysis.totalParts > 4) {
      tips.push({ type: 'config', icon: '⚡', text: t('tips.moreEngines') });
    }
    // 推重比太低
    else if (analysis.powerToWeightRatio < 0.15 && analysis.engineCount > 0) {
      tips.push({ type: 'config', icon: '⚖️', text: t('tips.tooHeavy') });
    }
    // 没有机翼
    else if (analysis.wingCount === 0 && analysis.totalParts > 2) {
      tips.push({ type: 'config', icon: '🪽', text: t('tips.noWings') });
    }
    // 零件太少
    else if (analysis.totalParts <= 2 && score < 50) {
      tips.push({ type: 'config', icon: '🧩', text: t('tips.moreParts') });
    }
    // 分数低但配置还行 → 操作建议
    else if (score < 30 && score > 0) {
      tips.push({ type: 'skill', icon: '🎮', text: t('tips.controlTip') });
    }
    // 分数中等 → 随机鼓励
    else if (score >= 50 && score < 200 && tips.length === 0) {
      const randomTips = [
        { type: 'encourage', icon: '🚀', text: t('tips.keepGoing') },
        { type: 'encourage', icon: '🎯', text: t('tips.dodgeTip') },
      ];
      tips.push(randomTips[Math.floor(Math.random() * randomTips.length)]);
    }
  }

  // 最多返回2条
  return tips.slice(0, 2);
}
