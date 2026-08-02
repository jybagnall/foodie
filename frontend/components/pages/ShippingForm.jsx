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
import { buildOrderDetails } from "../../utils/orderHelpers";
import useAddressMode from "../../hooks/address/useAddressMode";

export default function ShippingForm() {
  const { items, totalAmount, subTotalAmount, deliveryFee, selectedItemIds } =
    useContext(CartContext);
  const accessToken = useAccessToken();
  const userId = useUserId();
  const { addresses, isFetching, fetchingError, isDeleteError } =
    useAddressBook();
  const {
    selectedAddressId,
    exitAddressForm,
    isSelecting,
    isEditing,
    isCreating,
    mode,
    editAddress,
    createAddress,
    selectAddress,
  } = useAddressMode(addresses, isFetching);

  const [isOrderProcessing, setIsOrderProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const abortControllerRef = useRef(null);

  const methods = useForm({ mode: "onChange" });

  const {
    handleSubmit,
    formState: { isValid, isDirty },
  } = methods;

  useEffect(() => {
    document.title = "Shipping Form | Foodie";

    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const canSubmitSelect = isSelecting && !!selectedAddressId;
  const canSubmitEdit = isEditing && isDirty && isValid;
  const canSubmitCreate = isCreating && isValid;
  const isAddressReady = canSubmitSelect || canSubmitEdit || canSubmitCreate;

  const onAddressSubmit = async (formData) => {
    if (isOrderProcessing) return;
    if (
      items.length === 0 ||
      selectedItemIds.size === 0 ||
      !totalAmount ||
      !subTotalAmount ||
      deliveryFee === null ||
      subTotalAmount <= 0 ||
      totalAmount <= 0
    ) {
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
      items,
      selectedItemIds,
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

  const errorConfigs = [
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
  const resolvedError = errorConfigs.find((config) => config.condition);

  // if, else if, else
  const error = errorMsg
    ? { title: "There was a problem", message: errorMsg }
    : resolvedError
      ? {
          title: resolvedError.title,
          message: resolvedError.errorMsg,
        }
      : null;

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
                mode={mode}
                selectedAddressId={selectedAddressId}
                editAddress={editAddress}
                createAddress={createAddress}
                selectAddress={selectAddress}
                isEditing={isEditing}
                isCreating={isCreating}
              />
            ) : (
              <AddressFields />
            )}

            <div className="flex justify-between items-center mt-3">
              <Button
                type="button"
                textOnly
                className="text-gray-300 hover:text-gray-400"
                onClick={exitAddressForm}
              >
                {isEditing || (isCreating && addresses.length > 0)
                  ? "Back"
                  : "Cancel"}
              </Button>
              <Button
                type="submit"
                disabled={isOrderProcessing || !isAddressReady}
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-md px-5 py-2 transition"
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
