import React from "react";

const InfoEvento = ({ nombre, fecha, ubicacion, vestimenta, descripcion }) => {
  return (
    <section className="info-evento p-3 border rounded shadow-sm bg-light">
      <h2 className="mb-3">{nombre}</h2>
      <p><strong>Fecha y hora:</strong> {new Date(fecha).toLocaleString()}</p>
      <p><strong>Ubicación:</strong> {ubicacion}</p>
      <p><strong>Vestimenta:</strong> {vestimenta}</p>
      <p>{descripcion}</p>
    </section>
  );
};

export default InfoEvento;
