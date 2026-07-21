import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";

export default function EditMenuModal({ modalIsOpen, onCancel, children }) {
  return (
    <Dialog open={modalIsOpen} onClose={onCancel} className="relative z-10">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-900/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          <DialogPanel
            transition
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border-2 border-indigo-300/30 bg-gray-700 p-6 shadow-2xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-leave:duration-200 data-closed:sm:scale-95"
          >
            <div className="mt-1 sm:mt-2">
              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={onCancel}
                  className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm font-medium text-gray-400 transition-all duration-200 hover:bg-gray-700 hover:text-white cursor-pointer"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  Close
                </button>
              </div>

              <div className="mt-8">{children}</div>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
