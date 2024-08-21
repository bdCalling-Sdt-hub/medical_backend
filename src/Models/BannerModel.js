const { model, Schema } = require('mongoose');
const BannerModel = new Schema({
    order: {
        type: String,
        required: [true, 'Order is required'],
        unique: true,
        default: 0
    },
    img: {
        type: String,
        required: [true, 'image is required']
    },
}, { timestamps: true })
BannerModel.pre('save', async function (next) {
    const totalBanners = await Banner.countDocuments();
    this.order = totalBanners + 1;
    next();
});

const Banner = model('banner', BannerModel);
module.exports = Banner