import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (e) {
    return null;
  }
}

const Invitados = () => {
  const { eventoId } = useParams();
  const [invitados, setInvitados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emailInvitado, setEmailInvitado] = useState("");
  const [mensaje, setMensaje] = useState(null);
  const [esCreador, setEsCreador] = useState(false);

  const token = sessionStorage.getItem("token");
  const payload = parseJwt(token);
  const userId = payload?.sub;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const fetchEvento = async () => {
    if (!token) return;

    try {
      const res = await fetch(`${backendUrl}/api/eventos/${eventoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("No se pudo cargar el evento");

      const eventoData = await res.json();
      setEsCreador(parseInt(userId) === eventoData.creador_id);
    } catch (error) {
      console.error("Error al cargar el evento:", error);
    }
  };

  const fetchInvitados = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/${userId}/eventos/${eventoId}/invitaciones`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Error al obtener invitados");

      const data = await res.json();
      setInvitados(data);
    } catch (error) {
      console.error("Error al obtener invitados:", error);
    } finally {
      setLoading(false);
    }
  };

  const enviarInvitacion = async (email) => {
    try {
      const res = await fetch(`${backendUrl}/api/${userId}/eventos/${eventoId}/invitaciones`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ emails: [email.trim().toLowerCase()] }),
      });

      if (!res.ok) {
        const text = await res.text();
        setMensaje({ tipo: "error", texto: `Error enviando invitación: ${text}` });
        return false;
      }

      return true;
    } catch (error) {
      setMensaje({ tipo: "error", texto: "Error enviando invitación." });
      return false;
    }
  };

  const handleEliminarInvitacion = async (invitacionId) => {
    const result = await Swal.fire({
      title: "¿Eliminar invitación?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      background: "#1A1A1D",
      color: "#FFFFFF",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(
        `${backendUrl}/api/eventos/${eventoId}/invitaciones/${invitacionId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Error al eliminar la invitación");

      fetchInvitados();
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "No se pudo eliminar la invitación.",
        icon: "error",
        background: "#1A1A1D",
        color: "#FFFFFF",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);

    if (!emailInvitado) {
      setMensaje({ tipo: "error", texto: "Por favor ingresa un email." });
      return;
    }

    setLoading(true);
    const exito = await enviarInvitacion(emailInvitado);
    if (exito) {
      setEmailInvitado("");
      await fetchInvitados();
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEvento();
    fetchInvitados();
  }, [eventoId]);

  if (loading) return <div>Cargando invitados...</div>;

  return (
    <div className="box-seccion-evento d-flex flex-column" style={{ height: "500px" }}>
      <div className="card-header">
        <h4 className="mb-0 text-white">Invitados pendientes</h4>
      </div>

      <div className="flex-grow-1 overflow-auto mt-2 mb-2">
        {invitados.length === 0 ? (
          <p className="text-white">No hay invitados pendientes.</p>
        ) : (
          <ul className="list-group mb-0">
            {invitados.map((i) => (
              <li
                key={i.id}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                {i.email}
                {esCreador && (
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleEliminarInvitacion(i.id)}
                  >
                    Eliminar
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {esCreador && (
        <form onSubmit={handleSubmit} className="d-flex gap-2 mt-auto pt-2 border-top">
          <input
            type="email"
            className="form-control"
            placeholder="email@ejemplo.com"
            value={emailInvitado}
            onChange={(e) => setEmailInvitado(e.target.value)}
            required
          />
          <button type="submit" className="create-event-btn">
            Invitar
          </button>
        </form>
      )}

      {mensaje && (
        <div
          className={`mt-2 alert ${mensaje.tipo === "error" ? "alert-danger" : "alert-success"}`}
        >
          {mensaje.texto}
        </div>
      )}
    </div>
  );
};

export default Invitados;
