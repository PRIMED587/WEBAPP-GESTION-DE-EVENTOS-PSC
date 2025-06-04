import React from "react";
import { Button, Card } from "react-bootstrap";

const EventoSingle = ({ eventos }) => {
  // Ordenar eventos por fecha (más próximos primero)
  const eventosOrdenados = [...eventos].sort(
    (a, b) => new Date(a.fecha) - new Date(b.fecha)
  );

  return (
    <div className="events-section d-flex flex-wrap justify-content-center gap-4">
      {eventosOrdenados.map((event, index) => (
        <Card key={index} className="event-card text-white slide-up">
          <Card.Body>
            <Card.Title>{event.nombre.toUpperCase()}</Card.Title>
            <Card.Subtitle className="mb-2 text-muted">
              {event.tipo_actividad.toUpperCase()}
            </Card.Subtitle>
            <Card.Text>{event.descripcion}</Card.Text>
            <Card.Text>
              <strong>Fecha:</strong>{" "}
              {new Date(event.fecha).toLocaleString("es-CL", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Card.Text>
            <Button className="ver-detalles-btn" size="sm">
              Ver detalles
            </Button>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
};

export default EventoSingle;
