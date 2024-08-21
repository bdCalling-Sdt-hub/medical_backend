const Appointment = require("../Models/AppointmentModel");
const Doctor = require("../Models/DoctorModel");
const Queries = require("../utils/Queries");

const GetAvailableAppointments = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const doctor = await Doctor.findById(doctorId);
    } catch (error) {
        res.status(500).send({ success: false, error, message: 'Internal Server Error' });
    }
}


// create appointment 
const CreateAppointment = async (req, res) => {
    try {
        const { date, time, day } = req.body;
        const { doctorId } = req.params;
        if (!date || !time || !day) {
            return res.status(400).send({ success: false, message: 'Date , Time and Day are required' });
        }
        const query = {
            _id: doctorId,
            [`available_days.${day}`]: { $in: time }
        };
        const [Existingdoctor, ExistingAppointment] = await Promise.all([
            Doctor.findOne(query),
            Appointment.find({ doctorId, day, time })
        ])
        if (!Existingdoctor) {
            return res.status(404).send({ success: false, message: 'Doctor Not Available For Appointment' });
        }
        if (ExistingAppointment.length > 0 && ExistingAppointment[0].userId.toString() !== req.user.id) {
            return res.status(404).send({ success: false, message: 'Doctor Not Available For Appointment' });
        } else if (ExistingAppointment.length > 0 && ExistingAppointment[0].userId.toString() === req.user.id) {
            const result = await Appointment.updateOne({ _id: ExistingAppointment[0]._id }, { ...req.body, doctorId, userId: req.user.id, name: Existingdoctor.name });
            return res.status(200).send({ success: true, data: result, message: 'Appointment Request updated Successfully' });
        } else {
            const newAppointment = new Appointment({ ...req.body, doctorId, userId: req.user.id, name: Existingdoctor.name });
            const result = await newAppointment.save();
            return res.status(200).send({ success: true, data: result, message: 'Appointment Request Send Successfully' });
        }
    } catch (error) {
        res.status(500).send({ success: false, ...error, message: 'Internal Server Error' });
    }
}
//update appointments
const UpdateAppointments = async (req, res) => {
    try {
        const { id } = req.user
        const { date, time, day, _id } = req.body;
        const { doctorId } = req.params;
        if (!date || !time || !day) {
            return res.status(400).send({ success: false, message: 'Date , Time and Day are required' });
        }
        const query = {
            _id: doctorId,
            [`available_days.${day}`]: { $in: time }
        };
        const [Existingdoctor, ExistingAppointment] = await Promise.all([
            Doctor.findOne(query),
            Appointment.find({ doctorId, userId: id, _id: _id })
        ])
        if (!Existingdoctor) {
            return res.status(404).send({ success: false, message: 'Doctor Not Available For Appointment' });
        }
        if (ExistingAppointment.length <= 0 || ExistingAppointment[0].userId.toString() !== id) {
            return res.status(404).send({ success: false, message: 'Appointment Not Found' });
        }
        const result = await Appointment.updateOne({ _id: ExistingAppointment[0]._id }, { ...req.body, doctorId, userId: id, name: Existingdoctor.name });
        return res.status(200).send({ success: true, data: result, message: 'Appointment Request updated Successfully' });
    } catch (error) {

    }
}
// get all appointments
const GetAllAppointments = async (req, res) => {
    try {
        const { id } = req.user
        const { search, type, status, ...queryKeys } = req.query;
        queryKeys.userId = id
        const searchKey = {}
        if (search) searchKey.name = search

        if (status) {
            queryKeys.status = status
        } else if (type && type === 'past') {
            queryKeys.date = { $lt: new Date().toISOString() }
        } else {//if (type && type === 'upcoming')
            queryKeys.date = { $gte: new Date().toISOString() }
        }
        const result = await Queries(Appointment, queryKeys, searchKey, populatePath = "doctorId", selectFields = "name email phone location _id img specialization");
        res.status(200).send({ ...result });
    } catch (err) {
        res.status(500).send({ success: false, message: 'Internal server error', ...err });
    }
}

// delete appointment
const DeleteAppointment = async (req, res) => {
    try {
        const { id } = req.user
        const { appointmentId } = req.params;
        const result = await Appointment.deleteOne({ _id: appointmentId, userId: id })
        if (result.deletedCount <= 0) {
            return res.status(404).send({ success: false, message: 'Appointment Not Found' })
        }
        res.status(200).send({ success: true, data: result, message: 'Appointment Deleted Successfully' })
    } catch (error) {
        res.status(500).send({ success: false, message: 'Internal server error', ...error });
    }
}
module.exports = {
    CreateAppointment, GetAllAppointments, UpdateAppointments, DeleteAppointment
}