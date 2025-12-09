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
            register={register("street", {
              required: "Street is required",
              minLength: {
                value: 3,
                message: "Street name must be at least 3 characters long.",
              },
              maxLength: {
                value: 100,
                message: "Street name cannot exceed 100 characters.",
              },
              validate: {
                noSpacesOnly: (value) =>
                  value.trim().length > 0 ||
                  "Street cannot be blank or spaces only.",
              },
            })}
            error={errors.street}
          />

          <div className="grid grid-cols-2 gap-5">
            <Input
              label="Postal code"
              type="number"
              id="postal-code"
              register={register("postal_code", {
                required: "Postal code is required",
                minLength: {
                  value: 4,
                  message: "Postal code must be at least 4 digits.",
                },
                maxLength: {
                  value: 10,
                  message: "Postal code cannot exceed 10 digits.",
                },
                validate: {
                  isNumber: (value) =>
                    /^\d+$/.test(value) ||
                    "Postal code must contain only numbers.",
                },
              })}
              error={errors.postal_code}
            />
            <Input
              label="City"
              type="text"
              id="city"
              register={register("city", {
                required: "City is required",
                minLength: {
                  value: 2,
                  message: "City name must be at least 2 characters.",
                },
                maxLength: {
                  value: 50,
                  message: "City name cannot exceed 50 characters.",
                },
                validate: {
                  onlyLetters: (value) =>
                    /^[A-Za-z\s]+$/.test(value) ||
                    "City name must contain only letters.",
                  noSpacesOnly: (value) =>
                    value.trim().length > 0 ||
                    "City cannot be blank or spaces only.",
                },
              })}
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
