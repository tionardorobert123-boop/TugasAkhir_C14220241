import { useNavigate } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import useAccessLog from "../hooks/useAccessLog";

export default function AccessLogPage() {
  const navigate = useNavigate();

  const {
    selectedDate,
    setSelectedDate,
    loading,
    refreshing,
    roomSearch,
    setRoomSearch,
    customerSearch,
    setCustomerSearch,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    filteredLogs,
    paginatedLogs,
    totalPages,
    startIndex,
    endIndex,
    handleRefresh,
    handleFilterChange,
    formatDate,
    formatDuration,
    statusLabels,
  } = useAccessLog();

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-900 to-black text-white p-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Log Aktivitas Akses</h1>
            <p className="text-sm opacity-60 mt-2 max-w-xl">
              Catatan seluruh akses pengguna.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm"
            />
            <button
              onClick={() => navigate("/transactions")}
              className="bg-white/10 backdrop-blur px-4 py-2 rounded-lg hover:bg-white/20"
            >
              ← Kembali ke Transaksi
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-yellow-400">Owner Only</p>
              <h2 className="text-lg font-semibold">Riwayat Akses Pintu</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs opacity-60">Filter tanggal aktif</span>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 hover:bg-white/10 rounded-lg transition disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Filter Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <input
              type="text"
              placeholder="Cari Ruangan..."
              value={roomSearch}
              onChange={(e) => {
                setRoomSearch(e.target.value);
                handleFilterChange();
              }}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm placeholder-white/50"
            />
            <input
              type="text"
              placeholder="Cari Nama Customer..."
              value={customerSearch}
              onChange={(e) => {
                setCustomerSearch(e.target.value);
                handleFilterChange();
              }}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm placeholder-white/50"
            />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                handleFilterChange();
              }}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm"
            >
              <option className="text-white" value="">
                Status
              </option>
              <option className="text-black" value="active">Aktif</option>
              <option className="text-black" value="standby">Standby</option>
              <option className="text-black" value="disabled">Tidak Aktif</option>
              <option className="text-black" value="extend">Extend</option>
            </select>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/20">
            <table className="min-w-full divide-y divide-white/10 text-left text-sm">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-4 py-3 font-semibold opacity-80">Room</th>
                  <th className="px-4 py-3 font-semibold opacity-80">Nama Customer</th>
                  <th className="px-4 py-3 font-semibold opacity-80">Durasi</th>
                  <th className="px-4 py-3 font-semibold opacity-80">Status</th>
                  <th className="px-4 py-3 font-semibold opacity-80">Waktu</th>
                  <th className="px-4 py-3 font-semibold opacity-80">Total Durasi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm opacity-70">
                      Memuat log...
                    </td>
                  </tr>
                ) : paginatedLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm opacity-70">
                      {filteredLogs.length === 0 ? "Tidak ada log untuk tanggal ini." : "Tidak ada data untuk filter ini."}
                    </td>
                  </tr>
                ) : (
                  paginatedLogs.map((log, index) => {
                    const isStandby = log.room_status === 'standby';
                    const isActiveOrExtend = ['active', 'extend'].includes(log.room_status);
                    return (
                      <tr key={index} className="border-t border-white/10 hover:bg-white/5">
                        <td className="px-4 py-4">{log.room_name ?? `Room ${log.room_id}`}</td>
                        <td className="px-4 py-4">{log.customer_name ?? "-"}</td>
                        <td className="px-4 py-4">{isActiveOrExtend ? `${log.duration}jam` : '-'}</td>
                        <td className="px-4 py-4">{isStandby ? 'selesai' : (statusLabels[log.room_status] ?? log.room_status)}</td>
                        <td className="px-4 py-4">{formatDate(log.timestamp)}</td>
                        <td className="px-4 py-4">{isStandby ? formatDuration(log.duration) : '-'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {filteredLogs.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs opacity-60">
                Menampilkan {startIndex + 1} - {Math.min(endIndex, filteredLogs.length)} dari {filteredLogs.length} data
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="bg-white/10 hover:bg-white/20 disabled:opacity-30 border border-white/20 rounded-lg px-3 py-2 text-sm transition"
                >
                  ← Sebelumnya
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-2 py-1 rounded text-sm transition ${
                        currentPage === page
                          ? "bg-yellow-500/30 border border-yellow-500/50"
                          : "bg-white/10 border border-white/20 hover:bg-white/20"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="bg-white/10 hover:bg-white/20 disabled:opacity-30 border border-white/20 rounded-lg px-3 py-2 text-sm transition"
                >
                  Selanjutnya →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
