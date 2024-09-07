const { ACCESS_TOKEN_SECRET } = require("../config/defaults");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const uploadFile = require("../middlewares/FileUpload/FileUpload");
const HashPassword = require("../utils/HashPassword");
const SendEmail = require("../utils/SendMail");
const Verification = require("../Models/VerificationCodeModel");
const User = require("../Models/UserModel");
const FormateErrorMessage = require("../utils/FormateErrorMessage");
const Doctor = require("../Models/DoctorModel");
const UnlinkFiles = require("../middlewares/FileUpload/UnlinkFiles");
const Queries = require("../utils/Queries");
const Category = require("../Models/CategoryModel");
const { generateTimeSlots } = require("../utils/GenarateTime");
const FormateRequiredFieldMessage = require("../utils/FormateRequiredFieldMessage");
const checkMissingDays = require("../utils/AvailableForValidation");
const Appointment = require("../Models/AppointmentModel");
// Clear Cookie


// signUp
const SignUp = async (req, res) => {
    try {
        const { access, confirm_password, password, ...user } = req.body
        if (confirm_password !== password) {
            return res.status(201).send({ success: false, message: "confirm password doesn't match" });
        }
        const email = user?.email
        const existingUsers = await User.findOne({ email: email, verified: false })
        if (existingUsers) {
            const activationCode = Math.floor(100000 + Math.random() * 900000).toString();
            const code = new Verification({
                email: existingUsers?.email,
                code: activationCode
            })
            await code.save();
            SendEmail({
                sender: 'Medical',
                receiver: existingUsers?.email,
                subject: 'verify code',
                msg: `<h1>
            hallow ${existingUsers?.name} 
            </h1/>
            <p>you have successfully registered our website</p>
            <p>now you can explore more of your website</p>
            <p>please verify your email with this code : <strong>${activationCode}</strong></p>
            <h1>medical</h1>
            `,
            })
            return res.status(200).send({ success: true, data: existingUsers, message: 'user already exist a verification email has been sent to your email' });
        }
        let existingAdmin;
        let category;
        if (req.body?.role) {
            [category, existingAdmin] = await Promise.all([
                Category.find(),
                Queries(User, {}, { role: req.body.role })
            ]);
        }
        else {
            category = await Category.find()
        }
        if (existingAdmin?.data?.length > 0) {
            return res.status(201).send({ success: false, message: "admin already exist" });
        }
        if (!user.category && category) {
            user.category = category?.[0]?.name
        } else if (!user.category && !category) {
            user.category = []
        }
        const newUser = new User({ ...user, password });
        const savedUser = await newUser.save();
        if (savedUser?._id) {
            const activationCode = Math.floor(100000 + Math.random() * 900000).toString();
            const code = new Verification({
                email: savedUser?.email,
                code: activationCode
            })
            await code.save();
            //send mail
            SendEmail({
                sender: 'Medical',
                receiver: savedUser?.email,
                subject: 'register user successfully',
                msg: `<h1>
                hallow ${savedUser?.name} 
                </h1/>
                <p>you have successfully registered our website</p>
                <p>now you can explore more of your website</p>
                <p>please verify your email with this code : <strong>${activationCode}</strong></p>
                <h1>medical</h1>
                `,
            })

            return res.status(200).send({
                success: true, data: savedUser, message: 'user created successfully and verification code sent to your email',
            });
        } else {
            res.status(201).send({ success: false, message: 'something went wrong' });
        }
    } catch (error) {
        let duplicateKeys = ''
        if (error?.keyValue) {
            duplicateKeys = FormateErrorMessage(error)
            error.duplicateKeys = duplicateKeys
        }
        let requiredField = []
        if (error?.errors) {
            requiredField = FormateRequiredFieldMessage(error?.errors);
            error.requiredField = requiredField;
        }
        res.status(500).send({ success: false, message: requiredField[0] || duplicateKeys || 'Internal server error', ...error });
    }

}

