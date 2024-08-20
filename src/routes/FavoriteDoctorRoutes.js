const FavoriteDoctorRoutes = require('express').Router();
const { GetFavoriteDoctors, AddRemoveFavoriteDoctor } = require('../Controller/FavoriteDoctorsController');
const verifyToken = require('../middlewares/Token/verifyToken');

FavoriteDoctorRoutes.get('/get-favorite-doctors', verifyToken, GetFavoriteDoctors).post('/add-remove-favorite', verifyToken, AddRemoveFavoriteDoctor)

module.exports = FavoriteDoctorRoutes