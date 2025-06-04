import React, { useState } from "react";
import { Button, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const EventoSingle = ({ eventos }) => {
  const navigate = useNavigate();
  const [startIndex, setStartIndex] = useState(0);
  const eventosOrdenados = [...eventos].sort(
    (a, b) => new Date(a.fecha) - new Date(b.fecha)
  );

  const eventosPorPagina = 3;
  const eventosAMostrar = eventosOrdenados.slice(startIndex, startIndex + eventosPorPagina);

  const handlePrev = () => {
    if (startIndex > 0) {
      setStartIndex(startIndex - eventosPorPagina);
    }
  };

  const handleNext = () => {
    if (startIndex + eventosPorPagina < eventosOrdenados.length) {
      setStartIndex(startIndex + eventosPorPagina);
    }
  };

  return (
    <div className="text-center">
      <div className="d-flex justify-content-between align-items-center mb-3 px-3">
        <Button variant="outline-light" onClick={handlePrev} disabled={startIndex === 0}><i class="fa-solid fa-backward"></i>
        </Button>
        <h4 className="text-white">Próximos Eventos</h4>
        <Button
          variant="outline-light"
          onClick={handleNext}
          disabled={startIndex + eventosPorPagina >= eventosOrdenados.length}
        >
          <i class="fa-solid fa-forward"></i>
        </Button>
      </div>

      <div className="events-section d-flex flex-wrap justify-content-center gap-4">
        {eventosAMostrar.map((event, index) => (
          <Card key={index} className="event-card text-white slide-up mt-3">
            <Card.Body>
              <Card.Title>
                <i className="fa-solid fa-people-roof"></i> {event.nombre.toUpperCase()}
              </Card.Title>
              <Card.Subtitle className="mb-2 text">
                TIPO: {event.tipo_actividad.toUpperCase()}
              </Card.Subtitle>
              <Card.Text>{event.descripcion}</Card.Text>
              <Card.Text>
                <strong>Fecha:</strong> {new Date(event.fecha).toLocaleString()}
              </Card.Text>
              <Button
                className="ver-detalles-btn"
                size="sm"
                onClick={() => navigate(`/evento/${event.id}`)}
              >
                Ver detalles
              </Button>
            </Card.Body>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EventoSingle;
