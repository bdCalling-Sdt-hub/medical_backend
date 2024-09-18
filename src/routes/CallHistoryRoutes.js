const { GetCallHistory, PostCallHistory } = require('../Controller/CallHistoryController');
const verifyToken = require('../middlewares/Token/verifyToken');

const callHistoryRoutes = require('express').Router();
callHistoryRoutes.get('/get-call-history', verifyToken, GetCallHistory).post('/create-call-history', verifyToken, PostCallHistory);
module.exports = callHistoryRoutes