import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const Tareas = () => {
  const { eventoId } = useParams();
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTareas = async () => {
    try {
      const response = await fetch(`${process.env.BACKEND_URL}/api/eventos/${eventoId}/tareas`);
      const data = await response.json();
      setTareas(data);
    } catch (error) {
      console.error("Error al obtener tareas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTareas();
  }, []);

  if (loading) return <div>Cargando tareas...</div>;

  return (
    <div className="box-seccion-evento">
      <h4 className="mb-3">Tareas</h4>
      {tareas.length === 0 ? (
        <p className="text-muted">Aún no hay tareas registradas.</p>
      ) : (
        <ul className="list-group">
          {tareas.map((tarea) => (
            <li key={tarea.id} className="list-group-item d-flex justify-content-between align-items-start">
              <div className="ms-2 me-auto">
                <div className="fw-bold">{tarea.descripcion}</div>
                <small>Asignado a: {tarea.asignado_a || "No asignado"}</small>
              </div>
              {tarea.completada ? (
                <span className="badge bg-success">Completada</span>
              ) : (
                <span className="badge bg-warning text-dark">Pendiente</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Tareas;
