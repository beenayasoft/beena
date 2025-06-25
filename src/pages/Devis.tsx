import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Devis() {
  const navigate = useNavigate();
  
  // 🔄 REDIRECTION TEMPORAIRE vers DevisNew qui fonctionne avec la pagination
  useEffect(() => {
    navigate("/devis-new", { replace: true });
  }, [navigate]);

  return null;
}