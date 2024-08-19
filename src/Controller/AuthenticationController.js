const { ACCESS_TOKEN_SECRET } = require("../config/defaults");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const uploadFile = require("../middlewares/FileUpload/FileUpload");
const HashPassword = require("../utils/HashPassword");
const SendEmail = require("../utils/SendMail");
const Verification = require("../Models/VerificationCodeModel");
const User = require("../Models/UserModel");
const FormateErrorMessage = require("../utils/FormateErrorMessage");
// Clear Cookie


// signUp
const SignUp = async (req, res) => {
    try {
        const { access, role, confirm_password, password, ...user } = req.body
        if (confirm_password !== password) {
            return res.status(201).send({ success: false, error: { message: "confirm password doesn't match" } });
        }
        const newUser = new User({ ...user, password });
        const savedUser = await newUser.save();
        if (savedUser?._id) {
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
                <h1>medical</h1>
                `,
            })
            return res.status(200).send({
                success: true, date: savedUser,

            });
        } else {
            res.status(201).send({ success: false, error: { message: 'something went wrong' } });
        }
    } catch (error) {
        const duplicateKeys = FormateErrorMessage(error)
        error.duplicateKeys = duplicateKeys
        res.status(500).send({ success: false, message: 'Internal server error', ...error });
    }

}

// login 
const SignIn = async (req, res) => {
    try {
        const { email, password } = req.body
        console.log(req.body)
        const user = await User.findOne({ email: email })
        if (user) {
            const result = await bcrypt.compare(password, user?.password);
            if (result) {
                const userData = {
                    email: user?.email,
                    phone: user?.phone,
                    verified: user?.verified,
                    role: user?.role,
                    access: user?.access,
                    id: user?._id
                }
                const token = await jwt.sign(userData, ACCESS_TOKEN_SECRET, { expiresIn: '5h' });
                res.status(200).send({
                    success: true, date: user, token

                });
            } else {
                res.status(400).send({ success: false, error: { message: "Wrong Credentials" } });
            }
        } else {
            res.status(400).send({ success: false, message: "user doesn't exist" });
        }
    } catch (error) {
        res.status(500).send({ success: false, message: 'Internal server error', error: { error: error, message: 'Internal server error' } });
    }
}

//update user
const UpdateUser = async (req, res) => {
    const { access, role, ...user } = req.body;
    try {
        const uploadMiddleware = uploadFile('images/profile');
        uploadMiddleware(req, res, async (err) => {
            if (err) {
                return res.status(400).send({ success: false, message: err.message, error: err });
            }
            if (req?.files?.img) {
                let img = req.files.img[0]?.path
                const result = await User.updateOne({ _id: id }, {
                    $set: {
                        ...user,
                        img
                    }
                })
                res.send({ success: true, data: result });
            } else {
                const result = await User.updateOne({ _id: req?.user?.id }, {
                    $set: {
                        ...user,
                        img
                    }
                })
                res.status(200).send({ success: true, data: result });
            }
        });
    } catch (error) {
        res.status(500).send({ success: false, error: { error, message: 'Internal server error' } });
    }
}

// change password 
const ChangePassword = async (req, res) => {
    try {
        const { old_Password, password } = req.body;
        const { id } = req?.user
        console.log(id, { old_Password, password })
        if (old_Password === password) {
            return res.status(403).send({ success: false, error: { message: "new password cannot be your old password", } });
        }
        const user = await User.findOne({ _id: id })
        const CheckPassword = await bcrypt.compare(old_Password, user?.password);
        console.log(CheckPassword)
        if (CheckPassword) {
            const hash_pass = await HashPassword(password)
            const result = await User.updateOne({ _id: id }, {
                $set: {
                    password: hash_pass
                }
            })
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
            return res.status(403).send({ success: false, error: { message: "old password doesn't match", } });
        }
    } catch (error) {
        res.status(500).send({ success: false, message: 'Internal server error', error: error });
    }
}

// forget password send verification code
const SendVerifyEmail = async (req, res) => {
    try {
        const { email } = req.body
        if (!email) {
            return res.status(400).send({ success: false, message: 'invalid email' });
        }
        const user = await User.findOne({ email: email })
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
                subject: 'register user successfully',
                msg: `<h1> hallow ${user?.name} </h1/>
                <p>your password reset code is : <strong>${activationCode}</strong> </p>
                <p>Thank you </p>
                <h1>medical</h1>
                `,
            })
            console.log(email)
            res.status(200).send({ success: true, message: `verification code has been sent to ${email}`, });
        }
    } catch (error) {
        res.status(500).send({ success: false, error: { message: 'Internal server error', error: error } });
    }
}

//verify code
const VerifyCode = async (req, res) => {
    const { code, email } = req.body
    try {
        const verify = await Verification.findOne({ email: email, code: code })
        if (verify?._id) {
            await User.updateOne({ email: email }, {
                $set: {
                    verified: true
                }
            })
            const accessToken = await jwt.sign({ code, email }, ACCESS_TOKEN_SECRET, { expiresIn: 600 });
            res.status(200).send({ success: true, accessToken, message: "user verified successfully" })
        } else {
            res.status(401).send({ success: false, message: "verification code doesn't match" });
        }
    } catch (error) {
        res.status(500).send({ success: false, error: { error, message: 'Internal server error', } });
    }
}

//reset password
const ResetPassword = async (req, res) => {
    try {
        const requestedUser = req?.user
        const verify = await Verification.findOne({ email: requestedUser?.email, code: requestedUser?.code })
        if (verify?._id) {
            const { password, confirm_password } = req.body
            if (password !== confirm_password) {
                return res.status(201).send({ success: false, error: { message: "confirm password doesn't match" } });
            }
            const hash_pass = await HashPassword(password)
            console.log(hash_pass)
            const result = await User.updateOne({ email: verify?.email }, {
                $set: {
                    password: hash_pass
                }
            })
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
        res.status(500).send({ success: false, error: { message: 'Internal server error', error } });
    }
}

// get user profile
const GetProfile = async (req, res) => {
    const { id } = req.user;
    try {
        const result = await User.findOne({ _id: id })
        res.status(200).send({ success: true, data: result });
    } catch (error) {
        res.status(500).send({ success: false, error: { message: 'Internal server error', error } });
    }
}

module.exports = {
    SignUp,
    SignIn,
    UpdateUser,
    ChangePassword,
    SendVerifyEmail,
    ResetPassword,
    VerifyCode,
    GetProfile
}