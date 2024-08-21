const generateTimeSlots = (startTime, endTime) => {
    const slots = [];
    let [currentHour, currentMinute, currentMeridian] = parseTime(startTime);
    let [Hour, Minute, Meridian] = parseTime(startTime);
    const [endHour, endMinute, endMeridian] = parseTime(endTime);
    while (true) {
        slots.push(formatTime(currentHour, currentMinute, currentMeridian));
        currentMinute += 30;
        if (currentMinute >= 60) {
            currentMinute = 0;
            currentHour += 1;
        }
        Minute += 30;
        if (Minute >= 60) {
            Minute = 0;
            Hour += 1;
        }
        if (currentHour === 12 && currentMinute === 0) {
            currentMeridian = toggleMeridian(currentMeridian);
        }
        if (currentHour === 13) {
            currentHour = 1;
        }
        if (
            endHour === Hour &&
            endMinute === Minute
        ) {
            break;
        }
    }
    return slots;
};

const parseTime = (time) => {
    const [timeString, meridian] = time.split(' ');
    const [hourString, minuteString] = timeString.split(':');
    let hour = parseInt(hourString);
    let minute = parseInt(minuteString);

    if (meridian === 'PM' && hour !== 12) {
        hour += 12;
    } else if (meridian === 'AM' && hour === 12) {
        hour = 0;
    }

    return [hour, minute, meridian];
};

const formatTime = (hour, minute, meridian) => {
    let formattedHour = hour % 12 || 12;
    let formattedMinute = minute < 10 ? `0${minute}` : minute;
    return `${formattedHour}:${formattedMinute} ${meridian}`;
};

const toggleMeridian = (meridian) => {
    return meridian === 'AM' ? 'PM' : 'AM';
};

module.exports = { generateTimeSlots };
