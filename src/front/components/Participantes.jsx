import React, { useEffect, useState } from "react";

const Participantes = ({ eventoId, token, backendUrl, userId }) => {
  const [participantes, setParticipantes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchParticipantes = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(`${backendUrl}/api/${eventoId}/participantes`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        setLoading(false);
        return;
      }

      const data = await response.json();
      setParticipantes(data);
    } catch {
      setParticipantes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipantes();
  }, [eventoId]);

  if (loading) return <div>Cargando participantes...</div>;

  return (
    <div className="box-seccion-evento d-flex flex-column" style={{ height: "400px" }}>
      <div className="card-header">
        <h4 className="mb-0 text-white">Participantes</h4>
      </div>

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
