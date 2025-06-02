import React from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom"; // ⬅️ MODIFICADO
import { useForm } from "react-hook-form";

const ResetPassword = () => {
  const { token: tokenFromParams } = useParams();
  const [searchParams] = useSearchParams();
  const tokenFromSearch = searchParams.get("token");
  const token = tokenFromParams || tokenFromSearch;

  const navigate = useNavigate(); // ⬅️ AÑADIDO

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const [message, setMessage] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/reset-password/${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            password: data.newPassword,
          }),
        }
      );

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Error desconocido.");
      }

      setMessage("Contraseña actualizada con éxito.");
      navigate("/loginform"); // ⬅️ REDIRECCIÓN INMEDIATA
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "500px" }}>
      <h2>Restablecer contraseña</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-3">
          <label htmlFor="newPassword" className="form-label">
            Nueva contraseña
          </label>
          <input
            id="newPassword"
            type="password"
            className={`form-control ${errors.newPassword ? "is-invalid" : ""}`}
            {...register("newPassword", {
              required: "La contraseña es obligatoria",
              minLength: { value: 6, message: "Mínimo 6 caracteres" },
              maxLength: { value: 8, message: "Máximo 8 caracteres" },
            })}
          />
          {errors.newPassword && (
            <div className="invalid-feedback">{errors.newPassword.message}</div>
          )}
        </div>

        <div className="mb-3">
          <label htmlFor="confirmPassword" className="form-label">
            Confirmar contraseña
          </label>
          <input
            id="confirmPassword"
            type="password"
            className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
            {...register("confirmPassword", {
              required: "Confirma la contraseña",
              validate: (value) =>
                value === watch("newPassword") || "Las contraseñas no coinciden",
            })}
          />
          {errors.confirmPassword && (
            <div className="invalid-feedback">{errors.confirmPassword.message}</div>
          )}
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Cambiando..." : "Cambiar contraseña"}
        </button>
      </form>

      {message && (
        <div className="alert alert-info mt-3" role="alert">
          {message}
        </div>
      )}
    </div>
  );
};

export default ResetPassword;
