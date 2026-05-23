import { useState } from "react";
import { useTransactions } from "../hooks/useTransactions";
import { useRoomControl } from "../hooks/useRoomControl";
import { useNavigate,useLocation } from "react-router-dom";
import TransactionCard from "../components/Transactions/TransactionCard";
import { RefreshCw } from "lucide-react";

export default function TransactionsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const passedDate = location.state?.selectedDate;

  const role = localStorage.getItem("role");
  const isOwner = role === "owner";

  const [selectedDate, setSelectedDate] =
    useState(
      passedDate ??
      new Date().toISOString().split("T")[0]
    );

  const {
    activeRooms,
    sortedFinishedTransactions,
    totalIncome,
    formatTimer,
    isWarning,
    formatDuration
  } = useTransactions(selectedDate);

  const {
    openExtendModal,
  } = useRoomControl();

  const [page, setPage] = useState(1);
  const perPage = 4;
const [refreshing, setRefreshing] = useState(false);

const handleRefresh = async () => {

  setRefreshing(true);

  window.location.reload();

  setTimeout(() => {
    setRefreshing(false);
  }, 1000);
};

  const paginatedFinished = sortedFinishedTransactions.slice(
    (page - 1) * perPage,
    page * perPage
  );

  const totalPage = Math.ceil(sortedFinishedTransactions.length / perPage);

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-900 to-black text-white p-4 md:p-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">

        <div>
          <h1 className="text-xl font-bold">
            {isOwner ? "Laporan Transaksi" : "Transaksi Hari Ini"}
          </h1>

          <p className="text-sm opacity-60">
            {new Date(selectedDate).toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric"
            })}
          </p>
        </div>

       <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">

          {isOwner && (
            <>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm"
              />
              <button
              //passing parameter tanggal
                onClick={() =>
                  navigate("/access-log", {
                    state: {
                      selectedDate
                    }
                  })
                }
                className="flex-1 md:flex-none bg-yellow-500/20 border border-yellow-500/30 px-4 py-2 rounded-lg hover:bg-yellow-500/30"
              >
                Log Akses
              </button>
            </>
          )}

          <button
            onClick={() => navigate("/dashboard")}
            className="flex-1 md:flex-none bg-white/10 backdrop-blur px-4 py-2 rounded-lg hover:bg-white/20"
          >
            ← Kembali
          </button>

        </div>
      </div>

      {/* ACTIVE */}
      <div className="mb-6">
        <h2 className="text-yellow-400 font-bold mb-3">
          Room Aktif
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {activeRooms.map((room: any) => (
            <TransactionCard
              key={room.transaction_id}
              trx={room}
              type="active"
              onExtend={isOwner ? undefined : openExtendModal}
              formatTimer={formatTimer}
              isWarning={isWarning}
              formatDuration={formatDuration}
            />
          ))}
        </div>
      </div>

      {/* FINISHED TRANSACTIONS */}
