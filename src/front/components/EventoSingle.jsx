import React from "react";
import { Button, Card } from "react-bootstrap";

const EventoSingle = ({ eventos }) => {
    // Ordenar eventos por fecha (de más próxima a más lejana)
    const eventosOrdenados = [...eventos].sort(
        (a, b) => new Date(a.fecha) - new Date(b.fecha)
    );

    // Tomar solo los primeros 3 eventos
    const proximosEventos = eventosOrdenados.slice(0, 3);

    return (
        <div className="events-section d-flex flex-wrap justify-content-center gap-4">
            {proximosEventos.map((event, index) => (
                <Card key={index} className="event-card text-white slide-up mt-3">
                    <Card.Body>
                        <Card.Title><i class="fa-solid fa-people-roof"></i> {event.nombre.toUpperCase()}</Card.Title>
                        <Card.Subtitle className="mb-2 text">
                            TIPO: {event.tipo_actividad.toUpperCase()}
                        </Card.Subtitle>
                        <Card.Text>{event.descripcion}</Card.Text>
                        <Card.Text>
                            <strong>Fecha:</strong>{" "}
                            {new Date(event.fecha).toLocaleString()}
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

