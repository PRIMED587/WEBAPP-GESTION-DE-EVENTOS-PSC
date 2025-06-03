import React from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import InfoEvento from "../components/InfoEvento";
import Participantes from "../components/Participantes";
import Tareas from "../components/Tareas";
import Gastos from "../components/Gastos";
import ExtraBox from "../components/ExtraBox";


const Evento = ({ eventoId }) => {
  const { store } = useGlobalReducer();

  const evento = store.eventos?.find(e => e.id === eventoId);

  if (!evento) return <p className="text-center mt-4">Evento no encontrado.</p>;

  return (
    <div className="container evento-container my-4">
      <h2 className="mb-4 text-center">{evento.nombre}</h2>
      <div className="row g-4">
        <div className="col-lg-6">
          <InfoEvento evento={evento} />
          <ExtraBox eventoId={evento.id} />
        </div>

        <div className="col-lg-6">
          <Participantes participantes={evento.participantes} creadorId={evento.creador_id} />
          <Tareas tareas={evento.tareas_activas} />
          <Gastos gastos={evento.gastos} />
        </div>
      </div>
    </div>
  );
};

export default Evento;
