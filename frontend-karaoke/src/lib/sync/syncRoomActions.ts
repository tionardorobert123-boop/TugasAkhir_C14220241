import axios from 'axios'

import { db } from '../db'

const CLOUD_API =
  'https://tugasakhirc14220241.up.railway.app/api'

export async function syncRoomActions(

  cloudOnline: boolean

) {

  // ================= OFFLINE
  if (!cloudOnline) {

    console.log(
      '📴 CLOUD OFFLINE - SYNC SKIPPED'
    )

    return
  }

  const startSync =
  performance.now()

  let successCount = 0

  let failedCount = 0

  // ================= GET QUEUE
  const unsynced =

    await db.room_actions

      .where('sync_status')

      .equals(0)

      .toArray()

  // ================= EMPTY
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

              start_time:
                item.start_time,

              end_time:
                item.end_time,

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
      await db.room_actions.delete(
        item.id!
      )

      successCount++

      console.log(
        '☁️ SYNC BERHASIL'
      )

    } catch (err: any) {

      failedCount++

      console.log(
        '❌ SYNC GAGAL',
        err
      )

      // ================= DELETE INVALID AUTH
      if (
        err?.response?.status === 401
      ) {

        await db.room_actions.delete(
          item.id!
        )

        console.log(
          '🗑 INVALID TOKEN ACTION REMOVED'
        )
      }

      // ================= CONTINUE NEXT
      continue
    }
  }

  const endSync =
  performance.now()

  const durationMs =
    Number(
      (
        endSync - startSync
      ).toFixed(2)
    )

  console.log(
    `✅ SYNC FINISHED`
  )

  console.log(
    `SUCCESS : ${successCount}`
  )

  console.log(
    `FAILED : ${failedCount}`
  )

  console.log(
    `DURATION : ${durationMs} ms`
  )
}