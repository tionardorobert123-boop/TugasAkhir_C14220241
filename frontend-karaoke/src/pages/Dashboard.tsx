import RoomCard from "../components/Rooms/RoomCard";
import OpenRoomModal from "../components/Rooms/OpenRoomModal";
import ConfirmModal from "../components/Rooms/ConfirmModal";
import ExtendRoomModal from "../components/Rooms/ExtendRoomModal";

import { useRoomControl } from "../hooks/useRoomControl";
import { useNavigate } from "react-router-dom";

import logo from "../assets/logo.png";
import { closeRoom } from "../services/roomService";

function Dashboard() {
  const {
    rooms,
    now,
    formatTimer,
    isWarning,

    showModal,
    setShowModal,

    showConfirm,
    setShowConfirm,

    selectedRoom,
    customerName,
    setCustomerName,

    duration,
    setDuration,

    price,
    total,

    handleClick,
    startRoom,

    openExtendModal,
    showExtendModal,
    extendRoomId,
    submitExtend,
    setShowExtendModal,

    logout
  } = useRoomControl();

  const navigate = useNavigate();

  const role = localStorage.getItem("role");
  const isOwner = role === "owner";

  const renderRoom = (id: number) => {
    const room = rooms.find((r) => r.room_id === id);
    if (!room) return null;

    return (
      <RoomCard
        room={room}
        timer={room.end_time ? formatTimer(room.end_time) : "-"}
        warning={room.end_time ? isWarning(room.end_time) : false}

        onClick={isOwner ? () => {} : () => handleClick(room)}
        onExtend={isOwner ? undefined : () => openExtendModal(room.room_id)}
      />
    );
  };

  return (
    <div className="
      min-h-screen md:h-screen
      overflow-auto md:overflow-hidden
      bg-gradient-to-b from-yellow-900 to-black text-white
      px-4 md:px-6 py-3
      relative
    ">

      {/* ================= CENTER (DESKTOP ONLY) ================= */}
      <div className="
        hidden md:flex
        absolute inset-0
        flex-col items-center justify-center
        opacity-80
      ">
        <img src={logo} className="w-80 opacity-20 mb-4" />

        <h1 className="text-2xl font-bold tracking-wide">
          FRIENDSHIP KARAOKE & PUB
        </h1>

        <p className="text-sm opacity-70 mt-2">
          {now.toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
          })}
        </p>

        <p className="text-xl font-mono">
          {now.toLocaleTimeString("id-ID")}
        </p>
      </div>

      {/* ================= MOBILE HEADER ================= */}
      <div className="md:hidden text-center mb-4">
        <h1 className="text-lg font-bold">
          FRIENDSHIP KARAOKE
        </h1>

        <p className="text-xs opacity-60">
          {now.toLocaleTimeString("id-ID")}
        </p>
      </div>

      {/* ================= ROOM GRID ================= */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 md:gap-6 relative z-10">

        {/* LEFT */}
        <div className="flex flex-col gap-3 md:gap-4">
          {[5,4,3,2,1].map(renderRoom)}
        </div>

        {/* CENTER (DESKTOP ONLY) */}
        <div className="hidden md:flex flex-col justify-between">
          <div className="grid grid-cols-2 gap-4">
            {[11,12].map(renderRoom)}
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col gap-3 md:gap-4">
          {[10,9,8,7,6].map(renderRoom)}
        </div>

      </div>

      {/* ================= FLOATING BUTTON ================= */}

      {/* 🔥 MOBILE VERSION */}
      <div className="
        md:hidden
        fixed bottom-4 left-1/2 -translate-x-1/2 z-20
        flex flex-col gap-3 items-center
      ">
        <button
          onClick={logout}
          className="bg-gray-800/80 px-5 py-2 rounded-xl text-sm"
        >
          Logout
        </button>

        <div
          onClick={() => navigate("/transactions")}
          className="
            backdrop-blur-md
            bg-yellow-500/20 border border-yellow-500/70
            px-10 py-3 rounded-2xl
          "
        >
          <p className="text-sm font-bold text-center">
              💰 {isOwner ? "OWNER" : "KASIR"}
            </p>
        </div>
      </div>

      {/* 🔥 DESKTOP VERSION */}
      <div className="
        hidden md:flex
        absolute bottom-8 left-1/2 -translate-x-1/2 z-20
        flex-col gap-6 items-center
      ">
        <button
          onClick={logout}
          className="bg-gray-800/80 px-6 py-2 rounded-xl"
        >
          Logout
        </button>

        <div
          onClick={() => navigate("/transactions")}
          className="
            backdrop-blur-md bg-yellow-500/20 border border-yellow-500/70
            px-20 py-4 rounded-2xl
          "
        >
          <p className="text-lg font-bold text-center">
            💰 {isOwner ? "OWNER" : "KASIR"} 💰
          </p>
          <p className="text-sm text-center opacity-70">
            Lihat Detail Transaksi
          </p>
        </div>
      </div>

      {/* ================= MODALS ================= */}
      <OpenRoomModal
        show={showModal}
        selectedRoom={selectedRoom}
        customerName={customerName}
        setCustomerName={setCustomerName}
        duration={duration}
        setDuration={setDuration}
        price={price}
        total={total}
        onClose={() => setShowModal(false)}
        onNext={() => setShowConfirm(true)}
      />

      <ConfirmModal
        show={showConfirm}
        selectedRoom={selectedRoom}
        customerName={customerName}
        duration={duration}
        total={total}
        onClose={() => setShowConfirm(false)}
        onConfirm={startRoom}
      />

      <ExtendRoomModal
        show={showExtendModal}
        roomId={extendRoomId}
        onClose={() => setShowExtendModal(false)}
        onSubmit={submitExtend}
        onCloseRoom={closeRoom} 
      />

    </div>
  );
}

export default Dashboard;