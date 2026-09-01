function parseVehicleDetails(vehicleNumber = "", vehicleObj = {}) {
    const cleanNum = (vehicleNumber || "UK08AU9155").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

    const isBHSeries = /^[0-9]{2}BH/i.test(cleanNum);
    let stateCode = "UK";
    let rtoCode = "08";

    if (isBHSeries) {
        stateCode = "BH";
        rtoCode = cleanNum.slice(0, 2);
    } else {
        stateCode = cleanNum.slice(0, 2) || "UK";
        rtoCode = cleanNum.slice(2, 4) || "08";
    }

    const pucCode = `${stateCode}${rtoCode}0028`;

    const stateMap = {
        UK: "Uttarakhand",
        UA: "Uttarakhand",
        DL: "Delhi",
        UP: "Uttar Pradesh",
        HR: "Haryana",
        PB: "Punjab",
        MH: "Maharashtra",
        RJ: "Rajasthan",
        KA: "Karnataka",
        GJ: "Gujarat",
        MP: "Madhya Pradesh",
        TN: "Tamil Nadu",
        TS: "Telangana",
        WB: "West Bengal",
        CH: "Chandigarh",
        BH: "Government of India (BH Series)",
    };

    const stateName = stateMap[stateCode] || "Transport Department";
    const rtoArea = `RTO Office (${stateCode}-${rtoCode})`;

    const rawFuel = vehicleObj?.fuel || vehicleObj?.fuelType || "PETROL";
    const fuel = String(rawFuel).toUpperCase();
    const emissionNorm = fuel.includes("DIESEL") ? "BHARAT STAGE IV" : "BHARAT STAGE VI";

    const currentYear = new Date().getFullYear();
    const regYear = currentYear - 3;
    const mfgYear = currentYear - 4;

    return {
        cleanNum,
        stateCode,
        rtoCode,
        pucCode,
        stateName,
        rtoArea,
        fuel,
        emissionNorm,
        dateOfReg: `18/Sep/${regYear}`,
        mfgDate: `June-${mfgYear}`,
        certSLNo: `${stateCode}${rtoCode}00${Date.now().toString().slice(-6)}`,
    };
}

module.exports = { parseVehicleDetails };