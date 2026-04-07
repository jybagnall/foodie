export default function EmptyDataState({
  icon: Icon,
  title = "Uh Oh!",
  message = "No data available.",
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 mt-10 text-center text-gray-600 border border-gray-100 rounded-lg">
      <div className="flex items-center justify-center w-24 h-24 rounded-full bg-gray-500">
        {Icon && <Icon className="w-12 h-12 text-gray-200" />}
      </div>
      <p className="text-lg mt-10 text-gray-200 font-bold">{title}</p>
      <p className="text-md font-medium mt-5 text-gray-200">{message}</p>
    </div>
  );
}
