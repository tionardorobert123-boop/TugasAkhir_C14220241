import { useState } from "react";
import { useTransactions } from "../hooks/useTransactions";
import { useRoomControl } from "../hooks/useRoomControl";
import { useNavigate } from "react-router-dom";
import TransactionCard from "../components/Transactions/TransactionCard";

export default function TransactionsPage() {
  const navigate = useNavigate();

  const role = localStorage.getItem("role");
  const isOwner = role === "owner";

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const {
    activeRooms,
    finishedTransactions,
    totalIncome,
    formatTimer,
    isWarning,
    formatDuration
  } = useTransactions(selectedDate);

  const {
    openExtendModal,
  } = useRoomControl();

  const [page, setPage] = useState(1);
  const perPage = 8;

  const paginatedFinished = finishedTransactions.slice(
    (page - 1) * perPage,
    page * perPage
  );

  const totalPage = Math.ceil(finishedTransactions.length / perPage);

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-900 to-black text-white p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">

        <div>
          <h1 className="text-xl font-bold">
            {isOwner ? "Laporan Transaksi" : "Transaksi Hari Ini"}
          </h1>

          <p className="text-sm opacity-60">
            {new Date(selectedDate).toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric"
            })}
          </p>
        </div>

        <div className="flex items-center gap-3">

          {isOwner && (
            <>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm"
              />
              <button
                onClick={() => navigate("/access-log")}
                className="bg-yellow-500/20 border border-yellow-500/30 px-4 py-2 rounded-lg hover:bg-yellow-500/30"
              >
                Log Akses
              </button>
            </>
          )}

          <button
            onClick={() => navigate("/dashboard")}
            className="bg-white/10 backdrop-blur px-4 py-2 rounded-lg hover:bg-white/20"
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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

      {/* FINISHED */}
      <div className="relative bg-white/5 backdrop-blur-xl border border-yellow-500/20 rounded-2xl p-6">

        <h2 className="font-bold mb-4">
          Transaksi Selesai
        </h2>

        <div className="absolute top-4 right-6 bg-green-500/20 border border-green-500 px-4 py-2 rounded-xl">
          <p className="text-xs">Total</p>
          <p className="font-bold">
            Rp {totalIncome.toLocaleString()}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {paginatedFinished.map((trx: any) => (
            <TransactionCard
              key={trx.transaction_id}
              trx={trx}
              type="finished"
              formatTimer={formatTimer}
              isWarning={isWarning}
              formatDuration={formatDuration}
            />
          ))}
        </div>

        <div className="flex justify-between items-center mt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 bg-white/10 rounded-lg disabled:opacity-30"
          >
            Prev
          </button>

          <p className="opacity-60">
            Page {page} / {totalPage}
          </p>

          <button
            disabled={page === totalPage}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 bg-white/10 rounded-lg disabled:opacity-30"
          >
            Next
          </button>
        </div>

      </div>

    </div>
  );
}