const { model, Schema } = require('mongoose');
const HashPassword = require('../utils/HashPassword'); // Import the HashPassword function

// Define the Doctor schema
const DoctorModel = new Schema({
    'img': {
        type: String,
        required: false
    },
    "name": {
        type: String,
        required: [true, 'name is required'],
    },
    "email": {
        type: String,
        required: [true, 'email is required'],
        unique: true
    },
    "date_of_birth": {
        type: String,
        required: [true, 'date of birth is required'],
    },
    "location": {
        type: String,
        required: [true, 'location is required'],
    },
    "phone": {
        type: String,
        required: [true, 'phone is required'],
        unique: true
    },
    "password": {
        type: String,
        required: [true, 'password is required'],
    },
    "provider": {
        type: String,
        required: true,
        default: 'credential'
    },
    "Gender": {
        type: String,
        required: false,
        enum: ['male', 'female'],
    },
    "block": {
        type: Boolean,
        required: true,
        enum: [true, false],
        default: false
    },
    "role": {
        type: String,
        required: true,
        enum: ['DOCTOR', 'DOCTOR', 'ADMIN'],
        default: 'DOCTOR'
    },
    "access": {
        type: Number,
        required: true,
        enum: [0, 1, 2],
        default: 1,
    },
}, { timestamps: true });

DoctorModel.pre('save', async function (next) {
    if (this.isModified('password')) {
        try {
            this.password = await HashPassword(this.password);
        } catch (err) {
            return next(err);
        }
    }
    next();
});

const Doctor = model('Doctor', DoctorModel);
module.exports = Doctor;
