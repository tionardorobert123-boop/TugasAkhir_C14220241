import Dexie from 'dexie'
import type { Table } from 'dexie'

export interface OfflineRoomAction {
  id?: number

  temp_id: string

  room_id: number

  action: 'open' | 'extend' | 'close'

  customer_name?: string

  duration?: number

  minutes?: number

  created_at: string

  sync_status: number
}

class AppDB extends Dexie {
  room_actions!: Table<OfflineRoomAction>

  constructor() {
    super('karaokeDB')

    this.version(1).stores({
      room_actions:
        '++id,temp_id,action,sync_status,created_at'
    })
  }
}

export const db = new AppDB()