const { model, Schema } = require('mongoose');
const HashPassword = require('../utils/HashPassword');
const TimeSlotSchema = new Schema({
    startTime: { type: String, required: true },
    endTime: { type: String, required: true }
}, { _id: false });

const AvailabilitySchema = new Schema({
    monday: { type: TimeSlotSchema, required: false },
    tuesday: { type: TimeSlotSchema, required: false },
    wednesday: { type: TimeSlotSchema, required: false },
    thursday: { type: TimeSlotSchema, required: false },
    friday: { type: TimeSlotSchema, required: false },
    saturday: { type: TimeSlotSchema, required: false },
    sunday: { type: TimeSlotSchema, required: false },
}, { _id: false });
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
    "AvailableDays": {
        type: AvailabilitySchema,
        required: [true, 'Availability is required'],
        default: {}
    },
    "availableFor": {
        type: String,
        enum: ['ONLINE', 'OFFLINE'],
        required: [true, 'availableFor is required'],
    },
    "license": {
        type: String,
        required: [true, 'license is required'],
    },
    "specialization": {
        type: String,
        required: [true, 'specialization is required'],
    },
    "experience": {
        type: String,
        required: [true, 'experience is required'],
    },
    "educational_background": {
        type: String,
        required: [true, 'Educational Background is required'],
    },
    "current_affiliation": {
        type: String,
        required: [true, 'Current Affiliation is required'],
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
