import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const Participantes = () => {
  const { eventoId } = useParams();
  const [participantes, setParticipantes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchParticipantes = async () => {
    const token = sessionStorage.getItem("token");
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    try {
      const response = await fetch(`${backendUrl}/api/eventos/${eventoId}/participantes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
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
    <div className="box-seccion-evento">
      <h4 className="mb-3">Participantes</h4>
      {participantes.length === 0 ? (
        <p>No hay participantes confirmados.</p>
      ) : (
        <ul className="list-group">
          {participantes.map((p) => (
            <li key={p.id} className="list-group-item">
              <strong>ID Usuario:</strong> {p.usuario_id}
              {p.es_creador && <span className="badge bg-primary ms-2">Creador</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Participantes;
