import API from '../../services/api'

import { db } from '../db'

import { v4 as uuidv4 } from 'uuid'

interface Payload {
  room_id: number
}

export async function saveRoomClose(
  data: Payload,
  cloudOnline: boolean
) {

  const payload = {

    temp_id: uuidv4(),

    room_id: data.room_id,

    action: 'close' as const,

    created_at:
      new Date().toISOString(),

    sync_status: 0
  }

  // ================= ALWAYS LOCAL MQTT
  try {

    await API.post(

      `/local/rooms/${data.room_id}/close`,

      {
        temp_id:
          payload.temp_id
      }
    )

    console.log(
      '📡 ROOM CLOSE LOCAL MQTT'
    )

  } catch (err) {

    console.log(
      'LOCAL MQTT CLOSE FAILED',
      err
    )
  }

  // ================= CLOUD SYNC
  if (cloudOnline) {

    try {

      await API.post(

        `/rooms/${data.room_id}/close`,

        {
          temp_id:
            payload.temp_id
        }
      )

      console.log(
        '☁️ ROOM CLOSE CLOUD'
      )

    } catch (err) {

      console.log(
        'CLOUD CLOSE FAILED',
        err
      )
    }
  }

  // ================= UPDATE LOCAL ROOM
  await db.rooms.update(

    data.room_id,

    {
      status: 'available',

      customer_name: null,

      end_time: null
    }
  )

  // ================= UPDATE LOCAL TRANSACTION
  const transactions =
    await db.transactions
      .where('room_id')
      .equals(data.room_id)
      .toArray();

  const trx =
    transactions
      .filter(
        (t: any) =>
          t.status === 'active'
      )
      .sort(
        (a: any, b: any) =>

          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      )[0];

  if (trx) {

    await db.transactions.update(

      trx.temp_id!,

      {

        status:
          'finished',

        updated_at:

          new Date()
            .toISOString()
      }
    )
  }

  // ================= SAVE OFFLINE QUEUE
  await db.room_actions.add(
    payload
  )

  console.log(
    '💾 ROOM CLOSE SAVED OFFLINE'
  )
}