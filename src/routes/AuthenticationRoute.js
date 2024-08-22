
const { SignUp, SignIn, UpdateUser, ChangePassword, SendVerifyEmail, VerifyCode, ResetPassword, GetProfile, createDoctor, updateDoctor, DoctorSignIn, } = require('../Controller/AuthenticationController');
const VerificationToken = require('../middlewares/Token/VerificationToken');
const verifyToken = require('../middlewares/Token/verifyToken');
const AuthRoute = require('express').Router()

AuthRoute.post('/sign-up', SignUp).post('/sign-in', SignIn).post('/doctor-sign-in',DoctorSignIn).post('/send-verify-email', SendVerifyEmail).post('/verify-code', VerifyCode).post('/reset-password', VerificationToken, ResetPassword).patch('/update-user/:id', verifyToken, UpdateUser).patch('/change-password', verifyToken, ChangePassword).get('/profile', verifyToken, GetProfile).post('/doctor-sign-up', createDoctor).patch('/update-doctor/:doctorId', verifyToken, updateDoctor)

module.exports = AuthRoute