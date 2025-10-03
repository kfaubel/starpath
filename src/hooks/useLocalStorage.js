import { useState, useCallback } from 'react';

/**
 * Custom hook for managing localStorage with React state
 * @param {string} key - The localStorage key
 * @param {*} defaultValue - Default value if no stored value exists
 * @returns {[value, setValue]} - Current value and setter function
 */
export const useLocalStorage = (key, defaultValue) => {
    // Initialize state with value from localStorage or default
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.warn(`Failed to load from localStorage key "${key}":`, error);
            return defaultValue;
        }
    });

    // Wrapped setter function that updates both state and localStorage
    const setValue = useCallback((value) => {
        try {
            // Allow value to be a function so we have the same API as useState
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            
            // Save to state
            setStoredValue(valueToStore);
            
            // Save to localStorage
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.warn(`Failed to save to localStorage key "${key}":`, error);
        }
    }, [key, storedValue]);

    return [storedValue, setValue];
};

/**
 * Helper hook for managing multiple related localStorage values with a common prefix
 * @param {string} prefix - Common prefix for all keys (e.g., 'starpath_')
 * @param {object} defaults - Object with default values for each key
 * @returns {object} - Object with current values and update functions
 */
export const useLocalStorageGroup = (prefix, defaults) => {
    const values = {};
    const setters = {};
    
    // Create individual useLocalStorage hooks for each key
    Object.keys(defaults).forEach(key => {
        const fullKey = `${prefix}${key}`;
        const [value, setValue] = useLocalStorage(fullKey, defaults[key]);
        values[key] = value;
        setters[key] = setValue;
    });
    
    return { values, setters };
};