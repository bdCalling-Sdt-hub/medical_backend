const Doctor = require("../Models/DoctorModel");
const Review = require("../Models/ReviewModel");

// Create Review 
const CreateReview = async (req, res) => {
    try {
        const { sender, receiver, rating, comment } = req.body
        const ExistingDoctor = await Doctor.findOne({ _id: receiver })
        const result = await Review.create({ sender, receiver, rating, comment })
        res.send({ success: true, data: result, message: 'Review Created Successfully' })
    } catch (error) {
        let duplicateKeys = [];
        if (error?.keyValue) {
            duplicateKeys = FormateErrorMessage(error);
        }
        error.duplicateKeys = duplicateKeys;
        res.send({ success: false, ...error, message: 'Internal Server Error' })
    }
}