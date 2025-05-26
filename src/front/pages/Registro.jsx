import React from "react";


const Registro = () => {
    return (
        <div className="registerHeadTittle m-auto"> <h1>Formulario de Registro</h1>
            <div id="registerForm" className="container mt-5">
                <div id="imputRegisterForm" className="row p-4 rounded align-items-center">
                    <div className="col-lg-8 col-12">
                        <div className="mb-3">
                            <label htmlFor="nombre" className="form-label">Nombre</label>
                            <input type="text" className="form-control" id="nombre" placeholder="Nombre" />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="apellido" className="form-label">Apellido</label>
                            <input type="text" className="form-control" id="apellido" placeholder="Apellido" />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">Correo electrónico</label>
                            <input type="email" className="form-control" id="email" placeholder="name@example.com" />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="telefono" className="form-label">Teléfono</label>
                            <input type="tel" className="form-control" id="telefono" placeholder="Teléfono" />
                        </div>
                         <div className="mb-3">
                            <label htmlFor="email" className="form-label">Pais</label>
                            <input type="email" className="form-control" id="email" placeholder="name@example.com" />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">Ciudad</label>
                            <input type="email" className="form-control" id="email" placeholder="name@example.com" />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="password" className="form-label">Contraseña</label>
                            <input type="password" className="form-control" id="password" placeholder="Contraseña" />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="confirmPassword" className="form-label">Confirmar Contraseña</label>
                            <input type="password" className="form-control" id="confirmPassword" placeholder="Confirmar contraseña" />
                        </div>
                    </div>


                   
                    <div id="registerImg" className="col-lg-4 col-12">
                        <img
                            src="https://imgmedia.larepublica.pe/640x371/larepublica/original/2022/06/17/62acbcc9acce01340a3f8344.webp"
                            alt="Decoración"
                            className="img-fluid rounded"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Registro
