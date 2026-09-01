const axios = require("axios");

async function fetchRealVehicleData(vehicleNumber) {
    const cleanNum = (vehicleNumber || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    if (!cleanNum) return null;

    try {
        const apiKey = process.env.RAPIDAPI_KEY;
        const apiHost = process.env.RAPIDAPI_HOST || "rto-vehicle-information-india.p.rapidapi.com";

        if (!apiKey) {
            console.warn("[RapidAPI Warning] RAPIDAPI_KEY missing in .env.");
            return null;
        }

        const options = {
            method: "GET",
            url: `https://${apiHost}/get-vehicle-info`,
            params: { reg_no: cleanNum },
            headers: {
                "x-rapidapi-key": apiKey,
                "x-rapidapi-host": apiHost,
            },
            timeout: 8000,
        };

        const response = await axios.request(options);
        const data = response.data?.result || response.data?.data || response.data;

        if (data) {
            const stateCode = cleanNum.slice(0, 2);
            const rtoCode = cleanNum.slice(2, 4);

            const fuelType = (data.fuel_type || data.fuel || "PETROL").toUpperCase();
            const isDiesel = fuelType.includes("DIESEL");

            return {
                cleanNum,
                stateName: data.state || data.registered_place || "Transport Department",
                rtoArea: data.rto || data.registered_at || `RTO ${stateCode}${rtoCode}`,
                pucCode: `${stateCode}${rtoCode}0028`,
                fuel: fuelType,
                emissionNorm: data.norms_type || (isDiesel ? "BHARAT STAGE IV" : "BHARAT STAGE VI"),
                dateOfReg: data.reg_date || data.registration_date || "18/Sep/2020",
                mfgDate: data.manufacturing_date || "June-2019",
                makerModel: data.maker_model || data.model || "Motor Vehicle",
                ownerName: data.owner_name ? `******${data.owner_name.slice(-3)}` : "Registered Owner",
                certSLNo: `${stateCode}${rtoCode}00${Date.now().toString().slice(-6)}`,
            };
        }
    } catch (error) {
        console.warn("[RapidAPI Fallback Triggered]:", error.response?.data?.message || error.message);
        return null;
    }

    return null;
}

module.exports = { fetchRealVehicleData };