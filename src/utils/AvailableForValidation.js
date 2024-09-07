const checkMissingDays = (data, availableTime) => {
    if (!data || !availableTime) {
        return true;
    }
    try {
        for (let day in data) {
            if (!(day in availableTime)) {
                return true;
            }
        }
        return false;
    } catch (error) {
        throw error || new Error(`Error in checkMissingDays: ${error}`);
    }
}
module.exports = checkMissingDays



