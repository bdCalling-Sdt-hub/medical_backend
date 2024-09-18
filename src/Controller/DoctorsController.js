const UnlinkFiles = require("../middlewares/FileUpload/UnlinkFiles");
const Appointment = require("../Models/AppointmentModel");
const Doctor = require("../Models/DoctorModel");
const FavoriteDoctorModel = require("../Models/FavoriteDoctorModel");
const User = require("../Models/UserModel");
const getAgeFromDate = require("../utils/getAgeFromDate");
const Queries = require("../utils/Queries");
// get all doctors
const GetAllDoctors = async (req, res) => {
    try {
        const { id, role } = req.user
        const { search, ...queryKeys } = req.query;
        const searchKey = {}
        if (role !== "ADMIN") {
            queryKeys.block = false;
            queryKeys.approved = true;
        }
        if (search) searchKey.name = search
        const [result, favorite, appointments] = await Promise.all([
            Queries(Doctor, queryKeys, searchKey),
            FavoriteDoctorModel.find({ userId: id }),
            Appointment.aggregate([
                { $group: { _id: "$doctorId", totalAppointments: { $sum: 1 } } }
            ])
        ])
        const data = result?.data?.map((item) => {
            const isFavorite = favorite.some((fav) => fav.doctorId.toString() === item._id.toString());
            const doctorAppointments = appointments.find(
                (appointment) => appointment._id.toString() === item._id.toString()
            );

            return {
                ...item._doc,
                age: getAgeFromDate(item?.date_of_birth),
                isFavorite,
                total_booking: doctorAppointments ? doctorAppointments.totalAppointments : 0
            };
        });

        const formateData = { data, success: true };
        if (result?.pagination) {
            formateData.pagination = result?.pagination;
        }
        res.status(200).send({ ...formateData });
    } catch (err) {
        res.status(500).send({ success: false, message: err?.message || 'Internal server error', ...err });
    }
};
//delete doctors
const DeleteDoctor = async (req, res) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(401).send({ message: "unauthorized access" });
    }
    const { doctorId } = req.params;
    try {
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).send({ success: false, message: 'Doctor not found' });
        }
        const result = await Doctor.deleteOne({ _id: doctorId });
        if (doctor.img) {
            UnlinkFiles([doctor.img]);
        }
        if (doctor.license) {
            UnlinkFiles([doctor.license]);
        }
        res.status(200).send({ success: true, data: result, message: 'Doctor deleted successfully' });
    } catch (err) {
        res.status(500).send({ success: false, message: err?.message || 'Internal server error', ...err });
    }
}
// block doctors 
const BlockDoctor = async (req, res) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(401).send({ message: "unauthorized access" });
    }
    const { doctorId } = req.params;
    const { field } = req.body
    try {
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).send({ success: false, message: 'Doctor not found' });
        }
        const result = await Doctor.updateOne({ _id: doctorId }, { $set: { [field]: !doctor[field] } });
        res.status(200).send({ success: true, data: result, message: !doctor.block ? 'Doctor blocked successfully' : 'Doctor unblocked successfully' });
    } catch (err) {
        res.status(500).send({ success: false, message: error?.message || 'Internal server error', ...err });
    }
}
// get Popular doctor
const GetPopularDoctor = async (req, res) => {
    try {
        const { id, role } = req.user
        const { search, ...queryKeys } = req.query;
        const searchKey = {}
        if (role !== "ADMIN") {
            queryKeys.block = false;
            queryKeys.approved = true;
        }
        queryKeys.rating = { $gte: 4.5 }
        if (search) searchKey.name = search
        const [result, favorite] = await Promise.all([
            Queries(Doctor, queryKeys, searchKey),
            FavoriteDoctorModel.find({ userId: id })
        ])

        const data = result?.data?.map((item) => {
            const isFavorite = favorite.some((fav) => fav.doctorId.toString() === item._id.toString())
            return { ...item._doc, isFavorite }
        })
        const formateData = { data, success: true }
        if (result?.pagination) {
            formateData.pagination = result?.pagination
        }
        res.status(200).send({ ...formateData });
    } catch (error) {
        res.status(500).send({ success: false, message: error?.message || 'Internal server error', ...error });
    }
}
// get Recommended doctor
const GetRecommendedDoctor = async (req, res) => {
    try {
        const { id, role } = req.user
        const { category } = await User.findById(id)
        const { search, ...queryKeys } = req.query;
        const searchKey = {}
        if (role !== "ADMIN") {
            queryKeys.block = false;
            queryKeys.approved = true;
        }
        queryKeys.specialization = { $in: [...category] }
        queryKeys.sort = 'rating'
        queryKeys.order = 'esc'
        // queryKeys.rating = { $gte: 4.5 }
        if (search) searchKey.name = search
        const [result, favorite] = await Promise.all([
            Queries(Doctor, queryKeys, searchKey),
            FavoriteDoctorModel.find({ userId: id })
        ])

        const data = result?.data?.map((item) => {
            const isFavorite = favorite.some((fav) => fav.doctorId.toString() === item._id.toString())
            return { ...item._doc, isFavorite }
        })
        const formateData = { data, success: true }
        if (result?.pagination) {
            formateData.pagination = result?.pagination
        }
        res.status(200).send({ ...formateData });
    } catch (error) {
        res.status(500).send({ success: false, message: error?.message || 'Internal server error', ...error });
    }
}
// get single doctor
const GetSingleDoctor = async (req, res) => {
    const { doctorId } = req.params
    try {
        const result = await Doctor.findOne({ _id: doctorId })
        const similarDoctor = await Doctor.find({ specialization: result.specialization, _id: { $ne: doctorId } }).sort({ rating: -1 }).limit(10)
        res.status(200).send({ success: true, data: { doctor: result, similarDoctor } });
    } catch (error) {
        res.status(500).send({ success: false, message: error?.message || 'Internal server error', ...error });
    }

}
module.exports = {
    GetAllDoctors,
    DeleteDoctor,
    BlockDoctor,
    GetPopularDoctor,
    GetRecommendedDoctor,
    GetSingleDoctor
}