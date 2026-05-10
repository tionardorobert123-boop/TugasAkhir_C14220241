import { useEffect, useState } from "react";

export default function useOffline() {
  const [hasInternet, setHasInternet] = useState(true);

  useEffect(() => {
    const checkInternet = async () => {
      try {
        await fetch("https://clients3.google.com/generate_204", {
          mode: "no-cors",
        });

        setHasInternet(true);
      } catch {
        setHasInternet(false);
      }
    };

    checkInternet();

    const interval = setInterval(checkInternet, 5000);

    return () => clearInterval(interval);
  }, []);

  return hasInternet;
}