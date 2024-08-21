const ReviewRoutes = require('express').Router();
const { CreateReview } = require('../Controller/ReviewController');
const verifyToken = require('../middlewares/Token/verifyToken');

ReviewRoutes.get('/get-reviews',).post('/create-review', verifyToken, CreateReview).delete('/delete-review/:reviewId', verifyToken,).patch('/update-review/:reviewId', verifyToken,);

module.exports = ReviewRoutes