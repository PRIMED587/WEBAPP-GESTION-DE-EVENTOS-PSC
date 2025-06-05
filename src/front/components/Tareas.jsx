import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const Tareas = () => {
  const { eventoId } = useParams();
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nuevaTarea, setNuevaTarea] = useState("");
  const [asignadoA, setAsignadoA] = useState("");
  const [gasto, setGasto] = useState("");
  const [participantes, setParticipantes] = useState([]);

  // Fetch tareas
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

  // Fetch participantes para el select
  const fetchParticipantes = async () => {
    const token = sessionStorage.getItem("token");
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    try {
      const response = await fetch(`${backendUrl}/api/eventos/${eventoId}/participantes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setParticipantes(data);
    } catch (error) {
      console.error("Error al obtener participantes:", error);
    }
  };

  useEffect(() => {
    fetchTareas();
    fetchParticipantes();
  }, []);

  const handleAgregarTarea = () => {
    if (nuevaTarea.trim() === "") return;
    // Aquí puedes usar nuevaTarea, asignadoA y gasto para enviar al backend
    setNuevaTarea("");
    setAsignadoA("");
    setGasto("");
  };

  if (loading) return <div>Cargando tareas...</div>;

  return (
    <div className="box-seccion-evento d-flex flex-column" style={{ height: "400px" }}>
      <div className="card-header">
        <h4 className="mb-0 text-white">Tareas</h4>
      </div>

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

      {/* Inputs abajo */}
      <div className="mt-3 d-flex gap-2">
        <input
          type="text"
          className="form-control"
          style={{ flexBasis: "40%" }}
          placeholder="Agregar nueva tarea"
          value={nuevaTarea}
          onChange={(e) => setNuevaTarea(e.target.value)}
        />
        <select
          className="form-select"
          style={{ flexBasis: "20%" }}
          value={asignadoA}
          onChange={(e) => setAsignadoA(e.target.value)}
        >
          <option value="">Asignar a</option>
          {participantes.map((p) => (
            <option key={p.id} value={p.usuario_id}>
              {p.usuario_id} {/* O cambia por nombre si tienes */}
            </option>
          ))}
        </select>
        <input
          type="number"
          min="0"
          className="form-control"
          style={{ flexBasis: "20%" }}
          placeholder="Gastos"
          value={gasto}
          onChange={(e) => setGasto(e.target.value)}
        />
        <button
          className="create-event-btn"
          style={{ flexBasis: "20%" }}
          onClick={handleAgregarTarea}
        >
          Agregar
        </button>
      </div>
    </div>
  );
};

export default Tareas;
