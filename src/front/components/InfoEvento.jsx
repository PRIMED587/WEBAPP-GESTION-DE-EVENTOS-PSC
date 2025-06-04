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
    <section className="box-seccion-evento">
      <div className="card-header">
      <h4 className="mb-0 text-white">{nombre}</h4>
      </div>
      <p><strong>📅 Fecha y hora:</strong> {fechaFormateada}</p>
      {ubicacion && <p><strong>📍 Ubicación:</strong> {ubicacion}</p>}
      {vestimenta && <p><strong>👗 Vestimenta recomendada:</strong> {vestimenta}</p>}
      {descripcion && <p><strong>📝 Descripción:</strong> {descripcion}</p>}
    </section>
  );
};

export default InfoEvento;
