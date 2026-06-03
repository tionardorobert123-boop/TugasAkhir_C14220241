import API from '../../services/api'
import { db } from '../db'

export async function syncLogs() {

   const role =
    localStorage.getItem('role')

  if (role !== 'cashier') {

    console.log(
      '🚫 LOG SYNC DISABLED FOR OWNER'
    )

    return
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

      await db.logs.update(
        log.log_id!,
        {
          synced: true
        }
      )

      console.log(
        '☁️ LOG SYNCED'
      )

    } catch (err) {

      console.log(
        '❌ LOG SYNC FAILED',
        err
      )
    }
  }
}