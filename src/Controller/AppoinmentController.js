const Doctor = require("../Models/DoctorModel");

const GetAvailableAppointments = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const doctor = await Doctor.findById(doctorId);
    } catch (error) {
        res.status(500).send({ success: false, error, message: 'Internal Server Error' });
    }
}      