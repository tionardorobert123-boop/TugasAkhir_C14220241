import { useEffect, useState } from "react";
import API from "../services/api";
import { db } from '../lib/db'
import {useCloud} from '../context/CloudContext'

export function useTransactions(selectedDate?: string) {
  const [transactions, setTransactions] = useState<any[]>([]);

  const token = localStorage.getItem("token");

  const today = new Date().toISOString().split("T")[0];
  const filterDate = selectedDate || today;
  //check internet
  const {cloudOnline} = useCloud()

// ================= LOAD TRANSACTIONS
    useEffect(() => {

      if (!token) return;

      let isFetching = false;

      const fetchTransactions = async () => {

        // ================= PREVENT OVERLAP
        if (isFetching) return;

        isFetching = true;

        try {

          // ================= LOAD CACHE FIRST
          const cachedTransactions =

            await db.transactions.toArray();

          const filteredCache =

            cachedTransactions.filter(
              (trx: any) => {

                const trxDate =
                  trx.created_at?.slice(0, 10);

                return trxDate === filterDate;
              }
            );

          if (filteredCache.length > 0) {

            setTransactions(
              filteredCache
            );

            console.log(
              'TRANSACTIONS CACHE LOADED'
            );
          }

          // ================= CLOUD FETCH
          if (cloudOnline) {

            try {

              const res = await API.get(

                `/transactions/by-date?date=${filterDate}`
              );

              const filtered =

                (res.data || []).filter(
                  (trx: any) => {

                    const trxDate =
                      trx.created_at?.slice(0, 10);

                    return trxDate === filterDate;
                  }
                );

              // ================= UPDATE UI
              setTransactions(
                filtered
              );

              // ================= UPDATE DEXIE
              await db.transactions.bulkPut(
                filtered
              );

              console.log(
                'TRANSACTIONS FROM CLOUD'
              );

              return;

            } catch (err) {

              console.log(
                'TRANSACTION CLOUD FAILED',
                err
              );
            }
          }

          // ================= OFFLINE DEXIE
          const offlineTransactions =

            await db.transactions.toArray();

          const filteredOffline =

            offlineTransactions.filter(
              (trx: any) => {

                const trxDate =
                  trx.created_at?.slice(0, 10);

                return trxDate === filterDate;
              }
            );

          console.log(
            'TRANSACTIONS FROM DEXIE'
          );

          setTransactions(
            filteredOffline
          );

        } catch (err) {

          console.log(
            'FETCH TRANSACTION ERROR',
            err
          );

        } finally {

          isFetching = false;
        }
      };

      // ================= INITIAL LOAD
      fetchTransactions();

    }, [
      token,
      filterDate,
      cloudOnline
    ]);

  // ================= SPLIT =================
  const activeRooms = transactions.filter(trx => trx.status === "active");

  const finishedTransactions = transactions.filter(
    trx => trx.status === "finished"
  );
// ================= SORT DESC
const sortedFinishedTransactions =

  [...finishedTransactions].sort(
    (a: any, b: any) => {

      const dateA =
        new Date(
          a.created_at ||
          a.start_time
        ).getTime();

      const dateB =
        new Date(
          b.created_at ||
          b.start_time
        ).getTime();

      return dateB - dateA;
    }
  );

// ================= TOTAL
const totalIncome =

  sortedFinishedTransactions.reduce(
    (sum, trx) =>

      sum + Number(trx.total_price),

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

  const isWarning = (end_time: string) => {
    if (!end_time) return false;

    const diff = new Date(end_time).getTime() - Date.now();
    return diff > 0 && diff <= 5 * 60 * 1000;
  };

  const formatDuration = (
    hours: number
  ) => {

    if (!hours)
      return '0 jam';

    return `${hours} jam`;
  };

  return {
    activeRooms,
    sortedFinishedTransactions,
    totalIncome,
    today,

    formatTimer,
    isWarning,
    formatDuration,
  };
}