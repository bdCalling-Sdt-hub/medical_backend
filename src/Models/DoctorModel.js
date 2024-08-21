const { model, Schema } = require('mongoose');
const HashPassword = require('../utils/HashPassword');
// const TimeSlotSchema = new Schema({
//     startTime: { type: String, required: true },
//     endTime: { type: String, required: true }
// }, { _id: false });

const AvailabilitySchema = new Schema({
    monday: {
        type: [String],
        required: false
    },
    tuesday: {
        type: [String],
        required: false
    },
    wednesday: {
        type: [String],
        required: false
    },
    thursday: {
        type: [String],
        required: false
    },
    friday: {
        type: [String],
        required: false
    },
    saturday: {
        type: [String],
        required: false
    },
    sunday: {
        type: [String],
        required: false
    },
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
    "gender": {
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
    "available_days": {
        type: AvailabilitySchema,
        required: [true, 'Availability is required'],
        default: {},
        validate: {
            validator: function (value) {
                let hasAvailableDay = true;
                Object.keys(value).forEach(key => {
                    if (value[key] && value[key].length > 0) {
                        hasAvailableDay = false;
                    }
                })
                return hasAvailableDay;
            },
            message: 'At least one available day with non-empty time slots is required'
        }
    },
    "available_for": {
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
    "rating": {
        type: Number,
        required: [true, 'Rating is required'],
        default: 0,
    },
    "total_rated": {
        type: Number,
        required: [true, 'Rating is required'],
        default: 0,
    },
}, { timestamps: true });

DoctorModel.pre('save', async function (next) {
    this.email = this.email.toLowerCase();
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
