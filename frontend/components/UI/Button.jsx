export default function Button({
  children,
  variant = "default",
  type = "button",
  disabled = false,
  className = "",
  ...props
}) {
  const baseStyle =
    "cursor-pointer inline-flex items-center justify-center rounded-md font-semibold transition-all duration-200 py-1 px-3";

  const variants = {
    default: "shadow-md hover:shadow-lg",
    text: "bg-transparent border-0 shadow-none",
    primary:
      "bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg",
    accent:
      "bg-yellow-300 text-gray-800 border-yellow-300 hover:bg-yellow-400 shadow-md hover:shadow-lg",
    outline:
      "bg-gray-50 text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-100",
    danger:
      "bg-rose-500 hover:bg-rose-600 text-gray-50 shadow-md hover:shadow-lg",
  };

  const disabledStyle =
    "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none pointer-events-none";

  const styleToApply = [
    baseStyle,
    disabled ? disabledStyle : variants[variant],
    !disabled && className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button {...props} type={type} disabled={disabled} className={styleToApply}>
      {children}
    </button>
  );
}
