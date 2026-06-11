type Props = {
  show: boolean;
  selectedRoom: number | null;
  customerName: string;
  duration: number;
  total: number;
  total_minutes: number;
  onClose: () => void;
  onConfirm: () => void;
  isOffline?: boolean;

  isLoading?: boolean;
};

export default function ConfirmModal({
  show,
  selectedRoom,
  customerName,
  duration,
  total,
  total_minutes,
  onClose,
  onConfirm,
  isOffline,

  isLoading = false 
}: Props) {


  if (!show) return null;

  const rupiah = (n: number) => n.toLocaleString("id-ID");

  const formatDurasi = (m: number) => {
    if (m < 1) return "10 Detik";
    if (m === 5) return "5 Menit";
    return `${m / 60} Jam`;
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50">

      <div className="w-[420px] rounded-3xl p-6 
        bg-gradient-to-br from-white/10 to-white/5 
        backdrop-blur-xl border border-white/20 shadow-2xl text-white">

        <h2 className="text-xl font-bold mb-5 text-center">
          ✅ Konfirmasi Transaksi
        </h2>

        <div className="space-y-2 text-sm mb-4">
          <p><span className="text-white/60">Room:</span> <b>{selectedRoom}</b></p>
          <p><span className="text-white/60">Customer:</span> <b>{customerName || "-"}</b></p>
          <p><span className="text-white/60">Durasi:</span> <b>{formatDurasi(duration)}</b></p>
          {isOffline && (
            <div className="mt-3 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3">
              
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse mt-1" />

              <div>
                <p className="text-sm font-semibold text-red-400">
                  Device Offline
                </p>

                <p className="text-xs text-white/70 mt-1">
                  Apakah tetap ingin membuka Room {selectedRoom}?
                </p>
              </div>

            </div>
          )}
        </div>

        <div className="bg-black/30 rounded-xl p-3 mb-5 text-center">
          <p className="text-white/60 text-sm">Total Bayar</p>
          <p className="text-2xl font-bold text-green-400">
            Total: Rp {rupiah(duration === 5 ? total_minutes : total)}
          </p>
        </div>

        <div className="flex gap-3">

          <button
            onClick={onClose}
            disabled={isLoading}
            className="
              flex-1
              bg-white/10
              hover:bg-white/20
              py-2
              rounded-xl
              transition
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >
            Batal
          </button>

          <button

              onClick={onConfirm}

              disabled={isLoading}

              className="
                flex-1
                bg-green-500
                hover:bg-green-400
                text-black
                font-semibold
                py-2
                rounded-xl
                transition

                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >

              {isLoading ? (

                <div
                  className="
                  flex
                  items-center
                  justify-center
                  gap-2"
                >

                  <svg
                    className="
                    w-4 h-4
                    animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                      opacity="0.25"
                    />

                    <path
                      fill="currentColor"
                      opacity="0.75"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>

                  Processing...

                </div>

              ) : (

                '✔ Konfirmasi'

              )}

            </button>

        </div>

      </div>
    </div>
  );
}