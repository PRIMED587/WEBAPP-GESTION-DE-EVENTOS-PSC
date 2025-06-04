import { React, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";

function parseJwt(token) {
  try {
    const base64Payload = token.split(".")[1];
    const payload = atob(base64Payload);
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

const safeParseJSON = (str) => {
  try {
    const parsed = JSON.parse(str);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const FormularioEvento = () => {
  const navigate = useNavigate();
  const { id: eventId } = useParams();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    defaultValues: {
      aceptaColaboradores: true,
    },
  });

  const [loading, setLoading] = useState(false);

  // Estado para mensajes
  const [message, setMessage] = useState(null);
  // message = { type: "success"|"error", text: string } o null

  useEffect(() => {
    const loadEventData = async () => {
      if (!eventId) return;

      setLoading(true);

      const token = sessionStorage.getItem("token");
      if (!token) {
        setMessage({ type: "error", text: "Token de autenticación no encontrado" });
        setLoading(false);
        return;
      }

      const payload = parseJwt(token);
      const userId = payload?.sub;
      if (!userId) {
        setMessage({ type: "error", text: "Usuario no autenticado o token inválido" });
        setLoading(false);
        return;
      }

      try {
        const url = `${import.meta.env.VITE_BACKEND_URL}/api/${userId}/eventos/${eventId}`;
        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          setMessage({ type: "error", text: "Error al cargar datos del evento" });
          setLoading(false);
          return;
        }

        const eventData = await res.json();

        // Procesar campos que pueden ser strings JSON o arrays directamente
        const invitadosArray = Array.isArray(eventData.invitados)
          ? eventData.invitados
          : safeParseJSON(eventData.invitados);

        const serviciosArray = Array.isArray(eventData.servicios)
          ? eventData.servicios
          : safeParseJSON(eventData.servicios);

        const recursosArray = Array.isArray(eventData.recursos)
          ? eventData.recursos
          : safeParseJSON(eventData.recursos);

        reset({
          nombre: eventData.nombre || "",
          fechaHora: eventData.fecha || "",
          ubicacion: eventData.ubicacion || "",
          descripcion: eventData.descripcion || "",
          invitados: invitadosArray.join(", "),
          maxInvitados: eventData.max_invitados || "",
          tipoActividad: eventData.tipo_actividad || "",
          vestimenta: eventData.vestimenta || "",
          aceptaColaboradores: eventData.acepta_colaboradores ?? true,
          servicios: serviciosArray.join(", "),
          recursos: recursosArray.join(", "),
        });

        setValue("aceptaColaboradores", eventData.acepta_colaboradores ?? true);

        setLoading(false);
      } catch (error) {
        setMessage({ type: "error", text: "Error inesperado al cargar evento: " + error.message });
        setLoading(false);
      }
    };

    loadEventData();
  }, [eventId, reset, setValue]);

  const onSubmit = async (data) => {
    setMessage(null); // limpiar mensajes previos
    console.log("Datos del formulario para enviar:", data);

    const processedData = {
      nombre: data.nombre,
      descripcion: data.descripcion,
      fecha: data.fechaHora,
      ubicacion: data.ubicacion,
      acepta_colaboradores: data.aceptaColaboradores,
      invitados: null,
      max_invitados: data.maxInvitados ? Number(data.maxInvitados) : null,
      tipo_actividad: data.tipoActividad,
      vestimenta: data.vestimenta,
      servicios: data.servicios
        ? data.servicios
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s !== "")
        : [],
      recursos: data.recursos
        ? data.recursos
          .split(",")
          .map((r) => r.trim())
          .filter((r) => r !== "")
        : [],
    };

    const token = sessionStorage.getItem("token");
    if (!token) {
      setMessage({ type: "error", text: "No estás autenticado" });
      return;
    }
    const payload = parseJwt(token);
    const userId = payload?.sub;
    if (!userId) {
      setMessage({ type: "error", text: "Usuario no autenticado o token inválido" });
      return;
    }

    const baseUrl = `${import.meta.env.VITE_BACKEND_URL}/api/${userId}/eventos`;
    const url = eventId ? `${baseUrl}/${eventId}` : baseUrl;

    try {
      const res = await fetch(url, {
        method: eventId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(processedData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setMessage({
          type: "error",
          text:
            (eventId ? "Error al modificar" : "Error al crear") +
            " evento: " +
            (errorData.message || res.statusText),
        });
        return;
      }

      const eventResponse = await res.json();

      setMessage({
        type: "success",
        text: eventId ? "Evento modificado con éxito!" : "Evento creado con éxito!",
      });

      if (!eventId) {
        const nuevoEventoId = eventResponse.evento.id;

        const invitadosArray = data.invitados
          ? data.invitados
            .split(",")
            .map((email) => email.trim())
            .filter((email) => email !== "")
          : [];

        if (invitadosArray.length > 0) {
          const urlInvitaciones = `${baseUrl}/${nuevoEventoId}/invitaciones`;

          const resInv = await fetch(urlInvitaciones, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ emails: invitadosArray }),
          });

          if (!resInv.ok) {
            const errorInv = await resInv.json();
            setMessage((prev) => ({
              type: "error",
              text:
                "Evento creado pero error al agregar invitaciones: " +
                (errorInv.message || resInv.statusText),
            }));
            return;
          }
        }
      }

      reset();
      setValue("aceptaColaboradores", true);

      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      setMessage({ type: "error", text: "Error de red o inesperado: " + error.message });
    }
  };

  if (loading) {
    return <p>Cargando datos del evento...</p>;
  }

  return (
    <div className="homepage-container pt-5 pb-5 d-flex justify-content-center">
      <div className="container" style={{ maxWidth: "900px" }}>
        <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
          <h1 style={{ color: "#ff2e63" }} className="mb-0 ">
            {eventId ? "Editar evento" : "Crear evento"}
          </h1>
          <div className="btn-group" role="group" aria-label="Navegación rápida">
            <button
              type="button"
              className="btn btn-dark btn-sm mx-2"
              onClick={() => navigate("/dashboard")}
              style={{ minWidth: "130px" }}
            >
              Volver al Dashboard
            </button>
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={() => navigate("/")}
              style={{ minWidth: "130px" }}
            >
              Ir al Home
            </button>
          </div>
        </div>

        <form
          id="eventForm"
          className="row g-3 p-4 rounded shadow position-relative"
          style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}
          onSubmit={handleSubmit(onSubmit)}
        >
          {/* Nombre del evento - obligatorio */}
          <div className="col-md-12">
            <label htmlFor="nombre" className="form-label">
              Nombre del evento *
            </label>
            <input
              type="text"
              id="nombre"
              className={`form-control ${errors.nombre ? "is-invalid" : ""}`}
              {...register("nombre", { required: "El nombre es obligatorio" })}
            />
            {errors.nombre && (
              <div className="invalid-feedback">{errors.nombre.message}</div>
            )}
          </div>

          {/* Fecha y hora - obligatorio */}
          <div className="col-md-6">
            <label htmlFor="fechaHora" className="form-label">
              Fecha y hora *
            </label>
            <input
              type="datetime-local"
              id="fechaHora"
              className={`form-control ${errors.fechaHora ? "is-invalid" : ""}`}
              {...register("fechaHora", {
                required: "La fecha y hora son obligatorias",
              })}
            />
            {errors.fechaHora && (
              <div className="invalid-feedback">{errors.fechaHora.message}</div>
            )}
          </div>

          {/* Switch acepta colaboradores - obligatorio, default true */}
          <div className="col-md-6 d-flex align-items-center">
            <div className="form-check form-switch mt-4">
              <input
                className="form-check-input"
                type="checkbox"
                id="aceptaColaboradores"
                {...register("aceptaColaboradores")}
                defaultChecked={true}
              />
              <label className="form-check-label" htmlFor="aceptaColaboradores">
                Acepta colaboradores
              </label>
            </div>
          </div>

          {/* Ubicación - opcional */}
          <div className="col-md-6">
            <label htmlFor="ubicacion" className="form-label">
              Ubicación
            </label>
            <input
              type="text"
              id="ubicacion"
              className="form-control"
              {...register("ubicacion")}
            />
          </div>

          {/* Descripción - opcional */}
          <div className="col-md-6">
            <label htmlFor="descripcion" className="form-label">
              Descripción
            </label>
            <textarea
              id="descripcion"
              className="form-control"
              rows={3}
              {...register("descripcion")}
            />
          </div>

          {/* Correos invitados (pendientes) - opcional, múltiples emails separados por comas */}
          <div className="col-md-12">
            <label htmlFor="invitados" className="form-label">
              Correos electrónicos para invitar (separados por comas)
            </label>
            <textarea
              id="invitados"
              className="form-control"
              rows={2}
              {...register("invitados")}
              placeholder="email1@example.com, email2@example.com"
            />
          </div>

          {/* Cantidad máxima de invitados - opcional, número */}
          <div className="col-md-4">
            <label htmlFor="maxInvitados" className="form-label">
              Cantidad máxima de invitados
            </label>
            <input
              type="number"
              id="maxInvitados"
              className="form-control"
              min={1}
              {...register("maxInvitados", {
                valueAsNumber: true,
                min: { value: 1, message: "Debe ser un número positivo" },
              })}
            />
            {errors.maxInvitados && (
              <div className="invalid-feedback">{errors.maxInvitados.message}</div>
            )}
          </div>

          {/* Tipo de actividad - opcional */}
          <div className="col-md-4">
            <label htmlFor="tipoActividad" className="form-label">
              Tipo de actividad
            </label>
            <input
              type="text"
              id="tipoActividad"
              className="form-control"
              {...register("tipoActividad")}
              placeholder="Ej: asado, boda, reunión"
            />
          </div>

          {/* Tipo de vestimenta recomendada - opcional */}
          <div className="col-md-4">
            <label htmlFor="vestimenta" className="form-label">
              Tipo de vestimenta recomendada
            </label>
            <input
              type="text"
              id="vestimenta"
              className="form-control"
              {...register("vestimenta")}
              placeholder="Ej: casual, formal"
            />
          </div>

          {/* Servicios necesarios - opcional, múltiples separados por comas */}
          <div className="col-md-6">
            <label htmlFor="servicios" className="form-label">
              Servicios necesarios (separados por comas)
            </label>
            <textarea
              id="servicios"
              className="form-control"
              rows={2}
              {...register("servicios")}
              placeholder="fotógrafo, cocinero, música"
            />
          </div>

          {/* Recursos necesarios - opcional, múltiples separados por comas */}
          <div className="col-md-6">
            <label htmlFor="recursos" className="form-label">
              Recursos necesarios (separados por comas)
            </label>
            <textarea
              id="recursos"
              className="form-control"
              rows={2}
              {...register("recursos")}
              placeholder="comida, bebida, mesas"
            />
          </div>

          {/* Mensajes de error o éxito */}
          {message && (
            <div
              className={`alert mt-3 ${message.type === "error" ? "alert-danger" : "alert-success"
                }`}
              role="alert"
            >
              {message.text}
            </div>
          )}

          {/* Botón de enviar */}
          <div className="col-12 d-flex justify-content-end">
            <button
              type="button"
              onClick={() => {
                navigate(`/evento/${eventId}`); 
              }}
              className="btn btn-secondary"
            >
              Volver sin editar
            </button>
            <button type="submit" className="btn btn-primary px-5 ms-3">
              {eventId ? "Guardar cambios" : "Crear evento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioEvento;
