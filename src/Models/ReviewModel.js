// get review model
const { model, Schema } = require('mongoose');
const ReviewSchema = new Schema({
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    receiver: {
        type: Schema.Types.ObjectId,
        ref: 'Doctor'
    },
    rating: {
        type: Number
    },
    comment: {
        type: String
    }
}, { timestamps: true });
const Review = model('review', ReviewSchema);
module.exports = Review