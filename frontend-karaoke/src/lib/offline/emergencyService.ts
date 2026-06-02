import API from '../../services/api'
import { db } from '../db'

export const emergencyOpen = async (
  roomId: number
) => {

  const { data } = await API.post(
    `/local/rooms/${roomId}/emergency-open`
  )

  await db.logs.add({

    temp_id: crypto.randomUUID(),

    room_id: roomId,

    customer_name: 'EMERGENCY OPEN',

    room_status: 'disabled',

    duration: 0,

    timestamp: new Date().toISOString()
  })

  return data
}

export const emergencyClose = async (
  roomId: number
) => {

  const { data } = await API.post(
    `/local/rooms/${roomId}/emergency-close`
  )

  await db.logs.add({

    temp_id: crypto.randomUUID(),

    room_id: roomId,

    customer_name: 'EMERGENCY CLOSE',

    room_status: 'disabled',

    duration: 0,

    timestamp: new Date().toISOString()
  })

  return data
}