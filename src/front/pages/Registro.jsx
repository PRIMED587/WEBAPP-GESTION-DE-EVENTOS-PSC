import React, { useState } from "react";

const Registro = () => {
    
    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        email: "",
        telefono: "",
        pais: "",
        ciudad: "",
        password: "",
        confirmPassword: ""
    });

    const [error, setError] = useState("");

    // Solo se permite caracteres alfabeticos
    const soloLetras = (e) => {
        const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]*$/;
        if (!regex.test(e.key)) e.preventDefault();
    };

    // Solo se permite caracteres numericos
    const soloNumeros = (e) => {
        const regex = /[0-9]/;
        if (!regex.test(e.key)) e.preventDefault();
    };

    // Funcion de cambios en los inputs
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Funcion de Envío del formulario
    const handleSubmit = (e) => {
        e.preventDefault();

        // Validar que las contraseñas coincidan
        if (formData.password !== formData.confirmPassword) {
            setError("Las contraseñas no coinciden");
            return;
        }

        setError("");

        // POR TERMINAR: Aquí se debe conectar con la base de datos/backend
        console.log("Datos a enviar:", formData); // ← para pruebas

        // POR TERMINAR: Guia de lo que se debe hacer para vincular a la base de datos:
        /*
        fetch("https://tudominio.com/api/registro", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        })
        .then(res => res.json())
        .then(data => {
            console.log("Usuario creado", data);
        })
        .catch(error => {
            console.error("Error al registrar:", error);
        });
        */

        alert("Formulario enviado con éxito");
    };

    return (
        <div className="registerHeadTittle m-auto">
            <h1>Formulario de Registro</h1>
            <div id="registerForm" className="container mt-5">
                <form onSubmit={handleSubmit}>
                    <div id="imputRegisterForm" className="row p-4 rounded align-items-center">
                        <div className="col-lg-8 col-12">
                            <div className="mb-3">
                                <label htmlFor="nombre" className="form-label">Nombre</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="nombre"
                                    name="nombre"
                                    placeholder="Nombre"
                                    onKeyPress={soloLetras}
                                    value={formData.nombre}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="mb-3">
                                <label htmlFor="apellido" className="form-label">Apellido</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="apellido"
                                    name="apellido"
                                    placeholder="Apellido"
                                    onKeyPress={soloLetras}
                                    value={formData.apellido}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="mb-3">
                                <label htmlFor="email" className="form-label">Correo electrónico</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    id="email"
                                    name="email"
                                    placeholder="name@example.com"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="mb-3">
                                <label htmlFor="telefono" className="form-label">Teléfono</label>
                                <input
                                    type="tel"
                                    className="form-control"
                                    id="telefono"
                                    name="telefono"
                                    placeholder="Teléfono"
                                    onKeyPress={soloNumeros}
                                    value={formData.telefono}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="mb-3">
                                <label htmlFor="pais" className="form-label">País</label>
                                <select
                                    className="form-select"
                                    id="pais"
                                    name="pais"
                                    value={formData.pais}
                                    onChange={handleChange}
                                >
                                    <option value="">Selecciona un país</option>
                                    <option value="Argentina">Argentina</option>
                                    <option value="México">México</option>
                                    <option value="Colombia">Colombia</option>
                                </select>
                            </div>

                            <div className="mb-3">
                                <label htmlFor="ciudad" className="form-label">Ciudad</label>
                                <select
                                    className="form-select"
                                    id="ciudad"
                                    name="ciudad"
                                    value={formData.ciudad}
                                    onChange={handleChange}
                                >
                                    <option value="">Selecciona una ciudad</option>
                                    <option value="Buenos Aires">Buenos Aires</option>
                                    <option value="Bogotá">Bogotá</option>
                                    <option value="CDMX">CDMX</option>
                                </select>
                            </div>

                            <div className="mb-3">
                                <label htmlFor="password" className="form-label">Contraseña</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    id="password"
                                    name="password"
                                    placeholder="Contraseña"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="mb-3">
                                <label htmlFor="confirmPassword" className="form-label">Confirmar Contraseña</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    placeholder="Confirmar contraseña"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Mensaje de error */}
                            {error && (
                                <div className="text-danger mb-3">
                                    {error}
                                </div>
                            )}

                            {/* Botón Enviar */}
                            <div className="text-center mt-4">
                                <button type="submit" className="btn-enviarForm">Enviar Formulario</button>
                            </div>
                        </div>

                        {/* Imagen lateral */}
                        <div id="registerImg" className="col-lg-4 col-12">
                            <img
                                src="https://imgmedia.larepublica.pe/640x371/larepublica/original/2022/06/17/62acbcc9acce01340a3f8344.webp"
                                alt="Decoración"
                                className="img-fluid rounded"
                            />
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Registro;