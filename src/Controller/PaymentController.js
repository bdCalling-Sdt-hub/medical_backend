const { SRTIPE_KEY } = require('../config/defaults');
const uploadFile = require('../middlewares/FileUpload/FileUpload');
const Appointment = require('../Models/AppointmentModel');
const Doctor = require('../Models/DoctorModel');
const DoctorPaymentModel = require('../Models/DoctorPayment');
const PaymentModel = require('../Models/PaymentModel');
const StripeAccountModel = require('../Models/StripeAccountModel');
const stripe = require("stripe")("sk_test_51Jw074LLQHQhmkgVlHliqiOmj6Q7H4Ihf4g2mbSuhua7x02qQJ2ezuTSmeWL5DErKu6wvBw5AIp5sJ2Aza3yINZJ00PWdxsZAC")
const fs = require("fs");
const Queries = require('../utils/Queries');
const { Console } = require('console');
// create payment intent
const Payment = async (req, res) => {
    try {
        const { amount } = req.body;
        const paymentIntent = await stripe.paymentIntents.create({
            amount: parseInt(amount * 100),
            currency: "usd",
            payment_method_types: [
                "card"
            ],
        });
        res.status(200).send({
            success: true,
            message: "Payment Intent created successfully",
            data: {
                clientSecret: paymentIntent.client_secret,
                transactionId: paymentIntent.id,
                amount: amount,
            },
        });
    } catch (error) {
        res.status(500).send({ success: false, message: "Internal server error", ...error });
    }
}
// save payment status to database
const SavePayment = async (req, res) => {
    try {
        const newPayment = new PaymentModel({ ...req.body, doctor_amount: req.body?.amount - req.body?.amount * 5 / 100, });
        const [result] = await Promise.all([
            await newPayment.save(),
            await Appointment.updateOne({ _id: req.body?.AppointmentId }, { payment_status: true })
        ])
        res.status(200).send({ success: true, message: "Payment created successfully", data: result });
    } catch (error) {
        res.status(500).send({ success: false, message: "Internal server error", ...error });
    }
}

// create stripe account
// const createConnectedAccount = async (req, res) => {
//     try {
//         await uploadFile()(req, res, async function (err) {
//             if (err) {
//                 return res.status(400).send({ success: false, message: "Error uploading file" });
//             }
//             try {
//                 const { id } = req.user;
//                 const { data, dateOfBirth } = req?.body
//                 const { bank_info, business_profile, address } = JSON.parse(data)
//                 const dob = new Date(dateOfBirth);
//                 const { kycFront, kycBack } = req.files
//                 if (!address?.postal_code || !address?.city || !address?.country) {
//                     return res.status(404).send({ success: false, message: "country,city,postal_code fields are required" })
//                 }
//                 const [existingUser, existingAccount] = await Promise.all([
//                     Doctor.findOne({ _id: id }),
//                     StripeAccountModel.findOne({ doctorId: id }),
//                 ])
//                 if (!existingUser) {
//                     return res.status(404).send({ success: false, message: "Doctor not found" })
//                 }
//                 if (existingAccount) {
//                     return res.status(200).send({ success: false, message: "Account already exists", data: existingAccount })
//                 }
//                 if (!kycBack || !kycFront || kycBack.length === 0 || kycFront.length === 0) {
//                     return res.status(404).send({ success: false, message: "Two kyc files are required" })
//                 }
//                 if (!existingUser?.phone || !dateOfBirth || !bank_info || !bank_info?.account_number || !bank_info?.account_holder_name) {
//                     return res.status(404).send({ success: false, message: "dateOfBirth,business_profile,bank_info fields are required" })
//                 }

