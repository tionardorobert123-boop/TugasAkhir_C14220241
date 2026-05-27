import { useEffect, useState } from "react";
import API from "../services/api";
import { saveRoomOpen } from "../lib/offline/saveRoomOpen";
import { saveRoomExtend } from "../lib/offline/saveRoomExtend";
import { saveRoomClose } from "../lib/offline/saveRoomClose";
import { db } from "../lib/db";
import { useLocation } from 'react-router-dom'
import {useCloud} from '../context/CloudContext'

export function useRoomControl() {
  const [rooms, setRooms] = useState<any[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSetting, setShowSetting] = useState(false);

  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [selectedRoomData, setSelectedRoomData] = useState<any>(null);
  const [customerName, setCustomerName] = useState("");
  const [duration, setDuration] = useState(60);

  const [now, setNow] = useState(new Date());

  const token = localStorage.getItem("token");

  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extendRoomId, setExtendRoomId] = useState<number | null>(null);
  
  const location = useLocation()
   //check internet
  const {cloudOnline} = useCloud()

  //untuk hitung MS ui update
  let uiStart = 0;

  const openExtendModal = (roomId: number) => {
    setExtendRoomId(roomId);
    setShowExtendModal(true);
  };

  const submitExtend = async (minutes: number) => {
    if (extendRoomId === null) return;

    await extendRoom(extendRoomId, minutes);

    setShowExtendModal(false);
  };

  // ================= RESET =================
  const resetForm = () => {
    setCustomerName("");
    setDuration(60);
    setSelectedRoom(null);
  };

  const closeModal = () => {
    resetForm();
    setShowModal(false);
  };

  // ================= CLOCK =================
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

// ================= LOAD + FETCH ROOMS
useEffect(() => {

  if (!token) return;

  // ================= ONLY DASHBOARD
  if (
    location.pathname !== '/dashboard'
  ) {
    return;
  }

  let isFetching = false;

  // ================= MERGE ROOM + IOT
  const mergeRooms = async (
    roomData: any[]
  ) => {

    const iotDevices =
      await db.iot_devices.toArray();

    return roomData.map(room => {

      const device =
        iotDevices.find(

          d =>
            d.room_id === room.room_id
        );

      return {

        ...room,

        lock_status:

          device?.lock_status
          || 'unknown',

        door_status:

          device?.door_status
          || 'unknown',

        status_online:

          device?.status_online
          || false
      };
    });
  };

  // ================= LOAD CACHE
  const loadCachedRooms = async () => {

    const cachedRooms =
      await db.rooms.toArray();

    if (cachedRooms.length > 0) {

      const merged =
        await mergeRooms(
          cachedRooms
        );

      setRooms(merged);

      console.log(
        'ROOMS CACHE LOADED'
      );
    }
  };

  // ================= FETCH
  const fetchRooms = async () => {

    // ================= PREVENT OVERLAP
    if (isFetching) return;

    isFetching = true;

    try {

      // ================= OFFLINE MODE
      if (!cloudOnline) {

        const offlineRooms =
          await db.rooms.toArray();

        const merged =
          await mergeRooms(
            offlineRooms
          );

        setRooms(merged);

        console.log(
          'ROOMS FROM DEXIE'
        );

        return;
      }

      // // ================= CHECK PENDING QUEUE
      // const pending =
      //   await db.room_actions.count();

      // if (pending > 0) {

      //   console.log(
      //     'SKIP CLOUD FETCH - PENDING LOCAL ACTION'
      //   );

      //   return;
      // }

      // ================= CLOUD FETCH
      const res =
        await API.get('/rooms');

      // ================= SAVE ROOM CACHE
      await db.rooms.bulkPut(
        res.data
      );

      // ================= MERGE WITH IOT
      const merged =
        await mergeRooms(
          res.data
        );

      // ================= UPDATE UI
      setRooms(merged);

      console.log(
        'ROOMS FROM CLOUD'
      );

    } catch (err) {

      console.log(
        'CLOUD FETCH FAILED',
        err
      );

      // ================= FALLBACK DEXIE
      const offlineRooms =
        await db.rooms.toArray();

      const merged =
        await mergeRooms(
          offlineRooms
        );

      setRooms(merged);

      console.log(
        'ROOMS FROM DEXIE'
      );

    } finally {

      isFetching = false;
    }
  };

  // ================= LOAD CACHE FIRST
  loadCachedRooms();

  // ================= FETCH
  fetchRooms();

  // ================= AUTO REFRESH
  let interval: any;

  // ================= CLOUD POLLING
  if (cloudOnline) {

    interval = setInterval(() => {

      fetchRooms();

    }, 10000);
  }

  return () => {

    if (interval) {

      clearInterval(interval);
    }
  };

}, [
  token,
  location.pathname,
  cloudOnline
]);

