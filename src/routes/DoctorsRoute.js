const { GetAllDoctors, DeleteDoctor, BlockDoctor, GetPopularDoctor, GetRecommendedDoctor, GetSingleDoctor } = require('../Controller/DoctorsController');
const verifyToken = require('../middlewares/Token/verifyToken');

const DoctorsRoute = require('express').Router();
DoctorsRoute.get('/', verifyToken, GetAllDoctors).delete('/delete/:doctorId', verifyToken, DeleteDoctor).patch('/block/:doctorId', verifyToken, BlockDoctor).get('/popular-doctors', verifyToken, GetPopularDoctor).get('/recommended-doctors', verifyToken, GetRecommendedDoctor).get('/single-doctor/:doctorId', verifyToken, GetSingleDoctor);
module.exports = DoctorsRoute;