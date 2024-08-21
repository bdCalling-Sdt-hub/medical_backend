const { model, Schema } = require('mongoose');
const FaqSchema = new Schema({
    question: {
        type: String,
        required: [true, 'question is required'],
        unique: true
    },
    answer: {
        type: String,
        required: [true, 'answer is required']
    }
}, { timestamps: true });
const FaqModel = model('faq', FaqSchema);
module.exports = FaqModel