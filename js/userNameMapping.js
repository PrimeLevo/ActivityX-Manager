/**
 * Smart Username Mapping Utility
 * Manages custom display names for PC usernames with localStorage persistence
 */

class UserNameMapping {
    constructor() {
        this.storageKey = 'userNameMappings';
        this.mappings = this.loadMappings();
    }

    /**
     * Load mappings from localStorage
     */
    loadMappings() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            console.error('[UserNameMapping] Error loading mappings:', error);
            return {};
        }
    }

    /**
     * Save mappings to localStorage
     */
    saveMappings() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.mappings));
            return true;
        } catch (error) {
            console.error('[UserNameMapping] Error saving mappings:', error);
            return false;
        }
    }

    /**
     * Get display name for a PC username
     * @param {string} pcName - Original PC username
     * @returns {string} Custom display name or original PC name
     */
    getDisplayName(pcName) {
        if (!pcName) return 'Unknown';
        return this.mappings[pcName] || pcName;
    }

    /**
     * Set custom display name for a PC username
     * @param {string} pcName - Original PC username
     * @param {string} displayName - Custom display name
     * @returns {boolean} Success status
     */
    setDisplayName(pcName, displayName) {
        if (!pcName || !displayName) {
            console.error('[UserNameMapping] Invalid parameters');
            return false;
        }

        this.mappings[pcName] = displayName.trim();
        return this.saveMappings();
    }

    /**
     * Remove custom display name mapping
     * @param {string} pcName - Original PC username
     * @returns {boolean} Success status
     */
    removeMapping(pcName) {
        if (!pcName) return false;

        if (this.mappings[pcName]) {
            delete this.mappings[pcName];
            return this.saveMappings();
        }
        return false;
    }

    /**
     * Check if a PC name has a custom mapping
     * @param {string} pcName - Original PC username
     * @returns {boolean} True if mapping exists
     */
    hasMapping(pcName) {
        return !!this.mappings[pcName];
    }

    /**
     * Get all mappings
     * @returns {Object} All mappings
     */
    getAllMappings() {
        return { ...this.mappings };
    }

    /**
     * Clear all mappings
     * @returns {boolean} Success status
     */
    clearAllMappings() {
        this.mappings = {};
        return this.saveMappings();
    }

    /**
     * Get original PC name from display name
     * @param {string} displayName - Custom display name
     * @returns {string|null} Original PC name or null if not found
     */
    getPCNameFromDisplay(displayName) {
        for (const [pcName, customName] of Object.entries(this.mappings)) {
            if (customName === displayName) {
                return pcName;
            }
        }
        return null;
    }
}

// Create global instance
window.userNameMapping = new UserNameMapping();

// Helper function for easy access throughout the app
window.getDisplayName = function(pcName) {
    return window.userNameMapping.getDisplayName(pcName);
};

console.log('[UserNameMapping] Utility loaded. Mappings:', window.userNameMapping.getAllMappings());
