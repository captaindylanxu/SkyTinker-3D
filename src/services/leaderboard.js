import { supabase, isSupabaseConfigured } from '../lib/supabase';

// 简单的 PIN 码哈希（客户端）
function hashPin(pin) {
  // 使用简单的哈希，实际应用中应该用更安全的方法
  return btoa(pin + 'salt_key_2024');
}

// 创建新玩家账号
export async function createPlayer(playerName, pin = null) {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Not configured' };
  }

  try {
    const pinHash = pin ? hashPin(pin) : null;
    
    const { data, error } = await supabase
      .from('leaderboard')
      .insert([
        {
          player_name: playerName,
          pin_hash: pinHash,
          high_score: 0,
        },
      ])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // 唯一约束冲突
        return { success: false, error: 'Name already exists' };
      }
      throw error;
    }

    return { 
      success: true, 
      data: {
        playerId: data.player_id,
        playerName: data.player_name,
      }
    };
  } catch (error) {
    console.error('Error creating player:', error);
    return { success: false, error: error.message };
  }
}

// 账号找回（验证昵称和PIN）
export async function recoverAccount(playerName, pin) {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Not configured' };
  }

  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('player_id, player_name, pin_hash')
      .eq('player_name', playerName)
      .single();

    if (error || !data) {
      return { success: false, error: 'Account not found' };
    }

    // 验证 PIN
    if (data.pin_hash) {
      const inputPinHash = hashPin(pin);
      if (inputPinHash !== data.pin_hash) {
        return { success: false, error: 'Incorrect PIN' };
      }
    }

    return {
      success: true,
      data: {
        playerId: data.player_id,
        playerName: data.player_name,
      }
    };
  } catch (error) {
    console.error('Error recovering account:', error);
    return { success: false, error: error.message };
  }
}

// 提交分数到排行榜
export async function submitScore(playerId, playerName, score) {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, skipping score submission');
    return { success: false, error: 'Not configured' };
  }

  try {
    // 查找玩家记录
    const { data: existingPlayer } = await supabase
      .from('leaderboard')
      .select('id, high_score')
      .eq('player_id', playerId)
      .single();

    if (existingPlayer) {
      // 如果新分数更高，更新记录
      if (score > existingPlayer.high_score) {
        const { data, error } = await supabase
          .from('leaderboard')
          .update({
            player_name: playerName,
            high_score: score,
            updated_at: new Date().toISOString(),
          })
          .eq('player_id', playerId)
          .select()
          .single();

        if (error) throw error;
        return { success: true, data, isNewRecord: true };
      }
      return { success: true, data: existingPlayer, isNewRecord: false };
    }

    return { success: false, error: 'Player not found' };
  } catch (error) {
    console.error('Error submitting score:', error);
    return { success: false, error: error.message };
  }
}

// 获取排行榜（前 100 名）
export async function getLeaderboard(limit = 100) {
  if (!isSupabaseConfigured()) {
    return { success: false, data: [] };
  }

  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('player_id, player_name, high_score, created_at')
      .order('high_score', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return { success: false, data: [] };
  }
}

// 获取玩家排名
export async function getPlayerRank(playerId) {
  if (!isSupabaseConfigured()) {
    return { success: false, rank: null };
  }

  try {
    // 获取玩家分数
    const { data: player } = await supabase
      .from('leaderboard')
      .select('high_score')
      .eq('player_id', playerId)
      .single();

    if (!player) {
      return { success: true, rank: null };
    }

    // 计算排名（比玩家分数高的人数 + 1）
    const { count, error } = await supabase
      .from('leaderboard')
      .select('*', { count: 'exact', head: true })
      .gt('high_score', player.high_score);

    if (error) throw error;
    return { success: true, rank: (count || 0) + 1 };
  } catch (error) {
    console.error('Error fetching player rank:', error);
    return { success: false, rank: null };
  }
}

// 检查昵称是否已存在
export async function checkPlayerNameExists(playerName) {
  if (!isSupabaseConfigured()) {
    return false;
  }

  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('player_name')
      .eq('player_name', playerName)
      .single();

    return !error && data !== null;
  } catch {
    return false;
  }
}

export default {
  createPlayer,
  recoverAccount,
  submitScore,
  getLeaderboard,
  getPlayerRank,
  checkPlayerNameExists,
};
