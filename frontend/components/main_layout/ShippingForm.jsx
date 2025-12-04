import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import Input from "../UI/Input";
import Button from "../UI/Button";

export default function ShippingForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();

  const onAddressSubmit = (data) => {
    console.log(data);
  };

  const onCancelSubmit = () => {
    navigate("/");
  };

  useEffect(() => {
    document.title = "Shipping form | Foodie";
  }, []);

  return (
    <main className="min-h-screen flex justify-center items-start bg-gray-50 py-20 px-4">
      <section className="w-full max-w-lg bg-white shadow-xl rounded-xl p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">
          Shipping Address
        </h2>

        <form
          className="flex flex-col gap-5"
          onSubmit={handleSubmit(onAddressSubmit)}
        >
          <Input
            label="Full Name"
            type="text"
            id="name"
            register={register("name", {
              required: true,
              minLength: 5,
              maxLength: 20,
            })}
            error={errors.name}
          />

          <Input
            label="Street"
            type="text"
            id="street"
            register={register("street", { required: "Street is required" })}
            error={errors.street}
          />

          <div className="grid grid-cols-2 gap-5">
            <Input
              label="Postal code"
              type="number"
              id="postal-code"
              register={register("postalCode", {
                required: "Postal code is required",
              })}
              error={errors.postalCode}
            />
            <Input
              label="City"
              type="text"
              id="city"
              register={register("city", { required: "City is required" })}
              error={errors.city}
            />
          </div>

          <div className="flex justify-between items-center mt-8">
            <Button
              type="button"
              textOnly
              propStyle="text-gray-500 hover:text-gray-700"
              onClick={onCancelSubmit}
            >
              Cancel
            </Button>
            <Button className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-md px-5 py-2 transition">
              Next
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}
