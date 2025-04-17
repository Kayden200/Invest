const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

function adminAuth(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.status(403).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.isAdmin) return res.status(403).json({ error: 'Not authorized' });
    req.adminId = decoded.userId;
    next();
  } catch {
    return res.status(403).json({ error: 'Invalid token' });
  }
}

router.get('/transactions', adminAuth, async (req, res) => {
  const transactions = await Transaction.find().populate('userId');
  res.json(transactions);
});

router.post('/approve/:id', adminAuth, async (req, res) => {
  const transaction = await Transaction.findById(req.params.id);
  if (!transaction || transaction.status !== 'pending') return res.status(400).json({ error: 'Invalid transaction' });

  transaction.status = 'approved';
  await transaction.save();

  if (transaction.type === 'deposit') {
    const user = await User.findById(transaction.userId);
    user.balance += transaction.amount;
    await user.save();
  } else if (transaction.type === 'withdrawal') {
    const user = await User.findById(transaction.userId);
    user.balance -= transaction.amount;
    await user.save();
  }

  res.json({ message: 'Transaction approved' });
});

router.post('/reject/:id', adminAuth, async (req, res) => {
  const transaction = await Transaction.findById(req.params.id);
  if (!transaction || transaction.status !== 'pending') return res.status(400).json({ error: 'Invalid transaction' });

  transaction.status = 'rejected';
  await transaction.save();
  res.json({ message: 'Transaction rejected' });
});

module.exports = router;
