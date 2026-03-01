import { formatDate } from "../../utils/format.js";
import StatusBadge from "./StatusBadge.jsx";

const columns = [
  { key: "id", label: "ID" },
  { key: "event_type", label: "Event Type" },
  {
    key: "status",
    label: "Status",
    render: (value) => <StatusBadge status={value} />,
  },
  { key: "retry_count", label: "Retry Count" },
  { key: "last_error", label: "Last Error" },
  {
    key: "created_at",
    label: "Created At",
    render: (value) => formatDate(value),
  },
  // { key: "", label: "Actions" },
];

const thClass = "py-3.5 px-3 text-left text-sm font-semibold text-gray-900";
const tdClass = "px-3 py-3 whitespace-nowrap text-gray-800";

export default function StripeEventTable({ events }) {
  return (
    <table className="min-w-[700px] w-full divide-y divide-gray-200 text-sm">
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key} scope="col" className={thClass}>
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {events.map((e) => (
          <tr key={e.id}>
            {columns.map((col) => (
              <td key={col.key} className={tdClass}>
                {col.render ? col.render(e[col.key], e) : e[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// render: 내가 지정한 함수로 가공해서 출력함.
