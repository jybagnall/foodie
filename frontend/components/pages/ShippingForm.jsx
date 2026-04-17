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
import useAddressBook from "../../hooks/useAddressBook";
import AddressSelector from "./userDashboard/address/AddressSelector";
import useAccessToken from "../../hooks/useAccessToken";

export default function ShippingForm() {
  const { items, totalAmount } = useContext(CartContext);
  const accessToken = useAccessToken();
  const { addresses, isFetching, fetchingError, isDeleteError } =
    useAddressBook();

  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [isOrderProcessing, setIsOrderProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const methods = useForm();
  const abortControllerRef = useRef(null);

  useEffect(() => {
    document.title = "Shipping Form | Foodie";

    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const onAddressSubmit = async (formData) => {
    if (items.length === 0 || !totalAmount || totalAmount <= 0) {
      setErrorMsg(
        "Your cart is empty. Please add items before placing an order.",
      );
      return;
    }

    // 새 주소 입력 || 편집한 아이디면 폼 제출 : 선택한 주소 제출
    const shippingInfo =
      !selectedAddressId || editingAddressId
        ? formData
        : addresses.find((a) => a.id === selectedAddressId);

    if (!shippingInfo) {
      setErrorMsg("Please select or enter a shipping address.");
      return;
    }

    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    const orderService = new OrderService(
      abortControllerRef.current.signal,
      () => accessToken,
    );

    const orderDetails = {
      address: {
        full_name: shippingInfo.full_name.trim(),
        street: shippingInfo.street.trim(),
        city: shippingInfo.city.trim(),
        postal_code: String(shippingInfo.postal_code).trim(),
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

    setIsOrderProcessing(true);
    try {
      const { orderId } = await orderService.initializeOrder(orderDetails);
      queryClient.invalidateQueries({ queryKey: ["defaultAddress"] });
      queryClient.invalidateQueries({ queryKey: ["addressBook"] });
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

  if (fetchingError) {
    console.error(fetchingError.message);
  }

  if (isFetching) {
    return <Spinner />;
  }

  const errorProps = [
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

  const currentError = errorProps.find(({ condition }) => condition);

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
            onSubmit={methods.handleSubmit(onAddressSubmit)}
          >
            {addresses.length > 0 ? (
              <AddressSelector
                addresses={addresses}
                selectedAddressId={selectedAddressId}
                setSelectedAddressId={setSelectedAddressId}
                onAddressSubmit={onAddressSubmit}
                editingAddressId={editingAddressId}
                setEditingAddressId={setEditingAddressId}
              />
            ) : (
              <AddressFields />
            )}

            <div className="flex justify-between items-center mt-3">
              <Button
                type="button"
                textOnly
                className="text-gray-300 hover:text-gray-400"
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
        </FormProvider>
      </section>
    </main>
  );
}
