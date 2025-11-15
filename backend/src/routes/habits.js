import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { db, admin } from '../config/firebaseAdmin.js';

const router = express.Router();

/**
 * GET /api/habits/:userId
 * Get all habits for a user
 */
router.get('/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (req.user.uid !== userId) {
      return res.status(403).json({ 
        success: false, 
        error: 'Unauthorized' 
      });
    }

    const habitsSnapshot = await db
      .collection('habits')
      .where('userId', '==', userId)
      .get();

    const habits = habitsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ success: true, data: habits });
  } catch (error) {
    console.error('Get habits error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch habits' 
    });
  }
});

/**
 * POST /api/habits
 * Create a new habit
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    const habitData = {
      ...req.body,
      userId: req.user.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      completions: [],
    };

    const docRef = await db.collection('habits').add(habitData);

    res.status(201).json({ 
      success: true, 
      data: { id: docRef.id, ...habitData } 
    });
  } catch (error) {
    console.error('Create habit error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create habit' 
    });
  }
});

/**
 * PUT /api/habits/:habitId
 * Update a habit
 */
router.put('/:habitId', verifyToken, async (req, res) => {
  try {
    const { habitId } = req.params;
    const habitDoc = await db.collection('habits').doc(habitId).get();

    if (!habitDoc.exists) {
      return res.status(404).json({ 
        success: false, 
        error: 'Habit not found' 
      });
    }

    if (habitDoc.data().userId !== req.user.uid) {
      return res.status(403).json({ 
        success: false, 
        error: 'Unauthorized' 
      });
    }

    await db.collection('habits').doc(habitId).update(req.body);

    res.json({ 
      success: true, 
      message: 'Habit updated successfully' 
    });
  } catch (error) {
    console.error('Update habit error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update habit' 
    });
  }
});

/**
 * DELETE /api/habits/:habitId
 * Delete a habit
 */
router.delete('/:habitId', verifyToken, async (req, res) => {
  try {
    const { habitId } = req.params;
    const habitDoc = await db.collection('habits').doc(habitId).get();

    if (!habitDoc.exists) {
      return res.status(404).json({ 
        success: false, 
        error: 'Habit not found' 
      });
    }

    if (habitDoc.data().userId !== req.user.uid) {
      return res.status(403).json({ 
        success: false, 
        error: 'Unauthorized' 
      });
    }

    await db.collection('habits').doc(habitId).delete();

    res.json({ 
      success: true, 
      message: 'Habit deleted successfully' 
    });
  } catch (error) {
    console.error('Delete habit error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete habit' 
    });
  }
});

/**
 * POST /api/habits/:habitId/complete
 * Mark a habit as completed for today
 */
router.post('/:habitId/complete', verifyToken, async (req, res) => {
  try {
    const { habitId } = req.params;
    const habitDoc = await db.collection('habits').doc(habitId).get();

    if (!habitDoc.exists) {
      return res.status(404).json({ 
        success: false, 
        error: 'Habit not found' 
      });
    }

    if (habitDoc.data().userId !== req.user.uid) {
      return res.status(403).json({ 
        success: false, 
        error: 'Unauthorized' 
      });
    }

    const now = new Date();
    const today = now.toISOString().split('T')[0];

    await db.collection('habits').doc(habitId).update({
      completions: admin.firestore.FieldValue.arrayUnion({
        date: today,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      }),
    });

    // Award XP to user
    const userRef = db.collection('users').doc(req.user.uid);
    const habitData = habitDoc.data();
    const xpGain = habitData.xpReward || 50;

    await userRef.update({
      xp: admin.firestore.FieldValue.increment(xpGain),
    });

    res.json({ 
      success: true, 
      message: 'Habit completed successfully',
      data: { xpGained: xpGain }
    });
  } catch (error) {
    console.error('Complete habit error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to complete habit' 
    });
  }
});

export default router;
