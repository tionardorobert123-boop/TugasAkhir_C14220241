import {
  syncRoomActions
} from './syncRoomActions'

export async function syncAll(

  cloudOnline: boolean

) {

  await syncRoomActions(
    cloudOnline
  )
}