import React from "react";

const InfoEvento = ({ evento }) => {
  if (!evento) return null;

  const {
    nombre,
    fecha,
    ubicacion,
    vestimenta,
    descripcion
  } = evento;

  const fechaFormateada = new Date(fecha).toLocaleString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <section className="info-evento p-4 border rounded shadow-sm bg-light">
      <h4 className="mb-3">{nombre}</h4>
      <p><strong>📅 Fecha y hora:</strong> {fechaFormateada}</p>
      {ubicacion && <p><strong>📍 Ubicación:</strong> {ubicacion}</p>}
      {vestimenta && <p><strong>👗 Vestimenta recomendada:</strong> {vestimenta}</p>}
      {descripcion && <p><strong>📝 Descripción:</strong> {descripcion}</p>}
    </section>
  );
};

export default InfoEvento;
