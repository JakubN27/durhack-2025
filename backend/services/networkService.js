import { supabase } from '../config/supabase.js'

/**
 * Get user's network up to specified depth
 * Only fetches necessary data for network visualization
 */
export async function getUserNetwork(userId, depth = 5) {  // Increased default depth to 5
  try {
    console.log('[NetworkService] Getting connections for user:', userId);
    
    const connections = [];
    const processedPairs = new Set();
    const processedUsers = new Set([userId]);
    let currentDepth = 1;
    
    // Keep track of users at each depth level
    const usersByDepth = {
      1: new Set([userId])
    };
    
    // Fetch connections up to the specified depth
    while (currentDepth <= depth && usersByDepth[currentDepth]?.size > 0) {
      const currentLevelUsers = Array.from(usersByDepth[currentDepth]);
      usersByDepth[currentDepth + 1] = new Set();
      
      for (const currentUser of currentLevelUsers) {
        const { data, error } = await supabase
          .from('matches')
          .select(`
            id,
            user_a_id,
            user_b_id,
            user_a:users!matches_user_a_id_fkey (
              id,
              name
            ),
            user_b:users!matches_user_b_id_fkey (
              id,
              name
            )
          `)
          .or(`user_a_id.eq.${currentUser},user_b_id.eq.${currentUser})`);

        if (error) {
          console.error(`[NetworkService] Error fetching depth ${currentDepth} connections:`, error);
          continue;
        }

        for (const match of data) {
          const pairKey = [match.user_a_id, match.user_b_id].sort().join('-');
          if (!processedPairs.has(pairKey)) {
            processedPairs.add(pairKey);
            
            // Add connection to our list
            connections.push({
              connection_id: match.id,
              user_a_id: match.user_a_id,
              user_b_id: match.user_b_id,
              user_a_name: match.user_a?.name || 'Anonymous',
              user_b_name: match.user_b?.name || 'Anonymous',
              depth: currentDepth
            });
            
            // Add any new users to the next depth level
            const otherUser = match.user_a_id === currentUser ? match.user_b_id : match.user_a_id;
            if (!processedUsers.has(otherUser)) {
              processedUsers.add(otherUser);
              usersByDepth[currentDepth + 1].add(otherUser);
            }
          }
        }
      }
      
      currentDepth++;
    }

    // Log connection statistics
    const stats = {
      total: connections.length,
      byDepth: {}
    };
    
    for (let i = 1; i <= depth; i++) {
      stats.byDepth[i] = connections.filter(c => c.depth === i).length;
    }
    
    console.log('[NetworkService] Successfully retrieved connections:', stats);
    return connections;
  } catch (error) {
    console.error('[NetworkService] Error:', error);
    throw error;
  }
}