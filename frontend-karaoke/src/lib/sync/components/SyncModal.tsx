import { useCloud }
from '../../../context/CloudContext'

interface Props {

  open: boolean

  onClose: () => void
}

export default function SyncModal({

  open,

  onClose

}: Props) {

  const {

    syncInfo

  } = useCloud()

  if (!open)
    return null

  return (

    <div
      className="
      fixed inset-0
      bg-black/60
      flex items-center
      justify-center
      z-[99999]"
    >

      <div
        className="
        bg-zinc-900
        border border-white/10
        rounded-2xl
        p-6
        w-[400px]
        max-w-[90%]"
      >

        <h2
          className="
          text-lg
          font-bold
          mb-4"
        >
          Synchronization Details
        </h2>

        <div
          className="
          space-y-2
          text-sm"
        >

          <p>
            Status :
            {' '}
            {

              syncInfo.syncing

                ? 'Synchronizing'

                : syncInfo.failed > 0

                ? 'Failed'

                : 'Success'
            }
          </p>

          <p>
            Pending :
            {' '}
            {syncInfo.pending}
          </p>

          <p>
            Success :
            {' '}
            {syncInfo.success}
          </p>

          <p>
            Failed :
            {' '}
            {syncInfo.failed}
          </p>

          <p>
            Duration :
            {' '}
            {syncInfo.duration}
            {' '}
            ms
          </p>

          <p>
            Last Sync :
            {' '}
            {
              syncInfo.lastSync ??
              '-'
            }
          </p>

        </div>

        <button

          onClick={onClose}

          className="
          mt-6
          w-full
          bg-yellow-500/20
          border border-yellow-500/30
          py-2
          rounded-xl"
        >
          Close
        </button>

      </div>

    </div>
  )
}