import React from "react";



const Registro = () => {
    const soloLetras = (e) => {
        const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]*$/;
        if (!regex.test(e.key)) e.preventDefault();
    };

    const soloNumeros = (e) => {
        const regex = /[0-9]/;
        if (!regex.test(e.key)) e.preventDefault();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        alert("Formulario enviado");
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
                                <input type="text" className="form-control" id="nombre" name="nombre" placeholder="Nombre" onKeyPress={soloLetras} />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="apellido" className="form-label">Apellido</label>
                                <input type="text" className="form-control" id="apellido" name="apellido" placeholder="Apellido" onKeyPress={soloLetras} />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="email" className="form-label">Correo electrónico</label>
                                <input type="email" className="form-control" id="email" name="email" placeholder="name@example.com" required />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="telefono" className="form-label">Teléfono</label>
                                <input type="tel" className="form-control" id="telefono" name="telefono" placeholder="Teléfono" onKeyPress={soloNumeros} />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="pais" className="form-label">País</label>
                                <select className="form-select" id="pais" name="pais">
                                    <option value="">Selecciona un país</option>
                                </select>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="ciudad" className="form-label">Ciudad</label>
                                <select className="form-select" id="ciudad" name="ciudad">
                                    <option value="">Selecciona una ciudad</option>
                                </select>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="password" className="form-label">Contraseña</label>
                                <input type="password" className="form-control" id="password" name="password" placeholder="Contraseña" />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="confirmPassword" className="form-label">Confirmar Contraseña</label>
                                <input type="password" className="form-control" id="confirmPassword" name="confirmPassword" placeholder="Confirmar contraseña" />
                            </div>

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