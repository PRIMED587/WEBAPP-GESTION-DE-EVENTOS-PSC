import React, { useState } from "react";
import InfoEvento from "../components/InfoEvento";
import Participantes from "../components/Participantes";
import Tareas from "../components/Tareas";
import ExtraBox from "../components/ExtraBox";

const Evento = () => {
  const [participants, setParticipants] = useState([
    { name: "Marco", isOrganizer: true },
    { name: "Brenda", isOrganizer: false },
  ]);

  return (
    <div className="evento-container">
      <InfoEvento participants={participants} />

      <div className="listas-container">
        <Participantes participants={participants} setParticipants={setParticipants} />
        <Tareas participants={participants} />
      </div>

      <ExtraBox />
    </div>
  );
};

export default Evento;
