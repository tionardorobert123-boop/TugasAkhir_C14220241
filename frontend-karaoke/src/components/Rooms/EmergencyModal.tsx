type Props = {
  show: boolean
  roomId: number | null

  onClose: () => void

  onEmergencyOpen: () => void

  onEmergencyClose: () => void
}

export default function EmergencyModal({

  show,

  roomId,

  onClose,

  onEmergencyOpen,

  onEmergencyClose

}: Props) {

  if (!show) return null

  return (

    <div
      className="
        fixed inset-0
        bg-black/80
        backdrop-blur-sm
        flex items-center
        justify-center
        z-[999]
      "
    >

      <div
        className="
          w-[420px]
          rounded-3xl
          p-6
          bg-zinc-900
          border border-red-500/30
          text-white
        "
      >

        <h2
          className="
            text-xl
            font-bold
            text-center
            text-red-400
            mb-4
          "
        >
          🚨 Emergency Action
        </h2>

        <p
          className="
            text-center
            text-sm
            opacity-70
            mb-6
          "
        >
          Room {roomId}
        </p>

        <div className="space-y-3">

          <button
            onClick={onEmergencyOpen}
            className="
              w-full
              py-3
              rounded-xl
              bg-green-600/20
              border border-green-500/40
              hover:bg-green-600/30
            "
          >
            🔓 Emergency Open
          </button>

          <button
            onClick={onEmergencyClose}
            className="
              w-full
              py-3
              rounded-xl
              bg-red-600/20
              border border-red-500/40
              hover:bg-red-600/30
            "
          >
            🔒 Emergency Close
          </button>

        </div>

        <button
          onClick={onClose}
          className="
            mt-5
            w-full
            py-3
            rounded-xl
            bg-white/10
            hover:bg-white/20
          "
        >
          Cancel
        </button>

      </div>

    </div>
  )
}