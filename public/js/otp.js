const verifyOtpBtn  = document.getElementById("verifyOtpBtn");
const otpSection    = document.getElementById("otpSection");
const verifySection = document.getElementById("verifyOtpSection");
const otpToast      = document.getElementById("otpToast");
const otpToastMsg   = document.getElementById("otpToastMsg");
const registerBtn   = document.getElementById("registerBtn");
const contactInput  = document.getElementById("reg-contact");
const otpInput      = document.getElementById("otpInput");

function showToast(msg, type = "error") {
    otpToast.className = `otp-toast toast-${type}`;
    otpToastMsg.textContent = msg;
    otpToast.style.display = "block";

    if (type === "success") {
        setTimeout(() => { otpToast.style.display = "none"; }, 4000);
    }
}

sendOtpBtn.addEventListener("click", async () => {
    const contact = contactInput.value.trim();

    if (!/^\d{10}$/.test(contact)) {
        showToast("Please enter a valid 10-digit mobile number.", "error");
        return;
    }

    sendOtpBtn.disabled = true;
    sendOtpBtn.textContent = "Sending...";
    showToast("Sending OTP, please wait...", "info");

    try {
        const res = await fetch("/send-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contact }),
        });

        const data = await res.json();

        if (data.success) {
            showToast(`${data.message}`, "success");
            otpSection.style.display    = "block";
            verifySection.style.display = "block";

            let countdown = 30;
            sendOtpBtn.textContent = `Resend in ${countdown}s`;
            const timer = setInterval(() => {
                countdown--;
                if (countdown <= 0) {
                    clearInterval(timer);
                    sendOtpBtn.disabled = false;
                    sendOtpBtn.textContent = "Resend OTP";
                } else {
                    sendOtpBtn.textContent = `Resend in ${countdown}s`;
                }
            }, 1000);

        } else {
            showToast(`${data.message}`, "error");
            sendOtpBtn.disabled = false;
            sendOtpBtn.textContent = "Send OTP";
        }

    } catch (err) {
        showToast("Server error. Please try again.", "error");
        sendOtpBtn.disabled = false;
        sendOtpBtn.textContent = "Send OTP";
    }
});

verifyOtpBtn.addEventListener("click", async () => {
    const contact = contactInput.value.trim();
    const otp     = otpInput.value.trim();

    if (!otp || otp.length !== 6) {
        showToast("Please enter the 6-digit OTP.", "error");
        return;
    }

    verifyOtpBtn.disabled = true;
    verifyOtpBtn.textContent = "Verifying...";
    showToast("Verifying OTP...", "info");

    try {
        const res = await fetch("/verify-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contact, otp }),
        });

        const data = await res.json();

        if (data.success) {
            showToast("Mobile number verified!", "success");

            contactInput.readOnly = true;
            otpInput.readOnly     = true;
            otpInput.style.borderColor = "#28a745";

            sendOtpBtn.style.display    = "none";
            verifySection.style.display = "none";

            registerBtn.disabled      = false;
            registerBtn.style.opacity = "1";
            registerBtn.style.cursor  = "pointer";

        } else {
            showToast(`${data.message}`, "error");
            verifyOtpBtn.disabled = false;
            verifyOtpBtn.textContent = "Verify OTP";
        }

    } catch (err) {
        showToast("Server error. Please try again.", "error");
        verifyOtpBtn.disabled = false;
        verifyOtpBtn.textContent = "Verify OTP";
    }
});