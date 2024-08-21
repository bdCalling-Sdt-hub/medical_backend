const Appointment = require("../Models/AppointmentModel");
const Doctor = require("../Models/DoctorModel");
const Review = require("../Models/ReviewModel");

// Create Review 
const CreateReview = async (req, res) => {
    try {
        const { id } = req.user
        const { receiver, rating, comment, appointmentId } = req.body
        const ExistingAppointment = await Appointment.findOne({ doctorId: receiver, review: false, userId: id })
        if (!ExistingAppointment) {
            return res.send({ success: false, message: 'You have already reviewed this doctor' })
        }
        const [doctor, appointment, review] = await Promise.all([
            Doctor.findByIdAndUpdate(receiver, { $inc: { rating: rating, total_rated: 1 } }),
            Appointment.findByIdAndUpdate(appointmentId, { $set: { review: true } }),
            Review.create({ sender: id, receiver, rating, comment })
        ]);
        res.send({ success: true, data: review, message: 'Review Given Successfully' })
    } catch (error) {
        let duplicateKeys = [];
        if (error?.keyValue) {
            duplicateKeys = FormateErrorMessage(error);
        }
        error.duplicateKeys = duplicateKeys;
        res.status(500).send({ success: false, ...error, message: 'Internal Server Error' })
    }
}
module.exports = { CreateReview }