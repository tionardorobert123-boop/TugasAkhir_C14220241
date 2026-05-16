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
const isActive =
  room.status === "occupied";

const isDisabled =
  room.status === "disabled";

const isOffline =
  !room.status_online;

const isWarning =
  warning;

const base = `
  rounded-2xl p-5 transition
  min-h-[160px]
  flex flex-col
  backdrop-blur-md border
`;

// ================= CARD STYLE =================
let cardStyle = `
  bg-gradient-to-br
  from-white/10
  to-black/50
  border-white/20
`;

let status = "Standby";

// 🟡 WARNING
if (isWarning) {

  cardStyle = `
    bg-gradient-to-br
    from-yellow-400/30
    to-black/60
    border-yellow-400
    animate-[pulse_1.2s_ease-in-out_infinite]
  `;

  status = "Hampir Habis";
}

// 🔴 ACTIVE
else if (isActive) {

  cardStyle = `
    bg-gradient-to-br
    from-red-500/30
    to-black/60
    border-red-500
    shadow-[0_0_20px_rgba(255,0,0,0.3)]
  `;

  status = "Sedang Dipakai";
}

// ================= HANDLE CLICK =================
const handleCardClick = () => {

  // OWNER
  if (isOwner) { 
    onClick(); 
    return;
  }

  // DISABLED
  if (isDisabled) return;

  // ACTIVE / WARNING
  if ((isActive || isWarning) && onExtend) {
    onExtend();
    return;
  }

  // STANDBY
  onClick();
};

// ================= DISABLED =================
if (isDisabled) {

  return (

    <div
      onClick={handleCardClick}
      className={`${base}
        bg-black/40
        border-white/10
        opacity-30
        relative
        ${isOwner
          ? "cursor-pointer"
          : "cursor-not-allowed"
        }
      `}
    >

      <div>

        <h2 className="font-semibold text-lg">
          Room {room.room_name}
        </h2>

        <p className="text-sm opacity-70">
          Tidak Tersedia
        </p>

      </div>

      {isOwner && (
        <div className="absolute top-3 right-3">

          <Settings className="w-4 h-4 text-gray-400" />

        </div>
      )}

    </div>
  );
}

// ================= MAIN CARD =================
return (

  <div
    onClick={handleCardClick}
    className={`${base}
      ${cardStyle}
      cursor-pointer
      hover:scale-[1.02]
      relative
    `}
  >

    <Content
      room={room}
      timer={timer}
      status={status}
      active={isActive}
      warning={isWarning}
      offline={isOffline}
    />

    {/* OWNER */}
    {isOwner && (
      <div className="absolute top-3 right-3">

        <Settings className="w-4 h-4 text-gray-400" />

      </div>
    )}

    {/* KASIR */}
    {!isOwner && (isActive || isWarning) && (

      <div className="absolute top-3 right-3">

        <p className="text-xs font-bold text-white">
          ➕ Durasi
        </p>

      </div>

    )}

  </div>
);


// ================= CONTENT =================
function Content({
  room,
  timer,
  status,
  active,
  warning,
  offline
}: any) {

  const lock =
    room.lock_status ?? "unknown";

  const door =
    room.door_status ?? "unknown";

  return (
    <>

      {/* HEADER */}
      <div>

        <h2 className="font-semibold text-lg">
          Room {room.room_name}
        </h2>

        {/* STATUS */}
        <div className="flex flex-col gap-1 mt-1">

          {/* ROOM STATUS */}
          <div className="flex items-center gap-2">

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

          </div>

          {/* DEVICE STATUS */}
          {offline && (

            <div className="flex items-center gap-2">

              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />

              <p className="text-[11px] text-red-400 font-medium">
                Device Offline (Periksa Device)
              </p>

            </div>

          )}

        </div>

      </div>

      {/* BODY */}
      <div className="flex-1 min-h-[40px] mt-2">

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

      </div>

      {/* FOOTER */}
      <div className="flex justify-between items-center mt-2">

          <p className="text-sm font-mono opacity-80">
            ⏱ {timer ?? "-"}
          </p>

          <div className="flex gap-2 opacity-80">

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

        </div>

    </>
  );
 }
}