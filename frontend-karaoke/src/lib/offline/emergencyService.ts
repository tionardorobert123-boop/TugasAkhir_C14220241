import API from '../../services/api'
import { db } from '../db'

export const emergencyOpen = async (
  roomId: number
) => {

  // SIMPAN DULU KE DEXIE
  await db.logs.add({

    temp_id: crypto.randomUUID(),

    room_id: roomId,

    customer_name: 'EMERGENCY OPEN',

    room_status: 'active',

    duration: 0,

    timestamp: new Date().toISOString(),

    synced: false
  })

  try {

    const { data } = await API.post(
      `/local/rooms/${roomId}/emergency-open`
    )

    return data

  } catch (err) {

    console.log(
      'EMERGENCY OPEN OFFLINE'
    )

    return {
      success: false
    }
  }
}

export const emergencyClose = async (
  roomId: number
) => {

  await db.logs.add({

    temp_id: crypto.randomUUID(),

    room_id: roomId,

    customer_name: 'EMERGENCY CLOSE',

    room_status: 'standby',

    duration: 0,

    timestamp: new Date().toISOString(),

    synced: false
  })

  try {

    const { data } = await API.post(
      `/local/rooms/${roomId}/emergency-close`
    )

    return data

  } catch (err) {

    console.log(
      'Emergency MQTT offline'
    )

    return {
      success: false
    }
  }
}
