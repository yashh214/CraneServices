/**
 * Centralized Validation Utility for Frontend
 * Provides reusable validation functions for all forms
 */

// Validation patterns
const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[+]?[\d\s()-]{10,}$/,
  indianPhone: /^(\+91|0)?[6-9]\d{9}$/,
  // Allow letters, spaces, hyphens, and apostrophes for names
  name: /^[a-zA-Z\s'-]{2,50}$/,
  // Password: minimum 6 characters
  password: /^.{6,}$/,
};

// Validation error messages
const messages = {
  required: (field) => `${field} is required`,
  email: "Please enter a valid email address",
  phone: "Please enter a valid phone number",
  indianPhone: "Please enter a valid 10-digit Indian phone number",
  name: "Name should contain only letters and be 2-50 characters",
  password: "Password must be at least 6 characters",
  passwordMatch: "Passwords do not match",
  minLength: (field, min) => `${field} must be at least ${min} characters`,
  maxLength: (field, max) => `${field} must not exceed ${max} characters`,
  invalidDate: "Please select a valid date",
  pastDate: "Date cannot be in the past",
};

/**
 * Validate a single field
 * @param {string} value - The value to validate
 * @param {string} fieldName - The display name of the field
 * @param {Object} rules - Validation rules
 * @returns {Object} - { isValid: boolean, error: string }
 */
export const validateField = (value, fieldName, rules = {}) => {
  const trimmedValue = value ? value.toString().trim() : "";

  // Required validation
  if (rules.required && !trimmedValue) {
    return { isValid: false, error: messages.required(fieldName) };
  }

  // Skip other validations if empty and not required
  if (!trimmedValue) {
    return { isValid: true, error: "" };
  }

  // Email validation
  if (rules.email && !patterns.email.test(trimmedValue)) {
    return { isValid: false, error: messages.email };
  }

  // Phone validation
  if (rules.phone && !patterns.phone.test(trimmedValue)) {
    return { isValid: false, error: messages.phone };
  }

  // Indian phone validation
  if (rules.indianPhone && !patterns.indianPhone.test(trimmedValue.replace(/\s/g, ""))) {
    return { isValid: false, error: messages.indianPhone };
  }

  // Name validation
  if (rules.name && !patterns.name.test(trimmedValue)) {
    return { isValid: false, error: messages.name };
  }

  // Password validation
  if (rules.password && !patterns.password.test(trimmedValue)) {
    return { isValid: false, error: messages.password };
  }

  // Minimum length validation
  if (rules.minLength && trimmedValue.length < rules.minLength) {
    return { isValid: false, error: messages.minLength(fieldName, rules.minLength) };
  }

  // Maximum length validation
  if (rules.maxLength && trimmedValue.length > rules.maxLength) {
    return { isValid: false, error: messages.maxLength(fieldName, rules.maxLength) };
  }

  // Custom validation function
  if (rules.custom && typeof rules.custom === "function") {
    const customResult = rules.custom(trimmedValue);
    if (customResult !== true) {
      return { isValid: false, error: customResult };
    }
  }

  return { isValid: true, error: "" };
};

/**
 * Validate an entire form
 * @param {Object} formData - The form data object
 * @param {Object} validationRules - Object with field names as keys and rules as values
 * @returns {Object} - { isValid: boolean, errors: Object }
 */
export const validateForm = (formData, validationRules) => {
  const errors = {};
  let isValid = true;

  for (const fieldName in validationRules) {
    const rules = validationRules[fieldName];
    const value = formData[fieldName];
    const fieldLabel = rules.label || fieldName;

    const result = validateField(value, fieldLabel, rules);
    
    if (!result.isValid) {
      errors[fieldName] = result.error;
      isValid = false;
    }
  }

  return { isValid, errors };
};

/**
 * Validate password match
 * @param {string} password - The password
 * @param {string} confirmPassword - The confirmation password
 * @returns {Object} - { isValid: boolean, error: string }
 */
export const validatePasswordMatch = (password, confirmPassword) => {
  if (!password || !confirmPassword) {
    return { isValid: false, error: "Please enter both passwords" };
  }
  if (password !== confirmPassword) {
    return { isValid: false, error: messages.passwordMatch };
  }
  return { isValid: true, error: "" };
};

/**
 * Validate date is not in the past
 * @param {string} date - The date string (YYYY-MM-DD)
 * @returns {Object} - { isValid: boolean, error: string }
 */
export const validateFutureDate = (date) => {
  if (!date) {
    return { isValid: false, error: messages.required("Date") };
  }
  
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (selectedDate < today) {
    return { isValid: false, error: messages.pastDate };
  }
  
  return { isValid: true, error: "" };
};

/**
 * Common validation rules for reuse
 */
export const commonRules = {
  email: {
    required: true,
    email: true,
  },
  phone: {
    required: true,
    indianPhone: true,
  },
  name: {
    required: true,
    name: true,
    minLength: 2,
    maxLength: 50,
  },
  password: {
    required: true,
    password: true,
  },
  message: {
    required: true,
    minLength: 10,
    maxLength: 1000,
  },
};

// Export all validation functions and patterns
export default {
  validateField,
  validateForm,
  validatePasswordMatch,
  validateFutureDate,
  commonRules,
  patterns,
  messages,
};

