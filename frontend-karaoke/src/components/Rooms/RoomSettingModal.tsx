import { useState, useEffect } from "react";
import API from "../../services/api";

interface Props {
  show: boolean;
  room: any;
  onClose: () => void;
  onSuccess?: () => void;
}

interface ConfirmModalState {
  show: boolean;
  type: "price" | "status" | "type" | "combined" | null;
  mode?: "single" | "all_type";
  changes: any;
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
  const [loading, setLoading] = useState(false);

  // Original values to detect changes
  const [originalPrice, setOriginalPrice] = useState(0);
  const [originalType, setOriginalType] = useState("regular");
  const [originalStatus, setOriginalStatus] = useState("available");

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    show: false,
    type: null,
    changes: {}
  });

  const token = localStorage.getItem("token") || "";

  useEffect(() => {
    if (room && show) {
      setPrice(room.price_per_hour || 0);
      setRoomType(room.room_type || "regular");
      setStatus(room.status || "available");
      setOriginalPrice(room.price_per_hour || 0);
      setOriginalType(room.room_type || "regular");
      setOriginalStatus(room.status || "available");
    }
  }, [room, show]);

  if (!show || !room) return null;

  // Check if room is occupied or in warning state
  const isRoomActive = room.status === "occupied";
  const hasActiveTransaction = room.end_time !== null && room.end_time !== undefined;

  if (isRoomActive || hasActiveTransaction) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] rounded-2xl p-6 w-[400px] border border-red-500/30 shadow-2xl">
          <h2 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-500">
            ⚠️ Room Tidak Dapat Di-Setting
          </h2>

          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-300 mb-3">
              <span className="text-red-400 font-semibold">Room #{room.room_id}</span> sedang dipakai atau dalam status aktif.
            </p>

            <p className="text-sm text-gray-400 leading-relaxed">
              Silahkan hubungi <span className="text-yellow-300 font-semibold">kasir</span> untuk menutup room terlebih dahulu sebelum melakukan perubahan setting.
            </p>

            {room.customer_name && (
              <div className="mt-4 pt-4 border-t border-red-500/20">
                <p className="text-xs text-gray-500">Penyewa: <span className="text-yellow-300">{room.customer_name}</span></p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 rounded-lg font-semibold transition"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrice(Number(e.target.value));
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value);
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRoomType(e.target.value);
  };

  const handleSave = () => {
    const priceChanged = price !== originalPrice;
    const typeChanged = roomType !== originalType;
    const statusChanged = status !== originalStatus;

    if (!priceChanged && !typeChanged && !statusChanged) {
      alert("Tidak ada perubahan data");
      return;
    }

    // Jika ada perubahan kombinasi (harga + tipe/status), batch update ke single room saja
    if ((priceChanged && (typeChanged || statusChanged))) {
      const changes: any = {};
      if (priceChanged) {
        changes.price = { old: originalPrice, new: price };
      }
      if (typeChanged) {
        changes.type = { old: originalType, new: roomType };
      }
      if (statusChanged) {
        changes.status = { old: originalStatus, new: status };
      }

      setConfirmModal({
        show: true,
        type: "combined",
        mode: "single",
        changes
      });
    }
    // Jika hanya harga berubah, tampilkan modal pilihan (single/all_type)
    else if (priceChanged) {
      setConfirmModal({
        show: true,
        type: "price",
        changes: {
          field: "Harga per jam",
          oldValue: originalPrice,
          newValue: price,
          typeFilter: roomType
        }
      });
    }
    // Jika hanya tipe atau status berubah, langsung konfirmasi (single room saja)
    else if (typeChanged || statusChanged) {
      const changes: any = {};
      if (typeChanged) {
        changes.type = { old: originalType, new: roomType };
      }
      if (statusChanged) {
        changes.status = { old: originalStatus, new: status };
      }

      setConfirmModal({
        show: true,
        type: typeChanged ? "type" : "status",
        mode: "single",
        changes
      });
    }
  };

  const handleConfirmUpdate = async (updateMode?: "single" | "all_type") => {
    try {
      setLoading(true);

      const payload: any = {
        room_id: room.room_id
      };

      if (confirmModal.type === "price") {
        // Update harga dengan mode
        payload.price = price;
        payload.mode = updateMode || "single";
        if (updateMode === "all_type") {
          payload.room_type_filter = roomType;
        }
      } else if (confirmModal.type === "combined") {
        // Update kombinasi: price + type/status (hanya single room)
        payload.price = price;
        payload.mode = "single";
        if (roomType !== originalType) {
          payload.room_type = roomType;
        }
        if (status !== originalStatus) {
          payload.status = status;
        }
      } else {
        // Update status atau type (hanya single room)
        if (roomType !== originalType) {
          payload.room_type = roomType;
        }
        if (status !== originalStatus) {
          payload.status = status;
        }
      }

      await API.post(
        `/rooms/${room.room_id}/update-setting`,
        payload,
        {
          // headers: { Authorization: `Bearer ${token}` }
        }
      );

      setConfirmModal({ show: false, type: null, changes: {} });
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Gagal update");
      setConfirmModal({ show: false, type: null, changes: {} });
    } finally {
      setLoading(false);
    }
  };

  // Main Modal
  const mainModal = (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] rounded-2xl p-6 w-[400px] border border-yellow-500/20 shadow-2xl">
        <h2 className="text-xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-500">
          Setting Room #{room.room_id}
        </h2>

        <>
          {/* STATUS */}
          <div className="mb-5">
            <label className="text-sm font-medium text-yellow-400 mb-2 block">Status</label>
            <select
              value={status}
              onChange={handleStatusChange}
              className="w-full bg-black/40 border border-yellow-500/30 rounded-lg px-3 py-2 hover:border-yellow-500/60 transition focus:outline-none focus:border-yellow-500"
            >
              <option value="available">Aktif</option>
              <option value="disabled">Nonaktif</option>
            </select>
          </div>

          {/* ROOM TYPE */}
          <div className="mb-5">
            <label className="text-sm font-medium text-yellow-400 mb-2 block">Tipe Room</label>
            <select
              value={roomType}
              onChange={handleTypeChange}
              className="w-full bg-black/40 border border-yellow-500/30 rounded-lg px-3 py-2 hover:border-yellow-500/60 transition focus:outline-none focus:border-yellow-500"
            >
              <option value="regular">Regular</option>
              <option value="vip">VIP</option>
            </select>
          </div>

          {/* PRICE */}
          <div className="mb-6">
            <label className="text-sm font-medium text-yellow-400 mb-2 block">Harga per Jam (Rp)</label>
            <input
              type="number"
              step={50000}
              value={price}
              onChange={handlePriceChange}
              className="w-full bg-black/40 border border-yellow-500/30 rounded-lg px-3 py-2 hover:border-yellow-500/60 transition focus:outline-none focus:border-yellow-500"
            />
          </div>

          {/* ACTION */}
          <div className="flex justify-end gap-3 mt-8">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition font-medium"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black rounded-lg font-semibold transition disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </>
      </div>
    </div>
  );

  // Confirmation Modal for Status/Type Changes
  const confirmStatusTypeModal = (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60]">
      <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] rounded-2xl p-6 w-[420px] border border-yellow-500/20 shadow-2xl">
        <h2 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-500">
          Konfirmasi Perubahan
        </h2>

        <div className="bg-black/40 border border-yellow-500/20 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-300 mb-4">
            <span className="text-yellow-400 font-semibold">Room #{room.room_id}</span> akan diubah:
          </p>

          {confirmModal.changes.status && (
            <div className="mb-3 pb-3 border-b border-white/10">
              <p className="text-sm text-gray-400">Status</p>
              <p className="text-sm">
                <span className="text-red-400">{confirmModal.changes.status.old === "available" ? "Aktif" : "Nonaktif"}</span>
                <span className="text-gray-500 mx-2">→</span>
                <span className="text-green-400">{confirmModal.changes.status.new === "available" ? "Aktif" : "Nonaktif"}</span>
              </p>
            </div>
          )}

          {confirmModal.changes.type && (
            <div>
              <p className="text-sm text-gray-400">Tipe Room</p>
              <p className="text-sm">
                <span className="text-red-400 capitalize">{confirmModal.changes.type.old}</span>
                <span className="text-gray-500 mx-2">→</span>
                <span className="text-green-400 capitalize">{confirmModal.changes.type.new}</span>
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => setConfirmModal({ show: false, type: null, changes: {} })}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition font-medium"
          >
            Batal
          </button>
          <button
            onClick={() => handleConfirmUpdate("single")}
            disabled={loading}
            className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black rounded-lg font-semibold transition disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Konfirmasi"}
          </button>
        </div>
      </div>
    </div>
  );

  // Price Change Modal with Options
  const priceConfirmModal = (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60]">
      <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] rounded-2xl p-6 w-[420px] border border-yellow-500/20 shadow-2xl">
        <h2 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-500">
          Konfirmasi Perubahan Harga
        </h2>

        <div className="bg-black/40 border border-yellow-500/20 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-300 mb-4">
            <span className="text-yellow-400 font-semibold">Room #{room.room_id}</span> harga akan diubah:
          </p>

          <div className="mb-4">
            <p className="text-sm text-gray-400">Harga per Jam</p>
            <p className="text-sm">
              <span className="text-red-400">Rp {confirmModal.changes.oldValue?.toLocaleString("id-ID")}</span>
              <span className="text-gray-500 mx-2">→</span>
              <span className="text-green-400">Rp {confirmModal.changes.newValue?.toLocaleString("id-ID")}</span>
            </p>
          </div>

          <div className="pt-4 border-t border-white/10">
            <p className="text-xs text-gray-400">Status Room: <span className="text-yellow-300">{status === "available" ? "Aktif" : "Nonaktif"}</span></p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <p className="text-sm text-gray-300 font-medium">Terapkan ke:</p>
          
          <button
            onClick={() => handleConfirmUpdate("single")}
            disabled={loading}
            className="w-full p-3 bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-500/30 hover:border-blue-500/60 rounded-lg transition text-sm font-medium text-left disabled:opacity-50"
          >
            <span>Hanya Room #{room.room_id}</span>
          </button>

          <button
            onClick={() => handleConfirmUpdate("all_type")}
            disabled={loading}
            className="w-full p-3 bg-gradient-to-r from-purple-500/20 to-purple-600/20 border border-purple-500/30 hover:border-purple-500/60 rounded-lg transition text-sm font-medium text-left disabled:opacity-50"
          >
            <span>Semua Room dengan Tipe "{roomType}"</span>
          </button>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => setConfirmModal({ show: false, type: null, changes: {} })}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition font-medium"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );

  // Combined Changes Modal (Price + Type/Status)
  const combinedConfirmModal = (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60]">
      <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] rounded-2xl p-6 w-[420px] border border-yellow-500/20 shadow-2xl">
        <h2 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-500">
          Konfirmasi Perubahan
        </h2>

        <div className="bg-black/40 border border-yellow-500/20 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-300 mb-4">
            <span className="text-yellow-400 font-semibold">Room #{room.room_id}</span> akan diubah:
          </p>

          {confirmModal.changes.price && (
            <div className="mb-3 pb-3 border-b border-white/10">
              <p className="text-sm text-gray-400">Harga per Jam</p>
              <p className="text-sm">
                <span className="text-red-400">Rp {confirmModal.changes.price.old?.toLocaleString("id-ID")}</span>
                <span className="text-gray-500 mx-2">→</span>
                <span className="text-green-400">Rp {confirmModal.changes.price.new?.toLocaleString("id-ID")}</span>
              </p>
            </div>
          )}

          {confirmModal.changes.type && (
            <div className="mb-3 pb-3 border-b border-white/10">
              <p className="text-sm text-gray-400">Tipe Room</p>
              <p className="text-sm">
                <span className="text-red-400 capitalize">{confirmModal.changes.type.old}</span>
                <span className="text-gray-500 mx-2">→</span>
                <span className="text-green-400 capitalize">{confirmModal.changes.type.new}</span>
              </p>
            </div>
          )}

          {confirmModal.changes.status && (
            <div>
              <p className="text-sm text-gray-400">Status</p>
              <p className="text-sm">
                <span className="text-red-400">{confirmModal.changes.status.old === "available" ? "Aktif" : "Nonaktif"}</span>
                <span className="text-gray-500 mx-2">→</span>
                <span className="text-green-400">{confirmModal.changes.status.new === "available" ? "Aktif" : "Nonaktif"}</span>
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => setConfirmModal({ show: false, type: null, changes: {} })}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition font-medium"
          >
            Batal
          </button>
          <button
            onClick={() => handleConfirmUpdate("single")}
            disabled={loading}
            className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black rounded-lg font-semibold transition disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Konfirmasi"}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {mainModal}
      
      {confirmModal.show && confirmModal.type === "price" && priceConfirmModal}
      
      {confirmModal.show && (confirmModal.type === "status" || confirmModal.type === "type") && confirmStatusTypeModal}

      {confirmModal.show && confirmModal.type === "combined" && combinedConfirmModal}
    </>
  );
}