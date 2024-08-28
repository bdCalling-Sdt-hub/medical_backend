const Appointment = require("../Models/AppointmentModel");
const Doctor = require("../Models/DoctorModel");
const Queries = require("../utils/Queries");
const uploadFile = require("../middlewares/FileUpload/FileUpload");
const { CreateNotification } = require("./NotificationsController");
// create appointment 
const CreateAppointment = async (req, res) => {
    // console.log(req.user)
    try {
        await uploadFile()(req, res, async function (err) {
            if (err) {
                return res.status(400).send({ success: false, message: err.message });
            }
            try {
                if (req.user?.role === 'DOCTOR') {
                    return res.status(403).send({ success: false, message: 'forbidden access' });
                }
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
                    await CreateNotification({ userId: req.user.id, doctorId, appointmentId: ExistingAppointment[0]._id, message: 'New Appointment Request', body: `${req.user?.name} requested for a new appointments` }, req.user);
                    return res.status(200).send({ success: true, data: result, message: 'Appointment Request updated Successfully' });
                } else {
                    const { prescription } = req.files || [];
                    const data = { ...req.body, doctorId, userId: req.user.id, name: Existingdoctor.name, }
                    if (prescription) {
                        const pres = prescription?.map(file => file.path)
                        data.prescription = pres
                    }
                    const newAppointment = new Appointment(data);
                    const result = await newAppointment.save();
                    await CreateNotification({ userId: req.user.id, doctorId, appointmentId: result._id, message: 'New Appointment Request', body: `${req.user?.name} requested for a new appointments` }, req.user);
                    return res.status(200).send({ success: true, data: result, message: 'Appointment Request Send Successfully' });
                }
            }
            catch (error) {
                res.status(500).send({ success: false, ...error, message: error?.message || 'Internal server error' });
            }
        })
    } catch (error) {
        res.status(500).send({ success: false, ...error, message: error?.message || 'Internal server error', });
    }
}
//update appointments
const UpdateAppointments = async (req, res) => {
    try {
        uploadFile()(req, res, async function (err) {
            if (err) {
                return res.status(400).send({ success: false, message: err.message });
            }
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
                const { prescription } = req.files || [];
                const data = { ...req.body, doctorId, userId: req.user.id, name: Existingdoctor.name, }
                if (prescription) {
                    const pres = prescription?.map(file => file.path)
                    data.prescription = pres
                }
                const result = await Appointment.updateOne({ _id: ExistingAppointment[0]._id }, data);
                await CreateNotification({ userId: id, doctorId, appointmentId: ExistingAppointment[0]._id, message: 'Appointment Request updated', body: `${req.user?.name}updated an appointments request` }, req.user);
                return res.status(200).send({ success: true, data: result, message: 'Appointment Request updated Successfully' });

            } catch (error) {
                res.status(500).send({ success: false, ...error, message: error?.message || 'Internal server error', });
            }
        })
    } catch (error) {
        res.status(500).send({ success: false, ...error, message: error?.message || 'Internal server error', });
    }
}
// get all appointments
const GetAllAppointments = async (req, res) => {
    try {
        const { id } = req.user
        const { search, type, status, ...queryKeys } = req.query;
        let populatepaths = ['doctorId', 'userId'];
        let selectField = ['name email phone location _id img specialization', 'name email phone location _id img age'];
        if (req.user?.role === 'DOCTOR') {
            populatepaths = 'userId'
            selectField = 'name email phone location _id img age'
            queryKeys.doctorId = id
        } else if (req.user?.role === 'USER') {
            queryKeys.userId = id
            populatepaths = 'doctorId'
            selectField = 'name email phone location _id img specialization'
        }
        const searchKey = {}
        if (search) searchKey.name = search
        if (status) {
            queryKeys.status = status
        } else if (type && type === 'past') {//if (type && type === 'upcoming')
            queryKeys.date = { $lt: new Date().toISOString() }
        } else if (type && type === 'weekly') {
            queryKeys.date = {
                $gte: new Date().toISOString(),
                $lte: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString()
            };
        } else if (type && type === 'monthly') {
            queryKeys.date = {
                $gte: new Date().toISOString(),
                $lte: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString()
            };
        } else {
            queryKeys.date = { $gte: new Date().toISOString() }
        }
        const result = await Queries(Appointment, queryKeys, searchKey, populatePath = populatepaths, selectFields = selectField);
        res.status(200).send({ ...result });
    } catch (err) {
        res.status(500).send({ success: false, message: err?.message || 'Internal server error', ...err });
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
        res.status(500).send({ success: false, message: error?.message || 'Internal server error', ...error });
    }
}
// get single appointment
const GetSingleAppointment = async (req, res) => {
    try {
        const { role } = req.user
        const { appointmentId } = req.params;
        let result;
        if (role === 'DOCTOR') {
            result = await Appointment.findOne({ _id: appointmentId }).populate({ path: 'userId' })
        } else if (role === 'USER') {
            result = await Appointment.findOne({ _id: appointmentId }).populate({ path: 'doctorId' })
        } else {
            result = await Appointment.findOne({ _id: appointmentId }).populate({ path: 'userId' }).populate({ path: 'doctorId' })
        }
        if (!result) {
            return res.status(404).send({ success: false, message: 'Appointment Not Found' })
        }
        res.status(200).send({ success: true, data: result, message: 'Appointment Found Successfully' })
    } catch (error) {
        res.status(500).send({ success: false, message: error?.message || 'Internal server error', ...error });
    }
}
module.exports = {
    CreateAppointment, GetAllAppointments, UpdateAppointments, DeleteAppointment, GetSingleAppointment
}