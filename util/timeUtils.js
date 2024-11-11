export function calculateTime(timestamp) {
    const timeSince = Date.now() - timestamp;
    const seconds = Math.floor(timeSince / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    return {
        years,
        months: months % 12,
        weeks: weeks % 4,
        days: days % 7,
        hours: hours % 24,
        minutes: minutes % 60,
        seconds: seconds % 60
    };
}

export function formatTime(timeObj) {
    const units = [
        { label: 'year', value: timeObj.years },
        { label: 'month', value: timeObj.months },
        { label: 'week', value: timeObj.weeks },
        { label: 'day', value: timeObj.days },
        { label: 'hour', value: timeObj.hours },
        { label: 'minute', value: timeObj.minutes },
        { label: 'second', value: timeObj.seconds },
    ];

    const firstIndex = units.findIndex(unit => unit.value > 0);
    const topFields = units.slice(firstIndex, firstIndex + 3);

    return topFields.map(unit => `${unit.value} ${unit.label}${unit.value !== 1 ? 's' : ''}`).join(', ');
}