import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const Participantes = () => {
  const { eventoId } = useParams();
  const [participantes, setParticipantes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchParticipantes = async () => {
    try {
      const response = await fetch(`${process.env.BACKEND_URL}/api/eventos/${eventoId}/participantes`);
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
  }, []);

  if (loading) return <div>Cargando participantes...</div>;

  return (
    <div className="box-seccion-evento">
      <h4 className="mb-3">Participantes</h4>
      <ul className="list-group">
        {participantes.map((p) => (
          <li key={p.id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <strong>ID Usuario:</strong> {p.usuario_id}
              {p.aceptado && <span className="badge bg-success ms-2">Aceptado</span>}
              {!p.aceptado && <span className="badge bg-secondary ms-2">Pendiente</span>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Participantes;
