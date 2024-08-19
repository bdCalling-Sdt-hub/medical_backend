
const verifyToken = require('../middlewares/Token/verifyToken');

const UsersRoute = require('express').Router();
UsersRoute.get('/', verifyToken, ).delete('/delete/:doctorId', verifyToken, ).patch('/block/:doctorId', verifyToken, );
module.exports = UsersRoute;