import API from '../../services/api'
import { db } from '../db'

export async function syncLogs(
  setSyncInfo?: any
) {

  const role =
    localStorage.getItem('role')

  if (role !== 'kasir') {

    console.log(
      '🚫 LOG SYNC DISABLED FOR OWNER'
    )

    return {
      success: 0,
      failed: 0
    }
  }

  console.log(
    '🚀 syncLogs CALLED'
  )

  const logs = await db.logs
    .filter(log => !log.synced)
    .toArray()

  console.log(
    'LOG PENDING:',
    logs.length
  )

  let successCount = 0
  let failedCount = 0

  for (const log of logs) {

    try {

      const response =
        await API.post(

          '/sync/access-log',

          {
            temp_id: log.temp_id,

            room_id: log.room_id,

            customer_name:
              log.customer_name,

            room_status:
              log.room_status,

            duration:
              log.duration,

            timestamp:
              log.timestamp
          }
        )

      console.log(
        'SYNC RESPONSE:',
        response.data
      )

      await db.logs.delete(
        log.log_id!
      )

      successCount++

      setSyncInfo?.((prev: any) => ({

        ...prev,

        success:
          (prev.success || 0) + 1

      }))

      console.log(
        '☁️ LOG SYNCED & REMOVED'
      )

    } catch (err) {

      failedCount++

      setSyncInfo?.((prev: any) => ({

        ...prev,

        failed:
          (prev.failed || 0) + 1

      }))

      console.log(
        '❌ LOG SYNC FAILED',
        err
      )
    }
  }

  return {
    success: successCount,
    failed: failedCount
  }
}