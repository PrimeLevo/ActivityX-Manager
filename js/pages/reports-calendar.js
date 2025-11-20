// Turkish Calendar Modal Integration for Reports Page
// This file adds the modal functionality with Turkish calendars

// Open report generation modal
function openReportGenerationModal() {
    const modal = document.getElementById('report-generation-modal');
    if (!modal) return;

    // Initialize calendars if not already done
    if (!window.reportStartCalendar) {
        createReportCalendars();
    }

    // Set default dates and update displays
    updateDateDisplay('start', window.reportStartDate);
    updateDateDisplay('end', window.reportEndDate);
    updateDateRangeSummary();

    // Attach date display click handlers if not already attached
    if (!window.reportDateHandlersAttached) {
        setupDateDisplayHandlers();
        window.reportDateHandlersAttached = true;
    }

    // Attach click-outside-to-close handler if not already attached
    if (!window.reportModalClickHandlerAttached) {
        modal.addEventListener('click', (e) => {
            // Close modal if clicking on the modal backdrop (not the content)
            if (e.target === modal) {
                closeReportGenerationModal();
            }
        });
        window.reportModalClickHandlerAttached = true;
    }

    // Show modal
    modal.style.display = 'flex';
}

// Close report generation modal
function closeReportGenerationModal() {
    const modal = document.getElementById('report-generation-modal');
    if (modal) {
        modal.style.display = 'none';
    }

    // Hide calendar wrappers
    const startWrapper = document.getElementById('report-start-calendar-wrapper');
    const endWrapper = document.getElementById('report-end-calendar-wrapper');
    if (startWrapper) startWrapper.style.display = 'none';
    if (endWrapper) endWrapper.style.display = 'none';
}

// Create Turkish calendars
function createReportCalendars() {
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);

    // Create start date calendar
    window.reportStartCalendar = new TurkishCalendar('report-start-calendar', {
        type: 'range-start',
        minDate: oneYearAgo,
        maxDate: today,
        selectedDate: window.reportStartDate || new Date(),
        rangeStart: window.reportStartDate,
        rangeEnd: window.reportEndDate,
        onSelect: (date) => {
            window.reportStartDate = date;
            updateDateDisplay('start', date);
            updateDateRangeSummary();
            // Update the end calendar's range
            if (window.reportEndCalendar) {
                window.reportEndCalendar.rangeStart = date;
                window.reportEndCalendar.render();
            }
            // Hide calendar wrapper after selection
            const wrapper = document.getElementById('report-start-calendar-wrapper');
            if (wrapper) wrapper.style.display = 'none';
        }
    });

    // Create end date calendar
    window.reportEndCalendar = new TurkishCalendar('report-end-calendar', {
        type: 'range-end',
        minDate: oneYearAgo,
        maxDate: today,
        selectedDate: window.reportEndDate || new Date(),
        rangeStart: window.reportStartDate,
        rangeEnd: window.reportEndDate,
        onSelect: (date) => {
            window.reportEndDate = date;
            updateDateDisplay('end', date);
            updateDateRangeSummary();
            // Update the start calendar's range
            if (window.reportStartCalendar) {
                window.reportStartCalendar.rangeEnd = date;
                window.reportStartCalendar.render();
            }
            // Hide calendar wrapper after selection
            const wrapper = document.getElementById('report-end-calendar-wrapper');
            if (wrapper) wrapper.style.display = 'none';
        }
    });
}

