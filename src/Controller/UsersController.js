const User = require("../Models/UserModel");
const Queries = require("../utils/Queries");

// get all Users
const GetAllUsers = async (req, res) => {
    try {
        const { search, ...queryKeys } = req.query;
        const searchKey = {}
        queryKeys.block = false
        queryKeys.role = 'USER'
        if (search) searchKey.name = search
        const result = await Queries(User, queryKeys, searchKey);
        res.status(200).send({ success: true, data: result });
    } catch (err) {
        res.status(500).send({ success: false, message: 'Internal server error', ...err });
    }
};
//delete Users
const DeleteUser = async (req, res) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(401).send({ message: "unauthorized access" });
    }
    const { userId } = req.params;
    console.log(userId)
    try {
        const ExistingUser = await User.findById(userId);
        if (!ExistingUser) {
            return res.status(404).send({ success: false, message: 'User not found' });
        }
        const result = await User.deleteOne({ _id: userId });
        if (ExistingUser.img) {
            UnlinkFiles([User.img]);
        }
        if (ExistingUser.license) {
            UnlinkFiles([User.license]);
        }
        res.status(200).send({ success: true, data: result, message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).send({ success: false, error: { message: 'Internal server error', error: err } });
    }
}
// block Users 
const BlockUser = async (req, res) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(401).send({ message: "unauthorized access" });
    }
    const { userId } = req.params;
    try {
        const ExistingUser = await User.findById(userId);
        if (!ExistingUser) {
            return res.status(404).send({ success: false, message: 'User not found' });
        }
        console.log(ExistingUser)
        const result = await User.updateOne({ _id: userId }, { $set: { block: !ExistingUser.block } });
        res.status(200).send({ success: true, data: result, message: !ExistingUser.block ? 'User blocked successfully' : 'User unblocked successfully' });
    } catch (err) {
        res.status(500).send({ success: false, error: { message: 'Internal server error', error: err } });
    }
}
module.exports = {
    GetAllUsers,
    DeleteUser,
    BlockUser
}