export const signupFieldConfigs = {
  name: {
    label: "Your Name",
    type: "text",
  },
  email: {
    label: "Email",
    type: "email",
  },
};

export const signupValidationRules = {
  name: {
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
  email: {
    required: "Email is required",
    pattern: {
      value: /^\S+@\S+$/i,
      message: "Please enter a valid email address.",
    },
  },
};
