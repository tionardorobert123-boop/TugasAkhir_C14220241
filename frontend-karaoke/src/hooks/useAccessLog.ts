import { useEffect, useState } from "react";
import API from "../services/api";
import { db } from "../lib/db";
import { useCloud } from "../context/CloudContext";

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

export default function useAccessLog(
  initialDate?: string
) {

  const [selectedDate, setSelectedDate] =
    useState(
      initialDate ??
      new Date()
        .toISOString()
        .split("T")[0]
    );

  const [logs, setLogs] =
    useState<AccessLog[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [refreshing, setRefreshing] =
    useState(false);

  // ================= FILTER
  const [roomSearch, setRoomSearch] =
    useState("");

  const [
    customerSearch,
    setCustomerSearch
  ] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("");

  const [currentPage, setCurrentPage] =
    useState(1);

  const itemsPerPage = 9;

  // ================= CLOUD
  const { cloudOnline } = useCloud();

  // ================= FETCH LOGS
  const fetchLogs = async () => {

    setLoading(true);

    try {

      // ================= LOAD CACHE FIRST
      const cachedLogs =
        await db.logs.toArray();

      const filteredCache =
        cachedLogs.filter(
          (log: any) => {

            const logDate =
              log.timestamp?.slice(0, 10);

            return (
              logDate === selectedDate
            );
          }
        );

      // ================= SHOW CACHE FAST
      if (filteredCache.length > 0) {

        setLogs(filteredCache);

        console.log(
          "📦 LOGS CACHE LOADED"
        );
      }

      // ================= CLOUD FETCH
      if (cloudOnline) {

        try {

          const res = await API.get(
            `/access-logs?date=${selectedDate}`
          );

          const data =
            res.data || [];

          const filtered =
            data.filter(
              (log: any) => {

                const logDate =
                  log.timestamp?.slice(0, 10);

                return (
                  logDate === selectedDate
                );
              }
            );

          // ================= UPDATE UI
          setLogs(filtered);

          // ================= UPDATE CACHE
          await db.logs.bulkPut(
            filtered
          );

          console.log(
            "☁️ LOGS FROM CLOUD"
          );

        } catch (err) {

          console.log(
            "LOG CLOUD FAILED",
            err
          );
        }
      }

    } catch (err) {

      console.log(
        "FETCH LOG ERROR",
        err
      );

    } finally {

      setLoading(false);
    }
  };

  // ================= AUTO LOAD
  useEffect(() => {

    const role =
      localStorage.getItem("role");

    const isOwner =
      role === "owner";

    if (!isOwner) return;

    fetchLogs();

  }, [
    selectedDate,
    cloudOnline
  ]);

  // ================= REFRESH
  const handleRefresh = async () => {

    setRefreshing(true);

    await fetchLogs();

    setRefreshing(false);
  };

  // ================= FILTER LOGS
  const filteredLogs = logs.filter(
    (log) => {

      const roomMatch =
        (
          log.room_name ??
          `Room ${log.room_id}`
        )
          .toLowerCase()
          .includes(
            roomSearch.toLowerCase()
          );

      const customerMatch =
        (
          log.customer_name ?? ""
        )
          .toLowerCase()
          .includes(
            customerSearch.toLowerCase()
          );

      const statusMatch =
        statusFilter === "" ||
        log.room_status === statusFilter;

      return (
        roomMatch &&
        customerMatch &&
        statusMatch
      );
    }
  );

  // ================= PAGINATION
  const totalPages = Math.ceil(
    filteredLogs.length /
    itemsPerPage
  );

  const startIndex =
    (currentPage - 1) *
    itemsPerPage;

  const endIndex =
    startIndex + itemsPerPage;

  const paginatedLogs =
    filteredLogs.slice(
      startIndex,
      endIndex
    );

  // ================= RESET PAGE
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  // ================= FORMAT DATE
  const formatDate = (
    value: string
  ) => {

    if (!value) return "-";

    return new Date(value)
      .toLocaleTimeString(
        "en-GB",
        {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }
      );
  };

  // ================= FORMAT DURATION
  const formatDuration = (
    minutes: number | null
  ) => {

    if (!minutes || minutes <= 0)
      return "-";

    const hours =
      Math.floor(minutes / 60);

    const mins =
      minutes % 60;

    if (hours > 0 && mins > 0)
      return `${hours}jam ${mins}menit`;

    if (hours > 0)
      return `${hours}jam`;

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