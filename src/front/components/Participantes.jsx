import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (e) {
    return null;
  }
}

const Participantes = () => {
  const { eventoId } = useParams();
  const [participantes, setParticipantes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchParticipantes = async () => {
    const token = sessionStorage.getItem("token");
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    if (!token) {
      console.error("No hay token en sessionStorage");
      setLoading(false);
      return;
    }

    const url = `${backendUrl}/api/${eventoId}/participantes`;

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const text = await response.text();
        console.error(`Error en respuesta: ${response.status}`, text);
        setLoading(false);
        return;
      }

      const data = await response.json();
      setParticipantes(data);
    } catch (error) {
      console.error("Error al obtener participantes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipantes();
  }, [eventoId]);

  if (loading) return <div>Cargando participantes...</div>;

  return (
    <div className="box-seccion-evento d-flex flex-column" style={{ height: "100%" }}>
      <div className="card-header">
        <h4 className="mb-0 text-white">Participantes</h4>
      </div>

      {/* Contenedor scroll solo para la lista */}
      <div className="lista-scroll flex-grow-1 mt-2">
        {participantes.length === 0 ? (
          <p>No hay participantes confirmados.</p>
        ) : (
          <ul className="list-group mb-0">
            {participantes.map((p) => (
              <li key={p.id} className="list-group-item">
                {p.email}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Participantes;
