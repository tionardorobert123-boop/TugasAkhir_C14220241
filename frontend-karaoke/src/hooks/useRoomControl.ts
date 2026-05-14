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

  const loadCachedRooms = async () => {

    const cachedRooms =
      await db.rooms.toArray();

    if (cachedRooms.length > 0) {

      setRooms(cachedRooms);

      console.log(
        'ROOMS CACHE LOADED'
      );
    }
  };

  const fetchRooms = async () => {

    // ================= PREVENT OVERLAP
    if (isFetching) return;

    isFetching = true;

    try {

      // ================= OFFLINE MODE
      if (!cloudOnline) {

        const offlineRooms =
          await db.rooms.toArray();

        setRooms(offlineRooms);

        console.log(
          'ROOMS FROM DEXIE'
        );

        return;
      }

      // ================= CLOUD FETCH
      const res =
        await API.get('/rooms');

      // ================= UPDATE UI
      setRooms(res.data);

      // ================= UPDATE DEXIE
      await db.rooms.clear();

      await db.rooms.bulkPut(
        res.data
      );

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

      setRooms(offlineRooms);

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

  // ONLY POLLING IF CLOUD ONLINE
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

//AUTO CLOSE
useEffect(() => {

  if (!token) return;

  const interval = setInterval(async () => {

    const nowTime = Date.now();

    setRooms(prev =>

      prev.map(room => {

        // ================= SKIP
        if (
          room.status !== 'occupied' ||
          !room.end_time
        ) {
          return room;
        }

        const end =

          new Date(
            room.end_time
          ).getTime();

        // ================= AUTO CLOSE
        if (
          nowTime >= end &&
          !room._closing
        ) {

          // ================= CLOSE ROOM
          saveRoomClose(

            {
              room_id: room.room_id
            },

            cloudOnline
          );

          // ================= UPDATE DEXIE
          db.rooms.update(

            room.room_id,

            {
              status: 'available',

              customer_name: null,

              end_time: null
            }
          );

          console.log(

            cloudOnline
              ? 'AUTO CLOSE CLOUD'
              : 'AUTO CLOSE LOCAL'
          );

          return {

            ...room,

            status: 'available',

            end_time: null,

            customer_name: null,

            _closing: true
          };
        }

        return room;
      })
    );

  }, 1000);

  return () => clearInterval(interval);

}, [
  token,
  cloudOnline
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
        await saveRoomOpen(
        {
        room_id:
          selectedRoom,
        customer_name:
          customerName,
        duration,
      },
      cloudOnline
          
        );

        // ================= HITUNG END TIME
        const endTime =

          new Date(

            Date.now() +
            duration * 60000

          ).toISOString();

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
  // ================= EXTEND =================
    const extendRoom = async (

      roomId: number,

      minutes: number

    ) => {

      try {

        // ================= SAVE ACTION
        await saveRoomExtend({

          room_id:
            roomId,

          minutes,
        }, cloudOnline);

        // ================= UPDATE ROOM STATE
        setRooms(prev =>

          prev.map(room => {

            if (
              room.room_id !== roomId ||
              !room.end_time
            ) {
              return room;
            }

            // ================= TAMBAH WAKTU
            const currentEnd =

              new Date(
                room.end_time
              );

            currentEnd.setMinutes(

              currentEnd.getMinutes() +
              minutes
            );

            return {

              ...room,

              end_time:
                currentEnd.toISOString()
            };
          })
        );

        // ================= UPDATE DEXIE
        const room =
          await db.rooms.get(roomId);

        if (room?.end_time) {

          const end =

            new Date(
              room.end_time
            );

          end.setMinutes(

            end.getMinutes() +
            minutes
          );

          await db.rooms.update(

            roomId,

            {
              end_time:
                end.toISOString()
            }
          );
        }
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