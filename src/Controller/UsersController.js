const Appointment = require("../Models/AppointmentModel");
const User = require("../Models/UserModel");
const getAgeFromDate = require("../utils/getAgeFromDate");
const Queries = require("../utils/Queries");

// get all Users
const GetAllUsers = async (req, res) => {
        try {
            const { search, ...queryKeys } = req.query;
            const searchKey = {};
            if (req.user.role !== "ADMIN") {
                queryKeys.block = false;
            }
            queryKeys.role = 'USER';
            if (search) searchKey.name = search;
            const [result, payment, totalAppointments] = await Promise.all([
                Queries(User, queryKeys, searchKey),
                Appointment.aggregate([
                    {
                        $match: {
                            payment_status: false,
                            date: { $lt: new Date() } 
                        }
                    },
                    {
                        $group: {
                            _id: "$userId",
                            count: { $sum: 1 } 
                        }
                    }
                ]),
                Appointment.aggregate([
                    {
                        $group: {
                            _id: "$userId",
                            count: { $sum: 1 } 
                        }
                    }
                ])
            ]);
            const data = result?.data?.map((item) => {
                const unpaidCount = payment?.find(
                    (paymentItem) => paymentItem._id.toString() === item._id.toString()
                )?.count || 0;
                const totalAppointmentsCount = totalAppointments?.find(
                    (appointmentItem) => appointmentItem._id.toString() === item._id.toString()
                )?.count || 0;
                return {
                    ...item?._doc,
                    age: getAgeFromDate(item?.date_of_birth), 
                    unpaid: unpaidCount,                     
                    total_appointments: totalAppointmentsCount 
                };
            });
            const formattedData = { success: true, data };
            if (result?.pagination) {
                formattedData.pagination = result?.pagination;
            }
            return res.status(200).send({...formattedData});;
        } catch (err) {
            res.status(500).send({ success: false, message: err?.message || 'Internal server error', ...err });
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
            res.status(500).send({ success: false, message: err?.message || 'Internal server error', err });
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
            // console.log(ExistingUser)
            const result = await User.updateOne({ _id: userId }, { $set: { block: !ExistingUser.block } });
            res.status(200).send({ success: true, data: result, message: !ExistingUser.block ? 'User blocked successfully' : 'User unblocked successfully' });
        } catch (err) {
            res.status(500).send({ success: false, ...err, message: err?.message || 'Internal server error', });
        }
    }
    module.exports = {
        GetAllUsers,
        DeleteUser,
        BlockUser
    }