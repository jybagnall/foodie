import { useNavigate } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { useEffect, useMemo } from "react";
import useBrandAssetsMutations from "../../hooks/useBrandAssetsMutations";
import SpinnerMini from "../user_feedback/SpinnerMini";
import BackToDash from "../UI/BackToDash";
import ErrorAlert from "../user_feedback/ErrorAlert";
import Input from "../UI/Input";
import Button from "../UI/Button";
import ImageAssetField from "./ImageAssetField";

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

          <ImageAssetField label="Logo" assetType="logo" />
          <div className="mb-8" />
          <ImageAssetField label="Error Image" assetType="error_image" />
        </section>
      </div>
    </main>
  );
}
