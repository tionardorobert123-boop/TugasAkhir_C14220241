import { useEffect, useState }
from 'react'

import {
  syncRoomActions
}
from '../lib/sync/syncRoomActions'

import {
  isCloudOnline
}
from '../utils/network'

export default function useOffline() {

  const [hasInternet,
    setHasInternet] =
      useState(false)

  useEffect(() => {

    let interval: any;

    // ================= CHECK CLOUD
    const checkConnection =
      async () => {

      const online =
        await isCloudOnline();

      setHasInternet(online);

      if (online) {

        console.log(
          '☁️ INTERNET ONLINE'
        );

        // AUTO SYNC
        await syncRoomActions();

      } else {

        console.log(
          '📴 OFFLINE MODE'
        );
      }
    };

    // ================= FIRST CHECK
    checkConnection();

    // ================= AUTO CHECK
    interval = setInterval(() => {

      checkConnection();

    }, 5000);

    return () => {

      clearInterval(interval);
    };

  }, []);

  return hasInternet;
}