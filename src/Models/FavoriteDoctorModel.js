const { model, Schema, SchemaTypes } = require('mongoose');
const SettingsSchema = new Schema({
    doctorId: {
        type: SchemaTypes.ObjectId,
        required: [true, 'doctorId is required'],
        ref: 'Doctor'
    },
    userId: {
        type: SchemaTypes.ObjectId,
        required: [true, 'userId is required'],
        ref: 'User'
    }
}, { timestamps: true });

const FavoriteDoctorModel = model('favoriteDoctor', SettingsSchema);
module.exports = FavoriteDoctorModel