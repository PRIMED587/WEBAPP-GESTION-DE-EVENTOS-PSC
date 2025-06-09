import { React, useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import Swal from "sweetalert2"; //se agrego nuevo para la alerta


mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

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
  const geocoderContainer = useRef(null);

  const [coords, setCoords] = useState({ lat: null, lng: null });

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
  const [message, setMessage] = useState(null);

  // Carga datos del evento si editamos
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
          direccion: eventData.direccion || "",
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

        setCoords({
          lat: eventData.latitud || null,
          lng: eventData.longitud || null,
        });

        setLoading(false);
      } catch (error) {
        setMessage({ type: "error", text: "Error inesperado al cargar evento: " + error.message });
        setLoading(false);
      }
    };

    loadEventData();
  }, [eventId, reset, setValue]);

  // Inicializar Mapbox Geocoder
  useEffect(() => {
    if (!geocoderContainer.current) return;

    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      placeholder: "Buscar dirección exacta",
      types: "address,place,locality",
      autocomplete: true,
      language: "es",
    });

    geocoder.addTo(geocoderContainer.current);

    geocoder.on("result", (e) => {
      const direccionSeleccionada = e.result.place_name;
      const [lng, lat] = e.result.center;

      setValue("direccion", direccionSeleccionada);
      setCoords({ lat, lng });
    });

    // Limpieza al desmontar
    return () => {
      geocoder.clear();
      if (geocoderContainer.current) {
        geocoderContainer.current.innerHTML = "";
      }
    };
  }, [geocoderContainer, setValue]);

  const onSubmit = async (data) => {
    setMessage(null);

    const processedData = {
      nombre: data.nombre,
      descripcion: data.descripcion,
      fecha: data.fechaHora,
      ubicacion: data.ubicacion,
      direccion: data.direccion,
      acepta_colaboradores: data.aceptaColaboradores,
      invitados: null,
      max_invitados: data.maxInvitados ? Number(data.maxInvitados) : null,
      tipo_actividad: data.tipoActividad,
      vestimenta: data.vestimenta,
      servicios: data.servicios
        ? data.servicios.split(",").map((s) => s.trim()).filter((s) => s !== "")
        : [],
      recursos: data.recursos
        ? data.recursos.split(",").map((r) => r.trim()).filter((r) => r !== "")
        : [],
      latitud: coords.lat,
      longitud: coords.lng,
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

      //Nueva alerta agregada SweetAlert2
      if (!eventId) {
        Swal.fire({
          title: '¡Evento creado!',
          text: 'Tu evento ha sido creado exitosamente.',
          icon: 'success',
          confirmButtonColor: '#FF2E63',
          background: '#1A1A1D',
          color: '#FFFFFF',
          iconColor: '#FF2E63',
          confirmButtonText: 'Aceptar',
        });
      }

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
      setCoords({ lat: null, lng: null });

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
              className="btn ver-detalles-btn btn-sm"
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
          <div className="col-md-6">
            <label htmlFor="nombre" className="form-label">
              Nombre del evento
            </label>
            <input
              type="text"
              className={`form-control ${errors.nombre ? "is-invalid" : ""}`}
              id="nombre"
              {...register("nombre", {
                required: "El nombre es obligatorio",
                maxLength: {
                  value: 100,
                  message: "El nombre no puede superar 100 caracteres",
                },
              })}
              placeholder="Nombre Evento"
            />
            {errors.nombre && (
              <div className="invalid-feedback">{errors.nombre.message}</div>
            )}
          </div>

          {/* Fecha y hora - obligatorio */}
          <div className="col-md-6">
            <label htmlFor="fechaHora" className="form-label">
              Fecha y hora
            </label>
            <input
              type="datetime-local"
              className={`form-control ${errors.fechaHora ? "is-invalid" : ""}`}
              id="fechaHora"
              {...register("fechaHora", {
                required: "La fecha y hora es obligatoria",
              })}
            />
            {errors.fechaHora && (
              <div className="invalid-feedback">{errors.fechaHora.message}</div>
            )}
          </div>

          {/* Ubicación - opcional */}
          <div className="col-md-6">
            <label htmlFor="ubicacion" className="form-label">
              Ubicación
            </label>
            <input
              type="text"
              className="form-control"
              id="ubicacion"
              {...register("ubicacion")}
              placeholder="Ubicacion"
            />
          </div>

          {/* Dirección exacta con Mapbox Geocoder - opcional */}
          <div className="col-md-6">
            <label htmlFor="direccion" className="form-label">
              Dirección exacta
            </label>
            {/* Contenedor del geocoder (input de autocompletado) */}
            <div ref={geocoderContainer} />
            {/* Campo visible para editar la dirección, sincronizado con el geocoder */}
            <input
              type="text"
              id="direccion"
              className="form-control mt-1"
              {...register("direccion")}
              placeholder="Direccion"
            />
          </div>

          {/* Descripción - opcional */}
          <div className="col-md-12 mb-3">
            <label htmlFor="descripcion" className="form-label">
              Descripción
            </label>
            <textarea
              id="descripcion"
              rows="2"
              className="form-control"
              {...register("descripcion")}
              placeholder="Escribí una breve descripción del evento..."
              
            ></textarea>
          </div>

          {/* Correos para invitaciones - opcional */}
          {!eventId && (
            <div className="col-md-12">
              <label htmlFor="invitados" className="form-label">
                Correos electrónicos para enviar invitaciones (separados por coma)
              </label>
              <input
                type="text"
                className="form-control"
                id="invitados"
                {...register("invitados")}
                placeholder="ejemplo1@mail.com, ejemplo2@mail.com"
              />
            </div>
          )}

          {/* Switch acepta colaboradores - obligatorio */}
          {/* <div className="col-md-6 d-flex align-items-center">
            <label className="form-label me-2" htmlFor="aceptaColaboradores">
              ¿Acepta colaboradores?
            </label>
            <input
              type="checkbox"
              id="aceptaColaboradores"
              {...register("aceptaColaboradores")}
              defaultChecked={true}
            />
          </div> */}

          {/* Máximo invitados - opcional */}
          {/* <div className="col-md-6">
            <label htmlFor="maxInvitados" className="form-label">
              Cantidad máxima de invitados
            </label>
            <input
              type="number"
              min="1"
              className="form-control"
              id="maxInvitados"
              {...register("maxInvitados")}
              placeholder="Ej: 50"
            />
          </div> */}

          {/* Tipo de actividad - opcional */}
          <div className="col-md-6">
            <label htmlFor="tipoActividad" className="form-label">
              Tipo de actividad
            </label>
            <input
              type="text"
              className="form-control"
              id="tipoActividad"
              {...register("tipoActividad")}
              placeholder="Ej: Asado, boda, reunión"
            />
          </div>

          {/* Tipo de vestimenta - opcional */}
          <div className="col-md-6">
            <label htmlFor="vestimenta" className="form-label">
              Tipo de vestimenta recomendada
            </label>
            <input
              type="text"
              className="form-control"
              id="vestimenta"
              {...register("vestimenta")}
              placeholder="Ej: Casual, formal, temático"
            />
          </div>

          {/* Servicios necesarios - opcional */}
          <div className="col-md-6">
            <label htmlFor="servicios" className="form-label">
              Servicios necesarios (separados por coma)
            </label>
            <input
              type="text"
              className="form-control"
              id="servicios"
              {...register("servicios")}
              placeholder="Ej: Fotógrafo, cocinero"
            />
          </div>

          {/* Recursos necesarios - opcional */}
          <div className="col-md-6">
            <label htmlFor="recursos" className="form-label">
              Recursos necesarios (separados por coma)
            </label>
            <input
              type="text"
              className="form-control"
              id="recursos"
              {...register("recursos")}
              placeholder="Ej: Comida, bebida, mesas"
            />
          </div>

          {/* Mensajes */}
          {message && (
            <div
              className={`alert mt-3 ${message.type === "error" ? "alert-danger" : "alert-success"
                }`}
              role="alert"
            >
              {message.text}
            </div>
          )}

          {/* Botón submit */}
          <div className="col-12 mt-4 d-flex justify-content-center">
            <button
              type="submit"
              className="btn ver-detalles-btn w-50"
              disabled={loading}
            >
              {eventId ? "Modificar evento" : "Crear evento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioEvento;

