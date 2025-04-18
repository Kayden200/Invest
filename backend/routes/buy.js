const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Example products (can be moved to DB if needed)
const products = [
  { id: 'product_200', name: 'Starter Gym Kit', price: 200, dailyRate: 0.30 },
  { id: 'product_500', name: 'Intermediate Gym Kit', price: 500, dailyRate: 0.32 },
  { id: 'product_1000', name: 'Advanced Gym Kit', price: 1000, dailyRate: 0.35 },
  { id: 'product_2000', name: 'Pro Gym Kit', price: 2000, dailyRate: 0.40 },
];

router.post('/buy', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    const product = products.find(p => p.id === productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.balance < product.price) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Deduct balance
    user.balance -= product.price;
    await user.save();

    // Schedule daily earnings for 30 days
    const earnings = [];
    const dailyAmount = product.price * product.dailyRate;
    const today = new Date();

    for (let i = 0; i < 30; i++) {
      const payoutDate = new Date(today);
      payoutDate.setDate(today.getDate() + i);

      earnings.push({
        user: userId,
        amount: dailyAmount,
        product: product.name,
        payoutDate,
        status: 'pending'
      });
    }

    await Transaction.insertMany(earnings);

    return res.json({ message: 'Purchase successful', earnings });
  } catch (error) {
    console.error('Buy error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
