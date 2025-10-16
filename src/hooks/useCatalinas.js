import { useEffect, useState } from "react";
import { getCatalinas } from "../services/catalinaService";

export function useCatalinas() {
  const [catalinas, setCatalinas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCatalinas = async () => {
      try {
        const data = await getCatalinas();
        setCatalinas(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadCatalinas();
  },[]);

  return { catalinas, setCatalinas, loading }
}
