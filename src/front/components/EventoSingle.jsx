import React from "react";
import { Button, Card } from "react-bootstrap";

const EventoSingle = ({eventos}) => {
    return (
        <div className="events-section d-flex flex-wrap justify-content-center gap-4">
            {!!eventos && eventos.map((event, index) => (
                <Card key={index} className="event-card text-white slide-up">
                    <Card.Body>
                        <Card.Title>Evento #{event.id}</Card.Title>
                        <Card.Text>
                            Descripción breve del evento. Aquí puedes poner el lugar, hora o tipo.
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
