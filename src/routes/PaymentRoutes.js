const PaymentRoutes = require("express").Router();
const { 
    Payment, 
    SavePayment, 
    createConnectedAccount, 
    TransferBallance, 
    UserGetPaymentHistory, 
    GetDoctorPaymentHistory, 
    GetAvailablePayment, 
    GetMyCard, 
    TransitionHistoryOverview 
} = require("../Controller/PaymentController");
const verifyToken = require("../middlewares/Token/verifyToken");

PaymentRoutes
    .post("/create-payment-intent", verifyToken, Payment)
    .post("/save-payment", verifyToken, SavePayment)
    .post('/create-connected-account', verifyToken, createConnectedAccount)
    .post('/transfer-ballance', verifyToken, TransferBallance)
    .get('/user-payment-history', verifyToken, UserGetPaymentHistory)
    .get('/doctor-payment-history', verifyToken, GetDoctorPaymentHistory)
    .get('/get-available-payment', verifyToken, GetAvailablePayment)
    .get('/get-my-stripe-card', verifyToken, GetMyCard)
    .get('/income-overview', verifyToken, TransitionHistoryOverview);

module.exports = PaymentRoutes;
