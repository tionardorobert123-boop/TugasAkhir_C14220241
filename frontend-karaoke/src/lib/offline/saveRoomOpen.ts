import API from '../../services/api'

import { db } from '../db'

import { v4 as uuidv4 } from 'uuid'

interface Payload {
  room_id: number
  customer_name: string
  duration: number
  price_per_hour: number
}

export async function saveRoomOpen(

  data: Payload,

  cloudOnline: boolean

) {

  // ================= LOCAL DATETIME
  const startDate =
    new Date()

  const endDate =
    new Date(
      Date.now() +
      data.duration * 60000
    )

  // ================= FORMAT LOCAL
  const startTime =
    startDate
      .toLocaleString('sv-SE')
      .replace(' ', 'T')

  const endTime =
    endDate
      .toLocaleString('sv-SE')
      .replace(' ', 'T')

  // ================= PAYLOAD
  const payload = {

    temp_id: uuidv4(),

    room_id: data.room_id,

    action: 'open' as const,

    customer_name:
      data.customer_name,

    duration:
      data.duration,

    start_time:
      startTime,

    end_time:
      endTime,

    created_at:
      new Date().toISOString(),

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

          start_time:
            startTime,

          end_time:
            endTime,

          temp_id:
            payload.temp_id
        }
      )

      console.log(
        '☁️ ROOM OPEN CLOUD'
      )

    } catch (err) {

      console.log(
        'CLOUD OPEN FAILED',
        err
      )
    }
  }

  // ================= OFFLINE LOCAL UPDATE
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

  // ================= SAVE LOCAL TRANSACTION
await db.transactions.add({

  temp_id: payload.temp_id,

  room_id: data.room_id,

  customer_name: data.customer_name,

  start_time: startTime,

  end_time: endTime,

  duration: data.duration, // SIMPAN MENIT

  price_per_hour: data.price_per_hour,

  total_price:
    (data.duration / 60) *
    data.price_per_hour,

  status: 'active',

  created_at: startTime,

  updated_at: startTime
})

  // ================= SAVE OFFLINE QUEUE
  if (!cloudOnline) {

    await db.room_actions.add(
      payload
    );

    console.log(
      '💾 ROOM OPEN SAVED OFFLINE'
    );
  }

  console.log(
    '💾 ROOM OPEN SAVED OFFLINE'
  )
}