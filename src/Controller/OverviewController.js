const { default: mongoose } = require("mongoose");
const Appointment = require("../Models/AppointmentModel");
const PaymentModel = require("../Models/PaymentModel");
const Doctor = require("../Models/DoctorModel");
const User = require("../Models/UserModel");

// get doctor overview 
const GetDoctorOverview = async (req, res) => {
    const { id } = req.user
    try {
        const [result, totalAppointment] = await Promise.all([
            PaymentModel.aggregate([
                {
                    $match: { doctorId: new mongoose.Types.ObjectId(id) }
                },
                {
                    $group: {
                        _id: null,
                        total_received: {
                            $sum: {
                                $cond: {
                                    if: { $eq: ["$payment_doctor", true] },
                                    then: { $subtract: ["$amount", { $multiply: ["$amount", 0.03] }] },
                                    else: 0
                                }
                            }
                        },
                        available_for_receive: {
                            $sum: {
                                $cond: {
                                    if: { $eq: ["$payment_doctor", false] },
                                    then: "$amount",
                                    else: 0
                                }
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        total_received: 1,
                        available_for_receive: 1
                    }
                }
            ]),
            Appointment.aggregate([
                {
                    $match: { doctorId: new mongoose.Types.ObjectId(id) }
                },
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 }
                    }
                }
            ])
        ]);
        const data = result.length > 0 ? result[0] : { total_received: 0, available_for_receive: 0 };
        const totalAppointmentObj = {
            pending: 0,
            accepted: 0,
            rejected: 0,
            completed: 0
        };
        totalAppointment.forEach(item => {
            totalAppointmentObj[item._id] = item.count;
        });

        data.total_appointment = totalAppointmentObj;
        res.status(200).send({ success: true, data });

    } catch (error) {
        res.status(500).send({ success: false, message: error?.message || 'Internal server error', ...error })
    }
}
// get Admin Admin Overview
const GetAdminOverview = async (req, res) => {
    try {
        const { role } = req.user
        if (req.user?.role !== "ADMIN") {
            return res.status(401).send({ success: false, message: "unauthorized access" })
        }
        const [income, total_doctor, total_user, total_appointment] = await Promise.all([
            PaymentModel.aggregate([
                {
                    $group: {
                        _id: null,
                        total_payment: {
                            $sum: "$amount"
                        },
                        total_deduction: {
                            $sum: { $multiply: ["$amount", 0.03] }
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        total_income: 1,
                        total_deduction: 1
                    }
                }
            ]),
            Doctor.countDocuments({}),
            User.countDocuments({}),
            Appointment.aggregate([
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 }
                    }
                }
            ])
        ])
        const totalAppointmentObj = {
            pending: 0,
            accepted: 0,
            rejected: 0,
            completed: 0
        };
        total_appointment.forEach(item => {
            totalAppointmentObj[item._id] = item.count;
        });
        const data = income.length > 0 ? income[0] : { total_payment: 0, total_deduction: 0 };
        data.total_doctor = total_doctor;
        data.total_user = total_user;
        data.total_appointment = totalAppointmentObj;
        res.status(200).send({ success: true, data });
    } catch (error) {
        res.status(500).send({ success: false, message: error?.message || 'Internal server error', ...error })
    }
}