<div className="rounded-3xl border border-white/10 bg-white/5 p-4 md:p-6 shadow-lg shadow-black/20">

  {/* HEADER */}
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">

    <div>
      <p className="text-sm uppercase tracking-[0.2em] text-yellow-400">
        Transaction History
      </p>

      <h2 className="text-lg font-semibold">
        Transaksi Selesai
      </h2>
    </div>

    <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">

      <div className="flex-1 md:flex-none bg-green-500/20 border border-green-500 px-4 py-2 rounded-xl">
        <p className="text-xs opacity-70">
          Total Pendapatan
        </p>

        <p className="font-bold text-green-400">
          Rp {totalIncome.toLocaleString()}
        </p>
      </div>

      <button
        onClick={handleRefresh}
        disabled={refreshing}
        className="p-2 hover:bg-white/10 rounded-lg transition disabled:opacity-50"
      >
        <RefreshCw
          className={`w-4 h-4 ${
            refreshing ? "animate-spin" : ""
          }`}
        />
      </button>
    </div>
  </div>

  {/* TABLE */}
  <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/20">

    <table className="min-w-[700px] w-full divide-y divide-white/10 text-left text-sm">

      <thead className="bg-white/5">

        <tr>

          <th className="sticky left-0 z-20 bg-[#2b1608] px-4 py-3 font-semibold opacity-80">
            Room
          </th>

          <th className="px-4 py-3 font-semibold opacity-80">
            Customer
          </th>

          <th className="px-4 py-3 font-semibold opacity-80">
            Durasi
          </th>

          <th className="px-4 py-3 font-semibold opacity-80">
            Harga/Jam
          </th>

          <th className="px-4 py-3 font-semibold opacity-80">
            Total
          </th>

          <th className="px-4 py-3 font-semibold opacity-80">
            Status
          </th>

          <th className="px-4 py-3 font-semibold opacity-80">
            Waktu Mulai
          </th>

          <th className="px-4 py-3 font-semibold opacity-80">
            Waktu Selesai
          </th>

        </tr>

      </thead>

      <tbody>

        {paginatedFinished.length === 0 ? (

          <tr>
            <td
              colSpan={7}
              className="px-4 py-10 text-center text-sm opacity-70"
            >
              Tidak ada transaksi
            </td>
          </tr>

        ) : (

          paginatedFinished.map((trx: any) => (

            <tr
              key={trx.transaction_id}
              className="border-t border-white/10 hover:bg-white/5"
            >

              <td className="sticky left-0 z-10 bg-[#1a0d05] px-4 py-4 whitespace-nowrap">
                {trx.room_name ?? `Room ${trx.room_id}`}
              </td>

              <td className="px-4 py-4">
                {trx.customer_name}
              </td>

              <td className="px-4 py-4">
                {formatDuration(trx.duration)}
              </td>

              <td className="px-4 py-4">
                Rp {trx.price_per_hour?.toLocaleString()}
              </td>

              <td className="px-4 py-4 font-semibold text-green-400">
                Rp {trx.total_price?.toLocaleString()}
              </td>

              <td className="px-4 py-4">
                <span className="bg-green-500/20 border border-green-500/30 px-2 py-1 rounded-lg text-xs">
                  selesai
                </span>
              </td>
              <td className="px-4 py-4">
                {trx.start_time

                  ? new Date(trx.start_time)
                      .toLocaleTimeString(
                        'en-GB',
                        {
                          hour: '2-digit',
                          minute: '2-digit'
                        }
                      )

                  : '-'
                }
              </td>
              <td className="px-4 py-4">
                {new Date(trx.updated_at).toLocaleTimeString(
                  'en-GB',
                  {
                    hour: '2-digit',
                    minute: '2-digit'
                  }
                )}
              </td>

            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>

  {/* PAGINATION */}
  {sortedFinishedTransactions.length > 0 && (

    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-4">

      <p className="text-xs opacity-60">
        Menampilkan {(page - 1) * perPage + 1}
        -
        {Math.min(page * perPage, sortedFinishedTransactions.length)}
        dari {sortedFinishedTransactions.length} transaksi
      </p>

      <div className="flex flex-wrap gap-2 w-full md:w-auto">

        <button
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
          className="bg-white/10 hover:bg-white/20 disabled:opacity-30 border border-white/20 rounded-lg px-3 py-2 text-sm transition"
        >
          ← Sebelumnya
        </button>

        <div className="flex flex-wrap items-center gap-1">

          {Array.from(
            { length: totalPage },
            (_, i) => i + 1
          ).map((p) => (

            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-2 py-1 rounded text-sm transition ${
                page === p
                  ? "bg-yellow-500/30 border border-yellow-500/50"
                  : "bg-white/10 border border-white/20 hover:bg-white/20"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <button
          onClick={() =>
            setPage(Math.min(totalPage, page + 1))
          }
          disabled={page === totalPage}
          className="bg-white/10 hover:bg-white/20 disabled:opacity-30 border border-white/20 rounded-lg px-3 py-2 text-sm transition"
        >
          Selanjutnya →
        </button>

      </div>
    </div>
  )}
</div>

    </div>
  );
}