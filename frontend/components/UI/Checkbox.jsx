export default function Checkbox({ label, id, register }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          id={id}
          {...register}
          className="w-4 h-4 text-yellow-500 border-gray-300 rounded focus:ring-yellow-400"
        />
        <span className="text-sm text-gray-700">{label}</span>
      </label>
    </div>
  );
}
