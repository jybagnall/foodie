export default function StatusBadge({ status }) {
  const base =
    "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium";

  const styles = {
    dead: "bg-red-100 text-red-700",
    failed: "bg-yellow-100 text-yellow-700",
  };

  return (
    <span
      className={`${base} ${styles[status] || "bg-gray-100 text-gray-700"}`}
    >
      {status}
    </span>
  );
}
