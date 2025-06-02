import React, { useState } from "react";
import Swal from "sweetalert2";
import fiestaImg from "../assets/istockphoto-2155511077-612x612.jpg";
import parrilladaImg from "../assets/premium_photo-1666184130709-f3709060899a.avif";


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

    // Mensajes de alerta divertidos por tipo de respuesta (aceptar o rechazar)
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
  };

  return (
    <div
      style={{
        backgroundColor: "#1A1A1D",
        color: "#FFFFFF",
        minHeight: "100vh",
        padding: "3rem",
        position: "relative", // 🔑 importante para posicionar las imágenes
        overflow: "hidden", // evita que las imágenes sobresalgan
      }}
    >
      {/* 🎉 Imagenes decorativas */}
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


      {/* Título */}
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

      {/* Invitaciones */}
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
          <h2 style={{ fontSize: "2.2rem", marginBottom: "1.5rem", color: "#FF2E63" }}>
            🎉 {inv.evento}
          </h2>
          <p>
            📅 <strong>Fecha:</strong> {inv.fecha}
          </p>
          <p>
            📍 <strong>Lugar:</strong> {inv.lugar}
          </p>
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

          {/* Botones solo si está pendiente */}
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
