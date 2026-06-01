import { useState } from 'react'

import { useCloud }
from '../../../context/CloudContext'

import SyncModal
from './SyncModal'

export default function SyncStatus() {

  const {
    syncInfo
  } = useCloud()

  const [open,
    setOpen] = useState(false)

  const completed =
    syncInfo.success +
    syncInfo.failed

  const total =
    syncInfo.total || 0

  const DotAnimation = () => (

    <span
      className="
      inline-flex
      ml-1"
    >

      <span
        className="
        animate-bounce"
      >
        .
      </span>

      <span
        className="
        animate-bounce"
        style={{
          animationDelay:
            '0.15s'
        }}
      >
        .
      </span>

      <span
        className="
        animate-bounce"
        style={{
          animationDelay:
            '0.3s'
        }}
      >
        .
      </span>

    </span>
  )

  return (

    <>
      <button
            onClick={() => setOpen(true)}
            className={`
                px-6 py-3
                min-w-[220px]
                rounded-2xl
                border
                flex items-center
                justify-center
                gap-3
                text-base
                font-semibold
                backdrop-blur-md
                shadow-lg
                transition-all
                hover:scale-105
                ${
                syncInfo.syncing
                    ? 'bg-blue-500/20 border-blue-500/40'
                    : syncInfo.failed > 0
                    ? 'bg-red-500/20 border-red-500/40'
                    : syncInfo.pending > 0
                    ? 'bg-yellow-500/20 border-yellow-500/40'
                    : 'bg-green-500/20 border-green-500/40'
                }
            `}
            >

        {/* SYNCING */}
        {syncInfo.syncing && (

          <>
            <svg
              className="
              w-4 h-4
              animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >

              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
                opacity="0.25"
              />

              <path
                fill="currentColor"
                opacity="0.75"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />

            </svg>

            <span>

              Synchronizing

              {' '}

              ({completed}/{total})

              <DotAnimation />

            </span>
          </>
        )}

        {/* FAILED */}
        {!syncInfo.syncing &&
        syncInfo.failed > 0 && (

          <>
            <span
              className="
              animate-pulse"
            >
              ❌
            </span>

            <span>

              Sync Failed

              {' '}

              ({syncInfo.failed})

            </span>
          </>
        )}

        {/* PENDING */}
        {!syncInfo.syncing &&
        syncInfo.failed === 0 &&
        syncInfo.pending > 0 && (

          <>
            <span
              className="
              animate-pulse"
            >
              ⚠
            </span>

            <span>

              Sync Required

              {' '}

              ({syncInfo.pending})

            </span>
          </>
        )}

        {/* SUCCESS */}
        {!syncInfo.syncing &&
        syncInfo.failed === 0 &&
        syncInfo.pending === 0 && (

          <>
            <span>
              ☁
            </span>

            <span>

              Synced

            </span>
          </>
        )}

      </button>

      <SyncModal

        open={open}

        onClose={() =>
          setOpen(false)
        }
      />

    </>
  )
}