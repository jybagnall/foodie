import { CreditCardIcon } from "@heroicons/react/24/outline";
import EmptyDataState from "../../../UI/EmptyDataState";

export default function PaymentMethods() {
  return (
    <div>
      payment methods
      <EmptyDataState
        icon={CreditCardIcon}
        title="Uh Oh!"
        message="No payment methods saved yet. You may add a new one at checkout."
      />
    </div>
  );
}
