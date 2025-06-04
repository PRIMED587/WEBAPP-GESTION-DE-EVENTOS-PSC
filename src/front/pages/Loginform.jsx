import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

const Loginform = () => {
    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors },
        reset,
    } = useForm();

    const navigate = useNavigate();

    // Estado para manejar la alerta visual
    const [alert, setAlert] = useState({
        message: "",
        type: "",
        show: false,
    });

    // Función alertas
    const showAlert = (message, type = "info") => {
        setAlert({ message, type, show: true });
        setTimeout(() => setAlert({ ...alert, show: false }), 2000);
    };

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
            console.log(result); // Esto nos dirá qué datos devuelve el backend, para hacer el boton de logout. Jenn

            if (!response.ok) {
                throw new Error(result.message || "Error al iniciar sesión");
            }

            localStorage.setItem("token", result.access_token);
            {/* parte agregada para el token de misInvitaciones */ }
            localStorage.setItem("user_id", result.user_id || result.user?.id);
            // ✅ Guardar token y userId en sessionStorage
            sessionStorage.setItem("token", result.access_token);
            sessionStorage.setItem("userId", result.user.id);
            sessionStorage.setItem("user", JSON.stringify(result.user))

            showAlert("Inicio de sesión exitoso", "success");

            reset();
            navigate("/dashboard");
        } catch (error) {
            console.error("Login error:", error.message);
            showAlert("Correo o contraseña incorrectos", "danger");
        }
    };


    const handleSendPassword = async () => {
        const email = getValues("login");
        if (!email) {
            showAlert("Por favor escribe tu correo primero.", "warning");
            return;
        }
        sessionStorage.setItem("email", email);
        try {
            const response = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/forgot-password/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                throw new Error("No se pudo enviar el correo de recuperación.");
            }

            showAlert("Correo de recuperación enviado exitosamente.", "success");
        } catch (error) {
            console.error("Error al enviar correo de recuperación:", error.message);
            showAlert("Hubo un error al enviar el correo.", "danger");
        }
    };

    return (
        <div id="Logincontainer" className="col-lg-7 col-8 m-auto mt-5 p-5 mb-5">
            <h1>INICIO DE SESION</h1>

            {/* Alerta visual */}
            {alert.show && (
                <div className={`alert alert-${alert.type} alert-dismissible fade show`} role="alert">
                    {alert.message}
                    <button type="button" className="btn-close" onClick={() => setAlert({ ...alert, show: false })}></button>
                </div>
            )}

            <form id="LoginForm" className="m-auto w-100" onSubmit={handleSubmit(onSubmit)}>
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
                    <button
                        id="ResetButton"
                        type="button"
                        className="btn btn-primary m-auto"
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
