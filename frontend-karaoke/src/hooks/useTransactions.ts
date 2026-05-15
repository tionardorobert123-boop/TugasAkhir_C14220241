import API from "../services/api";
import { db } from '../lib/db'
import {useCloud} from '../context/CloudContext'
import { useLiveQuery }
from 'dexie-react-hooks'
import type {
  OfflineTransaction
} from '../lib/db'

export function useTransactions(selectedDate?: string) {

  const today = new Date().toISOString().split("T")[0];
  const filterDate = selectedDate || today;
  //check internet
  const {cloudOnline} = useCloud()
// ================= LIVE TRANSACTIONS
const transactions =
  useLiveQuery(

    async () => {

      // ================= CLOUD MODE
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

          // ================= UPDATE DEXIE
          await db.transactions.clear();

          await db.transactions.bulkPut(
            filtered
          );

          console.log(
            'TRANSACTIONS FROM CLOUD'
          );

          return filtered;

        } catch (err) {

          console.log(
            'TRANSACTION CLOUD FAILED',
            err
          );
        }
      }

      // ================= DEXIE OFFLINE
      const all =
        await db.transactions.toArray();

      const filteredOffline =

        all.filter((trx: any) => {

          const trxDate =
            trx.created_at?.slice(0, 10);

          return trxDate === filterDate;
        });

      console.log(
        'TRANSACTIONS FROM DEXIE'
      );

      return filteredOffline;

    },

    [
      filterDate,
      cloudOnline
    ],

    []
  ) || [];
// ================= SPLIT
const activeRooms =
  transactions.filter(

    (trx: OfflineTransaction) =>

      trx.status === 'active'
  );

// ================= FINISHED
const finishedTransactions =
  transactions.filter(

    (trx: OfflineTransaction) =>

      trx.status === 'finished'
  );

// ================= TOTAL
const totalIncome =
  finishedTransactions.reduce(

    (
      sum: number,

      trx: OfflineTransaction
    ) =>

      sum + Number(
        trx.total_price || 0
      ),

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

      return `${hours} Jam`;
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