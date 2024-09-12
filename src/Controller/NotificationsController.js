const Notification = require("../Models/NotificationModel");
const User = require("../Models/UserModel");
const { getReceiverSocketId, io } = require("../Socket");
const Queries = require("../utils/Queries");

//create notification
const CreateNotification = async (data, user) => {
    const { appointmentId, userId, doctorId, message, body, type } = data;
    const notification = new Notification({ appointmentId, userId, doctorId, title: message, body, type, reviver: user.role === 'DOCTOR' ? 'USER' : 'DOCTOR' });
    const [saveNotification, admins] = await Promise.all([
        notification.save(),
        User.find({ role: 'ADMIN' })
    ])
    const adminIds = admins.map(admin => admin._id.toString());
    if (user?.role === 'DOCTOR') {
        const receiverSocketId = getReceiverSocketId(userId.toString());
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("new-notification", notification);
        }
    } else {
        const receiverSocketId = getReceiverSocketId([doctorId.toString()]);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("new-notification", notification);
        }
    }
    adminIds?.map(id => {
        console.log('id', id)
        const adminReceiverSocketId = getReceiverSocketId(id)
        console.log(adminReceiverSocketId)
        io.to(adminReceiverSocketId).emit("new-notification", notification);
    });
}
// get all notifications
const GetNotifications = async (req, res) => {
    try {
        const { id } = req.user
        const { search, ...queryKeys } = req.query;
        let searchKey = {}
        let populatepaths = ['doctorId', 'userId'];
        let selectField = ['name email phone location _id img specialization', 'name email phone location _id img'];
        if (req.user?.role !== 'ADMIN') {
            populatepaths = ''
            queryKeys.reviver = req.user?.role
        }
        if (!queryKeys.sort) {
            queryKeys.sort = 'createdAt'
            queryKeys.order = 'desc'
        }
        const notifications = await Queries(Notification, queryKeys, searchKey, populatePath = populatepaths, selectFields = selectField);
        res.status(200).send(notifications)
    } catch (error) {
        res.status(500).send({ success: false, message: error?.message || 'Internal server error', ...error });
    }
}
// update notifications 
const UpdateNotifications = async (req, res) => {
    try {
        const { role } = req.user
        const { notificationIds } = req.body;
        console.log(req.body)
        let data = { isRead: true }
        if (role === 'DOCTOR') {
            data = { isReadByDoctor: true }
        }
        if (role === 'USER') {
            data = { isReadByUser: true }
        }
        console.log(notificationIds, data)
        const notifications = await Notification.updateMany({ _id: { $in: notificationIds } }, data)
        res.status(200).send({ success: true, message: 'Notifications Read successfully', data: notifications })
    } catch (error) {
        res.status(500).send({ success: false, message: error?.message || 'Internal server error', ...error });
    }
}
const UpdateAllNotifications = async (req, res) => {
    try {
        const { id, role } = req.user
        let query = { isRead: false }
        let data = { isRead: true }
        if (role === 'DOCTOR') {
            query.doctorId = id
            data = { isReadByDoctor: true }
            query = { isReadByDoctor: false, doctorId: id }
        }
        if (role === 'USER') {
            data = { isReadByUser: true }
            query = { isReadByUser: false, userId: id }
        }
        console.log(query, data)
        const notifications = await Notification.updateMany(query, data)
        res.status(200).send({ success: true, message: 'Notifications Read successfully', data: notifications })
    } catch (error) {
        res.status(500).send({ success: false, message: error?.message || 'Internal server error', ...error });
    }
}

module.exports = { CreateNotification, GetNotifications, UpdateNotifications, UpdateAllNotifications }