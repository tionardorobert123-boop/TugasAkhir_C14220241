import { Lock, Unlock, DoorOpen, DoorClosed, Settings } from "lucide-react";

interface Props {
  room: any;
  timer: string;
  warning: boolean;
  onClick: () => void;
  onExtend?: () => void;
  isOwner?: boolean;
}

export default function RoomCard({
  room,
  onClick,
  onExtend,
  timer,
  warning,
  isOwner
}: Props) {

  const isActive = room.status === "occupied";
  const isDisabled = room.status === "disabled";
  const isOffline = !room.status_online;

  const base = `
    rounded-2xl p-5 transition
    h-[140px] flex flex-col justify-between
    backdrop-blur-md border
  `;

  // SATU LOGIC SAJA
  const handleCardClick = () => {

    //OWNER
    if (isOwner) {
      onClick();
      return;
    }

    //KASIR
    if (isDisabled || isOffline) return;

    if ((isActive || warning) && onExtend) {
      onExtend();
      return;
    }

    onClick();
  };

  // ❌ DISABLED
  if (isDisabled) {
    return (
      
      <div onClick={handleCardClick} 
      className={`${base} bg-black/40 border-white/10 opacity-30 
       ${isOwner ? "cursor-pointer" : "cursor-not-allowed"}`}>
        <div>
          <h2 className="font-semibold text-lg">
            Room {room.room_name}
          </h2>
          <p className="text-sm opacity-70">
            Tidak Tersedia
          </p>
        </div>
        {isOwner && (
          <div className="absolute top-3 right-3" style={{ opacity: 1 }}>
            <Settings className="w-4 h-4 text-gray-400" />
          </div>
        )}

      </div>
    );
  }

  // 🔴 OFFLINE (UI beda, tapi logic ikut handleCardClick)
  if (isOffline) {
    return (
      <div
      onClick={handleCardClick}
        className={`${base}
          bg-gradient-to-br from-white/10 to-black/50
          border-red-500/40
          ${isOwner ? "cursor-pointer" : "cursor-not-allowed"}
          relative
        `}
      >
        <Content
          room={room}
          timer={timer}
          status="Device Offline"
          offline
          isOwner={isOwner}
        />
        {isOwner && (
          <div className="absolute top-3 right-3">
            <Settings className="w-4 h-4 text-gray-400" />
          </div>
        )}
      </div>
    );
  }

  // 🟡 WARNING
  if (warning) {
    return (
      <div
        onClick={handleCardClick}
        className={`${base} cursor-pointer
          bg-gradient-to-br from-yellow-400/30 to-black/60
          border-yellow-400
          animate-[pulse_1.2s_ease-in-out_infinite]
          hover:scale-[1.02]
          relative
        `}
      >
        <Content
          room={room}
          timer={timer}
          status="Hampir Habis"
          warning
          isOwner={isOwner}
        />
        {isOwner && (
          <div className="absolute top-3 right-3">
            <Settings className="w-4 h-4 text-gray-400" />
          </div>
        )}
      </div>
    );
  }

  // 🔴 ACTIVE
  if (isActive) {
    return (
      <div
        onClick={handleCardClick}
        className={`${base} cursor-pointer
          bg-gradient-to-br from-red-500/30 to-black/60
          border-red-500
          shadow-[0_0_20px_rgba(255,0,0,0.3)]
          hover:scale-[1.02]
          relative
        `}
      >
        <Content
          room={room}
          timer={timer}
          status="Sedang Dipakai"
          active
          isOwner={isOwner}
        />
        {isOwner && (
          <div className="absolute top-3 right-3">
            <Settings className="w-4 h-4 text-gray-400" />
          </div>
        )}
      </div>
    );
  }

  // ⚪ STANDBY
  return (
    <div
      onClick={handleCardClick}
      className={`${base} cursor-pointer
        bg-gradient-to-br from-white/10 to-black/50
        border-white/20
        hover:scale-[1.02]
        relative
      `}
    >
      <Content
        room={room}
        timer={timer}
        status="Standby"
        isOwner={isOwner}
      />
      {isOwner && (
        <div className="absolute top-3 right-3">
          <Settings className="w-4 h-4 text-gray-400" />
        </div>
      )}
    </div>
  );
}


// ================= CONTENT =================
function Content({ room, timer, status, active, warning, offline }: any) {

  const lock = room.lock_status ?? "unknown";
  const door = room.door_status ?? "unknown";

  return (
    <>
      {/* HEADER */}
      <div>
        <h2 className="font-semibold text-lg">
          Room {room.room_name}
        </h2>

        <div className="flex items-center gap-2 mt-1">

          {offline ? (
            <>
              <div className="w-2.5 h-2.5 rounded-full bg-gray-400" />
              <p className="text-s text-red-400 font-medium">
                Device Offline (Periksa Device)
              </p>
            </>
          ) : (
            <>
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  warning
                    ? "bg-yellow-400"
                    : active
                    ? "bg-red-500"
                    : "bg-green-400"
                }`}
              />
              <p className="text-xs opacity-70">
                {status}
              </p>
            </>
          )}

        </div>
      </div>

      {/* CUSTOMER */}
      {!offline && (
        <div className="min-h-[40px]">
          {room.customer_name && (
            <p className="text-sm truncate">
              👤 {room.customer_name}
            </p>
          )}

          {warning && (
            <p className="text-xs text-yellow-300">
              ⚠ Hampir habis
            </p>
          )}

          {active && !warning && (
            <p className="text-xs text-white">
              ➕ Durasi
            </p>
          )}
        </div>
      )}

      {/* FOOTER */}
      {!offline && (
        <div className="flex justify-between items-center">
          <p className="text-sm font-mono opacity-80">
            ⏱ {timer ?? "-"}
          </p>
        </div>
      )}

      {/* ICON */}
      {!offline && (
        <div className="absolute bottom-3 right-3 flex gap-2 opacity-80">

          {lock === "locked" ? (
            <Lock className="w-4 h-4 text-red-400" />
          ) : (
            <Unlock className="w-4 h-4 text-green-400" />
          )}

          {door === "closed" ? (
            <DoorClosed className="w-4 h-4 text-gray-300" />
          ) : (
            <DoorOpen className="w-4 h-4 text-yellow-400" />
          )}

        </div>
      )}
    </>
  );
}