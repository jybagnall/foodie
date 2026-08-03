export function getShippingFormError({
  fetchingError,
  isDeleteError,
  errorMsg,
}) {
  const shippingFormErrorConfigs = [
    {
      condition: fetchingError,
      errorMsg: "We couldn't load your saved address.",
      title: "We couldn't load your saved address",
    },
    {
      condition: isDeleteError,
      errorMsg: "We couldn't delete the address. Please try again later.",
      title: "Delete failed",
    },
  ];

  // 조건이 처음으로 true인 객체
  const resolvedError = shippingFormErrorConfigs.find(
    (config) => config.condition,
  );

  // if, else if, else
  const error = errorMsg
    ? { title: "There was a problem", message: errorMsg }
    : resolvedError
      ? {
          title: resolvedError.title,
          message: resolvedError.errorMsg,
        }
      : null;

  return error;
}

export function getAddressBookError({
  isDefaultUpdateError,
  fetchingError,
  isDeleteError,
}) {
  const errorConfigs = [
    {
      condition: isDefaultUpdateError,
      errorMsg:
        "We couldn't update your default address. Please try again later.",
      title: "Update failed",
    },
    {
      condition: fetchingError,
      errorMsg:
        "We couldn't load your addresses due to a network issue. Please try again.",
      title: "Connection issue",
    },
    {
      condition: isDeleteError,
      errorMsg: "We couldn't delete the address. Please try again later.",
      title: "Delete failed",
    },
  ];

  const error = errorConfigs.find(({ condition }) => condition);

  return error;
}

export function getAddressFormError({
  isEditMode,
  isUpdateError,
  isCreateError,
}) {
  if (isEditMode && isUpdateError) {
    return {
      title: "Couldn't update address",
      errorMsg:
        "Something went wrong while updating your address. Please try again.",
    };
  }

  if (!isEditMode && isCreateError) {
    return {
      title: "Couldn't save address",
      errorMsg:
        "Something went wrong while saving your new address. Please try again.",
    };
  }

  return null;
}
