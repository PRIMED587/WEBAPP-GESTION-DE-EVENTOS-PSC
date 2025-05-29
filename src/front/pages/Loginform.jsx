import React from "react";
import { useForm } from "react-hook-form";

const Loginform = () => {
    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors },
        reset,
    } = useForm();

    const onSubmit = async (data) => {

        try {
            const response = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/login/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: data.login,
                    password: data.password,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Error al iniciar sesión");
            }

            // Guardar el token en localStorage y mostrar éxito
            localStorage.setItem("token", result.access_token);
            alert("Inicio de sesión exitoso");
            reset();
        } catch (error) {
            console.error("Login error:", error.message);
            alert("Correo o contraseña incorrectos");
        }
    };

    const handleSendPassword = () => {
        const email = getValues("login");
        if (!email) {
            alert("Por favor escribe tu correo primero.");
            return;
        }
        // Aquí podrías agregar la lógica real de envío
        console.log(`Enviar enlace de recuperación a ${email}`);
    };

    return (
        
        <div id="Logincontainer" className="col-lg-7 col-8 m-auto mt-5 p-5">
            <h1>INICIO DE SESION</h1>
            <form id="LoginForm m-auto w-auto" onSubmit={handleSubmit(onSubmit)}>
                <div id="LoginLabel1" className="form-group mt-5">
                    <label htmlFor="loginEmail">Correo Electrónico</label>
                    <input
                        type="email"
                        id="loginEmail"
                        className="form-control"
                        placeholder="Ingrese e-mail"
                        {...register("login", {
                            required: "El correo es obligatorio",
                            pattern: {
                                value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
                                message: "Correo inválido",
                            },
                        })}
                    />
                    {errors.login && (
                        <small className="text-danger">{errors.login.message}</small>
                    )}
                </div>

                <div id="LoginLabel2" className="form-group mt-3">
                    <label htmlFor="loginPassword">Contraseña</label>
                    <input
                        type="password"
                        id="loginPassword"
                        className="form-control"
                        placeholder="Ingrese su contraseña"
                        {...register("password", {
                            required: "La contraseña es obligatoria",
                        })}
                    />
                    {errors.password && (
                        <small className="text-danger">{errors.password.message}</small>
                    )}
                </div>

                <div className="d-flex justify-content-center mt-5">
                    <button id="LoginButton" type="submit" className="btn btn-primary me-2">
                        Log In
                    </button>
                    <button id="ResetButton"
                        type="button"
                        className="btn btn-primary ms-2"
                        onClick={handleSendPassword}
                    >
                        Enviar Contraseña al correo
                    </button>
                </div>
            </form>
        </div>
    
    );
};

export default Loginform;