const User = require("../Models/UserModel");

// get all Users
const GetAllUsers = async (req, res) => {
    try {
        const result = await User.find();
        res.status(200).send({ success: true, data: result });
    } catch (err) {
        res.status(500).send({ success: false, error: { message: 'Internal server error', error: err } });
    }
};
//delete Users
const DeleteUser = async (req, res) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(401).send({ message: "unauthorized access" });
    }
    const { UserId } = req.params;
    try {
        const User = await User.findById(UserId);
        if (!User) {
            return res.status(404).send({ success: false, message: 'User not found' });
        }
        const result = await User.deleteOne({ _id: UserId });
        if (User.img) {
            UnlinkFiles([User.img]);
        }
        if (User.license) {
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
    const { UserId } = req.params;
    try {
        const User = await User.findById(UserId);
        if (!User) {
            return res.status(404).send({ success: false, message: 'User not found' });
        }
        const result = await User.updateOne({ _id: UserId }, { $set: { block: !User.block } });
        res.status(200).send({ success: true, data: result, message: !User.block ? 'User blocked successfully' : 'User unblocked successfully' });
    } catch (err) {
        res.status(500).send({ success: false, error: { message: 'Internal server error', error: err } });
    }
}
module.exports = {
    GetAllUsers,
    DeleteUser,
    BlockUser
}