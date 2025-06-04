const ExtraBox = ({ evento }) => {
  if (!evento) return <p className="text-muted">No se encontró el evento.</p>;

  const { servicios, recursos } = evento;

  return (
    <div className="box-seccion-evento">
      <div className="card-header">
        <h5 className="mb-0">Extras del Evento</h5>
      </div>
      <div className="card-body">
        <div className="mb-3">
          <strong>Servicios necesarios:</strong>
          <p>{servicios || "No especificado"}</p>
        </div>

        <div className="mb-3">
          <strong>Recursos necesarios:</strong>
          <p>{recursos || "No especificado"}</p>
        </div>
      </div>
    </div>
  );
};

export default ExtraBox;