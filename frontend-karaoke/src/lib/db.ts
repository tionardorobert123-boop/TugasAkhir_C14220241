import Dexie from 'dexie'

import type { Table } from 'dexie'

// ================= ROOMS
export interface OfflineRoom {

  room_id: number

  room_name: string

  status: string

  customer_name?: string | null

  end_time?: string | null

  price_per_hour?: number

  lock_status?: string

  door_status?: string

  status_online?: boolean

  updated_at?: string

  _closing?: boolean
}

// ================= TRANSACTIONS
export interface OfflineTransaction {

  id?: number

  transaction_id?: number

  temp_id?: string

  room_id: number

  customer_name?: string

  start_time?: string

  end_time?: string

  duration?: number

  price_per_hour?: number

  total_price?: number

  status?: 'active' | 'finished'

  created_at: string

  updated_at?: string
}

// ================= LOGS
export interface OfflineLog {

  log_id?: number

  temp_id: string

  room_id: number

  customer_name: string

  room_status: string

  duration: number

  timestamp: string

  synced?: boolean
}
// ================= ACTION QUEUE
export interface OfflineRoomAction {

  id?: number

  temp_id: string

  room_id: number

  action: 'open' | 'extend' | 'close'

  customer_name?: string

  duration?: number

  minutes?: number

  start_time?: string

  end_time?: string

  created_at: string

  sync_status: number
}

// ================= IOT DEVICES
export interface OfflineIoT {

  device_id?: number

  room_id: number

  lock_status:
    'locked' |
    'unlocked' |
    'unknown'

  door_status:
    'open' |
    'closed' |
    'unknown'

  status_online: boolean

  last_seen?: string
}

// ================= DATABASE
class AppDB extends Dexie {

  // TABLES
  rooms!: Table<OfflineRoom>

  transactions!: Table<OfflineTransaction>

  logs!: Table<OfflineLog>

  room_actions!: Table<OfflineRoomAction>

  iot_devices!: Table<OfflineIoT>

  constructor() {

    super('karaokeDB')

      this.version(2).stores({

      // ================= ROOMS
      rooms:
        'room_id,status,status_online',

      // ================= TRANSACTIONS
      transactions:
      'temp_id,transaction_id,room_id,status,created_at',

      // ================= LOGS
      logs:
      '++log_id,temp_id,room_id,timestamp',

      // ================= ACTIONS
      room_actions:
        '++id,temp_id,action,sync_status,created_at',

      iot_devices:'room_id,status_online,lock_status'
    })
  }
}

// ================= EXPORT DB
export const db = new AppDB()