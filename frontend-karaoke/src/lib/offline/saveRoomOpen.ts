import API from '../../services/api'

import { db } from '../db'

import { v4 as uuidv4 } from 'uuid'

interface Payload {
  room_id: number
  customer_name: string
  duration: number
}

export async function saveRoomOpen(

  data: Payload,

  cloudOnline: boolean

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

  // ================= ALWAYS LOCAL MQTT
  try {

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

    console.log(
      '📡 LOCAL MQTT OPEN'
    )

  } catch (err) {

    console.log(
      'LOCAL MQTT FAILED',
      err
    )
  }

  console.log(

    cloudOnline
      ? '☁️ CLOUD ONLINE'
      : '📴 CLOUD OFFLINE'
  )

  // ================= CLOUD SYNC
  if (cloudOnline) {

    try {

      await API.post(

        `/rooms/${data.room_id}/open`,

        {
          customer_name:
            data.customer_name,

          duration:
            data.duration,

          temp_id:
            payload.temp_id
        }
      )

      console.log(
        '☁️ ROOM OPEN CLOUD'
      )

      return

    } catch (err) {

      console.log(
        'CLOUD OPEN FAILED',
        err
      )
    }
  }

  // ================= OFFLINE LOCAL UPDATE
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

      end_time:
        endTime
    }
  )

  // ================= SAVE OFFLINE QUEUE
  await db.room_actions.add(
    payload
  )

  console.log(
    '💾 ROOM OPEN SAVED OFFLINE'
  )
}