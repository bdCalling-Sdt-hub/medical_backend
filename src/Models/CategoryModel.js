const { model, Schema } = require('mongoose');
const CategoryModel = new Schema({
    name: {
        type: String,
        required: [true, 'name is required']
    },
    img: {
        type: String,
        required: [true, 'name is required']
    },
})
const Category = model('category', CategoryModel);
module.exports = Category