//                 const frontFilePart = await stripe.files.create({
//                     purpose: "identity_document",
//                     file: {
//                         data: fs.readFileSync(kycFront[0]?.path),
//                         name: kycFront[0]?.filename,
//                         type: kycFront[0]?.mimetype,
//                     },
//                 });
//                 const backFilePart = await stripe.files.create({
//                     purpose: "identity_document",
//                     file: {
//                         data: fs.readFileSync(kycBack[0]?.path),
//                         name: kycBack[0]?.filename,
//                         type: kycBack[0]?.mimetype,
//                     },
//                 });
//                 const token = await stripe.tokens.create({
//                     account: {
//                         individual: {
//                             dob: {
//                                 day: dob.getDate(),
//                                 month: dob.getMonth() + 1,
//                                 year: dob.getFullYear(),
//                             },
//                             first_name: existingUser?.name?.split(" ")[0] || 'Unknown',
//                             last_name: existingUser?.name?.split(" ")[1] || 'Unknown',
//                             email: existingUser?.email,
//                             phone: '+880000000000',
//                             address: {
//                                 city: address.city,
//                                 country: address.country,
//                                 line1: address.line1,
//                                 postal_code: address.postal_code,
//                             },
//                             verification: {
//                                 document: {
//                                     front: frontFilePart.id,
//                                     back: backFilePart.id,
//                                 },
//                             },
//                         },
//                         business_type: "individual",
//                         tos_shown_and_accepted: true,
//                     },
//                 });
//                 console.log(token)
//                 const account = await stripe.accounts.create({
//                     type: "custom",
//                     account_token: token.id,
//                     capabilities: {
//                         card_payments: { requested: true },
//                         transfers: { requested: true },
//                     },
//                     business_profile: {
//                         mcc: "5970",
//                         name: business_profile.business_name || existingUser.name || 'Unknown',
//                         url: business_profile.website || "www.example.com",
//                     },
//                     external_account: {
//                         object: "bank_account",
//                         account_holder_name: bank_info.account_holder_name,
//                         account_holder_type: bank_info.account_holder_type,
//                         account_number: bank_info.account_number,
//                         country: bank_info.country,
//                         currency: bank_info.currency,
//                     },
//                 });
//                 if (account.id && account.external_accounts.data.length) {
//                     const accountInformation = {
//                         stripeAccountId: account.id,
//                         externalAccountId: account.external_accounts?.data[0].id,
//                         status: true
//                     }
//                     const newStripeAccount = new StripeAccountModel({
//                         name: existingUser?.name || 'Unknown',
//                         email: existingUser?.email,
//                         doctorId: id,
//                         stripeAccountId: account.id,
//                         kycBack: kycBack[0].path,
//                         kycFront: kycFront[0].path,
//                         address: address,
//                         accountInformation: accountInformation
//                     })
//                     const result = await newStripeAccount.save();
//                     return res.status(200).send({ success: true, message: "Account created successfully", data: result })
//                 } else {
//                     return res.status(500).send({ success: false, message: "Internal server error" })
//                 }
//             } catch (error) {
//                 return res.status(500).send({ success: false, message: "Internal server error", ...error })
//             }
//         })
//     } catch (error) {

//     }
// }
// const createConnectedAccount = async (req, res) => {
//     try {

//         console.log("Creating", req.body)
//         await uploadFile()(req, res, async function (err) {
//             if (err) {
//                 return res.status(400).send({ success: false, message: "Error uploading file" });
//             }

//             try {
//                 const { id } = req.user;
//                 const { data, dateOfBirth } = req.body;
//                 const { bank_info, business_profile, address } = JSON.parse(data);
//                 const dob = new Date(dateOfBirth);
//                 const { kycFront, kycBack } = req.files;

//                 // Validate input fields
//                 if (!address?.postal_code || !address?.city || !address?.country) {
//                     return res.status(400).send({ success: false, message: "Country, city, and postal code are required" });
//                 }
//                 if (!kycBack || !kycFront || kycBack.length === 0 || kycFront.length === 0) {
//                     return res.status(400).send({ success: false, message: "Two KYC files are required" });
//                 }
//                 if (!dateOfBirth || !bank_info || !bank_info?.account_number || !bank_info?.account_holder_name) {
//                     return res.status(400).send({ success: false, message: "Date of birth, business profile, and bank info fields are required" });
//                 }


//                 const [existingUser, existingAccount] = await Promise.all([
//                     Doctor.findOne({ _id: id }),
//                     StripeAccountModel.findOne({ doctorId: id }),
//                 ]); 

//                 if (!existingUser) {
//                     return res.status(404).send({ success: false, message: "Doctor not found" });
//                 }
//                 if (existingAccount) {
//                     return res.status(200).send({ success: false, message: "Account already exists", data: existingAccount });
//                 }
//                 let frontFileData, backFileData;
//                 try {
//                     frontFileData = fs.readFileSync(kycFront[0]?.path);
//                     backFileData = fs.readFileSync(kycBack[0]?.path);
//                 } catch (fileError) {
//                     return res.status(500).send({ success: false, message: "Error reading KYC files", error: fileError.message });
//                 }
//                 let frontFilePart, backFilePart;
//                 try {
//                     frontFilePart = await stripe.files.create({
//                         purpose: "identity_document",
//                         file: {
//                             data: frontFileData,
//                             name: kycFront[0]?.filename,
//                             type: kycFront[0]?.mimetype,
//                         },
//                     });
//                 } catch (stripeError) {
//                     return res.status(500).send({ success: false, message: "Error creating front KYC file with Stripe", error: stripeError.message });
//                 }

