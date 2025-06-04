import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import fiestaImg from "../assets/istockphoto-2155511077-612x612.jpg";
import parrilladaImg from "../assets/premium_photo-1666184130709-f3709060899a.avif";

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

      {invitaciones.length === 0 && <p>No tienes invitaciones pendientes.</p>}

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
                onClick={() => responderInvitacion(inv.id, "aceptado", inv.evento_id)}
              >
                ✔️ Aceptar invitación
              </button>
              <button
                className="btn-rechazar-invitacion"
                onClick={() => responderInvitacion(inv.id, "rechazado", inv.evento_id)}
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
