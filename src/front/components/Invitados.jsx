import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const Invitados = () => {
  const { eventoId } = useParams();
  const [invitados, setInvitados] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInvitados = async () => {
    const token = sessionStorage.getItem("token");
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    try {
      const response = await fetch(`${backendUrl}/api/eventos/${eventoId}/invitaciones`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setInvitados(data);
    } catch (error) {
      console.error("Error al obtener invitados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitados();
  }, [eventoId]);

  if (loading) return <div>Cargando invitados...</div>;

  return (
    <div className="box-seccion-evento">
      <div className="card-header">
      <h4 className="mb-0 text-white">Invitados pendientes</h4>
      </div>
      {invitados.length === 0 ? (
        <p>No hay invitados pendientes.</p>
      ) : (
        <ul className="list-group">
          {invitados.map((i) => (
            <li key={i.id} className="list-group-item">
              <strong>Correo:</strong> {i.email}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Invitados;