// login 
const SignIn = async (req, res) => {
    try {
        const { email, password } = req.body
        const [user, doctor] = await Promise.all([
            User.findOne({ email: email }),
            Doctor.findOne({ email: email })
        ])
        if (user || doctor) {
            let result
            if (user) {
                result = await bcrypt.compare(password, user?.password);
            } else if (doctor) {
                result = await bcrypt.compare(password, doctor?.password);
            } else {
                return res.status(400).send({ success: false, message: "user doesn't exist" });
            }
            if (result) {
                if ((user && !user?.verified) || (doctor && !doctor?.verified)) {
                    const activationCode = Math.floor(100000 + Math.random() * 900000).toString();
                    const code = new Verification({
                        email: doctor?.email || user?.email,
                        code: activationCode
                    })
                    await code.save();
                    return res.status(400).send({ success: false, data: user || doctor, message: "please verify your email a verification code sent to your email" });
                }
                const userData = {
                    email: user?.email || doctor?.email,
                    phone: user?.phone || doctor?.phone,
                    verified: user?.verified || doctor?.verified,
                    name: user?.name || doctor?.name,
                    role: user?.role || doctor?.role,
                    access: user?.access || doctor?.access,
                    id: user?._id || doctor?._id
                }
                const token = await jwt.sign(userData, ACCESS_TOKEN_SECRET, { expiresIn: 36000000 });
                res.status(200).send({
                    success: true, message: 'login successfully', data: user || doctor, token

                });
            } else {
                res.status(400).send({ success: false, message: "Wrong password" });
            }
        } else {
            res.status(400).send({ success: false, message: "user doesn't exist" });
        }
    } catch (error) {
        res.status(500).send({ success: false, message: error?.message || 'Internal server error', ...error });
    }
}
// login  doctor
const DoctorSignIn = async (req, res) => {
    try {
        const { email, password } = req.body
        //console.log(req.body)
        const user = await Doctor.findOne({ email: email })
        if (user) {
            const result = await bcrypt.compare(password, user?.password);
            if (result) {
                const userData = {
                    email: user?.email,
                    phone: user?.phone,
                    verified: user?.verified,
                    name: user?.name,
                    role: user?.role,
                    access: user?.access,
                    id: user?._id
                }
                const token = await jwt.sign(userData, ACCESS_TOKEN_SECRET, { expiresIn: 36000000 });
                res.status(200).send({
                    success: true, data: user, token

                });
            } else {
                res.status(400).send({ success: false, error: { message: "Wrong Credentials" } });
            }
        } else {
            res.status(400).send({ success: false, message: "user doesn't exist" });
        }
    } catch (error) {
        res.status(500).send({ success: false, message: error?.message || 'Internal server error', ...error, });
    }
}

//update user
const UpdateUser = async (req, res) => {
    const { id } = req?.user
    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).send({ success: false, message: 'User not found' });
        }
        await uploadFile()(req, res, async function (err) {
            if (err) {
                return res.status(400).send({ success: false, message: err.message });
            }
            try {
                const { access, role, email, password, category, ...data } = req.body;
                const { img } = req.files || {};
                if (err) {
                    return res.status(400).send({ success: false, message: err.message || 'Something went wrong', ...err });
                }
                if (req?.files?.img) {
                    data.img = req.files.img[0]?.path
                }
                if (category) {
                    data.category = JSON.parse(category)
                }
                const result = await User.updateOne({ _id: id }, {
                    $set: {
                        ...data,
                        img: img?.[0]?.path || user?.img,

                    }
                })
                if (user?.img) {
                    UnlinkFiles([user?.img]);
                }
                res.status(200).send({ success: true, data: result, message: 'Profile Updated Successfully' });
            } catch (error) {
                return res.status(500).send({ success: false, ...error, message: error?.message || 'Internal server error', });
            }
        });
    } catch (error) {
        res.status(500).send({ success: false, ...error, message: error?.message || 'Internal server error', });
    }
}

// change password 
const ChangePassword = async (req, res) => {
    try {
        const { old_Password, password, confirm_password } = req.body;
        if (password !== confirm_password) {
            return res.status(201).send({ success: false, message: "confirm password doesn't match" });
        }
        const { id, role } = req?.user
        //console.log(id, { old_Password, password })
        if (old_Password === password) {
            return res.status(403).send({ success: false, message: "new password cannot be your old password", });
        }
        let user;
        if (role === 'DOCTOR') {
            user = await Doctor.findById(id);
        } else {
            user = await User.findById(id);
        }
        const newPasswordCheck = await bcrypt.compare(password, user?.password);
        if (newPasswordCheck) {
            return res.status(403).send({ success: false, message: "new password cannot be your old password", });
        }
        const CheckPassword = await bcrypt.compare(old_Password, user?.password);
        //console.log(CheckPassword)
        if (CheckPassword) {
            const hash_pass = await HashPassword(password)
            let result;
            if (role === 'DOCTOR') {
                result = await Doctor.updateOne({ _id: id }, {
                    $set: {
                        password: hash_pass
                    }
                })
            } else {
                await User.updateOne({ _id: id }, {
                    $set: {
                        password: hash_pass
                    }
                })
            }
            SendEmail({
                sender: 'medical',
                receiver: user?.email,
                subject: 'password Changed successfully',
                msg: `<h1> hallow ${user?.name} </h1/>
                <p>your password has been changed</p>
                <p>your new password : ${password} </p>
                <p>Thank you </p>
                <h1>medical</h1>
                `,
            })
            return res.status(200).send({ success: true, message: 'password updated successfully', data: result });
        } else {
            return res.status(403).send({ success: false, message: "old password doesn't match", });
        }
    } catch (error) {
        res.status(500).send({ success: false, message: error?.message || 'Internal server error', ...error });
    }
}

