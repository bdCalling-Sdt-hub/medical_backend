const ReviewRoutes = require('express').Router();
const verifyToken = require('../middlewares/Token/verifyToken');

ReviewRoutes.get('/get-reviews', ).post('/create-review', verifyToken, ).delete('/delete-review/:reviewId', verifyToken, ).patch('/update-review/:reviewId', verifyToken, );

module.exports = ReviewRoutes