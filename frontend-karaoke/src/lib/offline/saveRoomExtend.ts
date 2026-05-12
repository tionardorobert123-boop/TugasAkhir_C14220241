import API from '../../services/api'

import { db } from '../db'

import { v4 as uuidv4 } from 'uuid'

interface Payload {
  room_id: number
  minutes: number
}

export async function saveRoomExtend(
  data: Payload
) {

  const payload = {

    temp_id: uuidv4(),

    room_id: data.room_id,

    action: 'extend' as const,

    minutes: data.minutes,

    created_at: new Date().toISOString(),

    // ALWAYS UNSYNC
    sync_status: 0
  }

  try {

    // ================= LOCAL MQTT
    await API.post(
      `/local/rooms/${data.room_id}/extend`,
      {
        minutes: data.minutes,

        temp_id: payload.temp_id
      }
    )

    // ================= UPDATE ROOM DEXIE
    const room =
      await db.rooms.get(
        data.room_id
      )

    if (room?.end_time) {

      const end =
        new Date(room.end_time)

      end.setMinutes(
        end.getMinutes() +
        data.minutes
      )

      await db.rooms.update(
        data.room_id,
        {
          end_time:
            end.toISOString()
        }
      )
    }

    // ================= SAVE QUEUE
    await db.room_actions.add(
      payload
    )

    console.log(
      '📡 ROOM EXTEND LOCAL MQTT'
    )

  } catch (err) {

    console.log(
      'ROOM EXTEND ERROR',
      err
    )

    // ================= SAVE OFFLINE
    await db.room_actions.add(
      payload
    )

    // ================= UPDATE ROOM LOCAL
    const room =
      await db.rooms.get(
        data.room_id
      )

    if (room?.end_time) {

      const end =
        new Date(room.end_time)

      end.setMinutes(
        end.getMinutes() +
        data.minutes
      )

      await db.rooms.update(
        data.room_id,
        {
          end_time:
            end.toISOString()
        }
      )
    }

    console.log(
      '💾 ROOM EXTEND SAVED OFFLINE'
    )
  }
}