// ================= FETCH IOT STATUS
useEffect(() => {

  if (!token) return;

  let interval: any;

  const fetchIoTStatus = async () => {

    try {

      // ================= FETCH IOT
      const res =
        await API.get(
          '/iot-devices'
        );

      // ================= SAVE DEXIE
      await db.iot_devices.bulkPut(

        res.data.map((iot: any) => ({

          device_id:
            iot.device_id,

          room_id:
            iot.device_id,

          lock_status:
            iot.lock_status,

          door_status:
            iot.door_status,

          status_online:
            iot.status_online,

          last_seen:
            iot.last_seen
        }))
      );

      console.log(
        'IOT STATUS UPDATED'
      );

    } catch (err) {

      console.log(
        'FETCH IOT FAILED',
        err
      );
    }
  };

  // ================= INITIAL
  fetchIoTStatus();

  // ================= POLLING
  interval = setInterval(() => {

    fetchIoTStatus();

  }, 3000);

  return () => {

    clearInterval(interval);
  };

}, [
  token
]);

// ================= AUTO CLOSE
useEffect(() => {

  if (!token) return;

  const interval = setInterval(async () => {

    const nowTime = Date.now();

    // ================= LOOP ROOM
    for (const room of rooms) {

      // ================= SKIP
      if (
        room.status !== 'occupied' ||
        !room.end_time ||
        room._closing
      ) {
        continue;
      }

      const end = new Date(
        room.end_time
      ).getTime();

      // ================= DEBUG
      // console.log({

      //   room: room.room_id,

      //   now:

      //     new Date(nowTime)

      //       .toLocaleString('sv-SE')

      //       .replace(' ', 'T'),

      //   end:

      //     new Date(end)

      //       .toLocaleString('sv-SE')

      //       .replace(' ', 'T'),

      //   diff:
      //     end - nowTime
      // });

      // ================= AUTO CLOSE
      if (nowTime >= end) {

        console.log(

          cloudOnline
            ? 'AUTO CLOSE CLOUD'
            : 'AUTO CLOSE LOCAL'
        );

        // ================= MARK CLOSING
        setRooms(prev =>

          prev.map(r =>

            r.room_id === room.room_id

              ? {
                  ...r,
                  _closing: true
                }

              : r
          )
        );

        try {

          uiStart =
            performance.now();
          // ================= CLOSE ROOM
          await saveRoomClose(

            {
              room_id: room.room_id
            },

            cloudOnline
          );

          // ================= UPDATE DEXIE
          await db.rooms.update(

            room.room_id,

            {
              status: 'available',

              customer_name: null,

              end_time: null
            }
          );

          // ================= UPDATE UI
          setRooms(prev =>

            prev.map(r =>

              r.room_id === room.room_id

                ? {

                    ...r,

                    status: 'available',

                    customer_name: null,

                    end_time: null,

                    _closing: false
                  }

                : r
            )
          );
          const uiEnd =
            performance.now();

          const uiMs =
            (
              uiEnd - uiStart
            ).toFixed(2);

          console.log(
            `UI UPDATE: ${uiMs} ms`
          );

        } catch (err) {

          console.log(
            'AUTO CLOSE ERROR',
            err
          );

          // ================= RESET FLAG
          setRooms(prev =>

            prev.map(r =>

              r.room_id === room.room_id

                ? {
                    ...r,
                    _closing: false
                  }

                : r
            )
          );
        }
      }
    }

  }, 1000);

  return () => clearInterval(interval);

}, [
  rooms,
  token,
  cloudOnline
]);
// ================= SELF HEALING MQTT
useEffect(() => {

  if (!token) return;

  const syncMismatch = async () => {

    for (const room of rooms) {

      // ================= ROOM SHOULD OPEN
      const shouldUnlocked =

        room.status === 'occupied';

      // ================= MQTT LOCKED
      const mqttLocked =

        room.lock_status === 'locked';

      console.log({

        room: room.room_id,

        shouldUnlocked,

        mqttLocked,

        resyncing:
          room._resyncing
      });

      // ================= MISMATCH
      if (

        shouldUnlocked &&

        mqttLocked &&

        !room._resyncing
      ) {

        console.log(
          `SYNC MISMATCH ROOM ${room.room_id}`
        );

        // ================= LOCK RESYNC
        setRooms(prev =>

          prev.map(r =>

            r.room_id === room.room_id

              ? {

                  ...r,

                  _resyncing: true
                }

              : r
          )
        );

        try {

          // ================= RESEND OPEN
          await API.post(

            `/local/rooms/${room.room_id}/resync`
          );

          console.log(
            `RETRY OPEN ROOM ${room.room_id}`
          );

        } catch (err) {

          console.log(
            'RETRY MQTT FAILED',
            err
          );
        }

        // ================= COOLDOWN
        setTimeout(() => {

          setRooms(prev =>

            prev.map(r =>

              r.room_id === room.room_id

                ? {

                    ...r,

                    _resyncing: false
                  }

                : r
            )
          );

        }, 5000);
      }
    }
  };

  syncMismatch();

}, [
  rooms,
  token
]);

  // ================= WARNING =================
  const isWarning = (endTime: string) => {
    if (!endTime) return false;

    const diff = new Date(endTime).getTime() - new Date().getTime();

    return diff > 0 && diff <= 5 * 60 * 1000;
  };

  // ================= TIMER =================
  const formatTimer = (endTime: string) => {
    if (!endTime) return "-";

    const diff = new Date(endTime).getTime() - new Date().getTime();

    if (diff <= 0) return "00:00:00";

    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // ================= OPEN ROOM =================
    const startRoom = async () => {

      if (!selectedRoom) return;

      try {

        // ================= SAVE ACTION
        const roomData =
          rooms.find(
            r => r.room_id === selectedRoom
          );

        await saveRoomOpen(
        {
          room_id:
            selectedRoom,

          customer_name:
            customerName,

          duration,

          price_per_hour:
            roomData?.price_per_hour || 0
        },
        cloudOnline
        );

        // ================= HITUNG END TIME
        const endTime =
        new Date(
          Date.now() +
          duration * 60000
        ).toLocaleString('sv-SE').replace(' ', 'T');

        // ================= UI TIMER START
        uiStart =
          performance.now();

       // ================= UPDATE UI LANGSUNG
        setRooms(prev =>

          prev.map(room =>

            room.room_id === selectedRoom

              ? {

                  ...room,

                  status: 'occupied',

                  customer_name:
                    customerName,

                  end_time:
                    endTime,

                  status_online:
                    room.status_online
                }

              : room
          )
        );

        // ================= UI TIMER END
        const uiEnd =
          performance.now();

        const uiMs =
          (
            uiEnd - uiStart
          ).toFixed(2);

        console.log(
          `UI UPDATE: ${uiMs} ms`
        );

        // ================= UPDATE DEXIE CACHE
        await db.rooms.update(

          selectedRoom,

          {
            status: 'occupied',

            customer_name:
              customerName,

            end_time:
              endTime
          }
        );

        // ================= CLOSE MODAL
        setShowConfirm(false);

        setShowModal(false);

        // ================= RESET FORM
        resetForm();

      } catch (err) {

        console.log(
          'OPEN ROOM ERROR',
          err
        );
      }
    };

    // ================= CLOSE ROOM =================
const closeRoom = async (
  roomId: number
) => {

  try {

    uiStart =
    performance.now();
    // ================= SAVE ACTION
    await saveRoomClose(

      {
        room_id: roomId
      },

      cloudOnline
    );

    // ================= UPDATE UI
    setRooms(prev =>

      prev.map(room =>

        room.room_id === roomId

          ? {

              ...room,

              status: 'available',

              customer_name: null,

              end_time: null
            }

          : room
      )
    );

    const uiEnd =
      performance.now();

    const uiMs =
      (
        uiEnd - uiStart
      ).toFixed(2);

    console.log(
      `UI UPDATE: ${uiMs} ms`
    );

    // ================= UPDATE DEXIE
    await db.rooms.update(

      roomId,

      {
        status: 'available',

        customer_name: null,

        end_time: null
      }
    );

    console.log(
      'ROOM CLOSE SUCCESS'
    );

  } catch (err) {

    console.log(
      'ROOM CLOSE ERROR',
      err
    );
  }
};
// ================= EXTEND
const extendRoom = async (

  roomId: number,

  minutes: number

) => {

  try {

    // ================= SAVE ACTION
    await saveRoomExtend(

      {
        room_id:
          roomId,

        minutes,
      },

      cloudOnline
    );

  } catch (err) {

    console.log(
      'EXTEND ERROR',
      err
    );
  }
};
  // ================= CLICK =================
  const handleClick = (room: any) => {
    if (room.status !== "available") return;

    resetForm();
    setSelectedRoom(room.room_id);
    setShowModal(true);
    
  };

  const handleOwnerClick = (room: any) => {
    setSelectedRoom(room.room_id);
    setSelectedRoomData(room);
    setShowSetting(true);
  };

  const handleSettingSuccess = () => {
    // Refresh rooms data setelah update setting
    const fetchRooms = () => {
      API.get("/rooms", {
        // headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          setRooms(res.data);
          localStorage.setItem("rooms_cache", JSON.stringify(res.data));
        });
    };
    fetchRooms();
  };

  // ================= LOGOUT =================
  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  //ambil data price dari database room
  const selected = Array.isArray(rooms)
  ? rooms.find(r => r.room_id === selectedRoom)
  : null;
  const price = selected?.price_per_hour ?? 0;
  const hours = Math.ceil(duration / 60);
  const total = hours * price;

  return {
    rooms,
    setRooms,

    now,

    formatTimer,
    isWarning,

    showModal,
    setShowModal,

    showConfirm,
    setShowConfirm,

    showSetting,
    setShowSetting,

    selectedRoom,
    selectedRoomData,
    customerName,
    setCustomerName,

    duration,
    setDuration,

    price,
    total,

    handleClick,
    startRoom,
    extendRoom,
    closeRoom,
    handleOwnerClick,
    handleSettingSuccess,

    closeModal,
    logout,

    showExtendModal,
    setShowExtendModal,
    extendRoomId,
    openExtendModal,
    submitExtend,
  };
}