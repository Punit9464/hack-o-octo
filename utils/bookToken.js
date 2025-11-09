const tokens = {};

async function bookToken(hospitalName) {
    const today = new Date().toISOString().split("T")[0];
    if (!tokens[hospitalName] || tokens[hospitalName].date != today) {
        tokens[hospitalName] = { date: today, number: 1 };
    } else {
        tokens[hospitalName].number++;
    }
    const token = tokens[hospitalName].number;
    let timeSlot = token <= 20 ? "9 se 10 baje"
        : token <= 40 ? "10 se 11 baje"
            : "11 se 12 baje";

    return { token, timeSlot, hospitalName };
}

export default bookToken;