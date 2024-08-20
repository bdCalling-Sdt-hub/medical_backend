const { model, Schema } = require('mongoose');
const BannerModel = new Schema({
    order: {
        type: String,
        required: [true, 'banner is required'],
        unique: true
    },
    img: {
        type: String,
        required: [true, 'image is required']
    },
})
BannerModel.pre('save', async function (next) {
    if (this.isNew) {
        const lastBanner = await this.constructor.findOne().sort('-order');
        this.order = lastBanner ? lastBanner.order + 1 : 1;
    }
    next();
});
const Banner = model('banner', BannerModel);
module.exports = Banner