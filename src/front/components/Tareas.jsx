import React, { useEffect, useState } from "react";

const Tareas = ({ eventoId, token, backendUrl, userId, userEmail, creadorId, onGastoGuardado }) => {
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
      const assignedUserId = asignadoA || null;
      const bodyToSend = { descripcion: nuevaTarea, asignado_a: assignedUserId };

      const response = await fetch(`${backendUrl}/api/eventos/${eventoId}/tareas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyToSend),
      });

      if (!response.ok) throw new Error("Error al crear la tarea");

      fetchTareas();
      setNuevaTarea("");
      setAsignadoA("");
    } catch (error) {
      console.error("❌ Error al agregar tarea:", error);
    }
  };

  const handleCompletarTarea = async (tareaId) => {
    try {
      const resTarea = await fetch(`${backendUrl}/api/${userId}/${eventoId}/tareas/${tareaId}/completar`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!resTarea.ok) throw new Error("Error completando tarea");

      const gastoMonto = gastosPorTarea[tareaId];
      if (gastoMonto && gastoMonto > 0) {
        const resGasto = await fetch(`${backendUrl}/api/eventos/${eventoId}/tareas/${tareaId}/gastos`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            monto: parseFloat(gastoMonto),
            etiqueta: "Gasto tarea",
            tarea_id: tareaId,
          }),
        });

        if (!resGasto.ok) throw new Error("Error guardando gasto");

        if (onGastoGuardado) onGastoGuardado(); // 🔁 Notificar cambio
      }

      setTareas((prevTareas) =>
        prevTareas.map((t) =>
          t.id === tareaId ? { ...t, completada: true } : t
        ).sort((a, b) => a.completada - b.completada)
      );

      setGastosPorTarea((prev) => ({ ...prev, [tareaId]: "" }));
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const handleEliminarTarea = async (tareaId) => {
    try {
      const response = await fetch(`${backendUrl}/api/tareas/${tareaId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Error al eliminar la tarea");

      setTareas((prev) => prev.filter((t) => t.id !== tareaId));
    } catch (error) {
      console.error("Error al eliminar tarea:", error);
    }
  };

  const handleGastoChange = (tareaId, value) => {
    setGastosPorTarea((prev) => ({ ...prev, [tareaId]: value }));
  };

  const puedeModificarTarea = (tarea) => {
    if (String(userId) === String(creadorId)) return true;
    if (!tarea.asignado_a) return true;
    return userEmail === tarea.asignado_a;
  };

  const handleAsignarmeTarea = async (tareaId) => {
    try {
      const res = await fetch(`${backendUrl}/api/eventos/${eventoId}/tareas/${tareaId}/asignar`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Error asignando tarea");

      fetchTareas();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  return (
    <div
      className="box-seccion-evento d-flex flex-column"
      style={{ height: "500px" }}
    >
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
            {tareas
              .slice()
              .sort((a, b) => a.completada - b.completada) // completadas al final
              .map((tarea) => (
                <li
                  key={tarea.id}
                  className="list-group-item d-flex justify-content-between align-items-center flex-wrap"
                >
                  <div className="me-auto">
                    <div className="fw-bold">{tarea.descripcion}</div>
                    <small>Para: {tarea.asignado_a || "No asignado"}</small>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    {tarea.completada ? (
                      <span className="badge bg-success">Completada</span>
                    ) : !tarea.asignado_a && puedeModificarTarea(tarea) ? (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleAsignarmeTarea(tarea.id)}
                      >
                        Asignarme tarea
                      </button>
                    ) : puedeModificarTarea(tarea) ? (
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
                    ) : null}
                  </div>
                </li>
              ))}
          </ul>
        )}
      </div>

      <div className="d-flex gap-2 mt-auto" style={{ paddingTop: "10px" }}>
        <input
          type="text"
          className="form-control"
          style={{ flexBasis: "50%" }}
          placeholder="Agregar nueva tarea"
          value={nuevaTarea}
          onChange={(e) => setNuevaTarea(e.target.value)}
        />
        <select
          className="form-select text-white"
          style={{ backgroundColor:"#2c2c34", borderColor:"#ff2e63", flexBasis: "30%"}}
          value={asignadoA}
          onChange={(e) => setAsignadoA(e.target.value)}
        >
          <option value="">Asignar a...</option>  
          {participantes.map((p) => (
            <option key={p.id} value={p.usuario_id}>
              {p.email}
            </option>
          ))}
        </select>

        <button className="create-event-btn" onClick={handleAgregarTarea}>
          Agregar
        </button>
      </div>
    </div>
  );

};

export default Tareas;
