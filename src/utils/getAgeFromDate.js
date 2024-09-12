const getAgeFromDate = (dateString) => {
    // Parse the date string into a JavaScript Date object
    const birthDate = new Date(dateString);
    const today = new Date();

    // Calculate the difference in years
    let age = today.getFullYear() - birthDate.getFullYear();

    // Check if the birthday has occurred this year; if not, subtract one year from age
    const hasHadBirthdayThisYear =
        today.getMonth() > birthDate.getMonth() ||
        (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());

    if (!hasHadBirthdayThisYear) {
        age--;
    }
    return age;
}
module.exports = getAgeFromDate
