import API from '../../services/api'
import { db } from '../db'
import { v4 as uuidv4 } from 'uuid'

interface Payload {
  room_id: number
}

export async function saveRoomClose(
  data: Payload
) {

  const payload = {

    temp_id: uuidv4(),

    room_id: data.room_id,

    action: 'close' as const,

    created_at: new Date().toISOString(),

    sync_status: 0
  }

  try {

    // AUTO:
    // cloud atau local
    await API.post(
      `/rooms/${data.room_id}/close`,
      {
        temp_id: payload.temp_id
      }
    )

    await db.room_actions.add({
      ...payload,

      sync_status:
        navigator.onLine ? 1 : 0
    })

    console.log(
      navigator.onLine
        ? 'ROOM CLOSE CLOUD'
        : 'ROOM CLOSE LOCAL'
    )

  } catch (err) {

    console.log(err)

    // fallback queue
    await db.room_actions.add(
      payload
    )

    console.log(
      'ROOM CLOSE SAVED OFFLINE'
    )
  }
}