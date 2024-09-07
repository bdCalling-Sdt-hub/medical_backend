const { model, Schema } = require('mongoose');
const BannerModel = new Schema({
    order: {
        type: Number,
        required: [true, 'Order is required'],
        unique: true,
        default: 1
    },
    img: {
        type: String,
        required: [true, 'image is required']
    },
    isActive: {
        type: Boolean,
        required: [true, 'isActive is required'],
        default: true
    }
}, { timestamps: true })
BannerModel.pre('save', async function (next) {
    const highestOrderBanner = await Banner.findOne({}).sort({ order: -1 });
    this.order = highestOrderBanner ? Number(highestOrderBanner.order) + 1 : 1;
    next();
});

const Banner = model('banner', BannerModel);
module.exports = Banner