// forget password send verification code
const SendVerifyEmail = async (req, res) => {
    try {
        const { email } = req.body
        if (!email) {
            return res.status(400).send({ success: false, message: 'invalid email' });
        }
        let user = {}
        const [doctor, normalUser] = await Promise.all([
            Doctor.findOne({ email: email }),
            User.findOne({ email: email })
        ])
        if (normalUser || doctor) {
            if (normalUser) {
                user = normalUser
            } else {
                user = doctor
            }
            if (!user?.email) {
                return res.status(400).send({ success: false, message: 'email not found' });
            }
            const activationCode = Math.floor(100000 + Math.random() * 900000).toString();
            const code = new Verification({
                email: email,
                code: activationCode
            })
            const result = await code.save()
            if (result?._id) {
                SendEmail({
                    sender: 'medical',
                    receiver: user?.email,
                    subject: 'verification email',
                    msg: `<h1> hallow ${user?.name} </h1/>
                <p>your password reset code is : <strong>${activationCode}</strong> </p>
                <p>Thank you </p>
                <h1>medical</h1>
                `,
                })
                //console.log(email)
                res.status(200).send({ success: true, message: `verification code has been sent to ${email}`, });
            }
        }
        else {
            res.status(400).send({ success: false, message: 'email not found' });
        }
    } catch (error) {
        res.status(500).send({ success: false, message: error?.message || 'Internal server error', ...error });
    }
}

//verify code
const VerifyCode = async (req, res) => {
    const { code, email } = req.body;
    try {
        const [verify, user, doctor] = await Promise.all([
            Verification.findOne({ email: email, code: code }),
            User.findOne({ email: email }),
            Doctor.findOne({ email: email })
        ])

        if (verify?._id) {
            let type;
            if (user) {
                type = 'USER'
            } else if (doctor) {
                type = 'DOCTOR'
            }
            if (type === 'DOCTOR') {
                await Doctor.updateOne({ email: email }, {
                    $set: {
                        verified: true
                    }
                })
            } else {
                await User.updateOne({ email: email }, {
                    $set: {
                        verified: true
                    }
                })
            }
            const userData = {
                email: user?.email || doctor?.email,
                phone: user?.phone || doctor?.phone,
                verified: user?.verified || doctor?.verified,
                name: user?.name || doctor?.name,
                role: user?.role || doctor?.role,
                access: user?.access || doctor?.access,
                id: user?._id || doctor?._id
            }
            const token = await jwt.sign(userData, ACCESS_TOKEN_SECRET, { expiresIn: 36000000 });
            const accessToken = await jwt.sign({ code, email }, ACCESS_TOKEN_SECRET, { expiresIn: 600 });
            res.status(200).send({ success: true, accessToken, token, message: `${type || 'user'} verified successfully` })
        } else {
            res.status(401).send({ success: false, message: "verification code doesn't match" });
        }
    } catch (error) {
        res.status(500).send({ success: false, error: { error, message: error?.message || 'Internal server error', } });
    }
}

//reset password
const ResetPassword = async (req, res) => {
    try {
        const requestedUser = req?.user
        const verify = await Verification.findOne({ email: requestedUser?.email, code: requestedUser?.code })
        if (verify?._id) {
            const { password, confirm_password, type } = req.body
            if (password !== confirm_password) {
                return res.status(201).send({ success: false, error: { message: "confirm password doesn't match" } });
            }
            const hash_pass = await HashPassword(password)
            //console.log(hash_pass)
            let result;
            if (type === 'DOCTOR') {
                result = await Doctor.updateOne({ email: verify?.email }, {
                    $set: {
                        password: hash_pass
                    }
                })
            } else {
                result = await User.updateOne({ email: verify?.email }, {
                    $set: {
                        password: hash_pass
                    }
                })
            }
            SendEmail({
                sender: 'medical',
                receiver: requestedUser?.email,
                subject: 'password reset successfully',
                msg: `<h1> hallow ${requestedUser?.name} </h1/>
            <p>your password has been changed</p>
            <p>your new password : ${password} </p>
            <p>Thank you </p>
            <h1>medical</h1>
            `,
            })
            await Verification.deleteOne({ email: requestedUser?.email, code: requestedUser?.code })
            return res.status(200).send({ success: true, message: 'password updated successfully', data: result });
        } else {
            res.status(401).send({ success: false, message: "verification code doesn't match" });
        }

    } catch (error) {
        res.status(500).send({ success: false, message: error?.message || 'Internal server error', ...error });
    }
}

