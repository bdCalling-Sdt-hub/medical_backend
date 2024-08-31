const Appointment = require("../Models/AppointmentModel");
const Doctor = require("../Models/DoctorModel");
const Review = require("../Models/ReviewModel");
const FormateRequiredFieldMessage = require("../utils/FormateRequiredFieldMessage");
const Queries = require("../utils/Queries");

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
            Doctor.findByIdAndUpdate(
                receiver,
                [
                    {
                        $set: {
                            rating: {
                                $divide: [
                                    { $multiply: ["$rating", "$total_rated"] },
                                    { $add: ["$total_rated", 1] }
                                ]
                            },
                            total_rated: { $add: ["$total_rated", 1] }
                        }
                    }
                ],
            ),
            // Doctor.findByIdAndUpdate(receiver, { $inc: { rating: rating, total_rated: 1 } }),
            Appointment.findByIdAndUpdate(appointmentId, { $set: { review: true } }),
            Review.create({ sender: id, receiver, rating, comment })
        ]);
        res.send({ success: true, data: review, message: 'Review Given Successfully' })
    } catch (error) {
        let duplicateKeys = '';
        if (error?.keyValue) {
            duplicateKeys = FormateErrorMessage(error);
            error.duplicateKeys = duplicateKeys;
        }
        let requiredField = []
        if (error?.errors) {
            requiredField = FormateRequiredFieldMessage(error?.errors);
            error.requiredField = requiredField;
        }
        res.status(500).send({ success: false, message: requiredField[0] || duplicateKeys || 'Internal server error', ...error });
    }
}
// delete review
const DeleteReview = async (req, res) => {
    try {
        const { id } = req.user
        const { reviewId } = req.params
        if (req.user.role !== 'ADMIN') {
            const result = await Review.deleteOne({ _id: reviewId, sender: id })
            if (result.deletedCount <= 0) {
                return res.status(404).send({ success: false, message: 'Review Not Found' })
            }
            res.status(200).send({ success: true, data: result, message: 'Review Deleted Successfully' })
        } else {
            const result = await Review.deleteOne({ _id: reviewId })
            if (result.deletedCount <= 0) {
                return res.status(404).send({ success: false, message: 'Review Not Found' })
            }
            res.status(200).send({ success: true, data: result, message: 'Review Deleted Successfully' })
        }
    } catch (error) {
        res.status(500).send({ success: false, message: error?.message || 'Internal server error', ...error })
    }
}
// get Doctor Review
const GetAllReview = async (req, res) => {
    try {
        const { id } = req.user
        const { search, receiverId, ...queryKeys } = req.query;
        const searchKey = {}
        let populatePaths = ["receiver", "sender"]
        let selectFields = ['name email phone location _id img specialization', 'name email phone location _id img age'];
        if (search) searchKey.name = search
        if (req?.user?.role !== 'ADMIN') {
            queryKeys.receiver = receiverId
            populatePaths = ["sender"]
            selectFields = ['name email phone location _id img age'];
        }
        const result = await Queries(Review, queryKeys, searchKey, populatePath = populatePaths, selectFields = selectFields);
        return res.status(200).send({ success: true, data: result })
    } catch (error) {
        res.status(500).send({ success: false, message: error?.message || 'Internal server error', ...error })
    }
}
module.exports = { CreateReview, DeleteReview, GetAllReview }