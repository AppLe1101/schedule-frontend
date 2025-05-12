import { useEffect } from "react";
import axios from "axios";

export function useCheckUpdates({ url, interval = 600000, token, onData }) {
  useEffect(() => {
    if (!url) return;

    const fetchData = async () => {
      try {
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        onData(res.data);
      } catch (err) {
        console.error(`Ошибка при автообновлении ${url}:`, err);
      }
    };

    fetchData();

    const timer = setInterval(fetchData, interval);

    return () => clearInterval(timer);
  }, [url, interval, token, onData]);
}
