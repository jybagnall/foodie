import { formatDateTime } from "../../utils/format.js";
import StatusBadge from "./StatusBadge.jsx";

const columns = [
  { key: "id", label: "ID", className: "w-14" },
  { key: "event_type", label: "Event Type", className: "w-40" },
  {
    key: "status",
    label: "Status",
    className: "w-18",
    render: (value) => <StatusBadge status={value} />,
  },
  {
    key: "retry_count",
    label: "Retry Count",
    className: "w-28",
    align: "center", // 헤더: 가운데 그대로
    cellAlign: "center-left", // 값: 가운데에서 살짝 왼쪽
  },
  { key: "last_error", label: "Last Error", className: "w-64" },
  {
    key: "created_at",
    label: "Created At",
    className: "w-40",
    render: (value) => formatDateTime(value),
  },
];

const thClass = "py-3.5 px-3 text-left text-sm font-semibold text-indigo-200";
const tdClass = "px-3 py-3 text-gray-200 truncate";

const alignClass = {
  center: "text-center",
  "center-left": "text-center pr-6", // 가운데에서 살짝 왼쪽으로
  right: "text-right",
};

function DesktopTable({ events }) {
  return (
    <div className="hidden sm:block overflow-x-auto">
      <table className="w-full table-fixed text-sm">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={`${thClass} ${col.className ?? ""} ${
                  col.align ? alignClass[col.align] : ""
                }`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200">
          {events.map((event) => (
            <tr key={event.id}>
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`${tdClass} ${
                    col.align ? alignClass[col.align] : ""
                  }`}
                  title={String(event[col.key] ?? "")}
                >
                  {col.render
                    ? col.render(event[col.key], event)
                    : event[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MobileEventCard({ event }) {
  return (
    <article className="rounded-lg border border-gray-600 bg-gray-800 p-4">
      <div className="mb-4">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
          Event Type
        </p>

        <p className="mt-1 break-words text-sm font-medium text-gray-100">
          {event.event_type}
        </p>
      </div>

      <dl className="space-y-3 text-sm">
        <div className="grid grid-cols-[7rem_1fr] items-center gap-4">
          <dt className="text-gray-400">Status</dt>
          <dd className="text-left">
            <StatusBadge status={event.status} />
          </dd>
        </div>

        <div className="grid grid-cols-[7rem_1fr] items-center gap-8">
          <dt className="text-gray-400">Retry Count</dt>
          <dd className="text-left text-gray-200">{event.retry_count}</dd>
        </div>

        <div className="flex flex-col gap-1">
          <dt className="text-gray-400">Created At</dt>
          <dd className="text-gray-200">{formatDateTime(event.created_at)}</dd>
        </div>

        <div className="flex flex-col gap-1">
          <dt className="text-gray-400">Last Error</dt>
          <dd className="break-words text-gray-200">
            {event.last_error || "-"}
          </dd>
        </div>

        <div className="flex flex-col gap-1">
          <dt className="text-gray-400">ID</dt>
          <dd className="break-all text-xs text-gray-300">{event.id}</dd>
        </div>
      </dl>
    </article>
  );
}

function MobileEventList({ events }) {
  return (
    <div className="flex flex-col gap-3 sm:hidden">
      {events.map((event) => (
        <MobileEventCard key={event.id} event={event} />
      ))}
    </div>
  );
}

export default function StripeEventTable({ events }) {
  return (
    <>
      <DesktopTable events={events} />
      <MobileEventList events={events} />
    </>
  );
}

// render: 내가 지정한 함수로 가공해서 출력함.
