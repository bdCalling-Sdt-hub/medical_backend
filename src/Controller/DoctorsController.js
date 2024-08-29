const Doctor = require("../Models/DoctorModel");
const User = require("../Models/UserModel");
const Queries = require("../utils/Queries");
// get all doctors
const GetAllDoctors = async (req, res) => {
    try {
        const { search, ...queryKeys } = req.query;
        const searchKey = {}
        queryKeys.block = false
        if (search) searchKey.name = search
        const result = await Queries(Doctor, queryKeys, searchKey);
        res.status(200).send({ ...result });
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
    try {
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).send({ success: false, message: 'Doctor not found' });
        }
        const result = await Doctor.updateOne({ _id: doctorId }, { $set: { block: !doctor.block } });
        res.status(200).send({ success: true, data: result, message: !doctor.block ? 'Doctor blocked successfully' : 'Doctor unblocked successfully' });
    } catch (err) {
        res.status(500).send({ success: false, message: error?.message || 'Internal server error', ...err });
    }
}
// get Popular doctor
const GetPopularDoctor = async (req, res) => {
    try {
        const { search, ...queryKeys } = req.query;
        const searchKey = {}
        queryKeys.block = false
        queryKeys.rating = { $gte: 4.5 }
        if (search) searchKey.name = search
        const result = await Queries(Doctor, queryKeys, searchKey);
        res.status(200).send({ success: true, ...result });
    } catch (error) {
        res.status(500).send({ success: false, message: error?.message || 'Internal server error', ...error });
    }
}
// get Recommended doctor
const GetRecommendedDoctor = async (req, res) => {
    try {
        const { id } = req.user
        const { category } = await User.findById(id)
        const { search, ...queryKeys } = req.query;
        const searchKey = {}
        queryKeys.block = false
        queryKeys.specialization = { $in: [...category] }
        queryKeys.sort = 'rating'
        queryKeys.order = 'esc'
        // queryKeys.rating = { $gte: 4.5 }
        if (search) searchKey.name = search
        const result = await Queries(Doctor, queryKeys, searchKey);
        res.status(200).send({ success: true, ...result });
    } catch (error) {
        res.status(500).send({ success: false, message: error?.message || 'Internal server error', ...error });
    }
}
// get single doctor
const GetSingleDoctor = async (req, res) => {
    const { doctorId } = req.params
    try {
        const result = await Doctor.findOne({ _id: doctorId })
        res.status(200).send({ success: true, data: result });
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