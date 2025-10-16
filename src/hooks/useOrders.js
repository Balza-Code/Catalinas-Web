import { useEffect, useState } from "react";
import { getOrders } from "../services/orderService";

const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await getOrders();
        setOrders(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, []);
  return { orders, setOrders, loading };
};

export default useOrders;
