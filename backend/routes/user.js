const express = require('express');
const router = express.Router();
const Purchase = require('../models/Purchase');
const authMiddleware = require('../middleware/auth');

// Buy a product
router.post('/buy', authMiddleware, async (req, res) => {
  const { productName, price, dailyEarning, totalDays } = req.body;

  try {
    const newPurchase = new Purchase({
      userId: req.user.id,
      productName,
      price,
      dailyEarning,
      totalDays
    });

    await newPurchase.save();
    res.status(201).json({ message: 'Purchase recorded', task: newPurchase });
  } catch (err) {
    res.status(500).json({ error: 'Purchase failed' });
  }
});

// Get all user purchases
router.get('/my-tasks', authMiddleware, async (req, res) => {
  try {
    const tasks = await Purchase.find({ userId: req.user.id });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load tasks' });
  }
});

module.exports = router;
