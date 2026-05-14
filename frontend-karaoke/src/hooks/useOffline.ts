import {useEffect} from 'react'
import {syncRoomActions} from '../lib/sync/syncRoomActions'
import {useCloud} from '../context/CloudContext'

export default function useOffline() {
  const {cloudOnline} = useCloud()
  useEffect(() => {
    // ================= ONLINE
    if (cloudOnline) {

      console.log(
        '☁️ INTERNET ONLINE'
      )
      // ================= AUTO SYNC
      syncRoomActions(
        cloudOnline
      )

    } else {

      console.log(
        '📴 OFFLINE MODE'
      )
    }

  }, [cloudOnline])

  return cloudOnline
}