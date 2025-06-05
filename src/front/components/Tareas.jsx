import React, { useEffect, useState } from "react";

const Tareas = ({ eventoId, token, backendUrl, userId }) => {
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nuevaTarea, setNuevaTarea] = useState("");
  const [asignadoA, setAsignadoA] = useState("");
  const [gastosPorTarea, setGastosPorTarea] = useState({});
  const [participantes, setParticipantes] = useState([]);

  const fetchTareas = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/eventos/${eventoId}/tareas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setTareas(data);
    } catch (error) {
      console.error("Error al obtener tareas:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipantes = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/${eventoId}/participantes`, {
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
  }, [eventoId, token, backendUrl]);

  const handleAgregarTarea = async () => {
    if (nuevaTarea.trim() === "") return;

    try {
      // Aquí enviamos el email directamente (asignadoA ya es email)
      const assignedEmail = asignadoA || null;

      const bodyToSend = {
        descripcion: nuevaTarea,
        asignado_a: assignedEmail,
      };

      const response = await fetch(`${backendUrl}/api/eventos/${eventoId}/tareas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyToSend),
      });

      if (!response.ok) {
        const responseData = await response.json().catch(() => null);
        throw new Error(responseData?.message || "Error al crear la tarea");
      }

      fetchTareas();
      setNuevaTarea("");
      setAsignadoA("");
    } catch (error) {
      console.error("❌ Error al agregar tarea:", error);
    }
  };

  const handleCompletarTarea = async (tareaId) => {
    const monto = gastosPorTarea[tareaId];

    try {
      const response = await fetch(`${backendUrl}/api/tareas/${tareaId}/realizar`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre_gasto: monto ? "Gasto de tarea" : null,
          monto: monto ? parseFloat(monto) : null,
        }),
      });

      if (!response.ok) throw new Error("Error al completar la tarea");

      fetchTareas();
    } catch (error) {
      console.error("❌ Error al completar tarea:", error);
    }
  };

  const handleEliminarTarea = async (tareaId) => {
    try {
      const response = await fetch(`${backendUrl}/api/tareas/${tareaId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Error al eliminar la tarea");

      setTareas((prev) => prev.filter((tarea) => tarea.id !== tareaId));
    } catch (error) {
      console.error("Error al eliminar tarea:", error);
    }
  };

  const handleGastoChange = (tareaId, value) => {
    setGastosPorTarea((prev) => ({
      ...prev,
      [tareaId]: value,
    }));
  };

  return (
    <div className="box-seccion-evento d-flex flex-column" style={{ height: "400px" }}>
      <div className="card-header">
        <h4 className="mb-0 text-white">Tareas</h4>
      </div>

      <div style={{ overflowY: "auto", flexGrow: 1 }}>
        {loading ? (
          <p className="text-white">Cargando tareas...</p>
        ) : tareas.length === 0 ? (
          <p className="text-white">Aún no hay tareas registradas.</p>
        ) : (
          <ul className="list-group mb-0">
            {tareas.map((tarea) => (
              <li
                key={tarea.id}
                className="list-group-item d-flex justify-content-between align-items-center flex-wrap"
              >
                <div className="me-auto">
                  <div className="fw-bold">{tarea.descripcion}</div>
                  <small>
                    Asignado a: {tarea.asignado_a || "No asignado"}
                  </small>
                </div>

                <div className="d-flex align-items-center gap-2">
                  {tarea.completada ? (
                    <span className="badge bg-success">Completada</span>
                  ) : (
                    <>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        style={{ width: "80px" }}
                        placeholder="Gasto"
                        value={gastosPorTarea[tarea.id] || ""}
                        onChange={(e) => handleGastoChange(tarea.id, e.target.value)}
                      />
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => handleCompletarTarea(tarea.id)}
                      >
                        ✓
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleEliminarTarea(tarea.id)}
                      >
                        🗑
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

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
          style={{ flexBasis: "30%", minWidth: "200px" }}
          value={asignadoA}
          onChange={(e) => setAsignadoA(e.target.value)}
        >
          <option value="">Asignar a...</option>
          {participantes.map((p) => (
            <option key={p.id} value={p.email}>
              {p.email}
            </option>
          ))}
        </select>

        <button className="btn btn-primary" onClick={handleAgregarTarea}>
          Agregar
        </button>
      </div>
    </div>
  );
};

export default Tareas;
