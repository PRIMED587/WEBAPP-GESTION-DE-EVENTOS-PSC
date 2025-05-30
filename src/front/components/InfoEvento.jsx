
import React from "react";

const InfoEvento = ({ participants }) => (
  <div className="info-box box-style">
    <h4>Información del Evento</h4>
    <p><strong>Nombre:</strong> Fiesta en la terraza</p>
    <p><strong>Fecha:</strong> 30/06/2025</p>
    <p><strong>Lugar:</strong> Rancagua</p>
    <p><strong>Participantes:</strong> {participants.length}</p>
    <div className="descripcion-box">
      <p>Esta será una reunión para celebrar el final del bootcamp con asado y buena música.</p>
    </div>
  </div>
);

export default InfoEvento;
