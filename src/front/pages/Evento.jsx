import React, { useState } from "react";

const Evento = () => {
  const [participants, setParticipants] = useState([
    { name: "Marco", role: "Organizador" },
    { name: "Brenda", role: "Invitado" },
  ]);

  const [newParticipant, setNewParticipant] = useState("");

  const handleAddParticipant = () => {
    if (newParticipant.trim() === "") return;
    setParticipants([...participants, { name: newParticipant, role: "Invitado" }]);
    setNewParticipant("");
  };

  const handleRemove = (index) => {
    setParticipants(participants.filter((_, i) => i !== index));
  };

  const [tasks, setTasks] = useState([
    { text: "Comprar bebidas", assignedTo: "Marco", done: false },
    { text: "Llevar carbón", assignedTo: "Brenda", done: false },
    { text: "Preparar playlist", assignedTo: "Marco", done: false },
  ]);

  const [newTaskText, setNewTaskText] = useState("");
  const [assignedTo, setAssignedTo] = useState(participants[0]?.name || "");

  const handleAddTask = () => {
    if (newTaskText.trim() === "" || assignedTo.trim() === "") return;
    setTasks([...tasks, { text: newTaskText, assignedTo, done: false }]);
    setNewTaskText("");
  };

  const toggleTask = (index) => {
    const updatedTasks = [...tasks];
    updatedTasks[index].done = !updatedTasks[index].done;
    setTasks(updatedTasks);
  };

  const removeTask = (index) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };


  return (
    <div className="evento-container">
      <div className="evento-grid grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Información del evento */}
        <div className="info-box p-4 rounded-2xl shadow-md">
          <h4>Información del Evento</h4>
          <p><strong>Nombre:</strong> Fiesta en la terraza</p>
          <p><strong>Fecha:</strong> 30/06/2025</p>
          <p><strong>Lugar:</strong> Rancagua</p>
          <p><strong>Participantes:</strong> {participants.length}</p>
          <div className="descripcion-box">
            <p>Esta será una reunión para celebrar el final del bootcamp con asado y buena música.</p>
          </div>
        </div>

        {/* Caja adicional para contenido futuro */}
        <div className="extra-box p-4 rounded-2xl shadow-md">
          <h4>Contenido adicional</h4>
          <p>Espacio reservado para ideas o funciones futuras.</p>
        </div>

        {/* Participantes */}
        <div className="participantes-box p-4 rounded-2xl shadow-md col-span-1 md:col-span-2">
          <h4>Mis Invitados</h4>
          <div className="lista-participantes">
            {participants.map((p, i) => (
              <div key={i} className="invitado">
                <span className="nombre">{p.name}</span>
                <span
                  className={`rol ${p.role === "Organizador" ? "organizador" : "invitado"}`}
                >
                  {p.role}
                  {p.role === "Organizador" && " 👑"}
                </span>
                {p.role !== "Organizador" && (
                  <button className="eliminar-btn" onClick={() => handleRemove(i)}>❌</button>
                )}
              </div>
            ))}
          </div>
          <div className="agregar-form">
            <input
              type="text"
              placeholder="Nuevo participante"
              value={newParticipant}
              onChange={(e) => setNewParticipant(e.target.value)}
            />
            <button onClick={handleAddParticipant}>Agregar</button>
          </div>
        </div>

        {/* Tareas */}
        <div className="tareas-box p-4 rounded-2xl shadow-md col-span-1 md:col-span-2">
          <h4 className="text-lg font-semibold mb-2">Lista de Tareas</h4>
          <ul className="lista-tareas space-y-2">
            {tasks.map((task, i) => (
              <li key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => toggleTask(i)}
                  />
                  <span className={`${task.done ? "line-through text-gray-500" : ""}`}>
                    {task.text} ({task.assignedTo})
                  </span>
                </div>
                <button className="text-red-500" onClick={() => removeTask(i)}>❌</button>
              </li>
            ))}
          </ul>

          <div className="agregar-tarea-form mt-4 flex flex-col md:flex-row gap-2">
            <input
              type="text"
              placeholder="Nueva tarea"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              className="p-2 border rounded w-full"
            />
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="p-2 border rounded w-full md:w-auto"
            >
              {participants.map((p, i) => (
                <option key={i} value={p.name}>{p.name}</option>
              ))}
            </select>
            <button
              onClick={handleAddTask}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Agregar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Evento;
