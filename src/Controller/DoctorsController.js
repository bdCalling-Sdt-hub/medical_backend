const Doctor = require("../Models/DoctorModel");
const Queries = require("../utils/Queries");
// get all doctors
const GetAllDoctors = async (req, res) => {
    try {
        const { search, ...queryKeys } = req.query;
        const searchKey = {}
        if (search) searchKey.name = search
        const result = await Queries(Doctor, queryKeys, searchKey);
        res.status(200).send({ ...result });
    } catch (err) {
        res.status(500).send({ success: false, error: { message: 'Internal server error', error: err } });
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
        res.status(500).send({ success: false, error: { message: 'Internal server error', error: err } });
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
        res.status(500).send({ success: false, error: { message: 'Internal server error', error: err } });
    }
}
module.exports = {
    GetAllDoctors,
    DeleteDoctor,
    BlockDoctor
}