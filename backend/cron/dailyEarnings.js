const cron = require('node-cron');
const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');

cron.schedule('0 0 * * *', async () => {
  try {
    const today = new Date().toDateString();

    const pending = await Transaction.find({
      payoutDate: { $lte: new Date(today) },
      status: 'pending'
    });

    for (let trx of pending) {
      const wallet = await Wallet.findOne({ user: trx.user });

      if (wallet) {
        wallet.balance += trx.amount;
        await wallet.save();

        trx.status = 'paid';
        await trx.save();
      }
    }

    console.log(`Cron Job: Paid ${pending.length} transactions on ${today}`);
  } catch (err) {
    console.error('Cron error:', err);
  }
});
