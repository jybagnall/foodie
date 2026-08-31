import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FormProvider, useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import Button from "../UI/Button";
import CartContext from "../../contexts/CartContext";
import OrderService from "../../services/order.service";
import ErrorAlert from "../user_feedback/ErrorAlert";
import Spinner from "../user_feedback/Spinner";
import { getUserErrorMessage } from "../../utils/getUserErrorMsg";
import SpinnerMini from "../user_feedback/SpinnerMini";
import AddressFields from "../UI/AddressFields";
import useAddressBook from "../../hooks/address/useAddressBook";
import AddressSelector from "./userDashboard/address/AddressSelector";
import useAccessToken from "../../hooks/auth/useAccessToken";
import useUserId from "../../hooks/auth/useUserId";
import { buildOrderDetails, isCartReady } from "../../utils/orderHelpers";
import useAddressMode from "../../hooks/address/useAddressMode";
import { getShippingFormError } from "../../utils/addressErrors";

export default function ShippingForm() {
  const methods = useForm({ mode: "onChange" });
  const {
    handleSubmit,
    formState: { isValid, isDirty },
  } = methods;

  const cart = useContext(CartContext);
  const accessToken = useAccessToken();
  const userId = useUserId();

  const { addresses, isFetching, fetchingError, isDeleteError } =
    useAddressBook();

  const [isOrderProcessing, setIsOrderProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const addressMode = useAddressMode({
    addresses,
    isFetching,
    isDirty,
    isValid,
  });

  const {
    selectedAddressId,
    exitAddressForm,
    isSelecting,
    isEditing,
    isCreating,
    isAddressReady,
  } = addressMode;

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const abortControllerRef = useRef(null);

  useEffect(() => {
    document.title = "Shipping Form | Foodie";

    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const error = getShippingFormError({
    fetchingError,
    isDeleteError,
    errorMsg,
  });

  const backButtonLabel =
    isEditing || (isCreating && addresses.length > 0) ? "Back" : "Cancel";

  const onAddressSubmit = async (formData) => {
    if (isOrderProcessing) return;
    if (!isCartReady(cart)) {
      setErrorMsg(
        "Your cart is empty. Please add items before placing an order.",
      );
      return;
    }

    // 선택 모드 ? 선택한 주소 제출 : 새 주소나 편집 주소 제출
    const shippingInfo = isSelecting
      ? addresses.find((a) => a.id === selectedAddressId)
      : formData;

    if (!shippingInfo) {
      setErrorMsg("Please select or enter a shipping address.");
      return;
    }

    abortControllerRef.current = new AbortController();

    const orderService = new OrderService(
      abortControllerRef.current.signal,
      () => accessToken,
    );

    const orderDetails = buildOrderDetails(
      shippingInfo,
      cart.items,
      cart.selectedItemIds,
    );
    setIsOrderProcessing(true);

    try {
      const { orderId } = await orderService.initializeOrder(orderDetails);
      queryClient.invalidateQueries({ queryKey: ["defaultAddress", userId] });
      queryClient.invalidateQueries({ queryKey: ["addressBook", userId] });
      navigate(`/order/payment/${orderId}`, { replace: true });
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

  if (isFetching) {
    return <Spinner />;
  }

  return (
    <main className="min-h-screen flex justify-center items-start py-20 px-4">
      <section className="w-full max-w-lg bg-gray-700 shadow-2xl rounded-xl p-8 border border-gray-700">
        {error && (
          <div className="mb-4">
            <ErrorAlert title={error.title} message={error.message} />
          </div>
        )}

        <h2
          className={`text-2xl font-semibold text-gray-200 mb-6 pb-3 ${addresses.length > 0 ? "" : "border-b"}`}
        >
          Shipping Address
        </h2>

        <FormProvider {...methods}>
          <form
            className="flex flex-col gap-5"
            onSubmit={handleSubmit(onAddressSubmit)}
          >
            {addresses.length > 0 ? (
              <AddressSelector
                addresses={addresses}
                onAddressSubmit={onAddressSubmit}
                addressMode={addressMode}
              />
            ) : (
              <AddressFields />
            )}

            <div className="flex justify-between items-center mt-3">
              <Button
                type="button"
                variant="text"
                className="text-gray-200 hover:text-gray-300"
                onClick={exitAddressForm}
              >
                {backButtonLabel}
              </Button>
              <Button
                type="submit"
                disabled={isOrderProcessing || !isAddressReady}
                variant="accent"
              >
                {isOrderProcessing ? <SpinnerMini /> : "Next"}
              </Button>
            </div>
          </form>
        </FormProvider>
      </section>
    </main>
  );
}
