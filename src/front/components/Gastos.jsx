import React from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";

const Gastos = ({ eventoId }) => {
    const { store } = useGlobalReducer();

    // Filtramos los gastos por evento
    const gastosDelEvento = store.gastos?.filter(gasto => gasto.evento_id === eventoId) || [];

    return (
        <div className="box-seccion-evento">
            <div className="card-header">
                <h5 className="mb-0">Gastos del Evento</h5>
            </div>
            <div className="card-body">
                {gastosDelEvento.length === 0 ? (
                    <p className="text-white">No hay gastos registrados para este evento.</p>
                ) : (
                    <table className="table table-striped table-bordered">
                        <thead className="table-light">
                            <tr>
                                <th scope="col">ID</th>
                                <th scope="col">Usuario ID</th>
                                <th scope="col">Tarea ID</th>
                                <th scope="col">Monto</th>
                                <th scope="col">Etiqueta</th>
                            </tr>
                        </thead>
                        <tbody>
                            {gastosDelEvento.map(gasto => (
                                <tr key={gasto.id}>
                                    <td>{gasto.id}</td>
                                    <td>{gasto.usuario_id ?? "No asignado"}</td>
                                    <td>{gasto.tarea_id}</td>
                                    <td>${gasto.monto?.toFixed(2) ?? "0.00"}</td>
                                    <td>{gasto.etiqueta ?? "-"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Gastos;
