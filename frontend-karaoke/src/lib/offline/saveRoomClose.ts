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

    // ================= ENDPOINT
   const endpoint =
  `/local/rooms/${data.room_id}/close`

    // ================= API
    await API.post(
      endpoint,
      {
        temp_id: payload.temp_id
      }
    )

    // ================= UPDATE DEXIE ROOM
    await db.rooms.update(
      data.room_id,
      {
        status: 'available',

        customer_name: null,

        end_time: null
      }
    )

    // ================= SAVE ACTION
    await db.room_actions.add({

      ...payload,

      sync_status:
        navigator.onLine ? 1 : 0
    })

    console.log(
      navigator.onLine
        ? '☁️ ROOM CLOSE CLOUD'
        : '💻 ROOM CLOSE LOCAL'
    )

  } catch (err) {

    console.log(
      'ROOM CLOSE ERROR',
      err
    )

    // ================= SAVE OFFLINE QUEUE
    await db.room_actions.add(
      payload
    )

    // ================= UPDATE ROOM LOCAL
    await db.rooms.update(
      data.room_id,
      {
        status: 'available',

        customer_name: null,

        end_time: null
      }
    )

    console.log(
      '💾 ROOM CLOSE SAVED OFFLINE'
    )
  }
}