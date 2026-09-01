// services/cronReminder.js
const cron = require("node-cron");
const Booking = require("../models/booking.js");
const { sendSMS } = require("../utils/smsService.js");

function initRenewalCron() {
    // Runs every day at 09:00 AM IST
    cron.schedule("0 9 * * *", async () => {
        console.log("Running Daily PUC 6-Month Expiry Check...");

        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // 1. Check for bookings expiring in exactly 7 days
            const in7DaysStart = new Date(today);
            in7DaysStart.setDate(in7DaysStart.getDate() + 7);
            const in7DaysEnd = new Date(in7DaysStart);
            in7DaysEnd.setHours(23, 59, 59, 999);

            const sevenDayAlerts = await Booking.find({
                status: "completed",
                expiryDate: { $gte: in7DaysStart, $lte: in7DaysEnd },
            }).populate("user", "username contact");

            for (const booking of sevenDayAlerts) {
                if (booking.user?.contact) {
                    const vehicles = booking.vehicles.map((v) => v.number).join(", ");
                    const msg = `Dear ${booking.user.username}, the 6-month PUC validity for vehicle(s) ${vehicles} expires in 7 days on ${new Date(
                        booking.expiryDate
                    ).toLocaleDateString("en-IN")}. Book your doorstep re-test on our platform to avoid traffic fines.`;

                    await sendSMS(booking.user.contact, msg);
                }
            }

            // 2. Check for bookings expiring tomorrow (1 day left)
            const in1DayStart = new Date(today);
            in1DayStart.setDate(in1DayStart.getDate() + 1);
            const in1DayEnd = new Date(in1DayStart);
            in1DayEnd.setHours(23, 59, 59, 999);

            const oneDayAlerts = await Booking.find({
                status: "completed",
                expiryDate: { $gte: in1DayStart, $lte: in1DayEnd },
            }).populate("user", "username contact");

            for (const booking of oneDayAlerts) {
                if (booking.user?.contact) {
                    const vehicles = booking.vehicles.map((v) => v.number).join(", ");
                    const msg = `URGENT: PUC for vehicle(s) ${vehicles} expires tomorrow! Schedule your certified doorstep inspection now: http://localhost:5173/dashboard`;
                    await sendSMS(booking.user.contact, msg);
                }
            }

            console.log(`Expiry Check Completed. Alerts Sent: 7-Day (${sevenDayAlerts.length}), 1-Day (${oneDayAlerts.length})`);
        } catch (err) {
            console.error("❌ Expiry Cron Error:", err);
        }
    });
}

module.exports = { initRenewalCron };