//                 try {
//                     backFilePart = await stripe.files.create({
//                         purpose: "identity_document",
//                         file: {
//                             data: backFileData,
//                             name: kycBack[0]?.filename,
//                             type: kycBack[0]?.mimetype,
//                         },
//                     });
//                 } catch (stripeError) {
//                     return res.status(500).send({ success: false, message: "Error creating back KYC file with Stripe", error: stripeError.message });
//                 }
//                 let token;
//                 try {
//                     token = await stripe.tokens.create({
//                         account: {
//                             individual: {
//                                 dob: {
//                                     day: dob.getDate(),
//                                     month: dob.getMonth() + 1,
//                                     year: dob.getFullYear(),
//                                 },
//                                 first_name: existingUser?.name?.split(" ")[0] || 'Unknown',
//                                 last_name: existingUser?.name?.split(" ")[1] || 'Unknown',
//                                 email: existingUser?.email,
//                                 phone: '+880000000000',// existingUser?.phone ||
//                                 address: {
//                                     city: address.city,
//                                     country: address.country,
//                                     line1: address.line1,
//                                     postal_code: address.postal_code,
//                                 },
//                                 verification: {
//                                     document: {
//                                         front: frontFilePart.id,
//                                         back: backFilePart.id,
//                                     },
//                                 },
//                             },
//                             business_type: "individual",
//                             tos_shown_and_accepted: true,
//                         },
//                     });
//                 } catch (stripeError) {
//                     return res.status(500).send({ success: false, message: "Error creating Stripe token", error: stripeError.message });
//                 }

//                 let account;
//                 try {
//                     account = await stripe.accounts.create({
//                         type: "custom",
//                         account_token: token.id,
//                         capabilities: {
//                             card_payments: { requested: true },
//                             transfers: { requested: true },
//                         },
//                         business_profile: {
//                             mcc: "5970",
//                             name: business_profile.business_name || existingUser.name || 'Unknown',
//                             url: business_profile.website || "www.example.com",
//                         },
//                         external_account: {
//                             object: "bank_account",
//                             account_holder_name: bank_info.account_holder_name,
//                             account_holder_type: bank_info.account_holder_type,
//                             account_number: bank_info.account_number,
//                             country: bank_info.country,
//                             currency: bank_info.currency,
//                         },
//                     });
//                 } catch (stripeError) {
//                     return res.status(500).send({ success: false, message: "Error creating Stripe account", error: stripeError.message });
//                 }

//                 // Save account information if account creation was successful
//                 if (account.id && account.external_accounts.data.length) {
//                     const accountInformation = {
//                         stripeAccountId: account.id,
//                         externalAccountId: account.external_accounts?.data[0].id,
//                         status: true
//                     };
//                     const newStripeAccount = new StripeAccountModel({
//                         name: existingUser?.name || 'Unknown',
//                         email: existingUser?.email,
//                         doctorId: id,
//                         stripeAccountId: account.id,
//                         kycBack: kycBack[0].path,
//                         kycFront: kycFront[0].path,
//                         address: address,
//                         accountInformation: accountInformation
//                     });
//                     const result = await newStripeAccount.save();
//                     return res.status(200).send({ success: true, message: "Account created successfully", data: result });
//                 } else {
//                     return res.status(500).send({ success: false, message: "Failed to create the Stripe account" });
//                 }

//             } catch (error) {
//                 return res.status(500).send({ success: false, message: "Internal server error", error: error.message });
//             }
//         });
//     } catch (error) {
//         return res.status(500).send({ success: false, message: "Internal server error", error: error.message });
//     }
// };

