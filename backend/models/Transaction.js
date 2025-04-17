const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    type: { type: String, enum: ['deposit', 'withdrawal'], required: true },
    amount: Number,
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    method: { type: String, default: 'Gcash' },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);
