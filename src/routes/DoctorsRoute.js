const { GetAllDoctors } = require('../Controller/DoctorsController');
const verifyToken = require('../middlewares/Token/verifyToken');

const DoctorsRoute = require('express').Router();
DoctorsRoute.get('/', verifyToken, GetAllDoctors);
module.exports = DoctorsRoute;