// transfer money
// const TransferBallance = async (req, res) => {
//     try {
//         if (req?.user?.role !== "ADMIN") {
//             return res.status(401).send({ success: false, message: "unauthorized access" })
//         }
//         const { doctorId } = req.query
//         const [GetDoctorPayment, existingStripeAccount] = await Promise.all([
//             PaymentModel.find({ doctorId: doctorId, payment_doctor: false }),
//             StripeAccountModel.findOne({ doctorId: doctorId })
//         ])
//         if (!GetDoctorPayment) {
//             return res.status(404).send({ success: false, message: "No payment found" })
//         }
//         if (!existingStripeAccount) {
//             return res.status(404).send({ success: false, message: "No stripe account found" })
//         }
//         const amount = GetDoctorPayment?.reduce((acc, item) => {
//             return acc + item.amount
//         })
//         const percentage = amount * 5 / 100
//         const totalPayable = amount - percentage
//         const transfer = await stripe.transfers.create(
//             {
//                 amount: totalPayable * 100,
//                 currency: "usd",
//                 destination: existingStripeAccount?.accountInformation?.externalAccountId,
//             },
//             {
//                 stripeAccount: existingStripeAccount?.accountInformation?.stripeAccountId,
//             }
//         )
//         if (transfer.id && payouts.id) {
//             const result = await PaymentModel.updateMany({ doctorId: doctorId, payment_doctor: false }, { $set: { payment_doctor: true } })
//             const DoctorPayment = new DoctorPaymentModel({
//                 doctorId: doctorId,
//                 amount: totalPayable,
//                 transferId: transfer.id,
//                 payoutsId: payouts.id,
//                 status: "success",
//                 fee: percentage
//             })
//             await DoctorPayment.save()
//             return res.status(200).send({ success: true, message: "Payment done successfully", data: result })
//         } else {
//             return res.status(500).send({ success: false, message: "Internal server error" })
//         }
//     } catch (error) {
//         res.status(500).send({ success: false, message: "Internal server error", ...error })
//     }
// }
// get user payment history

