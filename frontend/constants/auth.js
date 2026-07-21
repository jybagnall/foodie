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
    minLength: 2,
    maxLength: 32,
  },
  email: {
    required: "Email is required",
    pattern: {
      value: /^\S+@\S+$/i,
      message: "Please enter a valid email address.",
    },
  },
};
