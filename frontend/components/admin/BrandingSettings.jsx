import { useEffect } from "react";
import BackToDash from "../UI/BackToDash";
import BrandImageUploader from "./BrandImageUploader";

export default function BrandingSettings() {
  useEffect(() => {
    document.title = "Manage Brand Assets | Foodie";
  }, []);

  return (
    <main className="min-h-screen flex justify-center items-start py-20 px-4">
      <div className="w-full max-w-lg">
        <div className="mb-4">
          <BackToDash url="/admin" dashboardName="Back to admin dashboard" />
        </div>

        <section className="w-full max-w-lg bg-gray-700 shadow-xl rounded-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-200 mb-6 border-b pb-3">
            Manage Brand Assets
          </h2>

          <BrandImageUploader label="Logo" assetType="logo" />
          <div className="mb-8" />
          <BrandImageUploader label="Error Image" assetType="error_image" />
        </section>
      </div>
    </main>
  );
}
