const { GetAllDoctors, DeleteDoctor, BlockDoctor } = require('../Controller/DoctorsController');
const verifyToken = require('../middlewares/Token/verifyToken');

const DoctorsRoute = require('express').Router();
DoctorsRoute.get('/', verifyToken, GetAllDoctors).delete('/delete/:doctorId', verifyToken, DeleteDoctor).patch('/block/:doctorId', verifyToken, BlockDoctor);
module.exports = DoctorsRoute;