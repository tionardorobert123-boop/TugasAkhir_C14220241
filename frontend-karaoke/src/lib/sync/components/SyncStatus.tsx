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

  let text =
    '☁ Synced'

  let bg =
    'bg-green-500/20 border-green-500/40'

  if (syncInfo.syncing) {

    text =
      '🔄 Synchronizing'

    bg =
      'bg-blue-500/20 border-blue-500/40'
  }

  else if (

    syncInfo.failed > 0

  ) {

    text =
      '❌ Synchronization Failed'

    bg =
      'bg-red-500/20 border-red-500/40'
  }

  else if (

    syncInfo.pending > 0

  ) {

    text =
      '⚠ Synchronization Required'

    bg =
      'bg-yellow-500/20 border-yellow-500/40'
  }

  return (

    <>
      <button

        onClick={() =>
          setOpen(true)
        }

        className={`
          px-4 py-2
          rounded-xl
          border
          ${bg}
        `}
      >
        {text}
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