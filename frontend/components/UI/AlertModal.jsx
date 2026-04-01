import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import SpinnerMini from "../user_feedback/SpinnerMini";

export default function AlertModal({
  activateFn,
  isActivating,
  modalIsOpen,
  onCancel,
  alertText,
  userIntentionText,
}) {
  return (
    <div>
      <Dialog open={modalIsOpen} onClose={onCancel} className="relative z-10">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-900/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4 text-center">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-lg bg-gray-600 px-4 pt-5 pb-4 text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:p-6 data-closed:sm:translate-y-0 data-closed:sm:scale-95"
            >
              <div>
                <div className="mx-auto flex size-12 items-center justify-center rounded-full mb-2">
                  <ExclamationTriangleIcon
                    aria-hidden="true"
                    className="size-7 text-rose-600"
                  />
                </div>
                <div className="mt-1 text-center sm:mt-2">
                  <DialogTitle
                    as="h3"
                    className="text-base font-semibold text-gray-200"
                  >
                    {alertText}
                  </DialogTitle>
                  <div className="mt-2">
                    <p className="text-sm text-gray-300">
                      This cannot be undone.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex justify-center">
                <div className="mt-5 flex gap-3">
                  <button
                    onClick={activateFn}
                    disabled={isActivating}
                    className="inline-flex justify-center rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-rose-700"
                  >
                    {isActivating ? <SpinnerMini /> : userIntentionText}
                  </button>

                  <button
                    type="button"
                    onClick={onCancel}
                    className="inline-flex justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
