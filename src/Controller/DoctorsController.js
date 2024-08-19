const Doctor = require("../Models/DoctorModel");

const GetAllDoctors = async (req, res) => {
    try {
        const result = await Doctor.find();
        res.status(200).send({ success: true, data: result });
    } catch (err) {
        res.status(500).send({ success: false, error: { message: 'Internal server error', error: err } });
    }
};
module.exports = {
    GetAllDoctors
}