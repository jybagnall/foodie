import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import Button from "../UI/Button";
import CartContext from "../../contexts/CartContext";
import OrderService from "../../services/order.service";
import AuthContext from "../../contexts/AuthContext";
import ErrorAlert from "../user_feedback/ErrorAlert";
import { getUserErrorMessage } from "../../utils/getUserErrorMsg";
import useDefaultAddress from "../../hooks/useAddress";
import SpinnerMini from "../user_feedback/SpinnerMini";
import AddressFields from "../UI/AddressFields";

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
    console.error(addressFetchingError.message);
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
          <AddressFields register={register} errors={errors} />

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
