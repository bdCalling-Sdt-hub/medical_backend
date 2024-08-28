const { model, Schema } = require('mongoose');

const AppointmentSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    doctorId: {
        type: Schema.Types.ObjectId,
        ref: 'Doctor',
        required: [true, 'Doctor Id is required']
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User Id is required']
    },
    date: {
        type: Date,
        required: [true, 'Date is required']
    },
    time: {
        type: String,
        required: [true,]
    },
    day: {
        type: String,
        enum: ['sunday', 'saturday', 'friday', 'thursday', 'wednesday', 'tuesday', 'monday'],
        required: [true, 'Day is required']
    },
    status: {
        type: String,
        required: [true, 'Status Id is required'],
        default: 'pending',
        enum: ['pending', 'accepted', 'rejected', 'completed']
    },
    reason: {
        type: String,
        required: [true, 'Reason is required']
    },
    appointment_type: {
        type: String,
        required: [true, 'Appointment Type is required'],
        enum: ['ONLINE', 'OFFLINE']
    },
    desc: {
        type: String,
        required: [true, 'Description is required']
    },
    prescription: {
        type: [String],
    },
    review: {
        type: Boolean,
        required: [true, 'Review is required'],
        enum: [true, false],
        default: false,
    }
}, { timestamps: true });

const Appointment = model('appointment', AppointmentSchema);
module.exports = Appointment