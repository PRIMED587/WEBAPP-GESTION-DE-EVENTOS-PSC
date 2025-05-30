import React, { useState } from "react";

const Participantes = ({ participants, setParticipants }) => {
  const [newParticipant, setNewParticipant] = useState("");

  const handleAddParticipant = () => {
    if (newParticipant.trim() === "") return;
    setParticipants([...participants, { name: newParticipant, isOrganizer: false }]);
    setNewParticipant("");
  };

  const removeParticipant = (index) => {
    setParticipants(participants.filter((_, i) => i !== index));
  };

  return (
    <div className="participantes-box box-style">
      <h4>Mis Invitados</h4>
      <ul className="lista-participantes">
        {participants.map((p, i) => (
          <li key={i}>
            <div className="participant-info">
              {p.name}
              {p.isOrganizer && <span className="organizador-label">Organizador 👑</span>}
            </div>
            {!p.isOrganizer && (
              <button className="eliminar-btn" onClick={() => removeParticipant(i)}>❌</button>
            )}
          </li>
        ))}
      </ul>

      <div className="agregar-form">
        <input
          type="text"
          placeholder="Nuevo participante"
          value={newParticipant}
          onChange={(e) => setNewParticipant(e.target.value)}
        />
        <button onClick={handleAddParticipant}>Agregar</button>
      </div>
    </div>
  );
};

export default Participantes;
