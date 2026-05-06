import { useEffect, useState } from "react";
import axios from "axios";

export function useRoomControl() {
  const [rooms, setRooms] = useState<any[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSetting, setShowSetting] = useState(false);

  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [duration, setDuration] = useState(60);

  const [now, setNow] = useState(new Date());

  const token = localStorage.getItem("token");

  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extendRoomId, setExtendRoomId] = useState<number | null>(null);

  const openExtendModal = (roomId: number) => {
    setExtendRoomId(roomId);
    setShowExtendModal(true);
  };

  const submitExtend = async (minutes: number) => {
    if (!extendRoomId) return;

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

  // ================= LOAD + FETCH ROOMS =================
  useEffect(() => {
    if (!token) return;

    // LOAD CACHE
    const cached = localStorage.getItem("rooms_cache");
    if (cached) {
      setRooms(JSON.parse(cached));
    }

    const fetchRooms = () => {
      axios
        .get("http://localhost:8000/api/rooms", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setRooms(res.data);

          localStorage.setItem("rooms_cache", JSON.stringify(res.data));
        });
    };

    fetchRooms();

    const interval = setInterval(() => {
    fetchRooms();
  }, 5000);   

    return () => clearInterval(interval);
  }, [token]);

  // ================= AUTO CLOSE =================
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      setRooms((prev) =>
        prev.map((room) => {
          if (room.status !== "occupied" || !room.end_time) return room;

          const end = new Date(room.end_time).getTime();
          const nowTime = new Date().getTime();

          if (nowTime >= end && !room._closing) {
            axios.post(
              `http://localhost:8000/api/rooms/${room.room_id}/close`,
              {},
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            return {
              ...room,
              status: "available",
              end_time: null,
              customer_name: null,
              _closing: true,
            };
          }

          return room;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [token]);

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
      const res = await axios.post(
        `http://localhost:8000/api/rooms/${selectedRoom}/open`,
        {
          duration,
          customer_name: customerName,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setRooms((prev) =>
        prev.map((room) =>
          room.room_id === selectedRoom
            ? {
                ...room,
                status: "occupied",
                end_time: res.data.end_time,
                customer_name: customerName,
                _closing: false,
              }
            : room
        )
      );

      setShowConfirm(false);
      setShowModal(false);
      resetForm();
    } catch (err) {
      console.log(err);
    }
  };

  // ================= EXTEND =================
  const extendRoom = async (roomId: number, minutes: number) => {
    try {
      const res = await axios.post(
        `http://localhost:8000/api/rooms/${roomId}/extend`,
        { minutes },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setRooms((prev) =>
        prev.map((room) =>
          room.room_id === roomId
            ? {
                ...room,
                end_time: res.data.new_end_time,
              }
            : room
        )
      );
    } catch (err) {
      console.log("extend error", err);
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
    setShowSetting(true);
  };

  // ================= LOGOUT =================
  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  //ambil data price dari database room
  const selected = rooms.find(r => r.room_id === selectedRoom);
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

    closeModal,
    logout,

    showExtendModal,
    setShowExtendModal,
    extendRoomId,
    openExtendModal,
    submitExtend,
  };
}