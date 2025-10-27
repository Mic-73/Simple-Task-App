/*
 * dateUtils.js
 * Small date/time parsing and validation utilities.
 * - Works in the browser (attaches to window.dateUtils)
 * - Works in Node (module.exports)
 */
(function (root, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = factory();
    } else {
        root.dateUtils = factory();
    }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';

    function parseDateParts(dateStr) {
        if (!dateStr) return null;
        const re = /^(0?[1-9]|1[0-2])\/(0?[1-9]|[12][0-9]|3[01])\/(\d{4})$/;
        const m = re.exec(dateStr.trim());
        if (!m) return null;
        const month = parseInt(m[1], 10);
        const day = parseInt(m[2], 10);
        const year = parseInt(m[3], 10);
        return { month, day, year };
    }

    function isValidCalendarDate(year, month, day) {
        const d = new Date(year, month - 1, day);
        return d.getFullYear() === year && d.getMonth() === (month - 1) && d.getDate() === day;
    }

    function parseTimeParts(hourStr, minuteStr, ampm) {
        if (!hourStr) return null;
        const hour = parseInt(hourStr, 10);
        if (Number.isNaN(hour) || hour < 1 || hour > 12) return null;
        let minute = 0;
        if (minuteStr !== undefined && minuteStr !== null && String(minuteStr).trim() !== '') {
            minute = parseInt(minuteStr, 10);
            if (Number.isNaN(minute) || minute < 0 || minute > 59) return null;
        }
        let hour24 = hour % 12;
        if (ampm && String(ampm).toLowerCase() === 'pm') hour24 += 12;
        return { hour, minute, hour24 };
    }

    function buildDueDate(year, month, day, hour24, minute) {
        if (hour24 === undefined || hour24 === null) {
            return new Date(year, month - 1, day);
        }
        return new Date(year, month - 1, day, hour24, minute || 0, 0, 0);
    }

    function validateAndBuildDue(dateStr, hourStr, minuteStr, ampm) {
        // returns { ok: true, normalizedDate, dueTimestamp, dueDateObj } or { ok:false, error }
        const parts = parseDateParts(dateStr);
        if (!parts) return { ok: false, error: 'Date must be M/D/YYYY' };
        if (!isValidCalendarDate(parts.year, parts.month, parts.day)) return { ok: false, error: 'Invalid calendar date' };

        const timeParts = hourStr ? parseTimeParts(hourStr, minuteStr, ampm) : null;
        if (hourStr && !timeParts) return { ok: false, error: 'Invalid time (hour 1-12, minutes 0-59)' };

        const normalizedDate = `${parts.month}/${parts.day}/${parts.year}`;
        const dueDateObj = timeParts ? buildDueDate(parts.year, parts.month, parts.day, timeParts.hour24, timeParts.minute) : buildDueDate(parts.year, parts.month, parts.day);

        // double-check dueDateObj matches components (guards against JS Date overflow)
        if (dueDateObj.getFullYear() !== parts.year || dueDateObj.getMonth() !== (parts.month - 1) || dueDateObj.getDate() !== parts.day) {
            return { ok: false, error: 'Invalid calendar date' };
        }

        return { ok: true, normalizedDate, dueTimestamp: dueDateObj.getTime(), dueDateObj };
    }

    function normalizeDateString(dateStr) {
        const parts = parseDateParts(dateStr);
        if (!parts) return null;
        return `${parts.month}/${parts.day}/${parts.year}`;
    }

    return {
        parseDateParts,
        parseTimeParts,
        isValidCalendarDate,
        buildDueDate,
        validateAndBuildDue,
        normalizeDateString
    };
});
