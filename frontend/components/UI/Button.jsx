export default function Button({
  children,
  textOnly,
  type = "button",
  propStyle = "",
  ...props
}) {
  let styleToApply = textOnly
    ? "cursor-pointer bg-transparent border-0 transition-colors"
    : "cursor-pointer border rounded-md font-semibold shadow-md hover:shadow-lg transition-all duration-200";
  styleToApply += " " + propStyle;

  return (
    <button className={styleToApply} {...props}>
      {children}
    </button>
  );
}
// text-only 일 때 넘겨야 하는 값:
//  text-yellow-300 hover:text-yellow-400

// 버튼에 테두리가 있어야 할 때 넘겨야 하는 값:
// py-1 px-3 bg-yellow-300 text-gray-800 border-yellow-300 hover:bg-yellow-400
