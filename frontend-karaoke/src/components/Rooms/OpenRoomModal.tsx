type Props = {
  show: boolean;
  selectedRoom: number | null;
  customerName: string;
  setCustomerName: (v: string) => void;
  duration: number;
  setDuration: (v: number) => void;
  price: number;
  total: number;
  onClose: () => void;
  onNext: () => void;
   
   onEmergency: () => void;
};

export default function OpenRoomModal({
  show,
  selectedRoom,
  customerName,
  setCustomerName,
  duration,
  setDuration,
  price,
  total,
  onClose,
  onNext,
  onEmergency
}: Props) {
  if (!show) return null;

  const rupiah = (n: number) => n.toLocaleString("id-ID");

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50">

      <div className="w-[460px] rounded-3xl p-6 
        bg-gradient-to-br from-white/10 to-white/5 
        backdrop-blur-xl border border-white/20 shadow-2xl text-white">

        <h2 className="text-xl font-bold mb-5 text-center">
          🎤 Buka Room {selectedRoom}
        </h2>

        {/* INPUT */}
        <input
          type="text"
          placeholder="Nama Customer"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="w-full p-3 rounded-xl bg-white/10 border border-white/20 
          placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 mb-5"
        />

        {/* DURASI */}
        <p className="text-sm mb-2 font-semibold text-white/80">
          Pilih Durasi
        </p>

      <div className="grid grid-cols-3 gap-2 mb-5">

                {[5].map(h => (
                  <button
                    key={h}
                    onClick={() => setDuration(h * 1)}
                    className={`p-2 rounded-xl text-sm transition
                    ${duration === h*1
                      ? "bg-yellow-500 text-black font-semibold"
                      : "bg-white/10 hover:bg-white/20"}`}
                  >
                    {h} Menit
                  </button>
                ))}
              </div>
        <div className="grid grid-cols-3 gap-2 mb-5">

          {[1,2,3,4].map(h => (
            <button
              key={h}
              onClick={() => setDuration(h * 60)}
              className={`p-2 rounded-xl text-sm transition
              ${duration === h*60
                ? "bg-yellow-500 text-black font-semibold"
                : "bg-white/10 hover:bg-white/20"}`}
            >
              {h} Jam
            </button>
          ))}
        </div>

        {/* PRICE */}
        <div className="bg-black/30 rounded-xl p-3 mb-4 text-sm">
          <p>Harga / jam: <span className="font-semibold">Rp {rupiah(price)}</span></p>
          <p className="text-lg font-bold text-yellow-400">
            Total: Rp {rupiah(total)}
          </p>
        </div>

        <div className="mt-4 mb-4">

          <button
            onClick={onEmergency}
            className="
              w-full
              py-3
              rounded-xl
              bg-red-600/20
              border border-red-500/40
              text-red-300
              font-semibold
              hover:bg-red-600/30
              transition
            "
          >
            🚨 Emergency Action
          </button>

        </div>

        {/* ACTION */}
        <div className="flex justify-between gap-3 mt-4">

          <button
            onClick={onClose}
            className="flex-1 bg-white/10 hover:bg-white/20 py-2 rounded-xl transition"
          >
            Batal
          </button>

          <button
            onClick={onNext}
            className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold py-2 rounded-xl transition"
          >
            Lanjut →
          </button>

        </div>

      </div>
    </div>
  );
}