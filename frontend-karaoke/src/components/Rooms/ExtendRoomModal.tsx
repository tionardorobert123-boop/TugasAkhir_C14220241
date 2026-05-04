import { useState } from "react";

interface Props {
  show: boolean;
  onClose: () => void;
  onSubmit: (minutes: number) => void;
  onCloseRoom: (roomId: number) => void; // 🔥 TAMBAHAN
  roomId: number | null;
}

export default function ExtendRoomModal({
  show,
  onClose,
  onSubmit,
  onCloseRoom,
  roomId
}: Props) {
  const [minutes, setMinutes] = useState(60);

  // 🔥 STATE CONFIRM
  const [showConfirm, setShowConfirm] = useState(false);

  if (!show) return null;

  const options = [
    { label: "+1 Jam", value: 60 },
    { label: "+2 Jam", value: 120 },
    { label: "+3 Jam", value: 180 },
    { label: "+4 Jam", value: 240 },
  ];

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
                onClick={() => setMinutes(opt.value)}
                className={`py-2 rounded-lg border transition ${
                  minutes === opt.value
                    ? "bg-yellow-500 text-black"
                    : "border-white/20 text-white hover:bg-white/10"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* ACTION */}
          <div className="flex justify-between gap-2">

            {/* 🔥 CLOSE ROOM BUTTON */}
            <button
              onClick={() => setShowConfirm(true)}
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
                onClick={() => onSubmit(minutes)}
                className="px-4 py-2 bg-yellow-500 text-black rounded-lg font-bold hover:brightness-110 transition"
              >
                Tambah
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* ================= CONFIRM MODAL ================= */}
      {showConfirm && (
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
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-500"
              >
                Batal
              </button>

              <button
                onClick={() => {
                  if (roomId) {
                    onCloseRoom(roomId); // 🔥 CALL BACKEND
                  }
                  setShowConfirm(false);
                  onClose(); // tutup modal utama juga
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