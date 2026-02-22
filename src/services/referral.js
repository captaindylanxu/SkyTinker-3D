// 邀请追踪服务
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// 从 URL 中提取邀请码
export function getReferralFromUrl() {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get('ref') || null;
  } catch {
    return null;
  }
}

// 保存邀请码到 localStorage（注册时使用）
export function saveReferralCode(code) {
  if (!code) return;
  try {
    localStorage.setItem('skytinker-referral', code);
  } catch {}
}

// 读取并清除保存的邀请码
export function consumeReferralCode() {
  try {
    const code = localStorage.getItem('skytinker-referral');
    localStorage.removeItem('skytinker-referral');
    return code;
  } catch {
    return null;
  }
}

// 记录邀请关系（新用户注册时调用）
export async function recordReferral(referrerId, newPlayerId) {
  if (!isSupabaseConfigured() || !referrerId || !newPlayerId) {
    return { success: false };
  }

  try {
    // 防止自己邀请自己
    if (referrerId === newPlayerId) return { success: false };

    // 检查是否已经记录过
    const { data: existing } = await supabase
      .from('referrals')
      .select('id')
      .eq('referrer_id', referrerId)
      .eq('referred_id', newPlayerId)
      .single();

    if (existing) return { success: false, error: 'Already recorded' };

    // 插入邀请记录
    const { error } = await supabase
      .from('referrals')
      .insert([{
        referrer_id: referrerId,
        referred_id: newPlayerId,
      }]);

    if (error) throw error;

    // 给邀请者增加一次续命机会
    await supabase.rpc('increment_referral_lives', { target_player_id: referrerId });

    return { success: true };
  } catch (error) {
    console.error('Error recording referral:', error);
    return { success: false, error: error.message };
  }
}

// 获取玩家的邀请续命次数
export async function getReferralLives(playerId) {
  if (!isSupabaseConfigured() || !playerId) return 0;

  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('referral_lives')
      .eq('player_id', playerId)
      .single();

    if (error || !data) return 0;
    return data.referral_lives || 0;
  } catch {
    return 0;
  }
}

// 消耗一次邀请续命
export async function useReferralLife(playerId) {
  if (!isSupabaseConfigured() || !playerId) return false;

  try {
    const lives = await getReferralLives(playerId);
    if (lives <= 0) return false;

    const { error } = await supabase
      .from('leaderboard')
      .update({ referral_lives: lives - 1 })
      .eq('player_id', playerId);

    if (error) throw error;
    return true;
  } catch {
    return false;
  }
}
