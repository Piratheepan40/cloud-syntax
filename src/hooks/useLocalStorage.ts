/**
 * Custom useLocalStorage Hook
 * Generic hook for safe, type-safe localStorage operations with automatic syncing
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * useLocalStorage Hook - Persistent state management with localStorage
 * @template T - The type of data being stored
 * @param key - localStorage key
 * @param initialValue - Default value if localStorage key doesn't exist
 * @returns [storedValue, setValue] - Current value and setter function
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      
      // Parse stored json or if none return initialValue
      if (item) {
        return JSON.parse(item) as T;
      }
      return initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        
        // Save state
        setStoredValue(valueToStore);
        
        // Save to local storage
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        
        // Dispatch storage event for other tabs/windows
        window.dispatchEvent(
          new StorageEvent('storage', {
            key,
            newValue: JSON.stringify(valueToStore),
            oldValue: JSON.stringify(storedValue),
            storageArea: localStorage,
          })
        );
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Sync state across tabs/windows when storage changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          setStoredValue(JSON.parse(e.newValue) as T);
        } catch (error) {
          console.warn(`Error syncing storage for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue];
}

/**
 * Hook to clear a specific localStorage key
 */
export function useClearStorage(key: string) {
  return useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      window.dispatchEvent(
        new StorageEvent('storage', {
          key,
          newValue: null,
          oldValue: window.localStorage.getItem(key),
          storageArea: localStorage,
        })
      );
    } catch (error) {
      console.warn(`Error clearing localStorage key "${key}":`, error);
    }
  }, [key]);
}

/**
 * Hook to clear all localStorage
 */
export function useClearAllStorage() {
  return useCallback(() => {
    try {
      window.localStorage.clear();
      window.dispatchEvent(new StorageEvent('storage'));
    } catch (error) {
      console.warn('Error clearing all localStorage:', error);
    }
  }, []);
}
