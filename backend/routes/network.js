import express from 'express'
import { getUserNetwork } from '../services/networkService.js'

export const networkRouter = express.Router()

/**
 * GET /api/network/:userId
 * Get user's network up to specified depth
 * Query params: depth (number, default: 2)
 */
networkRouter.get('/:userId', async (req, res) => {
  try {
    console.log(`[NetworkRouter] Getting network for user ${req.params.userId}`);
    const { userId } = req.params;
    const depth = parseInt(req.query.depth) || 2;
    
    const network = await getUserNetwork(userId, depth);
    console.log(`[NetworkRouter] Successfully retrieved network with ${network.length} connections`);
    
    res.json({
      success: true,
      network
    });
  } catch (error) {
    console.error('[NetworkRouter] Error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Internal server error'
    });
  }
})