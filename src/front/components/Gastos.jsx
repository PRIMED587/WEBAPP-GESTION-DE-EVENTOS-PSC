import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";

const Gastos = ({ eventoId, creadorId, token, backendUrl, refresh }) => {
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);

  const usuarioId = JSON.parse(sessionStorage.getItem("user"))?.id;
  const esCreador = usuarioId === creadorId;

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

  const handleEliminarGasto = async (gastoId) => {
    const confirmacion = await Swal.fire({
      title: "¿Eliminar gasto?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!confirmacion.isConfirmed) return;

    try {
      const response = await fetch(`${backendUrl}/api/eventos/${eventoId}/gastos/${gastoId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        fetchGastos(); // Refrescar lista
        Swal.fire({
          icon: "success",
          title: "Gasto eliminado",
          showConfirmButton: false,
          timer: 1500,
        });
      } else {
        const data = await response.json();
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "No se pudo eliminar el gasto",
        });
      }
    } catch (error) {
      console.error("Error eliminando gasto:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un error inesperado",
      });
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
          <ul className="list-group mb-0">
            {gastos.map((g) => (
              <li
                key={g.id}
                className="list-group-item d-flex justify-content-between align-items-center flex-wrap"
              >
                {/* Contenido gasto a la izquierda */}
                <div>
                  <strong>{g.etiqueta || "Sin etiqueta"}</strong>
                  <br />
                  <small className="text-white">Por: {g.usuario_email || "Desconocido"}</small>
                </div>

                {/* Contenedor monto + botón a la derecha */}
                <div className="d-flex align-items-center gap-3">
                  <span>${g.monto.toFixed(2)}</span>
                  {esCreador && (
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleEliminarGasto(g.id)}
                      style={{ minWidth: "75px" }}
                    >
                      Eliminar
                    </button>
                  )}
                </div>
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
