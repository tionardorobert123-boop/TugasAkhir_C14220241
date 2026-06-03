import axios from 'axios'
import { db } from '../db'

const CLOUD_API =
'https://tugasakhirc14220241-production-11c4.up.railway.app/api'

export async function syncLogs() {

  const token =
  localStorage.getItem('token')

  const headers = token
    ? {
        Authorization:
          `Bearer ${token}`
      }
    : {}

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
      await axios.post(

        `${CLOUD_API}/sync/access-log`,

        {
          temp_id: log.temp_id,
          room_id: log.room_id,
          customer_name: log.customer_name,
          room_status: log.room_status,
          duration: log.duration,
          timestamp: log.timestamp
        },

        {
          headers,
          timeout: 5000
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