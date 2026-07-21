export const addressFieldConfigs = {
  full_name: {
    label: "Receiver's Name",
    type: "text",
  },
  phone: {
    label: "Phone number",
    type: "tel",
  },
  street: {
    label: "Street",
    type: "text",
  },
  postal_code: {
    label: "Postal code",
    type: "text",
  },
  city: {
    label: "City",
    type: "text",
  },
};

export const addressValidationRules = {
  full_name: {
    required: true,
    minLength: 5,
    maxLength: 20,
  },
  phone: {
    required: "Phone number is required",
    minLength: {
      value: 10,
      message: "Phone number must be at least 10 digits.",
    },
    maxLength: {
      value: 20,
      message: "Phone number cannot exceed 20 digits.",
    },
    validate: {
      validFormat: (value) =>
        /^\+?\d{9,20}$/.test(value.replace(/[-\s]/g, "")) ||
        "Invalid phone number format.",
    },
  },
  street: {
    required: "Street is required",
    minLength: {
      value: 3,
      message: "Street name must be at least 3 characters long.",
    },
    maxLength: {
      value: 100,
      message: "Street name cannot exceed 100 characters.",
    },
    validate: {
      noSpacesOnly: (value) =>
        value.trim().length > 0 || "Street cannot be blank or spaces only.",
    },
  },
  postal_code: {
    required: "Postal code is required",
    minLength: {
      value: 4,
      message: "Postal code must be at least 4 digits.",
    },
    maxLength: {
      value: 10,
      message: "Postal code cannot exceed 10 digits.",
    },
    validate: {
      isNumber: (value) =>
        /^\d+$/.test(value) || "Postal code must contain only numbers.",
    },
  },
  city: {
    required: "City is required",
    minLength: {
      value: 2,
      message: "City name must be at least 2 characters.",
    },
    maxLength: {
      value: 50,
      message: "City name cannot exceed 50 characters.",
    },
    validate: {
      onlyLetters: (value) =>
        /^[A-Za-z\s]+$/.test(value) || "City name must contain only letters.",
      noSpacesOnly: (value) =>
        value.trim().length > 0 || "City cannot be blank or spaces only.",
    },
  },
};
