const { CreateBanner, GetAllBanner, UpdateBanner } = require('../Controller/BannerController');
const verifyToken = require('../middlewares/Token/verifyToken');

const BannerRoute = require('express').Router();
BannerRoute.get('/get-banners', GetAllBanner).post('/create-banner', verifyToken, CreateBanner).patch('/update-banner/:bannerId',verifyToken,UpdateBanner).delete('/delete-banner/:bannerId',)
module.exports = BannerRoute