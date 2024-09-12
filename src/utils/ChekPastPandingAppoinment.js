const Appointment = require("../Models/AppointmentModel");

const checkPastPendingAppointments = async () => {
    try {
        const now = new Date();
        const appointments = await Appointment.find({
            status: 'pending',
            date: { $lt: now }
        });
        if (appointments.length > 0) {
            console.log(`Found ${appointments.length} pending appointments with a past date.`);
            for (let appointment of appointments) {
                await Appointment.updateOne({ _id: appointment._id }, { status: 'rejected' });
                console.log(`Updated appointment ${appointment._id} status to rejected.`);
            }
        } else {
            console.log('No pending appointments with a past date found.');
        }
    } catch (error) {
        console.error('Error checking past pending appointments:', error);
    }
};

module.exports = checkPastPendingAppointments;
