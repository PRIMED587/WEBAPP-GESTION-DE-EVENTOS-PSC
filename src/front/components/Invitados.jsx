import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

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

  const fetchInvitados = async () => {
    const token = sessionStorage.getItem("token");
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    if (!token) {
      console.error("No hay token en sessionStorage");
      setLoading(false);
      return;
    }

    const payload = parseJwt(token);
    const userId = payload?.sub;

    if (!userId) {
      console.error("Usuario no autenticado o token inválido");
      setLoading(false);
      return;
    }

    const url = `${backendUrl}/api/${userId}/eventos/${eventoId}/invitaciones`;

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
      setInvitados(data);
    } catch (error) {
      console.error("Error al obtener invitados:", error);
    } finally {
      setLoading(false);
    }
  };

  const enviarInvitacion = async (email) => {
    const token = sessionStorage.getItem("token");
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const payload = parseJwt(token);
    const userId = payload?.sub;

    const url = `${backendUrl}/api/${userId}/eventos/${eventoId}/invitaciones`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          emails: [email.trim().toLowerCase()],
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        setMensaje({ tipo: "error", texto: `Error enviando invitación: ${text}` });
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error enviando invitación:", error);
      setMensaje({ tipo: "error", texto: "Error enviando invitación." });
      return false;
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
      setMensaje({ tipo: "success", texto: "Invitación enviada correctamente." });
      setEmailInvitado("");
      await fetchInvitados();
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInvitados();
  }, [eventoId]);

  if (loading) return <div>Cargando invitados...</div>;

  return (
    <div className="box-seccion-evento d-flex flex-column" style={{ height: "500px" }}>
      <div className="card-header">
        <h4 className="mb-0 text-white">Invitados pendientes</h4>
      </div>

      {/* Lista con scroll independiente */}
      <div className="flex-grow-1 overflow-auto mt-2 mb-2">
        {invitados.length === 0 ? (
          <p className="text-white">No hay invitados pendientes.</p>
        ) : (
          <ul className="list-group mb-0">
            {invitados.map((i) => (
              <li key={i.id} className="list-group-item">
                {i.email}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Formulario fijo abajo en una sola línea */}
      <form onSubmit={handleSubmit} className="d-flex gap-2 mt-auto pt-2 border-top">
        <input
          type="email"
          id="emailInvitado"
          className="form-control"
          value={emailInvitado}
          onChange={(e) => setEmailInvitado(e.target.value)}
          placeholder="email@ejemplo.com"
          required
        />
        <button type="submit" className="create-event-btn ">
          Invitar
        </button>
      </form>

      {/* Mensaje de error o éxito */}
      {mensaje && (
        <div
          className={`mt-2 alert ${
            mensaje.tipo === "error" ? "alert-danger" : "alert-success"
          }`}
          role="alert"
        >
          {mensaje.texto}
        </div>
      )}
    </div>
  );
};

export default Invitados;
