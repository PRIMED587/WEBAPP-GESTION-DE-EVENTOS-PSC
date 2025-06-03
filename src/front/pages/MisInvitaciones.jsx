// Importaciones necesarias
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import fiestaImg from "../assets/istockphoto-2155511077-612x612.jpg";
import parrilladaImg from "../assets/premium_photo-1666184130709-f3709060899a.avif";

const MisInvitaciones = () => {
  const [invitaciones, setInvitaciones] = useState([]); // Estado para almacenar invitaciones

  useEffect(() => {
    // Obtener token e ID de usuario desde localStorage
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("user_id");

    if (!token || !userId) {
      console.error("Falta token o user_id en localStorage");
      return;
    }

    // Petición al backend para obtener invitaciones del usuario
    fetch(`http://localhost:5000/api/${userId}/invitaciones`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al obtener invitaciones");
        return res.json();
      })
      .then((data) => {
        // Formatea las invitaciones para mostrarlas
        const invitacionesFormateadas = data.map((inv) => ({
          id: inv.id,
          evento: inv.evento.titulo,
          fecha: inv.evento.fecha,
          lugar: inv.evento.lugar,
          estado: inv.estado,
        }));
        setInvitaciones(invitacionesFormateadas);
      })
      .catch((error) => {
        console.error("Error al obtener las invitaciones:", error);
      });
  }, []);

  // Función para aceptar o rechazar una invitación
  const responderInvitacion = (id, respuesta) => {
    // Actualiza el estado local de la invitación
    const nuevasInvitaciones = invitaciones.map((inv) => {
      if (inv.id === id && inv.estado !== respuesta) {
        return { ...inv, estado: respuesta };
      }
      return inv;
    });

    setInvitaciones(nuevasInvitaciones);

    // Mensajes personalizados para cada respuesta
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

    // Muestra alerta con SweetAlert
    const mensaje = mensajes[respuesta];
    Swal.fire({
      title: mensaje.title,
      text: mensaje.text,
      icon: mensaje.icon,
      confirmButtonColor: "#FF2E63",
      background: "#1A1A1D",
      color: "#FFFFFF",
    });
  };

  return (
    <div
      style={{
        backgroundColor: "#1A1A1D",
        color: "#FFFFFF",
        minHeight: "100vh",
        padding: "3rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Imágenes decorativas */}
      <img
        src={fiestaImg}
        alt="decoracion fiesta"
        className="decoracion-img"
        style={{ top: "30px", left: "10px" }}
      />
      <img
        src={parrilladaImg}
        alt="decoracion parrillada"
        className="decoracion-img2"
        style={{ bottom: "40px", right: "15px" }}
      />

      {/* Título principal */}
      <h1
        style={{
          color: "#FF2E63",
          textAlign: "center",
          marginBottom: "3rem",
          fontSize: "2.5rem",
        }}
      >
        📨 Tienes una invitación
      </h1>

      {/* Muestra cada invitación */}
      {invitaciones.map((inv) => (
        <div
          key={inv.id}
          style={{
            background: "linear-gradient(145deg, #1A1A1D, #2C2C2E)",
            border: "3px dashed #FF2E63",
            boxShadow: "0 0 20px rgba(255, 46, 99, 0.4)",
            borderRadius: "20px",
            padding: "3rem",
            margin: "0 auto 3rem auto",
            maxWidth: "800px",
            textAlign: "center",
            fontSize: "1.3rem",
            zIndex: 1,
            position: "relative",
          }}
        >
          {/* Detalles del evento */}
          <h2 style={{ fontSize: "2.2rem", marginBottom: "1.5rem", color: "#FF2E63" }}>
            🎉 {inv.evento}
          </h2>
          <p>📅 <strong>Fecha:</strong> {inv.fecha}</p>
          <p>📍 <strong>Lugar:</strong> {inv.lugar}</p>
          <p>
            📌 <strong>Estado:</strong>{" "}
            <span
              style={{
                color:
                  inv.estado === "aceptado"
                    ? "#00ffae"
                    : inv.estado === "rechazado"
                    ? "#ff6b6b"
                    : "#FF2E63",
              }}
            >
              {inv.estado}
            </span>
          </p>

          {/* Botones solo si la invitación está pendiente */}
          {inv.estado === "pendiente" && (
            <div
              style={{
                marginTop: "2rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              <button
                className="btn-rechazar-invitacion"
                onClick={() => responderInvitacion(inv.id, "aceptado")}
              >
                ✔️ Aceptar invitación
              </button>
              <button
                className="btn-rechazar-invitacion"
                onClick={() => responderInvitacion(inv.id, "rechazado")}
              >
                ❌ Rechazar invitación
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MisInvitaciones;
