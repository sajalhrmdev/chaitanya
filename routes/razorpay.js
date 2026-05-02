const express = require('express');
const Razorpay = require("razorpay");
const router = express.Router(); 

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET
});

router.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    const order = await razorpay.orders.create({
      amount: amount * 100, // paisa
      currency: "INR",
      receipt: "museum_receipt_" + Date.now()
    });

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message }); 
  }
});

module.exports = router;
