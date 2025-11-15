import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { db } from '../config/firebaseAdmin.js';

const router = express.Router();

/**
 * GET /api/users/:userId
 * Get user profile
 */
router.get('/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Ensure user can only access their own data
    if (req.user.uid !== userId) {
      return res.status(403).json({ 
        success: false, 
        error: 'Unauthorized' 
      });
    }

    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    res.json({ 
      success: true, 
      data: { id: userDoc.id, ...userDoc.data() } 
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch user' 
    });
  }
});

/**
 * PUT /api/users/:userId
 * Update user profile
 */
router.put('/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Ensure user can only update their own data
    if (req.user.uid !== userId) {
      return res.status(403).json({ 
        success: false, 
        error: 'Unauthorized' 
      });
    }

    const updates = req.body;
    
    // Remove sensitive fields that shouldn't be updated via API
    delete updates.email;
    delete updates.createdAt;
    
    await db.collection('users').doc(userId).update({
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    res.json({ 
      success: true, 
      message: 'User updated successfully' 
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update user' 
    });
  }
});

export default router;
