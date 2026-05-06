import { useState } from "react";

type Props = {
  show: boolean;
  roomId: number | null;

  price: number;   // 🔥 dari database (rooms.price_per_hour)
  total: number;   // 🔥 total lama (optional display)

  onClose: () => void;
  onSubmit: (minutes: number) => void;
  onCloseRoom: (roomId: number) => void;
};

export default function ExtendRoomModal({
  show,
  roomId,
  price,
  onClose,
  onSubmit,
  onCloseRoom,
}: Props) {
  const [selectedMinutes, setSelectedMinutes] = useState(60);

  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [showConfirmExtend, setShowConfirmExtend] = useState(false);

  if (!show) return null;

  const rupiah = (n: number) => n.toLocaleString("id-ID");

  const options = [
    { label: "+1 Jam", value: 60 },
    { label: "+2 Jam", value: 120 },
    { label: "+3 Jam", value: 180 },
    { label: "+4 Jam", value: 240 },
  ];

  // 🔥 FIX UTAMA (ANTI NaN)
  const safePrice = price ?? 0;

  // 🔥 HITUNG TAMBAHAN SAJA
  const hours = selectedMinutes / 60;
  const additionalTotal = hours * safePrice;

  return (
    <>
      {/* ================= MAIN MODAL ================= */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        
        <div className="bg-white/10 backdrop-blur-xl border border-yellow-500/30 rounded-2xl p-6 w-[350px] shadow-xl">

          <h2 className="text-lg font-bold mb-4 text-yellow-400">
            Tambah Durasi - Room {roomId}
          </h2>

          {/* OPTIONS */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSelectedMinutes(opt.value)}
                className={`py-2 rounded-lg border transition ${
                  selectedMinutes === opt.value
                    ? "bg-yellow-500 text-black"
                    : "border-white/20 text-white hover:bg-white/10"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* PRICE INFO (UI TIDAK DIUBAH) */}
          <div className="bg-black/30 rounded-xl p-3 mb-4 text-sm text-center">
            <p>
              Harga / jam:{" "}
              <span className="font-semibold">
                Rp {rupiah(safePrice)}
              </span>
            </p>

            <p className="text-lg font-bold text-yellow-400">
              Tambahan: Rp {rupiah(additionalTotal)}
            </p>
          </div>

          {/* ACTION */}
          <div className="flex justify-between gap-2">

            <button
              onClick={() => setShowConfirmClose(true)}
              className="px-4 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition"
            >
              Close Room
            </button>

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-500 transition"
              >
                Batal
              </button>

              <button
                onClick={() => setShowConfirmExtend(true)}
                className="px-4 py-2 bg-yellow-500 text-black rounded-lg font-bold hover:brightness-110 transition"
              >
                Tambah
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* ================= CONFIRM EXTEND ================= */}
      {showConfirmExtend && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60]">
          
          <div className="bg-black/80 border border-yellow-500/30 rounded-2xl p-6 w-[320px] text-center">

            <h3 className="text-lg font-bold text-yellow-400 mb-3">
              Konfirmasi Extend
            </h3>

            <p className="text-sm text-white/80 mb-3">
              Tambah {selectedMinutes / 60} jam?
            </p>

            <p className="text-lg font-bold text-green-400 mb-5">
              Rp {rupiah(additionalTotal)}
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowConfirmExtend(false)}
                className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-500"
              >
                Batal
              </button>

              <button
                onClick={() => {
                  onSubmit(selectedMinutes); // 🔥 kirim ke backend
                  setShowConfirmExtend(false);
                  onClose();
                }}
                className="px-4 py-2 bg-yellow-500 text-black rounded-lg font-bold hover:brightness-110"
              >
                Ya, Tambah
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= CONFIRM CLOSE ================= */}
      {showConfirmClose && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60]">
          
          <div className="bg-black/80 border border-red-500/30 rounded-2xl p-6 w-[320px] text-center">

            <h3 className="text-lg font-bold text-red-400 mb-3">
              Konfirmasi
            </h3>

            <p className="text-sm text-white/80 mb-5">
              Yakin ingin menutup Room {roomId}?
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowConfirmClose(false)}
                className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-500"
              >
                Batal
              </button>

              <button
                onClick={() => {
                  if (roomId) {
                    onCloseRoom(roomId);
                  }
                  setShowConfirmClose(false);
                  onClose();
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600"
              >
                Ya, Tutup
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}