export const ADDRESS_MODE = {
  SELECT: "select",
  EDIT: "edit",
  CREATE: "create",
};

export const EMPTY_ADDRESS = {
  full_name: "",
  street: "",
  city: "",
  postal_code: "",
  phone: "",
  is_default: false,
};

export const ADDRESS_SELECTOR_HEADINGS = {
  [ADDRESS_MODE.SELECT]: "Select a shipping address",
  [ADDRESS_MODE.EDIT]: "Edit address",
  [ADDRESS_MODE.CREATE]: "Enter a new address",
};
