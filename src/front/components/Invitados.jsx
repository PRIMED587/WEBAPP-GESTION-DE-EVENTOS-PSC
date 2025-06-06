import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";

const token = sessionStorage.getItem("token");
const userId = token ? parseJwt(token)?.sub : null;

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

  // Obtener datos del evento para saber si el usuario es creador
  const fetchEvento = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    const payload = parseJwt(token);
    const userId = payload?.sub;
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    try {
      const res = await fetch(`${backendUrl}/api/${userId}/eventos/${eventoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("No se pudo cargar el evento");
      const eventoData = await res.json();

      setEsCreador(eventoData.creador_id === userId);
    } catch (error) {
      console.error(error);
    }
  };

  // Obtener invitaciones pendientes
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

  // Enviar invitación
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

  const handleEliminarInvitacion = async (invitacionId) => {
    const token = sessionStorage.getItem("token");
    const payload = parseJwt(token);
    const userId = payload?.sub; // lo podés usar si necesitás, pero la ruta no lo usa
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const result = await Swal.fire({
      title: "¿Eliminar invitación?",
      text: "Esta acción no se puede deshacer.",
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
      const res = await fetch(
        `${backendUrl}/api/eventos/${eventoId}/invitaciones/${invitacionId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        Swal.fire({
          title: "Error",
          text: errorData.message || "No se pudo eliminar la invitación.",
          icon: "error",
          confirmButtonColor: "#FF2E63",
          background: "#1A1A1D",
          color: "#FFFFFF",
        });
        return;
      }

      Swal.fire({
        title: "Invitación eliminada",
        icon: "success",
        confirmButtonColor: "#FF2E63",
        background: "#1A1A1D",
        color: "#FFFFFF",
      });

      // Actualizar lista de invitados después de eliminar
      fetchInvitados();
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Error",
        text: "Error al eliminar invitación.",
        icon: "error",
        confirmButtonColor: "#FF2E63",
        background: "#1A1A1D",
        color: "#FFFFFF",
      });
    }
  };


  // Manejar envío de formulario
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
            {invitados.map((i) => {
              const token = sessionStorage.getItem("token");
              const userId = token ? parseJwt(token)?.sub : null;
              const esCreador = i.evento_info?.creador_id === parseInt(userId);

              return (
                <li
                  key={i.id}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  {i.email}
                  {i.estado === "pendiente" && esCreador && (
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleEliminarInvitacion(i.id)}
                      title="Eliminar invitación"
                    >
                      Eliminar
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

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

      {mensaje && (
        <div
          className={`mt-2 alert ${mensaje.tipo === "error" ? "alert-danger" : "alert-success"
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
