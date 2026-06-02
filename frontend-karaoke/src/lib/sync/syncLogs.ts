import axios from 'axios'
import { db } from '../db'

const CLOUD_API =
  'https://tugasakhirc14220241-production-11c4.up.railway.app/api'

export async function syncLogs() {

  const logs =
    await db.logs.toArray()

  for (const log of logs) {

    try {

      await axios.post(

        `${CLOUD_API}/sync/access-log`,

        {
          temp_id: log.temp_id,

          room_id: log.room_id,

          customer_name: log.customer_name,

          room_status: log.room_status,

          duration: log.duration,

          timestamp: log.timestamp
        }
      )

      await db.logs.delete(
        log.log_id!
      )

    } catch {

      continue
    }
  }
}