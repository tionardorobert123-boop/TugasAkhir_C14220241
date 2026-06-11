import { useEffect } from 'react'

import { syncRoomActions }
from '../lib/sync/syncRoomActions'

import { syncLogs }
from '../lib/sync/syncLogs'

import { useCloud }
from '../context/CloudContext'

export default function useOffline() {

  const {
    cloudOnline,
    setSyncInfo
  } = useCloud()

  useEffect(() => {

    if (cloudOnline) {

      console.log(
        '☁️ INTERNET ONLINE'
      )

      syncRoomActions(
        cloudOnline,
        setSyncInfo
      )

      syncLogs()
    }

    else {

      console.log(
        '📴 OFFLINE MODE'
      )
    }

  }, [
    cloudOnline,
    setSyncInfo
  ])

  return cloudOnline
}