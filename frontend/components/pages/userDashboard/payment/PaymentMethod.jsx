import { useEffect, useState } from "react";
import { CreditCardIcon } from "@heroicons/react/24/outline";
import EmptyDataState from "../../../UI/EmptyDataState";
import useSavedCards from "../../../../hooks/useSavedCards";
import Spinner from "../../../user_feedback/Spinner";
import SavedCard from "../../Payment/SavedCard";
import AlertModal from "../../../UI/AlertModal";
import ErrorAlert from "../../../user_feedback/ErrorAlert";

export default function PaymentMethods() {
  const {
    savedCards,
    isFetching,
    isFetchingError,
    deleteCard,
    isDeleting,
    isDeleteError,
  } = useSavedCards();
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    document.title = "Payment Methods | Foodie";
  }, []);

  if (isFetching) return <Spinner />;
  if (isFetchingError) return <PageError />;
  if (savedCards.length === 0)
    return (
      <EmptyDataState
        icon={CreditCardIcon}
        title="Uh Oh!"
        message="No payment methods saved yet. You may add a new one at checkout."
      />
    );

  return (
    <div className="min-h-screen flex justify-center items-start px-4">
      <div className="w-full max-w-lg">
        {isDeleteError && (
          <div className="w-full max-w-2xl">
            <ErrorAlert
              title="Delete failed"
              message="We couldn't delete the card. Please try again later."
            />
          </div>
        )}
        <div className="flex flex-col gap-5">
          <p className="font-bold text-xl">Payment Methods</p>
          {savedCards.map((card) => (
            <SavedCard
              key={card.id}
              card={card}
              selectedCardId={selectedCardId}
              setSelectedCardId={setSelectedCardId}
            />
          ))}
          {selectedCardId && (
            <button
              onClick={() => setShowAlert(true)}
              disabled={isDeleting}
              className="px-3 py-1 border rounded cursor-pointer hover:bg-gray-800"
            >
              Remove
            </button>
          )}
        </div>

        {showAlert && (
          <AlertModal
            activateFn={() =>
              deleteCard(selectedCardId, {
                onSuccess: () => setShowAlert(false),
                onError: () => setShowAlert(false),
              })
            }
            isActivating={isDeleting}
            modalIsOpen={showAlert}
            onCancel={() => setShowAlert(false)}
            title="Are you sure to delete this card?"
            userIntentionText="Delete"
          />
        )}
      </div>
    </div>
  );
}