//
const TransferBallance = async (req, res) => {
    try {
        if (req?.user?.role !== "ADMIN") {
            return res.status(401).send({ success: false, message: "unauthorized access" })
        }
        const { doctorId, appointmentId } = req.query
        const [GetDoctorPayment, existingStripeAccount, doctor] = await Promise.all([
            Appointment.find({ doctorId: doctorId, _id: appointmentId, doctor_payment: false, status: "completed", payment_status: true }),
            StripeAccountModel.findOne({ doctorId: doctorId }),
            Doctor.findOne({ _id: doctorId })
        ])
        if (!GetDoctorPayment) {
            return res.status(404).send({ success: false, message: "No payment found" })
        }
        if (!existingStripeAccount) {
            return res.status(404).send({ success: false, message: "No stripe account found" })
        }
        if (!doctor) {
            return res.status(404).send({ success: false, message: "Doctor not found" })
        }
        const amount = doctor?.appointment_fee || 0
        const percentage = amount * 3 / 100
        const totalPayable = amount - percentage
        const transfer = await stripe.transfers.create(
            {
                amount: totalPayable * 100,
                currency: "usd",
                destination: existingStripeAccount?.accountInformation?.externalAccountId,
            },
            {
                stripeAccount: existingStripeAccount?.accountInformation?.stripeAccountId,
            }
        )
        if (transfer.id && payouts.id) {
            const result = await PaymentModel.updateMany({ doctorId: doctorId, payment_doctor: false }, { $set: { payment_doctor: true } })
            const DoctorPayment = new DoctorPaymentModel({
                doctorId: doctorId,
                amount: totalPayable,
                transferId: transfer.id,
                payoutsId: payouts.id,
                status: "success",
                fee: percentage
            })
            await DoctorPayment.save()
            return res.status(200).send({ success: true, message: "Payment done successfully", data: result })
        } else {
            return res.status(500).send({ success: false, message: "Internal server error" })
        }
    } catch (error) {
        res.status(500).send({ success: false, message: "Internal server error", ...error })
    }
}
const UserGetPaymentHistory = async (req, res) => {
    try {
        const { id } = req.user;
        const { search, type, status, ...queryKeys } = req.query;
        let populatepaths = ['doctorId', 'userId', 'AppointmentId'];
        let selectField = ['name email phone location _id img specialization appointment_fee', 'name email phone location _id img', 'date'];
        if (req.user?.role === 'DOCTOR') {
            queryKeys.doctorId = id
        } else if (req.user?.role === 'USER') {
            queryKeys.userId = id
        }
        const searchKey = {}
        const result = await Queries(PaymentModel, queryKeys, searchKey, populatePath = populatepaths, selectFields = selectField);
        res.status(200).send({ success: true, message: "Payment history", ...result })
    } catch (error) {
        res.status(500).send({ success: false, message: error?.message || "Internal server error", ...error })
    }
}
// get doctors payment history
const GetDoctorPaymentHistory = async (req, res) => {
    try {
        const { search, ...queryKeys } = req.query;
        const searchKey = {}
        if (req.user?.role === "USER") {
            return res.status(401).send({ success: false, message: "unauthorized access" })
        }
        if (req?.user?.role !== "ADMIN") {
            queryKeys.doctorId = req?.user?.id
        }
        const result = await Queries(DoctorPaymentModel, queryKeys, searchKey);//, populatePath = 'userId'
        res.status(200).send({ ...result })
    } catch (error) {
        res.status(500).send({ success: false, message: "Internal server error", ...error })
    }
}
// see available payment 
const GetAvailablePayment = async (req, res) => {
    try {
        const { search, page, limit, sort } = req.query;
        const queryKeys = { ...req.query };

        if (req.user?.role === "USER") {
            return res.status(401).send({ success: false, message: "Unauthorized access" });
        }
        if (req?.user?.role !== "ADMIN") {
            queryKeys.doctorId = req?.user?.id;
            queryKeys.payment_doctor = false;
        }
        let matchCondition = {
            ...queryKeys,
        };
        delete matchCondition.page;
        delete matchCondition.limit;
        delete matchCondition.sort;

        if (search) {
            matchCondition.$or = [
                { "doctor.name": { $regex: search, $options: 'i' } },
                { "user.name": { $regex: search, $options: 'i' } }
            ];
        }
        let aggregationPipeline = [
            { $match: matchCondition },
            {
                $group: {
                    _id: "$doctorId",
                    totalAmount: { $sum: "$amount" },
                    payments: { $push: "$$ROOT" },
                }
            },
            {
                $lookup: {
                    from: 'doctors',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'doctor'
                }
            },
            { $unwind: "$doctor" },
            {
                $project: {
                    _id: 0,
                    doctorId: "$_id",
                    doctorName: "$doctor.name",
                    totalAmount: 1,
                    payments: 1
                }
            }
        ];
        if (sort) {
            const sortDirection = sort === 'desc' ? -1 : 1;
            aggregationPipeline.push({
                $sort: { totalAmount: sortDirection }
            });
        }

        let totalRecords = await PaymentModel.aggregate([
            { $match: matchCondition },
            { $group: { _id: "$doctorId" } }
        ]);

        if (page && limit) {
            const skip = (parseInt(page) - 1) * parseInt(limit);
            const totalPages = Math.ceil(totalRecords.length / parseInt(limit));

            aggregationPipeline.push({ $skip: skip });
            aggregationPipeline.push({ $limit: parseInt(limit) });

            const result = await PaymentModel.aggregate(aggregationPipeline);

            res.status(200).send({
                success: true,
                message: "Available Payment",
                data: result,
                pagination: {
                    totalRecords: totalRecords.length,
                    totalPages: totalPages,
                    currentPage: parseInt(page),
                    limit: parseInt(limit)
                }
            });
        } else {
            const result = await PaymentModel.aggregate(aggregationPipeline);
            res.status(200).send({
                success: true,
                message: "Available Payment",
                data: result
            });
        }
    } catch (error) {
        res.status(500).send({ success: false, message: "Internal server error", ...error });
    }
};
// get my card status 
const GetMyCard = async (req, res) => {
    try {
        const { id } = req.user;
        const result = await StripeAccountModel.findOne({ doctorId: id });
        res.status(200).send({ success: true, data: result })
    } catch (error) {
        res.status(500).send({ success: false, message: error?.message || "Internal server error", ...error })
    }
}
const GetTotalBalance = async (req, res) => {
    try {
        const { search, ...queryKeys } = req.query;
        const searchKey = {}
        if (req.user?.role === "USER") {
            return res.status(401).send({ success: false, message: "unauthorized access" })
        }
        if (req?.user?.role !== "ADMIN") {
            queryKeys.doctorId = req?.user?.id
        }
        const result = await Queries(PaymentModel, queryKeys, searchKey);
        res.status(200).send({ success: true, message: "Available Payment", data: result })
    } catch (error) {
        res.status(500).send({ success: false, message: "Internal server error", ...error })
    }
}

