export const menuFieldConfigs = {
  name: {
    label: "Menu Name",
    type: "text",
  },
  price: {
    label: "Price",
    type: "number",
    step: "0.01",
  },
  description: {
    label: "Description",
    type: "text",
  },
  image: {
    label: "Image",
    type: "file",
    accept: "image/*",
  },
};

export const menuValidationRules = {
  name: {
    required: "Menu name is required.",
    minLength: {
      value: 2,
      message: "Menu name must be at least 2 characters long.",
    },
    maxLength: {
      value: 50,
      message: "Menu name must be under 50 characters.",
    },
    validate: {
      noSpacesOnly: (value) =>
        value.trim().length > 0 || "Menu name cannot be blank or spaces only.",
    },
  },
  price: {
    valueAsNumber: true,
    validate: {
      required: (value) => !Number.isNaN(value) || "Price is required.",
      positive: (value) => value > 0 || "Price must be greater than 0.",
      decimalPlaces: (value) =>
        Number.isInteger(value * 100) ||
        "Price can have at most 2 decimal places.",
    },
  },
  description: {
    required: "Please enter a description.",
    minLength: {
      value: 5,
      message: "Description must be at least 5 characters long.",
    },
    maxLength: {
      value: 200,
      message: "Description cannot exceed 200 characters.",
    },
    validate: {
      noSpacesOnly: (value) =>
        value.trim().length > 0 ||
        "Description cannot be blank or spaces only.",
    },
  },
  image: {
    validate: {
      fileType: (value) => {
        if (!value[0]) return "Please select a file.";

        const type = value[0].type;
        if (!["image/jpeg", "image/png"].includes(type)) {
          return "Only JPEG and PNG files are allowed.";
        }
        return true; // 유효성 검사 통과
      },
    },
  },
};
