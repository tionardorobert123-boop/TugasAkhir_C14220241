import { useState, useEffect } from "react";
import axios from "axios";

interface Props {
  show: boolean;
  room: any;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function RoomSettingModal({
  show,
  room,
  onClose,
  onSuccess
}: Props) {
  const [price, setPrice] = useState(0);
  const [roomType, setRoomType] = useState("regular");
  const [status, setStatus] = useState("available");
  const [mode, setMode] = useState<"single" | "type">("single");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (room) {
      setPrice(room.price_per_hour || 0);
      setRoomType(room.room_type || "regular");
      setStatus(room.status || "available");
    }
  }, [room]);

  if (!show || !room) return null;

  const handleSubmit = async () => {
    try {
      await axios.post(
        `http://localhost:8000/api/rooms/${room.room_id}/update-setting`,
        {
          price,
          room_type: roomType,
          status,
          mode
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Gagal update");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

      <div className="bg-[#1a1a1a] rounded-2xl p-6 w-[350px] border border-white/10">

        <h2 className="text-lg font-bold mb-4">
          Setting Room {room.room_name}
        </h2>

        {/* STATUS */}
        <div className="mb-4">
          <p className="text-sm mb-1">Status</p>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full bg-black/40 border border-white/20 rounded-lg px-3 py-2"
          >
            <option value="available">Aktif</option>
            <option value="disabled">Nonaktif</option>
          </select>
        </div>

        {/* ROOM TYPE */}
        <div className="mb-4">
          <p className="text-sm mb-1">Tipe Room</p>
          <select
            value={roomType}
            onChange={(e) => setRoomType(e.target.value)}
            className="w-full bg-black/40 border border-white/20 rounded-lg px-3 py-2"
          >
            <option value="regular">Regular</option>
            <option value="vip">VIP</option>
          </select>
        </div>

        {/* PRICE */}
        <div className="mb-4">
          <p className="text-sm mb-1">Harga per jam</p>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="w-full bg-black/40 border border-white/20 rounded-lg px-3 py-2"
          />
        </div>

        {/* MODE */}
        <div className="mb-4">
          <p className="text-sm mb-2">Mode Update</p>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              checked={mode === "single"}
              onChange={() => setMode("single")}
            />
            Hanya room ini
          </label>

          <label className="flex items-center gap-2 text-sm mt-1">
            <input
              type="radio"
              checked={mode === "type"}
              onChange={() => setMode("type")}
            />
            Semua room tipe {room.room_type}
          </label>
        </div>

        {/* ACTION */}
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/10 rounded-lg"
          >
            Batal
          </button>

          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-yellow-500 text-black rounded-lg font-semibold"
          >
            Simpan
          </button>
        </div>

      </div>
    </div>
  );
}