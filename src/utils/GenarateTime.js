const generateTimeSlots = (startTime, endTime) => {
    try {
        if (!startTime || !endTime) {
            return [];
        }
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
                if (Hour >= 23) {
                    Hour = 0;
                } else {
                    Hour += 1
                }
            }
            if (currentHour === 12 && currentMinute === 0) {
                currentMeridian = toggleMeridian(currentMeridian);
            }
            if (currentHour === 13) {
                currentHour = 1;
            }
            if (
                endHour === Hour && ((endMinute <= 30 && Minute <= 30) || (endMinute >= 30 && Minute >= 30) || (endMinute === 0 && Minute === 0))
            ) {
                break;
            }
        }
        return slots;
    } catch (error) {
        throw error || new Error(`Error in generateTimeSlots: ${error}`);
    }
};
const parseTime = (time) => {
    try {
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
    } catch (error) {
        throw error || new Error(`Error in parseTime: ${error}`);
    }
};

const formatTime = (hour, minute, meridian) => {
    try {
        let formattedHour = hour % 12 || 12;
        let formattedMinute = minute < 10 ? `0${minute}` : minute;
        return `${formattedHour}:${formattedMinute} ${meridian}`;
    } catch (error) {
        throw error || new Error(`Error in formatTime: ${error}`);
    }
};

const toggleMeridian = (meridian) => {
    try {
        return meridian === 'AM' ? 'PM' : 'AM';
    } catch (error) {
        throw error || new Error(`Error in toggleMeridian: ${error}`);
    }
};

module.exports = { generateTimeSlots };
