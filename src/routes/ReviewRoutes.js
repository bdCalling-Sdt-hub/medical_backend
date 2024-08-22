const ReviewRoutes = require('express').Router();
const { CreateReview, DeleteReview, GetAllReview } = require('../Controller/ReviewController');
const verifyToken = require('../middlewares/Token/verifyToken');

ReviewRoutes.get('/get-reviews',verifyToken,GetAllReview).post('/create-review', verifyToken, CreateReview).delete('/delete-review/:reviewId', verifyToken,DeleteReview).patch('/update-review/:reviewId', verifyToken,);

module.exports = ReviewRoutes