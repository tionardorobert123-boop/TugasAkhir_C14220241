import axios from 'axios'

import { db } from '../db'

const CLOUD_API =
  'https://tugasakhirc14220241.up.railway.app/api'

export async function syncRoomActions() {

  const unsynced =
    await db.room_actions
      .where('sync_status')
      .equals(0)
      .toArray()

  if (!unsynced.length) {

    console.log(
      '✅ NO PENDING SYNC'
    )

    return
  }

  console.log(
    `🔄 SYNC ${unsynced.length} ACTION`
  )

  for (const item of unsynced) {

    try {

      // ================= TOKEN
      const token =
        localStorage.getItem(
          'token'
        )

      const headers = token
        ? {
            Authorization:
              `Bearer ${token}`
          }
        : {}

      // ================= OPEN
      if (item.action === 'open') {

        await axios.post(

          `${CLOUD_API}/rooms/${item.room_id}/open`,

          {
            customer_name:
              item.customer_name,

            duration:
              item.duration,

            temp_id:
              item.temp_id
          },

          {
            headers,
            timeout: 5000
          }
        )
      }

      // ================= EXTEND
      if (item.action === 'extend') {

        await axios.post(

          `${CLOUD_API}/rooms/${item.room_id}/extend`,

          {
            minutes:
              item.minutes,

            temp_id:
              item.temp_id
          },

          {
            headers,
            timeout: 5000
          }
        )
      }

      // ================= CLOSE
      if (item.action === 'close') {

        await axios.post(

          `${CLOUD_API}/rooms/${item.room_id}/close`,

          {
            temp_id:
              item.temp_id
          },

          {
            headers,
            timeout: 5000
          }
        )
      }

      // ================= SUCCESS
      await db.room_actions.update(
        item.id!,
        {
          sync_status: 1
        }
      )

      console.log(
        '☁️ SYNC BERHASIL'
      )

    } catch (err) {

      console.log(
        '❌ SYNC GAGAL',
        err
      )

      // STOP LOOP
      // supaya tidak spam request
      break
    }
  }
}