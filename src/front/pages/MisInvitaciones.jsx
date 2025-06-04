import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

const MisInvitaciones = () => {
  const token = sessionStorage.getItem("token");
  const userId = sessionStorage.getItem("userId");
  const email = JSON.parse(sessionStorage.getItem("user"))?.email || "";

  const [invitaciones, setInvitaciones] = useState([]);

  useEffect(() => {
    fetch(import.meta.env.VITE_BACKEND_URL + `/api/${userId}/invitaciones`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setInvitaciones(data))
      .catch(() => {
        Swal.fire({
          title: "Error",
          text: "No se pudieron cargar las invitaciones.",
          icon: "error",
          confirmButtonColor: "#FF2E63",
          background: "#1A1A1D",
          color: "#FFFFFF",
        });
      });
  }, [userId, token]);

  const responderInvitacion = async (id, respuesta, evento_id) => {
    if (respuesta === "rechazado") {
      const resultado = await Swal.fire({
        title: "¿Estás seguro?",
        text: "¿Querés rechazar esta invitación?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#FF2E63",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Sí, rechazar",
        cancelButtonText: "Cancelar",
        background: "#1A1A1D",
        color: "#FFFFFF",
      });

      if (!resultado.isConfirmed) return;
    }

    const endpoint =
      respuesta === "aceptado"
        ? `/api/eventos/${evento_id}/invitacion/aceptar`
        : `/api/eventos/${evento_id}/invitacion/rechazar`;

    try {
      const res = await fetch(import.meta.env.VITE_BACKEND_URL + endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error("Error en la respuesta del servidor");

      setInvitaciones((prev) => prev.filter((inv) => inv.id !== id));

      const mensajes = {
        aceptado: {
          title: "¡Genial! 🎉",
          text: "Nos alegra saber que vendrás. ¡Prepárate para divertirte!",
          icon: "success",
        },
        rechazado: {
          title: "¡Oh no! 😢",
          text: "Te vamos a extrañar, esperamos verte en el próximo evento.",
          icon: "info",
        },
      };

      const mensaje = mensajes[respuesta];

      Swal.fire({
        title: mensaje.title,
        text: mensaje.text,
        icon: mensaje.icon,
        confirmButtonColor: "#FF2E63",
        background: "#1A1A1D",
        color: "#FFFFFF",
      });
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "No se pudo procesar la invitación.",
        icon: "error",
        confirmButtonColor: "#FF2E63",
        background: "#1A1A1D",
        color: "#FFFFFF",
      });
    }
  };

  return (
    <div style={{ backgroundColor: "#1A1A1D", color: "#FFFFFF", minHeight: "100vh", padding: "2rem" }}>
      <h1 style={{ color: "#FF2E63", textAlign: "center", marginBottom: "2rem" }}>📨 Mis Invitaciones</h1>

      {invitaciones.map((inv) => (
        <div
          key={inv.id}
          style={{
            background: "linear-gradient(145deg, #1A1A1D, #2C2C2E)",
            border: "2px dashed #FF2E63",
            boxShadow: "0 0 10px rgba(255, 46, 99, 0.3)",
            borderRadius: "15px",
            padding: "2rem",
            margin: "0 auto 2rem auto",
            maxWidth: "600px",
            textAlign: "center",
            position: "relative",
          }}
        >
          <h2
            style={{ fontSize: "2.2rem", marginBottom: "1.5rem", color: "#FF2E63" }}
          >
            🎉 {inv.evento_info?.nombre || "Sin nombre"}
          </h2>
          <p>
            📅 <strong>Fecha:</strong>{" "}
            {inv.evento_info?.fecha
              ? new Date(inv.evento_info.fecha).toLocaleString()
              : "Sin fecha"}
          </p>
          <p>
            📍 <strong>Lugar:</strong> {inv.evento_info?.ubicacion || "Sin ubicación"}
          </p>
          <p>
            📌 <strong>Estado:</strong>{" "}
            <span style={{ color: inv.estado === "aceptado" ? "#00ffae" : inv.estado === "rechazado" ? "#ff6b6b" : "#FF2E63" }}>
              {inv.estado}
            </span>
          </p>

          {inv.estado === "pendiente" && (
            <div style={{ marginTop: "1.5rem" }}>
              <button
                onClick={() => responderInvitacion(inv.id, "aceptado")}
                style={{
                  backgroundColor: "#FF2E63",
                  color: "#FFFFFF",
                  border: "none",
                  padding: "0.7rem 1.5rem",
                  marginRight: "1rem",
                  borderRadius: "5px",
                  fontSize: "1rem",
                  cursor: "pointer",
                  transition: "transform 0.2s ease",
                }}
                onMouseOver={(e) => (e.target.style.transform = "scale(1.05)")}
                onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
              >
                ✅ Aceptar
              </button>
              <button
                onClick={() => responderInvitacion(inv.id, "rechazado")}
                style={{
                  backgroundColor: "transparent",
                  color: "#FF2E63",
                  border: "2px solid #FF2E63",
                  padding: "0.7rem 1.5rem",
                  borderRadius: "5px",
                  fontSize: "1rem",
                  cursor: "pointer",
                  transition: "transform 0.2s ease",
                }}
                onMouseOver={(e) => (e.target.style.transform = "scale(1.05)")}
                onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
              >
                ❌ Rechazar
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MisInvitaciones;