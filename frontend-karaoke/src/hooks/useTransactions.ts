import { useEffect, useState } from "react";
import axios from "axios";

export function useTransactions(selectedDate?: string) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);

  const token = localStorage.getItem("token");

  const today = new Date().toISOString().split("T")[0];
  const filterDate = selectedDate || today;

  const cacheKey = `transactions_cache_${filterDate}`;

  useEffect(() => {
    if (!token) return;

    // ================= LOAD CACHE =================
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      const parsed = JSON.parse(cached);

      setTransactions(parsed.transactions || []);
      setRooms(parsed.rooms || []);
    }

    // ================= FETCH =================
    const fetchData = async () => {
      try {
        const [trxRes, roomRes] = await Promise.all([
          axios.get("http://localhost:8000/api/transactions", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get("http://localhost:8000/api/rooms", {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        const filtered = trxRes.data.filter((trx: any) =>
          trx.created_at.startsWith(filterDate)
        );

        setTransactions(filtered);
        setRooms(roomRes.data);

        // ================= SAVE CACHE =================
        localStorage.setItem(
          cacheKey,
          JSON.stringify({
            transactions: filtered,
            rooms: roomRes.data
          })
        );

      } catch (err) {
        console.log(err);
      }
    };

    fetchData();

    // ================= POLLING (LEBIH RINGAN) =================
    const interval = setInterval(fetchData, 10000); // 🔥 dari 5s → 10s

    return () => clearInterval(interval);

  }, [token, filterDate]);

  // ================= SPLIT =================
  const activeRooms = rooms.filter(r => r.status === "occupied");

  const finishedTransactions = transactions.filter(
    trx => trx.status === "finished"
  );

  // ================= TOTAL =================
  const totalIncome = finishedTransactions.reduce(
    (sum, trx) => sum + Number(trx.total_price),
    0
  );

  // ================= TIMER =================
  const formatTimer = (end_time: string) => {
    if (!end_time) return "-";

    const diff = new Date(end_time).getTime() - Date.now();

    if (diff <= 0) return "00:00:00";

    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // ================= WARNING =================
  const isWarning = (end_time: string) => {
    if (!end_time) return false;

    const diff = new Date(end_time).getTime() - Date.now();
    return diff > 0 && diff <= 5 * 60 * 1000;
  };

  // ================= DURATION =================
  const formatDuration = (minutes: number) => {
    if (!minutes) return "0 jam";

    const h = Math.floor(minutes / 60);
    const m = minutes % 60;

    if (h > 0 && m > 0) return `${h} jam ${m} menit`;
    if (h > 0) return `${h} jam`;
    return `${m} menit`;
  };

  return {
    activeRooms,
    finishedTransactions,
    totalIncome,
    today,

    formatTimer,
    isWarning,
    formatDuration,
  };
}