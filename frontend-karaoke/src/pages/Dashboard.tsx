import RoomCard from "../components/Rooms/RoomCard";
import OpenRoomModal from "../components/Rooms/OpenRoomModal";
import ConfirmModal from "../components/Rooms/ConfirmModal";
import ExtendRoomModal from "../components/Rooms/ExtendRoomModal";
import useOffline from "../hooks/useOffline";
import { useRoomControl } from "../hooks/useRoomControl";
import { useNavigate } from "react-router-dom";

import logo from "../assets/logo.png";
import RoomSettingModal from "../components/Rooms/RoomSettingModal";

import SyncStatus from "../lib/sync/components/SyncStatus";

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

    showSetting,
    setShowSetting,

    selectedRoom,
    selectedRoomData,
    customerName,
    setCustomerName,

    duration,
    setDuration,

    price,
    total,

    handleClick,
    startRoom,
    closeRoom,
    handleOwnerClick,
    handleSettingSuccess,

    openExtendModal,
    showExtendModal,
    extendRoomId,
    submitExtend,
    setShowExtendModal,

    logout
  } = useRoomControl();

  const hasInternet = useOffline();

  const navigate = useNavigate();

  const role = localStorage.getItem("role");
  const isOwner = role === "owner";

  const selectedExtendRoom = rooms.find(r => r.room_id === extendRoomId);
  const extendPrice = selectedExtendRoom?.price_per_hour ?? 0;

  const renderRoom = (id: number) => {
    const room = rooms.find((r) => r.room_id === id);
    if (!room) return null;

    return (
      <RoomCard
        room={room}
        timer={room.end_time ? formatTimer(room.end_time) : "-"}
        warning={room.end_time ? isWarning(room.end_time) : false}
        isOwner={isOwner}

        onClick={isOwner ? () => handleOwnerClick(room) : () => handleClick(room)}
        onExtend={isOwner ? undefined : () => openExtendModal(room.room_id)}
      />
    );
  };

 return (

    <div
      className="
      min-h-screen
      overflow-auto
      bg-gradient-to-b
      from-yellow-900
      to-black
      text-white
      px-4 md:px-6 py-3
      relative
    ">

      <div
        className="
        hidden md:flex
        absolute inset-0
        flex-col items-center
        justify-center
        opacity-80
        pointer-events-none
      "
      >

        {/* SYNC STATUS */}
        <div className="mb-4 pointer-events-auto">
          <SyncStatus />
        </div>

      {!hasInternet && (
        <div
          className="
            mb-6 flex items-center justify-center gap-3 bg-red-600/85 border border-red-400 backdrop-blur-md px-6 py-3
            rounded-2xl shadow-lg shadow-red-900/40  w-fit  mx-auto">
          {/* STATUS DOT */}
          <div className="relative flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-white animate-ping absolute" />
            <div className="w-3 h-3 rounded-full bg-white relative" />
          </div>

          {/* TEXT */}
          <div className="text-center">
            <p className="font-bold text-base tracking-wide">
              MODE OFFLINE LOKAL
            </p>

            <p className="text-xs opacity-90">
              Internet tidak tersedia • Sistem berjalan melalui jaringan lokal
            </p>
          </div>
        </div>
      )}
        <img src={logo} className="w-80 opacity-20 mb-4" />

        <h1 className="text-2xl font-bold tracking-wide">
          FRIENDSHIP KARAOKE & PUB
        </h1>

        <p className="text-sm opacity-70 mt-2">
          {now.toLocaleDateString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
          })}
        </p>

        <p className="text-xl font-mono">
          {now.toLocaleTimeString("en-GB")}
        </p>
      </div>

      {/* ================= MOBILE HEADER ================= */}
      <div className="md:hidden sticky top-0 z-40 text-center pt-2 pb-3 backdrop-blur-md">
        {/* OFFLINE MOBILE */}
      {!hasInternet && (
        <div className=" mb-3 flex items-center justify-center gap-2 bg-red-600/90 border border-red-400 px-3 py-2 rounded-xl shadow-lg shadow-red-900/40 " >
          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <p className="text-[11px] font-semibold">
            MODE OFFLINE LOKAL
          </p>
        </div>
      )}
        <h1 className="text-lg font-bold">
          FRIENDSHIP KARAOKE
        </h1>

        <p className="text-xs opacity-60">
          {now.toLocaleTimeString("en-GB")}
        </p>
      </div>

      {/* ================= ROOM GRID ================= */}

    <>
      {/* MOBILE */}
      <div className="grid grid-cols-2 gap-3 md:hidden relative z-10">

        {/* TOP */}
        {renderRoom(11)}
        {renderRoom(12)}
        {/* LEFT - RIGHT */}
        {renderRoom(5)}
        {renderRoom(10)}
        {renderRoom(4)}
        {renderRoom(9)}
        {renderRoom(3)}
        {renderRoom(8)}
        {renderRoom(2)}
        {renderRoom(7)}
        {renderRoom(1)}
        {renderRoom(6)}

      </div>

      {/* DESKTOP */}
      <div className="hidden md:grid md:grid-cols-3 gap-6 relative z-10">

        {/* LEFT */}
        <div className="flex flex-col gap-4">
          {[5,4,3,2,1].map(renderRoom)}
        </div>

        {/* CENTER */}
        <div className="flex flex-col justify-between">
          <div className="grid grid-cols-2 gap-4">
            {[11,12].map(renderRoom)}
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col gap-4">
          {[10,9,8,7,6].map(renderRoom)}
        </div>

      </div>
    </>

      {/*MOBILE VERSION*/}
      <div className="
        md:hidden
        flex flex-col gap-3 items-center
        mt-8 mb-6">
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

      {/* DESKTOP VERSION */}
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
        price={extendPrice} 
        total={total}
        onClose={() => setShowExtendModal(false)}
        onSubmit={submitExtend}
        onCloseRoom={closeRoom}
      />

      <RoomSettingModal
        show={showSetting}
        room={selectedRoomData}
        onClose={() => setShowSetting(false)}
        onSuccess={handleSettingSuccess}
      />

    </div>
  );
}

export default Dashboard;