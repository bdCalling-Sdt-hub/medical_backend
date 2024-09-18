const { model, Schema } = require('mongoose');

const PaymentSchema = new Schema({
    amount: {
        type: Number,
        required: [true, 'amount is required']
    },
    transitionId: {
        type: String,
        required: [true, 'paymentId is required']
    },
    status: {
        type: String,
        required: [true, 'status is required'],
        enum: ['pending', 'success', 'failed'],
        default: 'success'
    },
    doctorId: {
        type: Schema.Types.ObjectId,
        ref: 'Doctor',
        required: [true, 'Doctor is required'],
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required'],
    },
    payment_doctor: {
        type: Boolean,
        required: [true, 'payment doctor required'],
        enum: [true, false],
        default: false
    },
    doctor_amount: {
        type: Number,
        required: true
    },
    AppointmentId: {
        type: Schema.Types.ObjectId,
        ref: 'appointment',
        required: [true, 'Appointment is required'],
    },
    appointmentDate: {
        type: Date,
        required: [true, 'Appointment Date is required'],
    }
}, { timestamps: true });
PaymentSchema.pre('save', function (next) {
    if (this.payment_doctor) {
        this.doctor_payment = this.amount - (this.amount * 0.03);
    } else {
        this.doctor_payment = this.amount;
    }
    next();
});
const PaymentModel = model('payment', PaymentSchema);
module.exports = PaymentModel