// get user profile
const GetProfile = async (req, res) => {
    const { email, role } = req.user;
    try {
        if (role === 'DOCTOR') {
            const result = await Doctor.findOne({ email: email })
            const total_appointments = await Appointment.countDocuments({ doctorId: result?._id, status: "completed" })
            const data = {
                ...result?._doc,
                total_appointments: total_appointments || 0
            }
            return res.status(200).send({ success: true, data });
        } else {
            const result = await User.findOne({ email: email })
            return res.status(200).send({ success: true, data: result });
        }
    } catch (error) {
        res.status(500).send({ success: false, message: error?.message || 'Internal server error', ...error });
    }
}

// create  doctors
const createDoctor = async (req, res) => {
    try {
        await uploadFile()(req, res, async function (err) {
            if (err) {
                console.error(err);
                return res.status(400).send({ success: false, message: err.message });
            }
            try {
                const { available_days, available_for, ...otherInfo } = req.body
                const email = otherInfo?.email
                const existingDoctor = await Doctor.findOne({ email: email, verified: false })
                if (existingDoctor) {
                    const activationCode = Math.floor(100000 + Math.random() * 900000).toString();
                    const code = new Verification({
                        email: existingDoctor?.email,
                        code: activationCode
                    })
                    await code.save();
                    SendEmail({
                        sender: 'Medical',
                        receiver: existingDoctor?.email,
                        subject: 'verify code',
                        msg: `<h1>
                    hallow ${existingDoctor?.name} 
                    </h1/>
                    <p>you have successfully registered our website</p>
                    <p>now you can explore more of your website</p>
                    <p>please verify your email with this code : <strong>${activationCode}</strong></p>
                    <h1>medical</h1>
                    `,
                    })
                    return res.status(400).send({ success: false, data: existingDoctor, message: 'user already exist a verification email has been sent to your email' });
                }
                const available_days_purse = JSON.parse(available_days)
                const available_for_purse = JSON.parse(available_for)
                // console.log(available_for_purse, available_days_purse,otherInfo)
                // return res.send({ available_days: JSON.parse(available_days), available_for: JSON.parse(available_for) })
                const { img, license } = req.files || {};
                if (!available_days_purse || Object.keys(available_days_purse).length === 0) {
                    return res.status(400).send({ success: false, message: 'available days are required' });
                }
                let data = {}
                let timeError = {};

                Object.keys(available_days_purse).forEach((key) => {
                    if ((!available_days_purse[key]?.startTime && available_days_purse[key]?.endTime) || (available_days_purse[key]?.startTime && !available_days_purse[key]?.endTime)) {
                        timeError = { message: `missing ${available_days_purse[key]?.startTime ? 'endTime' : 'startTime'} for ${key}` }
                    } else if ((available_days_purse[key]?.startTime && available_days_purse[key]?.endTime) && (available_days_purse[key]?.startTime === available_days_purse[key]?.endTime)) {
                        timeError = { message: `invalid ${available_days_purse[key]?.startTime ? 'endTime' : 'startTime'} for ${key}` }
                    } else if (available_days_purse[key]?.startTime && available_days_purse[key]?.endTime) {
                        try {
                            const timeSlots = generateTimeSlots(available_days_purse[key]?.startTime, available_days_purse[key]?.endTime)
                            data[key] = timeSlots
                        } catch (error) {
                            return res.status(400).send({ success: false, message: error.message })
                        }
                    }
                })
                if (timeError?.message) {
                    return res.status(400).send({ success: false, message: timeError?.message })
                }
                const availableDaysCheck = checkMissingDays(data, available_for_purse)
                if (availableDaysCheck) {
                    return res.status(400).send({ success: false, message: "There are days in 'data' that don't exist in 'availableTime" })
                }
                const doctorData = {
                    ...otherInfo,
                    available_for: available_for_purse,
                    available_days: data,
                    img: img?.[0]?.path || '',
                    license: license?.[0]?.path || ''
                };
                try {
                    const newDoctor = new Doctor(doctorData);
                    await newDoctor.save();
                    const activationCode = Math.floor(100000 + Math.random() * 900000).toString();
                    const code = new Verification({
                        email: newDoctor?.email,
                        code: activationCode
                    })
                    await code.save();
                    SendEmail({
                        sender: 'Medical',
                        receiver: newDoctor?.email,
                        subject: 'register user successfully',
                        msg: `<h1>
                    hallow ${newDoctor?.name} 
                    </h1/>
                    <p>you have successfully registered our website</p>
                    <p>now you can explore more of your website</p>
                    <p>please verify your email with this code : <strong>${activationCode}</strong></p>
                    <h1>medical</h1>
                    `,
                    })
                    res.status(201).send({ success: true, message: 'doctor created successfully a verification code sent to your email', data: newDoctor });
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
            } catch (error) {
                return res.status(500).send({ success: false, message: error?.message || 'Internal server error', ...error });
            }
        });
    } catch (error) {
        res.status(500).send({ success: false, ...error, message: error?.message || 'Internal server error', });
    }
};

// update doctor 
const updateDoctor = async (req, res) => {
    const { doctorId } = req.params;

    try {
        if (req.user.role !== 'ADMIN' && req.user.id !== doctorId) {
            return res.status(401).send({ success: false, message: 'unauthorized access' });

        }
        await uploadFile()(req, res, async function (err) {
            if (err) {
                return res.status(400).send({ success: false, message: err.message });
            }
            const { role, access, email, password, available_for, available_days, ...otherInfo } = req.body;
            const { img, license } = req.files || {};
            let data = {}
            let timeError = {};
            try {
                const doctor = await Doctor.findById(doctorId);
                if (!doctor) {
                    return res.status(404).send({ success: false, message: 'Doctor not found' });
                }
                let available_for_purse;
                let available_days_purse;
                if (available_for) {
                    available_for_purse = JSON.parse(available_for);
                }
                if (available_days) {
                    available_days_purse = JSON.parse(available_days);
                }
                if (available_days_purse && Object.keys(available_days_purse).length === 0) {
                    return res.status(400).send({ success: false, message: 'available days are required' });
                }
                // console.log({ available_days_purse, available_for_purse })
                if (available_days_purse) {
                    Object.keys(available_days_purse).forEach((key) => {
                        if ((!available_days_purse[key]?.startTime && available_days_purse[key]?.endTime) || (available_days_purse[key]?.startTime && !available_days_purse[key]?.endTime)) {
                            timeError = { message: `missing ${available_days_purse[key]?.startTime ? 'endTime' : 'startTime'} for ${key}` }
                        } else if ((available_days_purse[key]?.startTime && available_days_purse[key]?.endTime) && (available_days_purse[key]?.startTime === available_days_purse[key]?.endTime)) {
                            timeError = { message: `invalid ${available_days_purse[key]?.startTime ? 'endTime' : 'startTime'} for ${key}` }
                        } else if (available_days_purse[key]?.startTime && available_days_purse[key]?.endTime) {
                            try {
                                const timeSlots = generateTimeSlots(available_days_purse[key]?.startTime, available_days_purse[key]?.endTime)
                                data[key] = timeSlots
                            } catch (error) {
                                return res.status(400).send({ success: false, message: error.message || 'invalid time' })
                            }
                        }
                    })
                }
                if (timeError?.message) {
                    return res.status(400).send({ success: false, message: timeError?.message })
                }
                const availableDaysCheck = checkMissingDays(data, available_for_purse || doctor?.available_for)
                if (availableDaysCheck) {
                    return res.status(400).send({ success: false, message: "There are days in 'data' that don't exist in 'availableTime" })
                }
                const filesToDelete = [];
                if (doctor.img) {
                    filesToDelete.push(doctor.img);
                }
                if (doctor.license) {
                    filesToDelete.push(doctor.license);
                }
                const result = await Doctor.updateOne({ _id: doctorId }, {
                    $set: {
                        ...otherInfo,
                        available_for: available_for_purse,
                        available_days: Object.keys(data).length === 0 ? doctor.available_days : data,
                        img: img?.[0]?.path || doctor.img,
                        license: license?.[0]?.path || doctor.license
                    }
                })
                UnlinkFiles(filesToDelete);

                res.status(200).send({ success: true, result, message: 'Doctor updated successfully' });
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
        });
    } catch (error) {
        res.status(500).send({ success: false, ...error, message: error?.message || 'Internal server error', });
    }
};

module.exports = {
    SignUp,
    SignIn,
    UpdateUser,
    ChangePassword,
    SendVerifyEmail,
    ResetPassword,
    VerifyCode,
    GetProfile,
    createDoctor,
    updateDoctor,
    DoctorSignIn
}