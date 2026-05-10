import API from '../../services/api'
import { db } from '../db'
import { v4 as uuidv4 } from 'uuid'

interface Payload {
  room_id: number
  customer_name: string
  duration: number
}

export async function saveRoomOpen(
  data: Payload
) {
  const payload = {
    temp_id: uuidv4(),

    room_id: data.room_id,

    action: 'open' as const,

    customer_name: data.customer_name,

    duration: data.duration,

    created_at: new Date().toISOString(),

    sync_status: 0
  }

  // ================= ONLINE
  
  if (navigator.onLine) {

    try {

      await API.post(
        `/rooms/${data.room_id}/open`,
        {
          customer_name: data.customer_name,
          duration: data.duration,
          temp_id: payload.temp_id
        }
      )

      await db.room_actions.add({
        ...payload,
        sync_status: 1
      })

      console.log('ROOM OPEN ONLINE')

      return

    } catch (err) {

      console.log(err)

      console.log('ROOM OPEN OFFLINE')
    }
  }

  // ================= OFFLINE
  await db.room_actions.add(payload)

  console.log('ROOM OPEN SAVED OFFLINE')
}