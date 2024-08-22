const { model, Schema } = require('mongoose');
const NotificationSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Title is required']
    },
    body: {
        type: String,
        required: [true, 'Body is required']
    },
    appointmentId: {
        type: Schema.Types.ObjectId,
        ref: 'Appointment',
        required: [false, 'Appointment Id is required']
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User Id is required']
    },
    doctorId: {
        type: Schema.Types.ObjectId,
        ref: 'Doctor',
        required: [true, 'Doctor Id is required']
    },
    isRead: {
        type: Boolean,
        required: [true, 'isRead is required'],
        enum: [true, false],
        default: false
    }
}, { timestamps: true });

const Notification = model('notification', NotificationSchema);
module.exports = Notification;