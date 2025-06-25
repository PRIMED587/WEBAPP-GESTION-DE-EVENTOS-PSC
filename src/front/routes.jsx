import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";

import { Layout } from "./pages/Layout";
import Home from "./pages/Home";
import { Single } from "./pages/Single";
import { Demo } from "./pages/Demo";
import Dashboard from "./pages/Dashboard";
import Registro from "./pages/Registro";
import FormularioEvento from "./pages/FormularioEvento";
import Evento from "./pages/Evento";
import AboutUs from "./pages/AboutUs";
import MisInvitaciones from "./pages/MisInvitaciones";
import Loginform from "./pages/Loginform";
import ResetPassword from "./components/ResetPassword";

// IMPORTA la ruta protegida
import RutaProtegida from "./components/RutaProtegida";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>}>
      {/* Página principal */}
      <Route path="/" element={<Home />} />

      {/* Otras rutas */}
      <Route path="/single/:theId" element={<Single />} />
      <Route path="/demo" element={<Demo />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/formulario-evento" element={<FormularioEvento />} />
      <Route path="/eventos/crear" element={<FormularioEvento />} />
      <Route path="/eventos/editar/:id" element={<FormularioEvento />} />
      <Route path="/loginform" element={<Loginform />} />
      <Route path="/aboutus" element={<AboutUs />} />
      <Route path="/evento" element={<Evento />} />
      <Route path="/evento/:eventoId" element={<Evento />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protegido: Solo logueados pueden ver Dashboard */}
      <Route
        path="/dashboard"
        element={
          <RutaProtegida>
            <Dashboard />
          </RutaProtegida>
        }
      />
      <Route
        path="/dashboard/:id"
        element={
          <RutaProtegida>
            <Dashboard />
          </RutaProtegida>
        }
      />

      {/* Protegido: Solo logueados pueden ver Mis Invitaciones */}
      <Route
        path="/mis-invitaciones"
        element={
          <RutaProtegida>
            <MisInvitaciones />
          </RutaProtegida>
        }
      />
    </Route>
  )
);
