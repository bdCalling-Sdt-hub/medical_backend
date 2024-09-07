const { model, Schema } = require('mongoose');

const DoctorPaymentSchema = new Schema({
    doctorId: {
        type: Schema.Types.ObjectId,
        ref: 'Doctor',
        required: [true, 'Doctor Id is required']
    },
    amount: {
        type: Number,
        required: [true, 'amount is required']
    },
    // userId: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'User',
    //     required: [true, 'User Id is required']
    // },
    fee: {
        type: Number,
        required: [true, 'amountPaid is required']
    },
    transferId: {
        type: String,
        required: [true, 'transferId is required']
    },
    payoutsId: {
        type: String,
        required: [true, 'payoutsId is required']
    },
    status: {
        type: String,
        required: [true, 'status is required'],
        enum: ['pending', 'success', 'failed'],
        default: 'success'
    }
}, { timestamps: true });
const DoctorPaymentModel = model('doctorPayment', DoctorPaymentSchema);
module.exports = DoctorPaymentModel