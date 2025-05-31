import React, { useState } from "react";

const Tareas = ({ participants }) => {
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
    <div className="tareas-box box-style">
      <h4>Lista de Tareas</h4>
      <ul className="lista-tareas">
        {tasks.map((task, i) => (
          <li key={i}>
            <div className={`task-info ${task.done ? "completada" : ""}`}>
              <input
                type="checkbox"
                checked={task.done}
                onChange={() => toggleTask(i)}
                style={{ marginRight: "8px" }}
              />
              {task.text} ({task.assignedTo})
            </div>
            <button className="eliminar-btn" onClick={() => removeTask(i)}>❌</button>
          </li>
        ))}
      </ul>

      <div className="agregar-tarea-form agregar-form">
        <input
          type="text"
          placeholder="Nueva tarea"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
        />
        <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
          {participants.map((p, i) => (
            <option key={i} value={p.name}>{p.name}</option>
          ))}
        </select>
        <button onClick={handleAddTask}>Agregar</button>
      </div>
    </div>
  );
};

export default Tareas;

