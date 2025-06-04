// RutaProtegida.jsx
import { Navigate } from "react-router-dom";

// Este componente evalúa si hay un token en sessionStorage.
// Si lo hay, permite el acceso al componente hijo.
// Si no, redirige al login.
const RutaProtegida = ({ children }) => {
  const token = sessionStorage.getItem("token");
  return token ? children : <Navigate to="/loginform" />;
};

export default RutaProtegida;
