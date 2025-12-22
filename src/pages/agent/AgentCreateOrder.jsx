import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AgentCreateOrder = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to orders list page which has the create order functionality
    navigate("/agent/orders", { replace: true });
  }, [navigate]);

  return null;
};

export default AgentCreateOrder;

