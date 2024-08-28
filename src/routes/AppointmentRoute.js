const { CreateAppointment, GetAllAppointments, UpdateAppointments, DeleteAppointment, GetSingleAppointment } = require('../Controller/AppoinmentController')
const verifyToken = require('../middlewares/Token/verifyToken')

const AppointmentRoute = require('express').Router()
AppointmentRoute.get('/get-my-appointments', verifyToken, GetAllAppointments).post('/create-appointment/:doctorId', verifyToken, CreateAppointment).patch('/update-appointment/:doctorId', verifyToken, UpdateAppointments).delete('/delete-appointment/:appointmentId', verifyToken, DeleteAppointment).get('/get-single-appointments/:appointmentId', verifyToken, GetSingleAppointment)
module.exports = AppointmentRoute