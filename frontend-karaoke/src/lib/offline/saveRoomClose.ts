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

    // ALWAYS UNSYNC
    sync_status: 0
  }

  try {

    // ================= LOCAL MQTT
    await API.post(
      `/local/rooms/${data.room_id}/close`,
      {
        temp_id: payload.temp_id
      }
    )

    // ================= UPDATE ROOM
    await db.rooms.update(
      data.room_id,
      {
        status: 'available',

        customer_name: null,

        end_time: null
      }
    )

    // ================= SAVE QUEUE
    await db.room_actions.add(
      payload
    )

    console.log(
      '📡 ROOM CLOSE LOCAL MQTT'
    )

  } catch (err) {

    console.log(
      'ROOM CLOSE ERROR',
      err
    )

    // ================= SAVE OFFLINE
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