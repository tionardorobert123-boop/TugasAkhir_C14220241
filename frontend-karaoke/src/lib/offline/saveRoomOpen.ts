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

    // ALWAYS UNSYNC
    sync_status: 0
  }

  try {

    // ================= LOCAL MQTT
    await API.post(
      `/local/rooms/${data.room_id}/open`,
      {
        customer_name:
          data.customer_name,

        duration:
          data.duration,

        temp_id:
          payload.temp_id
      }
    )

    // ================= LOCAL UI UPDATE
    const endTime =
      new Date(
        Date.now() +
        data.duration * 60000
      ).toISOString()

    await db.rooms.update(
      data.room_id,
      {
        status: 'occupied',

        customer_name:
          data.customer_name,

        end_time: endTime
      }
    )

    // ================= SAVE QUEUE
    await db.room_actions.add(
      payload
    )

    console.log(
      '📡 ROOM OPEN LOCAL MQTT'
    )

  } catch (err) {

    console.log(
      'ROOM OPEN ERROR',
      err
    )

    // ================= SAVE OFFLINE
    await db.room_actions.add(
      payload
    )

    // ================= UPDATE ROOM
    const endTime =
      new Date(
        Date.now() +
        data.duration * 60000
      ).toISOString()

    await db.rooms.update(
      data.room_id,
      {
        status: 'occupied',

        customer_name:
          data.customer_name,

        end_time: endTime
      }
    )

    console.log(
      '💾 ROOM OPEN SAVED OFFLINE'
    )
  }
}