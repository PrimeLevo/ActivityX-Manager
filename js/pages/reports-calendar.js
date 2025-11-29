// Turkish Calendar Modal Integration for Reports Page
// This file adds the modal functionality with Turkish calendars

// Track which calendar is currently open
let activeCalendarType = null;

// Track the current modal element to detect page navigation
let currentModalElement = null;

// Open report generation modal
function openReportGenerationModal() {
    const modal = document.getElementById('report-generation-modal');
    if (!modal) return;

    // Check if we navigated to a new page (modal element changed)
    // This happens when user navigates away and comes back
    if (currentModalElement !== modal) {
        // Reset all flags since DOM elements have been recreated
        window.reportDateHandlersAttached = false;
        window.reportModalClickHandlerAttached = false;
        window.reportCalendarScrollAttached = false;
        window.reportStartCalendar = null;
        window.reportEndCalendar = null;
        activeCalendarType = null;
        currentModalElement = modal;
    }

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

    // Setup global click handler for closing calendar when clicking outside
    // This is on document so it persists across page navigations
    if (!window.reportCalendarClickOutsideAttached) {
        document.addEventListener('click', handleCalendarClickOutside);
        window.reportCalendarClickOutsideAttached = true;
    }

    // Setup scroll handler to close calendar when modal scrolls
    if (!window.reportCalendarScrollAttached) {
        // The scrollable element is .report-generation-modal (modal-content)
        const modalContent = modal.querySelector('.report-generation-modal');
        if (modalContent) {
            modalContent.addEventListener('scroll', handleModalScroll);
        }
        window.reportCalendarScrollAttached = true;
    }

    // Show modal
    modal.style.display = 'flex';
}

// Handle clicks outside the calendar to close it
function handleCalendarClickOutside(e) {
    // Only process if a calendar is actually open
    if (activeCalendarType === null) {
        return;
    }

    const startWrapper = document.getElementById('report-start-calendar-wrapper');
    const endWrapper = document.getElementById('report-end-calendar-wrapper');
    const startDisplay = document.getElementById('report-start-date-display');
    const endDisplay = document.getElementById('report-end-date-display');

    // Check if click is outside both calendars and their triggers
    const clickedInsideStartCalendar = startWrapper && startWrapper.contains(e.target);
    const clickedInsideEndCalendar = endWrapper && endWrapper.contains(e.target);
    const clickedOnStartDisplay = startDisplay && startDisplay.contains(e.target);
    const clickedOnEndDisplay = endDisplay && endDisplay.contains(e.target);

    if (!clickedInsideStartCalendar && !clickedInsideEndCalendar &&
        !clickedOnStartDisplay && !clickedOnEndDisplay) {
        // Close any open calendar
        hideAllCalendars();
    }
}

// Handle modal body scroll - close calendars when scrolling
function handleModalScroll() {
    // Only close if a calendar is actually open
    if (activeCalendarType !== null) {
        hideAllCalendars();
    }
}

// Hide all calendars
function hideAllCalendars() {
    const startWrapper = document.getElementById('report-start-calendar-wrapper');
    const endWrapper = document.getElementById('report-end-calendar-wrapper');

    if (startWrapper) startWrapper.style.display = 'none';
    if (endWrapper) endWrapper.style.display = 'none';
    activeCalendarType = null;
}

// Close report generation modal
function closeReportGenerationModal() {
    const modal = document.getElementById('report-generation-modal');
    if (modal) {
        modal.style.display = 'none';
    }

    // Hide all calendars and reset state
    hideAllCalendars();
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
        maxDate: window.reportEndDate || today, // Can't select start after end
        selectedDate: window.reportStartDate || new Date(),
        rangeStart: window.reportStartDate,
        rangeEnd: window.reportEndDate,
        onSelect: (date) => {
            window.reportStartDate = date;
            updateDateDisplay('start', date);
            updateDateRangeSummary();
            // Update the end calendar - use proper methods to update options
            if (window.reportEndCalendar) {
                // Set minDate to selected start date so end can't be before start
                window.reportEndCalendar.setMinDate(date);
                window.reportEndCalendar.setRangeStart(date);
            }
            // Update this calendar's range too
            window.reportStartCalendar.setRangeStart(date);
            // Hide calendar wrapper after selection and reset state
            hideAllCalendars();
        }
    });

    // Create end date calendar
    window.reportEndCalendar = new TurkishCalendar('report-end-calendar', {
        type: 'range-end',
        minDate: window.reportStartDate || oneYearAgo, // Can't select end before start
        maxDate: today,
        selectedDate: window.reportEndDate || new Date(),
        rangeStart: window.reportStartDate,
        rangeEnd: window.reportEndDate,
        onSelect: (date) => {
            window.reportEndDate = date;
            updateDateDisplay('end', date);
            updateDateRangeSummary();
            // Update the start calendar - use proper methods to update options
            if (window.reportStartCalendar) {
                // Set maxDate to selected end date so start can't be after end
                window.reportStartCalendar.setMaxDate(date);
                window.reportStartCalendar.setRangeEnd(date);
            }
            // Update this calendar's range too
            window.reportEndCalendar.setRangeEnd(date);
            // Hide calendar wrapper after selection and reset state
            hideAllCalendars();
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

    // Use our tracked state instead of computed style to avoid timing issues
    const isCurrentlyOpen = activeCalendarType === type;

    if (isCurrentlyOpen) {
        // Hide if already visible
        hideAllCalendars();
    } else {
        // Hide any open calendar first
        hideAllCalendars();

        const wrapper = type === 'start' ? startWrapper : endWrapper;
        const calendar = type === 'start' ? window.reportStartCalendar : window.reportEndCalendar;
        const selectedDate = type === 'start' ? window.reportStartDate : window.reportEndDate;

        // Update calendar properties before showing using proper methods
        if (calendar) {
            calendar.selectedDate = selectedDate;
            // Use updateRange to set both start and end without multiple renders
            calendar.updateRange(window.reportStartDate, window.reportEndDate, false);
            // Update min/max dates to prevent invalid selections
            if (type === 'start' && window.reportEndDate) {
                calendar.options.maxDate = window.reportEndDate;
            } else if (type === 'end' && window.reportStartDate) {
                calendar.options.minDate = window.reportStartDate;
            }
            calendar.render();
        }

        // Show the calendar
        wrapper.style.display = 'block';
        activeCalendarType = type;

        // Position the calendar wrapper using fixed positioning
        // Use requestAnimationFrame to ensure the calendar is rendered before positioning
        requestAnimationFrame(() => {
            positionCalendarWrapper(type);
        });
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

