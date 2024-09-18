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
CategoryModel.pre('save', async function (next) {
    this.name = this.name.toLowerCase();
    next();
});
const Category = model('category', CategoryModel);
module.exports = Category