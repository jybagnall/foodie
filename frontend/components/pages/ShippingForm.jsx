import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FormProvider, set, useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import Button from "../UI/Button";
import CartContext from "../../contexts/CartContext";
import OrderService from "../../services/order.service";
import ErrorAlert from "../user_feedback/ErrorAlert";
import Spinner from "../user_feedback/Spinner";
import { getUserErrorMessage } from "../../utils/getUserErrorMsg";
import SpinnerMini from "../user_feedback/SpinnerMini";
import AddressFields from "../UI/AddressFields";
import useAddressBook from "../../hooks/useAddressBook";
import AddressSelector from "./userDashboard/address/AddressSelector";
import useAccessToken from "../../hooks/useAccessToken";
import useUserId from "../../hooks/useUserId";
import { buildOrderDetails } from "../../utils/orderHelpers";
import { ADDRESS_MODE } from "./userDashboard/address/address.constants";

export default function ShippingForm() {
  const { items, totalAmount, subTotalAmount, deliveryFee, selectedItemIds } =
    useContext(CartContext);
  const accessToken = useAccessToken();
  const userId = useUserId();
  const { addresses, isFetching, fetchingError, isDeleteError } =
    useAddressBook();

  const [mode, setMode] = useState(ADDRESS_MODE.CREATE);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isOrderProcessing, setIsOrderProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const abortControllerRef = useRef(null);
  const methods = useForm();
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

  useEffect(() => {
    if (!isFetching && addresses.length > 0) {
      setMode(ADDRESS_MODE.SELECT);
    }
  }, [isFetching]);

  useEffect(() => {
    if (addresses.length === 1 && !selectedAddressId) {
      setSelectedAddressId(addresses[0].id);
    }
  }, [addresses]);

  const canSubmitSelect = mode === ADDRESS_MODE.SELECT && !!selectedAddressId;
  const canSubmitEdit = mode === ADDRESS_MODE.EDIT && isDirty && isValid;
  const canSubmitCreate = mode === ADDRESS_MODE.CREATE && isValid;
  const isAddressReady = canSubmitSelect || canSubmitEdit || canSubmitCreate;

  const handleCancel = () => {
    if (mode === ADDRESS_MODE.EDIT) {
      setMode(ADDRESS_MODE.SELECT);
      setSelectedAddressId(null);
    } else if (mode === ADDRESS_MODE.CREATE && addresses.length > 0) {
      setMode(ADDRESS_MODE.SELECT);
    } else {
      navigate("/cart");
    }
  };

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
    const shippingInfo =
      mode === ADDRESS_MODE.SELECT
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

  const currentError = errorConfigs.find(({ condition }) => condition);

  if (fetchingError) console.error(fetchingError.message);

  if (isFetching) {
    return <Spinner />;
  }

  return (
    <main className="min-h-screen flex justify-center items-start py-20 px-4">
      <section className="w-full max-w-lg bg-gray-700 shadow-2xl rounded-xl p-8 border border-gray-700">
        {errorMsg && (
          <div className="mb-4">
            <ErrorAlert title="There was a problem" message={errorMsg} />
          </div>
        )}
        {currentError && (
          <div className="mb-4">
            <ErrorAlert
              title={currentError.title}
              message={currentError.errorMsg}
            />
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
                selectedAddressId={selectedAddressId}
                setSelectedAddressId={setSelectedAddressId}
                mode={mode}
                setMode={setMode}
                onAddressSubmit={onAddressSubmit}
              />
            ) : (
              <AddressFields />
            )}

            <div className="flex justify-between items-center mt-3">
              <Button
                type="button"
                textOnly
                className="text-gray-300 hover:text-gray-400"
                onClick={handleCancel}
              >
                {mode === ADDRESS_MODE.EDIT ||
                (mode === ADDRESS_MODE.CREATE && addresses.length > 0)
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
