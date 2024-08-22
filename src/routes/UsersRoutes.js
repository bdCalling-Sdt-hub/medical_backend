
const { GetAllUsers, DeleteUser, BlockUser } = require('../Controller/UsersController');
const verifyToken = require('../middlewares/Token/verifyToken');

const UsersRoute = require('express').Router();
UsersRoute.get('/', verifyToken, GetAllUsers).delete('/delete/:userId', verifyToken,DeleteUser ).patch('/block/:userId', verifyToken, BlockUser);
module.exports = UsersRoute;