// get income overview
const GetIncomeOverview = async (req, res) => {
    try {
        const { year } = req.query
        const { role } = req.user
        if (role !== "ADMIN") {
            return res.status(401).send({ success: false, message: "unauthorized access" })
        }
        const currentYear = year || new Date().getFullYear();
        const previousYear = currentYear - 1;
        const currentMonth = new Date().getMonth() + 1;
        const currentDate = new Date().getDate();
        const currentYearData = await PaymentModel.aggregate([
            {
                $match: {
                    // doctorId: mongoose.Types.ObjectId(doctorId),
                    // status: 'success',
                    // payment_doctor: true,
                    createdAt: {
                        $gte: new Date(`${currentYear}-01-01`),
                        $lte: new Date(`${currentYear}-12-31`)
                    }
                }
            },
            {
                $project: {
                    month: { $month: "$createdAt" },
                    admin_deduction: { $multiply: ["$amount", 0.03] }
                }
            },
            {
                $group: {
                    _id: { month: "$month" },
                    total_deduction: { $sum: "$admin_deduction" }
                }
            }
        ]);
        const previousYearData = await PaymentModel.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(`${previousYear}-01-01`),
                        $lte: new Date(`${previousYear}-12-31`)
                    }
                }
            },
            {
                $project: {
                    month: { $month: "$createdAt" },
                    admin_deduction: { $multiply: ["$amount", 0.03] } // 3% deduction
                }
            },
            {
                $group: {
                    _id: { month: "$month" },
                    total_deduction: { $sum: "$admin_deduction" }
                }
            }
        ]);
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        const monthlyData = monthNames.reduce((acc, month) => {
            acc[month] = 0;
            return acc;
        }, {});
        currentYearData.forEach(entry => {
            const monthIndex = entry._id.month - 1;
            monthlyData[monthNames[monthIndex]] = entry.total_deduction;
        });
        let totalCurrentYearDeduction = 0;
        let totalPreviousYearDeduction = 0;

        currentYearData.forEach(entry => {
            totalCurrentYearDeduction += entry.total_deduction;
        });

        previousYearData.forEach(entry => {
            totalPreviousYearDeduction += entry.total_deduction;
        });

        const yearlyComparison = totalPreviousYearDeduction > 0
            ? ((totalCurrentYearDeduction - totalPreviousYearDeduction) / totalPreviousYearDeduction) * 100
            : 0;
        const currentMonthDeduction = monthlyData[monthNames[currentMonth - 1]];
        const previousMonthDeduction = currentMonth > 1 ? monthlyData[monthNames[currentMonth - 2]] : 0;
        const monthlyComparison = previousMonthDeduction > 0
            ? ((currentMonthDeduction - previousMonthDeduction) / previousMonthDeduction) * 100
            : 0;
        const dailyData = currentYearData.filter(entry => entry._id.month === currentMonth);
        const currentDayDeduction = dailyData.find(entry => entry._id.day === currentDate)?.total_deduction || 0;
        const previousDayDeduction = dailyData.find(entry => entry._id.day === currentDate - 1)?.total_deduction || 0;
        const dailyComparison = previousDayDeduction > 0
            ? ((currentDayDeduction - previousDayDeduction) / previousDayDeduction) * 100
            : 0;
        res.status(200).send({
            success: true, data: {
                monthlyData,
                monthlyComparison,
                dailyComparison,
                yearlyComparison,
                currentYear: year || new Date().getFullYear()
            }
        });
    } catch (error) {
        res.status(500).send({ success: false, message: error?.message || 'Internal server error', ...error })
    }
}
// get appointment overview
const GetAppointmentOverview = async (req, res) => {
    try {
        if (req.user.role !== "ADMIN") {
            return res.status(401).send({ success: false, message: "unauthorized access" })
        }
        const { year } = req.query
        const currentYear = year || new Date().getFullYear();
        const previousYear = currentYear - 1;
        const currentMonth = new Date().getMonth() + 1;
        const currentDate = new Date().getDate();
        const currentYearData = await Appointment.aggregate([
            {
                $match: {
                    date: {
                        $gte: new Date(`${currentYear}-01-01`),
                        $lte: new Date(`${currentYear}-12-31`)
                    }
                }
            },
            {
                $project: {
                    month: { $month: "$date" },
                    day: { $dayOfMonth: "$date" }
                }
            },
            {
                $group: {
                    _id: { month: "$month", day: "$day" },
                    total_appointments: { $sum: 1 }
                }
            }
        ]);
        const previousYearData = await Appointment.aggregate([
            {
                $match: {
                    date: {
                        $gte: new Date(`${previousYear}-01-01`),
                        $lte: new Date(`${previousYear}-12-31`)
                    }
                }
            },
            {
                $project: {
                    month: { $month: "$date" },
                    day: { $dayOfMonth: "$date" }
                }
            },
            {
                $group: {
                    _id: { month: "$month", day: "$day" },
                    total_appointments: { $sum: 1 }
                }
            }
        ]);
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        const monthlyData = monthNames.reduce((acc, month) => {
            acc[month] = 0;
            return acc;
        }, {});
        currentYearData.forEach(entry => {
            const monthIndex = entry._id.month - 1;
            monthlyData[monthNames[monthIndex]] = (monthlyData[monthNames[monthIndex]] || 0) + entry.total_appointments;
        });
        let totalCurrentYearAppointments = 0;
        let totalPreviousYearAppointments = 0;

        currentYearData.forEach(entry => {
            totalCurrentYearAppointments += entry.total_appointments;
        });

        previousYearData.forEach(entry => {
            totalPreviousYearAppointments += entry.total_appointments;
        });

        const yearlyComparison = totalPreviousYearAppointments > 0
            ? ((totalCurrentYearAppointments - totalPreviousYearAppointments) / totalPreviousYearAppointments) * 100
            : 0;
        const currentMonthAppointments = monthlyData[monthNames[currentMonth - 1]];
        const previousMonthAppointments = currentMonth > 1 ? monthlyData[monthNames[currentMonth - 2]] : 0;
        const monthlyComparison = previousMonthAppointments > 0
            ? ((currentMonthAppointments - previousMonthAppointments) / previousMonthAppointments) * 100
            : 0;
        const dailyData = currentYearData.filter(entry => entry._id.month === currentMonth);
        const currentDayAppointments = dailyData.find(entry => entry._id.day === currentDate)?.total_appointments || 0;
        const previousDayAppointments = dailyData.find(entry => entry._id.day === currentDate - 1)?.total_appointments || 0;
        const dailyComparison = previousDayAppointments > 0
            ? ((currentDayAppointments - previousDayAppointments) / previousDayAppointments) * 100
            : 0;

        res.status(200).send({
            success: true, data: {
                monthlyData,
                monthlyComparison,
                dailyComparison,
                yearlyComparison,
                currentYear: year || new Date().getFullYear()
            }
        });
    } catch (error) {
        res.status(500).send({ success: false, message: error?.message || 'Internal server error', ...error })
    }
}
module.exports = { GetDoctorOverview, GetAdminOverview, GetIncomeOverview, GetAppointmentOverview }