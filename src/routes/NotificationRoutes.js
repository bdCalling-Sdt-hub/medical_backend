const NotificationRoutes = require('express').Router();
const { GetNotifications, UpdateNotifications, UpdateAllNotifications } = require('../Controller/NotificationsController');
const verifyToken = require('../middlewares/Token/verifyToken');
NotificationRoutes.get('/get-notifications', verifyToken, GetNotifications).patch('/update-notification', verifyToken, UpdateNotifications).patch('/read-all', verifyToken, UpdateAllNotifications);

module.exports = NotificationRoutes