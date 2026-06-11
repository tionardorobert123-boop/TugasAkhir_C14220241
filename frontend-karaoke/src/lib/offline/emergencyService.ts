import API from '../../services/api'
import { db } from '../db'

export const emergencyOpen = async (
  roomId: number
) => {

  const payload = {

    temp_id: crypto.randomUUID(),

    room_id: roomId,

    customer_name: 'EMERGENCY OPEN',

    room_status: 'standby',

    duration: 0,

    timestamp: new Date()
      .toLocaleString('sv-SE')
      .replace(' ', 'T')
  }

  // ================= MQTT LOCAL
  try {

    await API.post(
      `/local/rooms/${roomId}/emergency-open`
    )

    console.log(
      '📡 MQTT OPEN SENT'
    )

  } catch (err) {

    console.log(
      '❌ MQTT OPEN FAILED'
    )
  }

  // ================= CLOUD LOG
  try {

    await API.post(
      '/sync/access-log',
      payload
    )

    console.log(
      '☁️ EMERGENCY OPEN SAVED'
    )

    return {
      success: true
    }

  } catch (err) {

    console.log(
      '📴 CLOUD FAILED -> SAVE DEXIE'
    )

    await db.logs.add({

      ...payload,

      synced: false
    })

    return {
      success: false
    }
  }
}

export const emergencyClose = async (
  roomId: number
) => {

  const payload = {

    temp_id: crypto.randomUUID(),

    room_id: roomId,

    customer_name: 'EMERGENCY CLOSE',

    room_status: 'standby',

    duration: 0,

    timestamp: new Date()

            .toLocaleString('sv-SE')

            .replace(' ', 'T')
  }

  // ================= MQTT LOCAL
  try {

    await API.post(
      `/local/rooms/${roomId}/emergency-close`
    )

    console.log(
      '📡 MQTT CLOSE SENT'
    )

  } catch (err) {

    console.log(
      '❌ MQTT CLOSE FAILED'
    )
  }

  // ================= CLOUD LOG
  try {

    await API.post(
      '/sync/access-log',
      payload
    )

    console.log(
      '☁️ EMERGENCY CLOSE SAVED'
    )

    return {
      success: true
    }

  } catch (err) {

    console.log(
      '📴 CLOUD FAILED -> SAVE DEXIE'
    )

    await db.logs.add({

      ...payload,

      synced: false
    })

    return {
      success: false
    }
  }
}