// Toggle calendar visibility
function toggleCalendar(type) {

    // Make sure calendars are created first
    if (!window.reportStartCalendar || !window.reportEndCalendar) {
        createReportCalendars();
    }

    const startWrapper = document.getElementById('report-start-calendar-wrapper');
    const endWrapper = document.getElementById('report-end-calendar-wrapper');

    if (!startWrapper || !endWrapper) {
        console.error('Calendar wrappers not found');
        return;
    }

    if (type === 'start') {
        // Check visibility using computed style for reliability
        const computedStyle = window.getComputedStyle(startWrapper);
        const isVisible = computedStyle.display === 'block';

        if (isVisible) {
            // Hide if already visible
            startWrapper.style.display = 'none';
        } else {
            // Hide the other calendar first
            endWrapper.style.display = 'none';

            // Update calendar properties before showing
            if (window.reportStartCalendar) {
                window.reportStartCalendar.selectedDate = window.reportStartDate;
                window.reportStartCalendar.rangeStart = window.reportStartDate;
                window.reportStartCalendar.rangeEnd = window.reportEndDate;
                window.reportStartCalendar.render();
            }

            // Show the calendar (must be visible for positioning calculations)
            startWrapper.style.display = 'block';

            // Position the calendar wrapper using fixed positioning
            // Use setTimeout to ensure the calendar is rendered before positioning
            setTimeout(() => {
                positionCalendarWrapper('start');
            }, 10);
        }
    } else {
        // Check visibility using computed style for reliability
        const computedStyle = window.getComputedStyle(endWrapper);
        const isVisible = computedStyle.display === 'block';

        if (isVisible) {
            // Hide if already visible
            endWrapper.style.display = 'none';
        } else {
            // Hide the other calendar first
            startWrapper.style.display = 'none';

            // Update calendar properties before showing
            if (window.reportEndCalendar) {
                window.reportEndCalendar.selectedDate = window.reportEndDate;
                window.reportEndCalendar.rangeStart = window.reportStartDate;
                window.reportEndCalendar.rangeEnd = window.reportEndDate;
                window.reportEndCalendar.render();
            }

            // Show the calendar (must be visible for positioning calculations)
            endWrapper.style.display = 'block';

            // Position the calendar wrapper using fixed positioning
            // Use setTimeout to ensure the calendar is rendered before positioning
            setTimeout(() => {
                positionCalendarWrapper('end');
            }, 10);
        }
    }
}

// Position calendar wrapper relative to date display using fixed positioning
function positionCalendarWrapper(type) {
    const dateDisplay = document.getElementById('report-' + type + '-date-display');
    const wrapper = document.getElementById('report-' + type + '-calendar-wrapper');

    if (!dateDisplay || !wrapper) return;

    // Get the position of the date display element relative to viewport
    const rect = dateDisplay.getBoundingClientRect();

    // Position the calendar below the date display
    wrapper.style.top = (rect.bottom + 8) + 'px';
    wrapper.style.left = rect.left + 'px';

    // Ensure calendar doesn't go off-screen to the right
    const wrapperWidth = 400; // max-width from CSS
    if (rect.left + wrapperWidth > window.innerWidth) {
        wrapper.style.left = (window.innerWidth - wrapperWidth - 16) + 'px';
    }

    // Ensure calendar doesn't go off-screen at the bottom
    const wrapperHeight = 450; // approximate calendar height
    if (rect.bottom + wrapperHeight + 8 > window.innerHeight) {
        // Position above the date display instead
        wrapper.style.top = (rect.top - wrapperHeight - 8) + 'px';
    }
}

// Update date display
function updateDateDisplay(type, date) {
    const textElement = document.getElementById('report-' + type + '-date-text');
    if (textElement && date) {
        // Use formatDateTurkish if available, otherwise use a simple format
        if (window.formatDateTurkish) {
            textElement.textContent = window.formatDateTurkish(date);
        } else {
            textElement.textContent = formatDateTurkish(date);
        }
    }
}

// Local formatDateTurkish function in case it's not loaded from reports.js yet
function formatDateTurkish(date) {
    const turkishMonths = [
        'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
        'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];
    const day = date.getDate();
    const month = turkishMonths[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
}

// Update date range summary (removed from UI, kept for compatibility)
function updateDateRangeSummary() {
    // Date range summary removed from UI
    // This function is kept to avoid breaking existing code that calls it
}

// Override getDateRange to use modal dates
window.getReportDateRange = function() {
    if (!window.reportStartDate || !window.reportEndDate) {
        return null;
    }

    const startDate = new Date(window.reportStartDate);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(window.reportEndDate);
    endDate.setHours(23, 59, 59, 999);

    if (startDate > endDate) {
        return null;
    }

    return { startDate, endDate };
};

// Setup date display click handlers
function setupDateDisplayHandlers() {
    const startDateDisplay = document.getElementById('report-start-date-display');
    const endDateDisplay = document.getElementById('report-end-date-display');


    if (startDateDisplay) {
        startDateDisplay.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleCalendar('start');
        });
    } else {
    }

    if (endDateDisplay) {
        endDateDisplay.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleCalendar('end');
        });
    } else {
    }
}

// Make functions global
window.openReportGenerationModal = openReportGenerationModal;
window.closeReportGenerationModal = closeReportGenerationModal;
window.toggleCalendar = toggleCalendar;

