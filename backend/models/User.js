const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    balance: { type: Number, default: 0 },
    referredBy: { type: String, default: null },
    referralCode: { type: String, unique: true },
    isAdmin: { type: Boolean, default: false }
});

module.exports = mongoose.model('User', userSchema);
