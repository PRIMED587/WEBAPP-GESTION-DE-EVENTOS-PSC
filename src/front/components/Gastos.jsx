import React, { useEffect, useState } from "react";

const Gastos = ({ eventoId, token, backendUrl, userId }) => {
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGastos = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(`${backendUrl}/api/${eventoId}/gastos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        setLoading(false);
        return;
      }
      const data = await response.json();
      setGastos(data);
    } catch {
      setGastos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGastos();
  }, [eventoId]);

  return (
    <div className="box-seccion-evento d-flex flex-column" style={{ height: "100%" }}>
      <div className="card-header">
        <h4 className="mb-0 text-white">Gastos</h4>
      </div>

      <div className="lista-scroll flex-grow-1 mt-2">
        {loading ? (
          <p>Cargando gastos...</p>
        ) : gastos.length === 0 ? (
          <p>No hay gastos registrados.</p>
        ) : (
          <ul className="list-group mb-0">
            {gastos.map((g) => (
              <li key={g.id} className="list-group-item">
                {g.descripcion} - ${g.monto}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Gastos;