// const GetAvailablePayment = async (req, res) => {
//     try {
//         const { search, ...queryKeys } = req.query;
//         const searchKey = {}
//         if (req.user?.role === "USER") {
//             return res.status(401).send({ success: false, message: "unauthorized access" })
//         }
//         if (req?.user?.role !== "ADMIN") {
//             queryKeys.doctorId = req?.user?.id
//             queryKeys.payment_doctor = false
//         }

//         // await PaymentModel.updateMany({ doctorId: doctorId, payment_doctor: false },
//         const result = await Queries(PaymentModel, queryKeys, searchKey);
//         res.status(200).send({ success: true, message: "Available Payment", data: result })
//     } catch (error) {
//         res.status(500).send({ success: false, message: "Internal server error", ...error })
//     }
// }
const getStartOfDay = (date) => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    return start;
};

const getStartOfWeek = () => {
    const now = new Date();
    const startOfWeek = new Date();
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
};

const getStartOfMonth = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
};
const TransitionHistoryOverview = async (req, res) => {
    try {
        if (req.user?.role !== "ADMIN") {
            return res.status(401).send({ success: false, message: "Forbidden Access" })
        }
        const today = getStartOfDay(new Date());
        const startOfWeek = getStartOfWeek();
        const startOfMonth = getStartOfMonth();
        const [totalIncome, todayIncome, weeklyIncome, monthlyIncome] = await Promise.all([
            PaymentModel.aggregate([
                { $match: { status: 'success' } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]),
            PaymentModel.aggregate([
                { $match: { status: 'success', createdAt: { $gte: today } } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]),
            PaymentModel.aggregate([
                { $match: { status: 'success', createdAt: { $gte: startOfWeek } } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]),
            PaymentModel.aggregate([
                { $match: { status: 'success', createdAt: { $gte: startOfMonth } } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ])
        ]);

        const data = {
            totalIncome: totalIncome.length ? totalIncome[0].total : 0,
            todayIncome: todayIncome.length ? todayIncome[0].total : 0,
            weeklyIncome: weeklyIncome.length ? weeklyIncome[0].total : 0,
            monthlyIncome: monthlyIncome.length ? monthlyIncome[0].total : 0
        };

        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}


// -------------------------------------------
const createConnectedAccount = async (req, res) => {
    try {
        await uploadFile()(req, res, async (err) => {
            if (err) {
                return res.status(400).send({ success: false, message: "Error uploading file" });
            }

            const { id } = req.user;
            const { data, dateOfBirth } = req.body;
            console.log("Creating", data, dateOfBirth);
            const { bank_info, business_profile, address } = JSON.parse(data);
            const dob = new Date(dateOfBirth);
            const { kycFront, kycBack } = req.files;

            const validationError = validateInputs(address, kycFront, kycBack, dateOfBirth, bank_info);
            if (validationError) return res.status(400).send(validationError);

            try {
                const [existingUser, existingAccount] = await checkUserAndAccount(id);
               
                if (!existingUser) return res.status(404).send({ success: false, message: "Doctor not found" });
                if (existingAccount) return res.status(200).send({ success: false, message: "Account already exists", data: existingAccount });

                const { frontFilePart, backFilePart } = await handleKYCFiles(kycFront, kycBack);
                const token = await createStripeToken(existingUser, dob, address, frontFilePart, backFilePart);

                console.log("token", token);
                
                const account = await createStripeAccount(token, bank_info, business_profile, existingUser);
                console.log("account", account);

                if (account.id && account.external_accounts.data.length) {
                    const result = await saveStripeAccount(account, existingUser, id, address, kycFront, kycBack, dob);
                    return res.status(200).send({ success: true, message: "Account created successfully", data: result });
                } else {
                    return res.status(500).send({ success: false, message: "Failed to create the Stripe account" });
                }

            } catch (error) {
                return res.status(500).send({ success: false, message: "Internal server error", error: error.message });
            }
        });
    } catch (error) {
        return res.status(500).send({ success: false, message: "Internal server error", error: error.message });
    }
};

const validateInputs = (address, kycFront, kycBack, dateOfBirth, bank_info) => {
    if (!address?.postal_code || !address?.city || !address?.country) {
        return { success: false, message: "Country, city, and postal code are required" };
    }
    if (!kycBack || !kycFront || kycBack.length === 0 || kycFront.length === 0) {
        return { success: false, message: "Two KYC files are required" };
    }
    if (!dateOfBirth || !bank_info || !bank_info?.account_number || !bank_info?.account_holder_name) {
        return { success: false, message: "Date of birth, business profile, and bank info fields are required" };
    }
    return null;
};

const checkUserAndAccount = async (doctorId) => {
    return Promise.all([
        Doctor.findOne({ _id: doctorId }),
        StripeAccountModel.findOne({ doctorId }),
    ]);
};

const handleKYCFiles = async (kycFront, kycBack) => {
    let frontFileData, backFileData;
    try {
        frontFileData = fs.readFileSync(kycFront[0]?.path);
        backFileData = fs.readFileSync(kycBack[0]?.path);
    } catch (fileError) {
        throw new Error("Error reading KYC files: " + fileError.message);
    }

    const frontFilePart = await createStripeFile(frontFileData, kycFront[0]);
    const backFilePart = await createStripeFile(backFileData, kycBack[0]);

    return { frontFilePart, backFilePart };
};

const createStripeFile = async (fileData, file) => {
    try {
        return await stripe.files.create({
            purpose: "identity_document",
            file: {
                data: fileData,
                name: file.filename,
                type: file.mimetype,
            },
        });
    } catch (error) {
        throw new Error("Error creating KYC file with Stripe: " + error.message);
    }
};

const createStripeToken = async (user, dob, address, frontFilePart, backFilePart) => {
    try {
        return await stripe.tokens.create({
            account: {
                individual: {
                    dob: {
                        day: dob.getDate(),
                        month: dob.getMonth() + 1,
                        year: dob.getFullYear(),
                    },
                    first_name: user?.name?.split(" ")[0] || 'Unknown',
                    last_name: user?.name?.split(" ")[1] || 'Unknown',
                    email: user?.email,
                    phone: '+880000000000', // Replace with actual phone if available
                    address: {
                        city: address.city,
                        country: address.country,
                        line1: address.line1,
                        postal_code: address.postal_code,
                    },
                    verification: {
                        document: {
                            front: frontFilePart.id,
                            back: backFilePart.id,
                        },
                    },
                },
                business_type: "individual",
                tos_shown_and_accepted: true,
            },
        });
    } catch (error) {
        throw new Error("Error creating Stripe token: " + error.message);
    }
};

const createStripeAccount = async (token, bank_info, business_profile, user) => {
    try {
        const resData = await stripe.accounts.create({
            type: "custom",
            account_token: token.id,
            capabilities: {
                card_payments: { requested: true },
                transfers: { requested: true },
            },
            business_profile: {
                mcc: "5970", // Ensure this MCC is correct for your business type
                name: business_profile.business_name || user.name || 'Unknown',
                url: business_profile.website || "www.example.com",
            },
            external_account: {
                object: "bank_account",
                account_holder_name: bank_info.account_holder_name,
                account_holder_type: bank_info.account_holder_type,
                account_number: bank_info.account_number,
                country: bank_info.country,
                currency: bank_info.currency,
            },
        });

        return resData; // Return the response data
    } catch (error) {
        console.error("Error creating Stripe account:", error);
        throw new Error("Error creating Stripe account: " + error.message);
    }
};

const saveStripeAccount = async (account, user, doctorId, address, kycFront, kycBack, dob) => {
    const formattedAddress = `${address.line1}, ${address.city}, ${address.country}, ${address.postal_code}`;
    const dobFormatted = dob.toISOString(); // Convert date to ISO string

    const accountInformation = {
        stripeAccountId: account.id,
        externalAccountId: account.external_accounts?.data[0].id,
        status: true,
    };

    const newStripeAccount = new StripeAccountModel({
        name: user?.name || 'Unknown',
        email: user?.email,
        doctorId: doctorId,
        stripeAccountId: account.id,
        kycBack: kycBack[0].path,
        kycFront: kycFront[0].path,
        address: formattedAddress, // Use formatted address
        dob: dobFormatted, // Make sure dob is included
        accountInformation: accountInformation,
    });

    return await newStripeAccount.save();
};



module.exports = { Payment, SavePayment, createConnectedAccount, TransferBallance, UserGetPaymentHistory, GetDoctorPaymentHistory, GetAvailablePayment, GetMyCard, TransitionHistoryOverview }


