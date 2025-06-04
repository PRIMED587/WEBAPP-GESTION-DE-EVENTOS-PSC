import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const Tareas = () => {
  const { eventoId } = useParams();
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nuevaTarea, setNuevaTarea] = useState("");

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

  // Aquí no modifiqué la función de agregar tarea, solo agrego el input y botón en la UI
  const handleAgregarTarea = () => {
    if (nuevaTarea.trim() === "") return;
    // Por ahora solo limpio el input para no cambiar lógica
    setNuevaTarea("");
  };

  if (loading) return <div>Cargando tareas...</div>;

  return (
    <div className="box-seccion-evento d-flex flex-column" style={{ height: "400px" }}>
      <div className="card-header">
        <h4 className="mb-0 text-white">Tareas</h4>
      </div>

      {/* Lista con scroll */}
      <div style={{ overflowY: "auto", flexGrow: 1 }}>
        {tareas.length === 0 ? (
          <p className="text-white ">Aún no hay tareas registradas.</p>
        ) : (
          <ul className="list-group mb-0">
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

      {/* Input y botón fijos abajo */}
      <div className="mt-3 d-flex">
        <input
          type="text"
          className="form-control me-2"
          placeholder="Agregar nueva tarea"
          value={nuevaTarea}
          onChange={(e) => setNuevaTarea(e.target.value)}
          
        />
        <button className="create-event-btn" onClick={handleAgregarTarea}>
          Agregar
        </button>
      </div>
    </div>
  );
};

export default Tareas;
