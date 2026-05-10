import { useEffect, useState } from "react";
import axios from "axios";

const statusLabels: Record<string, string> = {
  active: "aktif",
  standby: "standby",
  disabled: "tidak aktif",
  finished: "selesai",
  extend: "extend",
};

export interface AccessLog {
  room_id: number;
  room_name?: string;
  customer_name?: string;
  duration: number;
  room_status: string;
  timestamp: string;
}

export default function useAccessLog(initialDate?: string) {
  const [selectedDate, setSelectedDate] =
  useState(
    initialDate ??
    new Date().toISOString().split("T")[0]
  );
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Filter states
  const [roomSearch, setRoomSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 9;

  const cacheKey =
  `access_logs_cache_${selectedDate}`;

 const fetchLogs = async () => {

  const token = localStorage.getItem("token");
  if (!token) return;
  // ================= CACHE
  const cached = localStorage.getItem(cacheKey);
  // kalau ada cache -> tampilkan dulu
    if (cached) {
      const parsed = JSON.parse(cached);
      setLogs(parsed.logs || []);
    } else {
      // loading hanya jika belum ada cache
      setLoading(true);
    }
    try {
      const res = await axios.get(
        `http://localhost:8000/api/access-logs?date=${selectedDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = res.data || [];
      setLogs(data);
      // update cache
      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          logs: data
        })
      );
    } catch (err) {
      console.log(err);
      // hanya kosongkan jika memang tidak ada cache
      if (!cached) {
        setLogs([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchLogs();
    setRefreshing(false);
  };

  // Filter logs based on search criteria
  const filteredLogs = logs.filter((log) => {
    const roomMatch = (log.room_name ?? `Room ${log.room_id}`)
      .toLowerCase()
      .includes(roomSearch.toLowerCase());
    const customerMatch = (log.customer_name ?? "")
      .toLowerCase()
      .includes(customerSearch.toLowerCase());
    const statusMatch = statusFilter === "" || log.room_status === statusFilter;

    return roomMatch && customerMatch && statusMatch;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  useEffect(() => {
    const role = localStorage.getItem("role");
    const isOwner = role === "owner";
    if (!isOwner) return;
    fetchLogs();
  }, [selectedDate]);

  const formatDate = (value: string) => {
    if (!value) return "-";
    return new Date(value).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes || minutes <= 0) return "-";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) return `${hours}jam ${mins}menit`;
    if (hours > 0) return `${hours}jam`;
    return `${mins}menit`;
  };

  return {
    selectedDate,
    setSelectedDate,
    logs,
    loading,
    refreshing,
    roomSearch,
    setRoomSearch,
    customerSearch,
    setCustomerSearch,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    filteredLogs,
    paginatedLogs,
    totalPages,
    startIndex,
    endIndex,
    handleRefresh,
    handleFilterChange,
    formatDate,
    formatDuration,
    statusLabels,
  };
}