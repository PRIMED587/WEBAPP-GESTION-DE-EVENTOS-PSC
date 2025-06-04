import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import InfoEvento from "../components/InfoEvento";
import Participantes from "../components/Participantes";
import Tareas from "../components/Tareas";
import Gastos from "../components/Gastos";
import ExtraBox from "../components/ExtraBox";
import Invitados from "../components/Invitados";
import ClimaYMapa from "../components/ClimaYMapa";

const Evento = () => {
  const { eventoId } = useParams();
  const navigate = useNavigate();
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchEvento = async () => {
    const token = sessionStorage.getItem("token");
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const userId = sessionStorage.getItem("userId");

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
      data.es_creador = parseInt(userId) === data.creador_id;

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

  return (
    <div className="container evento-container my-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0 text-center flex-grow-1">{evento.nombre}</h2>
        {evento.es_creador && (
          <button
            className="btn btn-warning ms-3"
            onClick={() => navigate(`/eventos/editar/${eventoId}`)}
          >
            Editar evento
          </button>
        )}
      </div>

      {/* InfoEvento ocupa todo el ancho */}
      <div className="col-lg-12">
        <InfoEvento evento={evento} />
      </div>

      {/* Contenedor para las 4 boxes centrales */}
      <div className="row gx-4 gy-4">
        {/* Invitados */}
        <div className="col-lg-6 col-12 caja-central">
          <Invitados eventoId={eventoId} />
        </div>

        {/* Participantes */}
        <div className="col-lg-6 col-12 caja-central">
          <Participantes eventoId={eventoId} />
        </div>
        
        {/* Tareas */}
        <div className="col-lg-6 col-12 caja-central">
          <ExtraBox evento={evento} />
        </div>

        {/* Gastos */}
        <div className="col-lg-6 col-12 caja-central">
          <Gastos eventoId={parseInt(eventoId, 10)} />
        </div>

        {/* Tareas */}
        <div className="col-lg-6 col-12 caja-central">
          <Tareas eventoId={eventoId} />
        </div>

        {/* Ubicación y Clima */}
        <div className="col-lg-6 col-12 caja-central">
          <ClimaYMapa
            direccion={evento.direccion}
            fecha={evento.fecha}
            latitud={evento.latitud}
            longitud={evento.longitud}
          />
        </div>
      </div>
    </div>
  );
};

export default Evento;
