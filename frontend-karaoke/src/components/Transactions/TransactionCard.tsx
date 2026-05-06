interface Props {
  trx: any;
  type: "active" | "finished";
  onExtend?: (roomId: number) => void;

  formatTimer: (end_time: string) => string;
  isWarning: (end_time: string) => boolean;
  formatDuration: (minutes: number) => string;
}

export default function TransactionCard({
  trx,
  type,
  onExtend,
  formatTimer,
  isWarning,
  formatDuration
}: Props) {

  const isActive = type === "active";
  const warning = isActive && isWarning(trx.end_time);

  const base = `
    rounded-2xl p-4 transition
    h-[120px] flex flex-col justify-between
    backdrop-blur-md border
  `;

  const clickable = isActive ? "cursor-pointer hover:scale-[1.02]" : "cursor-default";

  const handleClick = () => {
    if (!isActive) return;
    onExtend?.(trx.room_id);
  };

  // ================= STYLE =================
  let style = `
    bg-gradient-to-br from-white/10 to-black/50
    border-white/20
  `;

  if (warning) {
    style = `
      bg-gradient-to-br from-yellow-400/30 to-black/60
      border-yellow-400
      animate-[pulse_1.2s_ease-in-out_infinite]
    `;
  } else if (isActive) {
    style = `
      bg-gradient-to-br from-red-500/30 to-black/60
      border-red-500
      shadow-[0_0_20px_rgba(255,0,0,0.3)]
    `;
  }

  return (
    <div
      onClick={handleClick}
      className={`${base} ${style} ${clickable}`}
    >
      <Content
        trx={trx}
        active={isActive}
        warning={warning}
        finished={!isActive}
        formatTimer={formatTimer}
        formatDuration={formatDuration}
      />
    </div>
  );
}


// ================= CONTENT =================
function Content({
  trx,
  active,
  warning,
  finished,
  formatTimer,
  formatDuration
}: any) {
  return (
    <>
      {/* HEADER */}
      <div className="flex justify-between">
        <div>
          <p className="text-xs opacity-60">
            Room {trx.room_name || trx.room_id}
          </p>

          <p className="font-bold text-lg">
            {trx.customer_name || "-"}
          </p>
        </div>

        <span className="opacity-40">🎵</span>
      </div>

      {/* INFO */}
      <div className="min-h-[30px]">
        {warning && (
          <p className="text-xs text-yellow-300">
            ⚠ Hampir habis (klik untuk tambah)
          </p>
        )}

        {active && !warning && (
          <p className="text-xs text-yellow-300">
            klik untuk tambah durasi
          </p>
        )}

        {finished && (
          <p className="text-xs opacity-60">
            ⏱ {formatDuration(trx.duration)}
          </p>
        )}
      </div>

      {/* FOOTER */}
      <div className="flex justify-between items-center">

        <p className="text-sm font-mono opacity-80">
          ⏱ {active ? formatTimer(trx.end_time) : "-"}
        </p>

        <p className="text-green-400 font-bold">
          Rp {Number(trx.total_price || 0).toLocaleString()}
        </p>

      </div>
    </>
  );
}