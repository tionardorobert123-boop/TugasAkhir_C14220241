import { useCloud } from '../../../context/CloudContext'

interface Props {
  open: boolean
  onClose: () => void
}

export default function SyncModal({
  open,
  onClose
}: Props) {

  const { syncInfo } = useCloud()

  if (!open) return null

  const statusText =
    syncInfo.syncing
      ? 'Synchronizing'
      : syncInfo.failed > 0
      ? 'Failed'
      : 'Success'

  const statusColor =
    syncInfo.syncing
      ? 'text-yellow-400'
      : syncInfo.failed > 0
      ? 'text-red-400'
      : 'text-green-400'

  return (
    <div
      className="
        fixed inset-0
        bg-black/60
        backdrop-blur-sm
        flex items-center
        justify-center
        z-[99999]
      "
    >
      <div
        className="
          bg-zinc-900
          border border-yellow-500/20
          rounded-3xl
          p-8
          w-[500px]
          max-w-[90%]
          shadow-2xl
        "
      >
        <h2
          className="
            text-xl
            font-bold
            text-center
            mb-6
          "
        >
          Synchronization Details
        </h2>

        <div className="space-y-4 text-sm">

          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <span className="text-gray-400">
              Status
            </span>

            <span className={`font-semibold ${statusColor}`}>
              {statusText}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">
              Pending Queue
            </span>

            <span className="font-medium">
              {syncInfo.pending}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">
              Success
            </span>

            <span className="text-green-400 font-medium">
              {syncInfo.success}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">
              Failed
            </span>

            <span className="text-red-400 font-medium">
              {syncInfo.failed}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">
              Duration
            </span>

            <span>
              {syncInfo.duration} ms
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">
              Last Sync
            </span>

            <span>
              {syncInfo.lastSync ?? '-'}
            </span>
          </div>

        </div>

        <button
          onClick={onClose}
          className="
            mt-8
            w-full
            py-3
            rounded-xl
            bg-yellow-500/20
            border border-yellow-500/40
            hover:bg-yellow-500/30
            transition
            font-medium
          "
        >
          Close
        </button>
      </div>
    </div>
  )
}