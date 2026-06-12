import { useEffect, useState } from "react";
import API from "../services/api";
import { db } from '../lib/db'
import {useCloud} from '../context/CloudContext'

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
    new Date()
    .toLocaleDateString(
      'sv-SE'
    )
  );
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [loading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Filter states
  const [roomSearch, setRoomSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 9;

     //check internet
    const {cloudOnline} = useCloud()
    const token =
  localStorage.getItem("token");

    // ================= FETCH ACCESS LOGS
      let isFetching = false;

const fetchLogs = async () => {

  if (isFetching) return;

  isFetching = true;

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

    if (filteredCache.length > 0) {

      setLogs(filteredCache);

      console.log(
        'LOGS CACHE LOADED'
      );
    }

    // ================= CLOUD FETCH
    if (cloudOnline) {

      try {

        const res = await API.get(
          `/access-logs?date=${selectedDate}`
        );

        const filtered = res.data || [];

        // UPDATE UI
        setLogs(filtered);

        await db.logs.bulkPut(filtered);

        console.log(
          '☁️ LOGS FROM CLOUD'
        );

        return;

      } catch (err) {

        console.log(
          'LOG CLOUD FAILED',
          err
        );
      }
    }

    // ================= OFFLINE DEXIE
    const offlineLogs =
      await db.logs.toArray();

    const filteredOffline =

      offlineLogs.filter(
        (log: any) => {

          const logDate =
            log.timestamp?.slice(0, 10);

          return (
            logDate === selectedDate
          );
        }
      );

    console.log(
      'LOGS FROM DEXIE'
    );

    setLogs(filteredOffline);

  } catch (err) {

    console.log(
      'FETCH LOG ERROR',
      err
    );

  } finally {

    isFetching = false;
  }
};

useEffect(() => {

  if (!token) return;

  fetchLogs();

}, [
  token,
  selectedDate,
  cloudOnline
]);

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

  const formatDuration = (
      minutes: number | string | null
    ) => {

      const value = Number(minutes);

      if (!value || value <= 0)
        return "-";

      const hours = Math.floor(value / 60);
      const mins = value % 60;

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