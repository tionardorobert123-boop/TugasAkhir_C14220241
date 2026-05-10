import { syncRoomActions }
from './syncRoomActions'

export async function syncAll() {

  await syncRoomActions()
}