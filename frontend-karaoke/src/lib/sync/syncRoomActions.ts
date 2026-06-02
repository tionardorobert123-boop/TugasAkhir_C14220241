import axios from 'axios'

import { db } from '../db'

const CLOUD_API =
  'https://tugasakhirc14220241-production-11c4.up.railway.app/api'

  let isSyncing = false

export async function syncRoomActions(

  cloudOnline: boolean,

  setSyncInfo?: any

) {
  // ================= OFFLINE
   if (!cloudOnline) {

    console.log(
      '📴 CLOUD OFFLINE - SYNC SKIPPED'
    )

    return
  }

    if (isSyncing) {

    console.log(
      '⛔ SYNC ALREADY RUNNING'
    )

    return
  }

  isSyncing = true
try { 
  console.log(
    '🚀 SYNC FUNCTION CALLED'
  )
  
 

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

      console.log(
      'PENDING QUEUE:',
      unsynced.length
    )


 // ================= EMPTY
if (!unsynced.length) {

  setSyncInfo?.({

    syncing: false,

    pending: 0,

    success: 0,

    failed: 0,

    duration: 0,

    total: 0,

    lastSync:
      new Date()
        .toLocaleTimeString()
  })

    console.log(
      '✅ NO PENDING SYNC'
    )

    return
  }


  // ================= START SYNC
  setSyncInfo?.({

    syncing: true,

    pending: unsynced.length,

    success: 0,

    failed: 0,

    duration: 0,

    total: unsynced.length,

    lastSync: null
  })

  console.log(
    `🔄 SYNC ${unsynced.length} ACTION`
  )

  for (const item of unsynced) {

    const startAction =
    performance.now()

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

      setSyncInfo?.((prev: any) => ({

        ...prev,

        success: successCount
      }))

      const endAction =
        performance.now()

      console.log(
        `ACTION ${item.action}
        ROOM ${item.room_id}
        : ${(endAction-startAction).toFixed(2)} ms`
      )

      console.log(
        '☁️ SYNC BERHASIL'
      )

    } catch (err: any) {

      failedCount++

      setSyncInfo?.((prev: any) => ({

        ...prev,

        failed: failedCount
      }))

      const endAction =
      performance.now()

      console.log(
          `ACTION ${item.action}
          ROOM ${item.room_id}
          FAILED
          : ${(endAction-startAction).toFixed(2)} ms`
      )

      console.log(
        '❌ SYNC GAGAL',
        err?.response?.data
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

    setSyncInfo?.({

      syncing: false,

      pending: 0,

      success: successCount,

      failed: failedCount,

      duration: durationMs,

      total: successCount + failedCount,

      lastSync:
        new Date()
          .toLocaleTimeString()
    })

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

  finally {

    isSyncing = false

    setSyncInfo?.((prev: any) => ({

      ...prev,

      syncing: false
    }))

    console.log(
      '🔓 SYNC LOCK RELEASED'
    )
  }

  
}