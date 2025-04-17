const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

function auth(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.status(403).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(403).json({ error: 'Invalid token' });
  }
}

router.post('/deposit', auth, async (req, res) => {
  const { amount } = req.body;
  if (amount < 200) return res.status(400).json({ error: 'Minimum deposit is 200' });

  const transaction = new Transaction({
    userId: req.userId,
    type: 'deposit',
    amount
  });

  await transaction.save();
  res.json({ message: 'Deposit request submitted' });
});

router.post('/withdraw', auth, async (req, res) => {
  const { amount } = req.body;
  if (amount < 250) return res.status(400).json({ error: 'Minimum withdrawal is 250' });

  const user = await User.findById(req.userId);
  if (user.balance < amount) return res.status(400).json({ error: 'Insufficient balance' });

  const transaction = new Transaction({
    userId: req.userId,
    type: 'withdrawal',
    amount
  });

  await transaction.save();
  res.json({ message: 'Withdrawal request submitted' });
});

router.get('/my-transactions', auth, async (req, res) => {
  const transactions = await Transaction.find({ userId: req.userId });
  res.json(transactions);
});

module.exports = router;
