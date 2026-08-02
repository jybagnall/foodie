import { useFormContext } from "react-hook-form";

import Checkbox from "./Checkbox";
import Input from "./Input";
import Select from "./Select";
import {
  addressFieldConfigs,
  addressValidationRules,
} from "../../constants/address";
import { US_STATES } from "../../constants/usStates";

export default function AddressFields() {
  const {
    register,
    formState: { errors, touchedFields },
  } = useFormContext();

  const mainFields = ["full_name", "phone", "street"];
  const gridFields = ["postal_code", "city"];

  const renderInput = (key) => (
    <Input
      key={key}
      id={key}
      {...addressFieldConfigs[key]}
      register={register(key, addressValidationRules[key])}
      error={touchedFields[key] ? errors[key] : undefined}
    />
  );

  return (
    <>
      {mainFields.map(renderInput)}

      <div className="grid grid-cols-2 gap-5">
        {gridFields.map(renderInput)}
      </div>

      <Select
        id="state"
        label="State"
        register={register("state", {
          required: "State is required.",
        })}
        error={errors.state}
        options={US_STATES}
        placeholder="Select a state"
      />
      <Checkbox
        label="Set as default address"
        id="is_default"
        register={register("is_default")}
      />
    </>
  );
}
