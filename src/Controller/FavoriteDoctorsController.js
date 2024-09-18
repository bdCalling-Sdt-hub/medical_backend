const FavoriteDoctorModel = require("../Models/FavoriteDoctorModel");
const Queries = require("../utils/Queries");

// get favorite doctors
const GetFavoriteDoctors = async (req, res) => {

    try {
        const { id } = req.user
        const { search, ...queryKeys } = req.query;
        const searchKey = {}
        if (search) searchKey.name = search
        queryKeys.userId = id
        const result = await Queries(FavoriteDoctorModel, queryKeys, searchKey, populatePath = "doctorId");
        res.status(200).send({ ...result });
    } catch (error) {
        res.status(500).send({ success: false, ...error, message: error?.message || 'Internal server error', })
    }
}
// add favorite doctors
const AddRemoveFavoriteDoctor = async (req, res) => {
    try {
        const { id } = req.user
        const { doctorId } = req.body
        const check = await FavoriteDoctorModel.findOne({ doctorId: doctorId, userId: id })
        if (check?._id) {
            const result = await FavoriteDoctorModel.deleteOne({ _id: check._id })
            return res.status(200).send({ success: true, data: result, message: 'Doctor removed from favorite successfully' })

        } else {
            const result = await FavoriteDoctorModel.create({ doctorId: doctorId, userId: id })
            res.status(200).send({ success: true, data: result, message: 'Doctor added to favorite successfully' })
        }

    } catch (error) {
        res.status(500).send({ success: false, message: error?.message || 'Internal server error', ...error })
    }
}
module.exports = { GetFavoriteDoctors, AddRemoveFavoriteDoctor }