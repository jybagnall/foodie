import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import Input from "../UI/Input";
import Button from "../UI/Button";
import CartContext from "../../contexts/CartContext";
import OrderService from "../../services/order.service";
import AuthContext from "../../contexts/AuthContext";
import ErrorAlert from "../user_feedback/ErrorAlert";
import { getUserErrorMessage } from "../../utils/getUserErrorMsg";
import Checkbox from "../UI/Checkbox";
import useDefaultAddress from "../../hooks/useAddress";
import SpinnerMini from "../user_feedback/SpinnerMini";

export default function ShippingForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitted },
  } = useForm();
  const { items, totalAmount } = useContext(CartContext);
  const { accessToken } = useContext(AuthContext);
  const { defaultAddress, addressFetchingError } =
    useDefaultAddress(accessToken);
  const [isOrderProcessing, setIsOrderProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const onAddressSubmit = async (shippingInfo) => {
    const abortController = new AbortController();
    const orderService = new OrderService(
      abortController.signal,
      () => accessToken,
    );

    if (items.length === 0 || !totalAmount || totalAmount <= 0) {
      setErrorMsg(
        "Your cart is empty. Please add items before placing an order.",
      );
      return;
    }

    const orderDetails = {
      address: {
        full_name: shippingInfo.full_name.trim(),
        street: shippingInfo.street.trim(),
        city: shippingInfo.city.trim(),
        postal_code: shippingInfo.postal_code.trim(),
        phone: shippingInfo.phone.trim(),
        is_default: shippingInfo.is_default,
      },
      orderPayload: {
        items: items.map((i) => ({
          menu_name: i.name,
          menu_id: i.id,
          qty: i.qty,
        })),
      },
    };

    try {
      setIsOrderProcessing(true);
      const { orderId } = await orderService.initializeOrder(orderDetails);
      queryClient.invalidateQueries({ queryKey: ["defaultAddress"] });
      navigate(`/order/payment/${orderId}`);
    } catch (err) {
      console.error(err);
      const message = getUserErrorMessage(err);
      if (message) {
        setErrorMsg(message);
      }
    } finally {
      setIsOrderProcessing(false);
    }
  };

  const onCancelSubmit = () => {
    navigate("/");
  };

  useEffect(() => {
    document.title = "Shipping form | Foodie";
  }, []);

  useEffect(() => {
    if (defaultAddress && !isDirty && !isSubmitted) {
      reset({
        ...defaultAddress,
        postal_code: String(defaultAddress.postal_code),
      });
    }
  }, [defaultAddress, reset, isDirty, isSubmitted]);

  if (addressFetchingError) {
    console.error(addressFetchingError);
  }

  return (
    <main className="min-h-screen flex justify-center items-start bg-gray-50 py-20 px-4">
      <section className="w-full max-w-lg bg-white shadow-xl rounded-xl p-8">
        {errorMsg && (
          <div className="mb-4">
            <ErrorAlert title="There was a problem" message={errorMsg} />
          </div>
        )}
        {addressFetchingError && (
          <div className="mb-4">
            <ErrorAlert
              title="We couldn't load your saved address"
              message="Please enter a new one"
            />
          </div>
        )}
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">
          Shipping Address
        </h2>

        <form
          className="flex flex-col gap-5"
          onSubmit={handleSubmit(onAddressSubmit)}
        >
          <Input
            label="Receiver's Name"
            type="text"
            id="full_name"
            register={register("full_name", {
              required: true,
              minLength: 5,
              maxLength: 20,
            })}
            error={errors.full_name}
          />
          <Input
            label="Phone number"
            type="tel"
            id="phone"
            register={register("phone", {
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
            })}
            error={errors.phone}
          />
          <Input
            label="Street"
            type="text"
            id="street"
            register={register("street", {
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
                  value.trim().length > 0 ||
                  "Street cannot be blank or spaces only.",
              },
            })}
            error={errors.street}
          />

          <div className="grid grid-cols-2 gap-5">
            <Input
              label="Postal code"
              type="text"
              id="postal_code"
              register={register("postal_code", {
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
                    /^\d+$/.test(value) ||
                    "Postal code must contain only numbers.",
                },
              })}
              error={errors.postal_code}
            />
            <Input
              label="City"
              type="text"
              id="city"
              register={register("city", {
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
                    /^[A-Za-z\s]+$/.test(value) ||
                    "City name must contain only letters.",
                  noSpacesOnly: (value) =>
                    value.trim().length > 0 ||
                    "City cannot be blank or spaces only.",
                },
              })}
              error={errors.city}
            />
            <Checkbox
              label="Set as default address"
              id="is_default"
              register={register("is_default")}
            />
          </div>

          <div className="flex justify-between items-center mt-8">
            <Button
              type="button"
              textOnly
              className="text-gray-500 hover:text-gray-700"
              onClick={onCancelSubmit}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isOrderProcessing}
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-md px-5 py-2 transition"
            >
              {isOrderProcessing ? <SpinnerMini /> : "Next"}
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}
