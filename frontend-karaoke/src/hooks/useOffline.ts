import {useEffect} from 'react'
import {syncRoomActions} from '../lib/sync/syncRoomActions'
import {useCloud} from '../context/CloudContext'

export default function useOffline() {
  const {cloudOnline,
  setSyncInfo} = useCloud()

  useEffect(() => {
    // ================= ONLINE
    if (cloudOnline) {

      console.log(
        '☁️ INTERNET ONLINE'
      )
      // ================= AUTO SYNC
      syncRoomActions(
        cloudOnline,
         setSyncInfo
      )

    } else {

      console.log(
        '📴 OFFLINE MODE'
      )
    }

  }, [cloudOnline,

    setSyncInfo])

  return cloudOnline
}