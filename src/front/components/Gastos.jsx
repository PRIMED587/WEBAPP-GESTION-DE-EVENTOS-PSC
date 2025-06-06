import React, { useEffect, useState } from "react";

const Gastos = ({ eventoId, token, backendUrl, refresh }) => {
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGastos = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(`${backendUrl}/api/eventos/${eventoId}/gastos`, {
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
  }, [eventoId, refresh]);

  const totalGastos = gastos.reduce((acc, g) => acc + (g.monto || 0), 0);

  return (
    <div className="box-seccion-evento d-flex flex-column" style={{ height: "500px" }}>
      {/* Título */}
      <div className="card-header">
        <h4 className="mb-0 text-white">Gastos</h4>
      </div>

      {/* Contenido scrollable */}
      <div className="flex-grow-1 overflow-auto mt-2 mb-2">
        {loading ? (
          <p className="text-white">Cargando gastos...</p>
        ) : gastos.length === 0 ? (
          <p className="text-white">No hay gastos registrados.</p>
        ) : (
          <ul className="list-group mb-0 ">
            {gastos.map((g) => (
              <li
                key={g.id}
                className="list-group-item d-flex justify-content-between align-items-center flex-wrap"
              >
                <div>
                  <strong>{g.etiqueta || "Sin etiqueta"}</strong>
                  <br />
                  <small className="text-white">Por: {g.usuario_email || "Desconocido"}</small>
                </div>
                <span>${g.monto.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Total fijo abajo */}
      <div className="mt-auto bg-dark text-white py-2 px-3 text-end border-top">
        <strong>Total: ${totalGastos.toFixed(2)}</strong>
      </div>
    </div>
  );
};

export default Gastos;
