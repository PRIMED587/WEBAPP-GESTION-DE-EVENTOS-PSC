import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import InfoEvento from "../components/InfoEvento";
import Participantes from "../components/Participantes";
import Tareas from "../components/Tareas";
import Gastos from "../components/Gastos";
import ExtraBox from "../components/ExtraBox";
import Invitados from "../components/Invitados";
import ClimaYMapa from "../components/ClimaYMapa";
import Swal from "sweetalert2";

const Evento = () => {
  const { eventoId } = useParams();
  const navigate = useNavigate();
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [refreshGastos, setRefreshGastos] = useState(0); // <-- nuevo estado

  const token = sessionStorage.getItem("token");
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const userId = sessionStorage.getItem("userId");
  const userStr = sessionStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const userEmail = user?.email || "";

  const fetchEvento = async () => {
    if (!token || !backendUrl || !eventoId) {
      setErrorMsg("Faltan datos necesarios");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/eventos/${eventoId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      data.es_creador = parseInt(userId, 10) === data.creador_id;

      setEvento(data);
      setErrorMsg(null);
    } catch (error) {
      console.error("Error al obtener el evento:", error);
      setErrorMsg(error.message || "Error en la conexión con el servidor");
      setEvento(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvento();
  }, [eventoId]);

  if (loading) return <p className="text-center mt-4">Cargando evento...</p>;
  if (errorMsg) return <p className="text-center mt-4 text-danger">{errorMsg}</p>;
  if (!evento) return <p className="text-center mt-4">Evento no encontrado.</p>;

  const handleEliminar = async () => {
    const result = await Swal.fire({
      title: "¿Eliminar evento?",
      text: "¡Esta acción no se puede deshacer!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#FF2E63",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      background: "#1A1A1D",
      color: "#FFFFFF",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(`${backendUrl}/api/${userId}/eventos/${eventoId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const data = await response.json();
        await Swal.fire({
          title: "Error",
          text: data.message || "Error desconocido",
          icon: "error",
          confirmButtonColor: "#FF2E63",
          background: "#1A1A1D",
          color: "#FFFFFF",
        });
        return;
      }

      await Swal.fire({
        title: "¡Evento eliminado!",
        text: "El evento ha sido eliminado correctamente.",
        icon: "success",
        confirmButtonColor: "#FF2E63",
        background: "#1A1A1D",
        color: "#FFFFFF",
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Error al eliminar evento:", error);
      await Swal.fire({
        title: "Error",
        text: "Error de red o servidor al eliminar el evento.",
        icon: "error",
        confirmButtonColor: "#FF2E63",
        background: "#1A1A1D",
        color: "#FFFFFF",
      });
    }
  };

  return (
    <div className="container evento-container my-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0 text-center flex-grow-1">{evento.nombre}</h2>
        {evento.es_creador && (
          <>
            <button
              className="btn btn-warning ms-3"
              onClick={() => navigate(`/eventos/editar/${eventoId}`)}
            >
              Editar evento
            </button>

            <button
              className="btn btn-danger ms-3"
              onClick={handleEliminar}
            >
              Eliminar evento
            </button>
          </>
        )}
      </div>


      <div className="container">
        <div className="row gx-4 gy-4">
          {/* Fila 1: InfoEvento + Participantes */}
          <div className="col-lg-8 col-12">
            <InfoEvento evento={evento} />
          </div>
          <div className="col-lg-4 col-12">
            <Participantes
              eventoId={eventoId}
              token={token}
              backendUrl={backendUrl}
              userId={userId}
            />
          </div>

          {/* Fila 2: Invitados + Tareas + Gastos */}
          <div className="col-lg-4 col-12 mb-1 h-100">
            <Invitados
              eventoId={eventoId}
              token={token}
              backendUrl={backendUrl}
              userId={userId}
            />
          </div>

          <div className="col-lg-4 col-12 mb-1 h-100">
            <Tareas
              eventoId={eventoId}
              token={token}
              backendUrl={backendUrl}
              userId={userId}
              tareas={evento.tareas_activas}
              userEmail={userEmail}
              creadorId={evento.creador_id}
              onGastoGuardado={() => setRefreshGastos(prev => prev + 1)}
            />
          </div>

          <div className="col-lg-4 col-12 mb-1 h-100">
            <Gastos
              eventoId={parseInt(eventoId, 10)}
              token={token}
              backendUrl={backendUrl}
              userId={userId}
              refresh={refreshGastos}
            />
          </div>


          {/* Fila 3: ExtraBox + ClimaYMapa */}
          <div className="row mt-4 " style={{ flex: "0 0 auto", minHeight: "250px" }}>
            <div className="col-12 col-md-6 d-flex">
              <div className="w-100">
                <ExtraBox evento={evento} />
              </div>
            </div>

            <div className="col-12 col-md-6 d-flex">
              <div className="w-100">
                <ClimaYMapa
                  direccion={evento.direccion}
                  fecha={evento.fecha}
                  latitud={evento.latitud}
                  longitud={evento.longitud}
                />
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Evento;
