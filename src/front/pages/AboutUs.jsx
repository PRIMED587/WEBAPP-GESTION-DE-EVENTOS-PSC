import React from "react";
import demianImg from "../assets/img/200945771.png";
import pascualImg from "../assets/img/foto_carnet_720.jpg";
import jenniferImg from "../assets/img/PHOTO-2025-05-28-16-01-55.jpg";


const AboutUs = () => {
    const team = [
        {
            name: "Demian Caivano",
            image: demianImg,
            github: "https://github.com/demiancaivano"
        },
        {
            name: "Pascual Rivera",
            image: pascualImg,
            github: "https://github.com/pascualrivera"
        },
        {
            name: "Marco Pastene",
            image: "https://randomuser.me/api/portraits/men/45.jpg", // aún sin foto local
            github: "https://github.com/marcopastene"
        },
        {
            name: "Jennifer Calderon",
            image: jenniferImg,
            github: "https://github.com/jennifercalderon"
        }
    ];

    return (
        <section
            className="py-5"
            style={{
                backgroundColor: "#1A1A1D",
                color: "#FFFFFF",
                position: "relative",
                backgroundImage: `
            radial-gradient(circle, rgba(175, 7, 85, 0.418) 1px, transparent 1px),
            radial-gradient(circle, rgba(175, 7, 85, 0.418) 1px, transparent 1px)
        `,
                backgroundPosition: "0 0, 25px 25px",
                backgroundSize: "50px 50px"
            }}
        >

            {/* Fondo decorativo estilo wave */}
            <div style={{ position: "absolute", top: 0, width: "100%", zIndex: 0, overflow: "hidden", lineHeight: 0 }}>
                <svg viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#FF2E63" fillOpacity="1" d="M0,160C80,192,160,224,240,208C320,192,400,128,480,106.7C560,85,640,107,720,122.7C800,139,880,149,960,138.7C1040,128,1120,96,1200,112C1280,128,1360,192,1400,224L1440,256L1440,0L1400,0C1360,0,1280,0,1200,0C1120,0,1040,0,960,0C880,0,800,0,720,0C640,0,560,0,480,0C400,0,320,0,240,0C160,0,80,0,40,0L0,0Z" />
                </svg>
            </div>

            {/* Cuadro de agradecimiento */}
            <div className="container mb-5" style={{ position: "relative", zIndex: 1 }}>
                <div
                    style={{
                        border: "2px solid #FF2E63",
                        borderRadius: "12px",
                        padding: "40px 30px",
                        maxWidth: "800px",
                        margin: "0 auto",
                        backgroundColor: "black",
                        boxShadow: "0 0 15px #FF2E63",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        textAlign: "center",
                    }}
                >
                    <h1 style={{ color: "#FF2E63", fontWeight: "bold", marginBottom: "20px" }}>
                        Sobre Nosotros
                    </h1>
                    <p className="lead" style={{ fontSize: "1.1rem" }}>
                        Esta app fue creada con amor, dedicación y muchas líneas de código durante
                        nuestro proyecto final del Bootcamp Full Stack de 4Geeks Academy.
                    </p>
                    <p style={{ fontStyle: "italic", marginTop: "15px" }}>
                        Gracias por ser parte de esta aventura.
                    </p>
                    <p className="fw-bold mt-3" style={{ color: "#FF2E63" }}>
                        Con cariño,<br />
                        Demian Caivano, Marco Pastene, Pascual Rivera y Jennifer Calderon.
                    </p>
                </div>
            </div>

            {/* Presentación del equipo */}
            <div className="container">
                <div className="team-title-container">
                    <h2 className="team-title">
                        Conozca a nuestro equipo
                    </h2>
                </div>

                <div className="row justify-content-center team-row">
                    {team.map((member, index) => (
                        <div key={index} className="col-12 col-md-6 col-lg-3 mb-4 d-flex justify-content-center team-card-wrapper">
                            <div
                                className="card text-center"
                                style={{
                                    backgroundColor: "black",
                                    color: "#FFFFFF",
                                    border: "2px solid transparent",
                                    borderRadius: "12px",
                                    transition: "transform 0.3s ease, box-shadow 0.3s ease"
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = "scale(1.05)";
                                    e.currentTarget.style.boxShadow = "0 0 15px #FF2E63";
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = "scale(1)";
                                    e.currentTarget.style.boxShadow = "none";
                                }}
                            >
                                <img
                                    src={member.image}
                                    className="rounded-circle mx-auto mt-4"
                                    alt={`Foto de ${member.name}`}
                                    style={{
                                        width: "130px",
                                        height: "130px",
                                        objectFit: "cover",
                                        border: "3px solid #FF2E63",
                                        transition: "box-shadow 0.3s ease",
                                        boxShadow: "none"
                                    }}
                                />
                                <div className="card-body">
                                    <h5 className="card-title" style={{ color: "#FF2E63", fontWeight: "600" }}>
                                        {member.name}
                                    </h5>
                                    <p className="card-text" style={{ fontSize: "0.85rem", opacity: 0.7 }}>
                                        Desarrollador Full Stack
                                    </p>
                                    <a
                                        href={member.github}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="d-inline-block mt-2"
                                        style={{ color: "#FF2E63", fontSize: "1.2rem" }}
                                    >
                                        <i className="fab fa-github"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default AboutUs;
