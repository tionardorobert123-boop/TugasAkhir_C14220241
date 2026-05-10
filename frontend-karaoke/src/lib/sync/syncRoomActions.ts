import API from '../../services/api'
import { db } from '../db'

export async function syncRoomActions() {

  if (!navigator.onLine) return

  const unsynced = await db.room_actions
    .where('sync_status')
    .equals(0)
    .toArray()

  for (const item of unsynced) {

    try {

      // ================= OPEN
      if (item.action === 'open') {

        await API.post(
          `/rooms/${item.room_id}/open`,
          {
            customer_name: item.customer_name,

            duration: item.duration,

            temp_id: item.temp_id
          }
        )
      }

      // ================= EXTEND
      if (item.action === 'extend') {

        await API.post(
          `/rooms/${item.room_id}/extend`,
          {
            minutes: item.minutes,

            temp_id: item.temp_id
          }
        )
      }

      // ================= CLOSE
      if (item.action === 'close') {

        await API.post(
          `/rooms/${item.room_id}/close`,
          {
            temp_id: item.temp_id
          }
        )
      }

      // ================= SUCCESS
      await db.room_actions.update(item.id!, {
        sync_status: 1
      })

      console.log('SYNC BERHASIL')

    } catch (err) {

      console.log(err)

      console.log('SYNC GAGAL')
    }
  }
}