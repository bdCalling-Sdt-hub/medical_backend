const { GetDoctorOverview, GetAdminOverview, GetIncomeOverview, GetAppointmentOverview } = require('../Controller/OverviewController')
const verifyToken = require('../middlewares/Token/verifyToken')

const OverViewRoutes = require('express').Router()
OverViewRoutes.get('/doctor-overview', verifyToken, GetDoctorOverview).get('/admin-overview', verifyToken, GetAdminOverview).get('/income-overview', verifyToken,GetIncomeOverview).get('/appointment-overview', verifyToken,GetAppointmentOverview)
module.exports = OverViewRoutes