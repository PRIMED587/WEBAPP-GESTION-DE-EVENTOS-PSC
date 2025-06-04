import React, { useState } from "react";
import Swal from "sweetalert2";

const MisInvitaciones = () => {
  const [invitaciones, setInvitaciones] = useState([
    {
      id: 1,
      evento: "Fiesta de cumpleaños",
      fecha: "2025-06-15",
      lugar: "Casa de Juan",
      estado: "pendiente",
    },
  ]);

  const responderInvitacion = (id, respuesta) => {
    const nuevasInvitaciones = invitaciones.map((inv) => {
      if (inv.id === id && inv.estado !== respuesta) {
        return { ...inv, estado: respuesta };
      }
      return inv;
    });

    setInvitaciones(nuevasInvitaciones);

    Swal.fire({
      title: "¡Respuesta registrada!",
      text: `Has ${respuesta === "aceptado" ? "aceptado" : "rechazado"} la invitación.`,
      icon: "success",
      confirmButtonColor: "#FF2E63",
      background: "#1A1A1D",
      color: "#FFFFFF"
    });
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
          <h2 style={{ fontSize: "1.8rem", marginBottom: "1rem", color: "#FF2E63" }}>
            🎉 {inv.evento}
          </h2>
          <p style={{ fontSize: "1.1rem", margin: "0.5rem 0" }}>📅 <strong>Fecha:</strong> {inv.fecha}</p>
          <p style={{ fontSize: "1.1rem", margin: "0.5rem 0" }}>📍 <strong>Lugar:</strong> {inv.lugar}</p>
          <p style={{ fontSize: "1.1rem", margin: "0.5rem 0" }}>
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