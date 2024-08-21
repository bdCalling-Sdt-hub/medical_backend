const { model, Schema } = require('mongoose');
const CategoryModel = new Schema({
    name: {
        type: String,
        required: [true, 'name is required'],
        unique: true
    },
    img: {
        type: String,
        required: [true, 'image is required']
    },
}, { timestamps: true });
const Category = model('category', CategoryModel);
module.exports = Category