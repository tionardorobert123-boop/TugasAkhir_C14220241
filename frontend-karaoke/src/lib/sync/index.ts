import {
  syncRoomActions
} from './syncRoomActions'

import {
  syncLogs
} from './syncLogs'

export async function syncAll(

  cloudOnline: boolean

) {

  await Promise.all([

    syncRoomActions(
      cloudOnline
    ),

    syncLogs()
  ])
}