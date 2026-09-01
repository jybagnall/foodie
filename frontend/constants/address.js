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
    maxLength: {
      value: 20,
      message: "Name cannot exceed 20 characters.",
    },
    validate: {
      noSpacesOnly: (value) =>
        value.trim().length > 0 || "Name cannot be blank or spaces only.",
      minTrimmedLength: (value) =>
        value.trim().length >= 2 || "Name must be at least 2 characters.",
    },
  },
  phone: {
    required: "Phone number is required",
    pattern: {
      value: /^\d{10,20}$/,
      message: "Enter 10–20 digits without spaces.",
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
    pattern: {
      value: /^\d{4,10}$/,
      message: "Postal code must contain 4–10 digits.",
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

export const DEFAULT_ADDRESS_VALUES = {
  full_name: "",
  street: "",
  city: "",
  state: "",
  postal_code: "",
  phone: "",
  is_default: false,
};
