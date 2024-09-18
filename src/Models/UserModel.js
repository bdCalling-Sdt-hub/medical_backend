const { model, Schema } = require('mongoose');
const HashPassword = require('../utils/HashPassword'); // Import the HashPassword function

// Define the User schema
const UserModel = new Schema({
    'img': {
        type: String,
        required: false,
        default: null
    },
    "name": {
        type: String,
        required: [true, 'name is required'],
    },
    "age": {
        type: Number,
        required: [false, 'age is required'],
        default: null
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
        enum: ['USER', 'DOCTOR', 'ADMIN'],
        default: 'USER'
    },
    "access": {
        type: Number,
        required: true,
        enum: [0, 1, 2],
        default: 0,
    },
    verified: {
        type: Boolean,
        required: true,
        enum: [true, false],
        default: false
    },
    "category": {
        type: [String],
        required: [true, 'category is required'],
    },
}, { timestamps: true });

UserModel.pre('save', async function (next) {
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

const User = model('User', UserModel);
module.exports = User;
