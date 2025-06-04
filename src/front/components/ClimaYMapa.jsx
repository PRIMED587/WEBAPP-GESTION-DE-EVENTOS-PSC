import React, { useEffect, useState, useRef } from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

function ClimaYMapa({ direccion, fecha, latitud, longitud }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [clima, setClima] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!latitud || !longitud) return;

    if (map.current) return; // inicializa solo una vez

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [longitud, latitud],
      zoom: 12,
      attributionControl: false,  // Aquí desactivo el control de atribución
    });

    new mapboxgl.Marker().setLngLat([longitud, latitud]).addTo(map.current);
  }, [latitud, longitud]);

  useEffect(() => {
    if (!latitud || !longitud) return;

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitud}&lon=${longitud}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=es`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Error al obtener datos del clima");
        return res.json();
      })
      .then((data) => {
        setClima(data);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
        setClima(null);
      });
  }, [latitud, longitud]);

  return (
    <div
      id="clima-mapa-container"
      className="container my-4"
      style={{ minHeight: "350px", marginBottom: "5rem" }}
    >
      <div
        className="row gx-4 gy-3 align-items-center flex-column flex-md-row"
        style={{ minHeight: "300px" }}
      >
        <div className="col-12 col-md-6" style={{ height: "300px" }}>
          <div
            ref={mapContainer}
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "8px",
              boxShadow: "0 0 8px rgba(0,0,0,0.15)",
            }}
          />
        </div>

        <div className="col-12 col-md-6">
          {error && <p className="text-danger">{error}</p>}

          {clima && (
            <div>
              <h5>Clima actual en {clima.name}</h5>
              <p>
                <strong>Temperatura:</strong> {clima.main.temp}°C
              </p>
              <p>
                <strong>Humedad:</strong> {clima.main.humidity}%
              </p>
              <p>
                <strong>Viento:</strong> {clima.wind.speed} m/s
              </p>
              <p>
                <strong>Descripción:</strong> {clima.weather[0].description}{" "}
                <img
                  src={`https://openweathermap.org/img/wn/${clima.weather[0].icon}@2x.png`}
                  alt={clima.weather[0].description}
                  style={{ verticalAlign: "middle" }}
                />
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ClimaYMapa;
