import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useContext, useEffect } from "react";
import AddressFields from "../UI/AddressFields";
import AuthContext from "../../contexts/AuthContext";
import useAddressBook from "../../hooks/useAddressBook";
import SpinnerMini from "../user_feedback/SpinnerMini";
import Button from "../UI/Button";
import ErrorAlert from "../user_feedback/ErrorAlert";

export default function AddressForm() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const { accessToken } = useContext(AuthContext);
  const navigate = useNavigate();
  const { state } = useLocation();
  const address = state?.address;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm();

  const {
    createAddress,
    isCreating,
    isCreateError,
    updateAddress,
    isUpdating,
    isUpdateError,
  } = useAddressBook(accessToken);

  const onAddressSubmit = async ({
    full_name,
    street,
    city,
    postal_code,
    phone,
    is_default,
  }) => {
    const payload = { full_name, street, city, postal_code, phone, is_default };

    if (isEditMode) {
      updateAddress(
        { addressId: address.id, payload },
        {
          onSuccess: () => {
            navigate("/my-account/address");
          },
        },
      );
      return;
    }

    createAddress(payload, {
      onSuccess: () => {
        navigate("/my-account/address");
      },
    });
  };

  const onCancelSubmit = () => {
    navigate("/my-account/address");
  };

  useEffect(() => {
    if (address) {
      reset({
        full_name: address.full_name,
        street: address.street,
        city: address.city,
        postal_code: String(address.postal_code),
        phone: address.phone,
        is_default: address.is_default,
      });
    }
  }, [address, reset]);

  const errorProps = isEditMode
    ? {
        condition: isUpdateError,
        title: "Couldn't update address",
        message:
          "Something went wrong while updating your address. Please try again.",
      }
    : {
        condition: isCreateError,
        title: "Couldn't save address",
        message:
          "Something went wrong while saving your new address. Please try again.",
      };

  return (
    <main className="min-h-screen flex justify-center items-start py-10 px-4">
      <section className="w-full max-w-lg bg-gray-400 border-2 border-gray-400 shadow-xl rounded-xl p-8">
        {errorProps.condition && (
          <div className="mb-4">
            <ErrorAlert title={errorProps.title} message={errorProps.message} />
          </div>
        )}

        <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">
          {isEditMode ? "Edit Address" : "Add Address"}
        </h2>

        <form
          className="flex flex-col gap-5"
          onSubmit={handleSubmit(onAddressSubmit)}
        >
          <AddressFields register={register} errors={errors} />

          <div className="flex justify-between items-center mt-8">
            <Button
              type="button"
              textOnly
              className="text-gray-800 hover:text-gray-700"
              onClick={onCancelSubmit}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreating || isUpdating || (isEditMode && !isDirty)}
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-md transition"
            >
              {isCreating || isUpdating ? <SpinnerMini /> : "Save"}
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}
