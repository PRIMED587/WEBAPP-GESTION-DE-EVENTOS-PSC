import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';
import EventoSingle from "../components/EventoSingle";

const Dashboard = () => {
  const navigate = useNavigate();
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = sessionStorage.getItem("token");
  const userId = sessionStorage.getItem("userId");
  const user = JSON.parse(sessionStorage.getItem("user"));

useEffect(() => {

    const fetchEventos = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/usuarios/${user.id}/eventos-participados`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) throw new Error("Error al obtener eventos");

        const data = await response.json();
        setEventos(data);
        console.log(data)
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventos();
  }, []);

  return (
    <div className="dashboard-container d-flex flex-column align-items-center text-white py-5 px-3 fade-in">
      <h1 className="mb-3 text-center slide-down">Mis Eventos</h1>

      <Button
        variant="danger"
        className="create-event-btn mb-5 fade-in-delay"
        onClick={() => navigate("/eventos/crear")}
      >
        Crear nuevo evento
      </Button>


      {loading ? (
        <p className="text-center">Cargando eventos...</p>
      ) : eventos.length === 0 ? (
        <p className="no-events-text text-center fade-in-delay">No tienes eventos aún...</p>
      ) : (
        <EventoSingle eventos={eventos} />
      )}
    </div>
  );
};

export default Dashboard;
