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

  created_at:
    new Date().toISOString(),

  sync_status: 0
  }

  // ================= ALWAYS LOCAL MQTT
  try {

    await API.post(

      `/local/rooms/${data.room_id}/extend`,

      {
        minutes: data.minutes,

        temp_id: payload.temp_id,

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
            payload.temp_id,

          created_at:
            payload.created_at,
        }
      )

      console.log(
        '☁️ ROOM EXTEND CLOUD'
      )


    } catch (err) {

      console.log(
        'CLOUD EXTEND FAILED',
        err
      )
    }
  }

  // ================= UPDATE LOCAL ROOM
  const room =
    await db.rooms.get(
      data.room_id
    )

  if (room?.end_time) {

    const currentEnd =
      new Date(
        room.end_time
      )

    currentEnd.setMinutes(

      currentEnd.getMinutes() +
      data.minutes
    )

    await db.rooms.update(

      data.room_id,

      {
        end_time:

          currentEnd

            .toLocaleString('sv-SE')

            .replace(' ', 'T')
      }
    )
  }

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

    const currentEnd =

      new Date(
        trx.end_time || new Date()
      )

    currentEnd.setMinutes(

      currentEnd.getMinutes() +
      data.minutes
    )

    const newDuration =
      (trx.duration || 0) +
      data.minutes;

    const totalPrice =
      (newDuration / 60) *
      (trx.price_per_hour || 0);

    await db.transactions.update(

      trx.temp_id!,

      {

        end_time:

          currentEnd

            .toLocaleString('sv-SE')

            .replace(' ', 'T'),

        duration:
          newDuration,

        total_price:
          totalPrice,

        updated_at:

          new Date()

            .toLocaleString('sv-SE')

            .replace(' ', 'T')
      }
    )
  }

  // ================= SAVE OFFLINE QUEUE
      if (!cloudOnline) {
      await db.room_actions.add(payload)

      console.log(
        '💾 ROOM CLOSE SAVED OFFLINE'
      )
    }
}