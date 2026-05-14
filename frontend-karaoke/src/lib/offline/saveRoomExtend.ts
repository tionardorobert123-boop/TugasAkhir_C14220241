import API from '../../services/api'

import { db } from '../db'

import { v4 as uuidv4 } from 'uuid'

interface Payload {
  room_id: number
  minutes: number
}

export async function saveRoomExtend(
  data: Payload,
  cloudOnline: boolean
) {

  const payload = {

    temp_id: uuidv4(),

    room_id: data.room_id,

    action: 'extend' as const,

    minutes: data.minutes,

    created_at: new Date().toISOString(),

    sync_status: 0
  }

  // ================= ALWAYS LOCAL MQTT
  try {

    await API.post(

      `/local/rooms/${data.room_id}/extend`,

      {
        minutes:
          data.minutes,

        temp_id:
          payload.temp_id
      }
    )

    console.log(
      '📡 ROOM EXTEND LOCAL MQTT'
    )

  } catch (err) {

    console.log(
      'LOCAL MQTT EXTEND FAILED',
      err
    )
  }

  // ================= CLOUD SYNC
  if (cloudOnline) {

    try {

      await API.post(

        `/rooms/${data.room_id}/extend`,

        {
          minutes:
            data.minutes,

          temp_id:
            payload.temp_id
        }
      )

      console.log(
        '☁️ ROOM EXTEND CLOUD'
      )

      return

    } catch (err) {

      console.log(
        'CLOUD EXTEND FAILED',
        err
      )
    }
  }

  // ================= UPDATE ROOM LOCAL
  const room =
    await db.rooms.get(
      data.room_id
    )

  if (room?.end_time) {

    const currentEnd =
      new Date(
        room.end_time
      ).getTime()

    const newEnd =

      currentEnd +
      (data.minutes * 60000)

    await db.rooms.update(

      data.room_id,

      {
        end_time:
          new Date(newEnd)
            .toISOString()
      }
    )
  }

  // ================= SAVE OFFLINE QUEUE
  await db.room_actions.add(
    payload,
  )

  console.log(
    '💾 ROOM EXTEND SAVED OFFLINE'
  )
}