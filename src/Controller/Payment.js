const { SRTIPE_KEY } = require('../config/defaults');
const stripe = require("stripe")(SRTIPE_KEY)
const Payment = async (req, res) => {
    const { price } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
        amount: parseInt(price * 100),
        currency: "usd",
        payment_method_types: [
            "card"
        ],
    });
    //Controller
    res.send({
        clientSecret: paymentIntent.client_secret,
    });
}
module.exports = Payment