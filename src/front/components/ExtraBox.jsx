const ExtraBox = ({ evento }) => {
  if (!evento) return <p className="text-muted">No se encontró el evento.</p>;

  const parseToList = (str) => {
    if (!str) return [];
    return str.replace(/[{}]/g, "").split(",").map(item => item.trim());
  };

  const serviciosList = parseToList(evento.servicios);
  const recursosList = parseToList(evento.recursos);

  return (
    <div className="box-seccion-evento" style={{ height: "400px" }}>
      <div className="card-header">
        <h5 className="mb-0">Extras del Evento</h5>
      </div>
      <div className="card-body">
        <div className="row">
          {/* Servicios */}
          <div className="col-md-6">
            <h6 className="fw-bold">Servicios</h6>
            {serviciosList.length > 0 ? (
              <ul className="list-group list-group-flush border rounded">
                {serviciosList.map((servicio, index) => (
                  <li className="list-group-item" key={index}>
                    {servicio}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted">No especificado</p>
            )}
          </div>

          {/* Recursos */}
          <div className="col-md-6 mt-4 mt-md-0">
            <h6 className="fw-bold">Recursos</h6>
            {recursosList.length > 0 ? (
              <ul className="list-group list-group-flush border rounded">
                {recursosList.map((recurso, index) => (
                  <li className="list-group-item" key={index}>
                    {recurso}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted">No especificado</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExtraBox;
