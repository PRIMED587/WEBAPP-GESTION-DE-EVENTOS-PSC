//  Se agregó 'useLocation' para saber en qué ruta estamos 
import { Link, useLocation } from "react-router-dom";

export const Navbar = () => {
	// SE CAMBIO: usamos el hook useLocation para obtener la ruta actual
	const location = useLocation(); // Para saber en qué ruta estamos

	// SE CAMBIO: variable que verifica si estamos en /aboutus
	const isAboutPage = location.pathname === "/aboutus";

	// SE AGREGÓ: variable que verifica si estamos en la página principal
	const isHomePage = location.pathname === "/";

	// SE AGREGÓ: variable que verifica si estamos en la página de mis invitaciones
	const isMisInvitaciones = location.pathname === "/mis-invitaciones";

	// SE AGREGÓ: función para cerrar sesión
	const handleLogout = () => {
		console.log("Sesión cerrada"); // Aquí luego pondrás la lógica real
	};

	return (
		<header>
			<nav
				className="px-4 py-3"
				style={{
					backgroundColor: "#FF2E63",
					backdropFilter: "blur(6px)",
				}}
			>
				<div className="container">
					<div className="row align-items-center">
						{/* Nombre del sitio */}
						<div className="col-12 col-md-6 text-center text-md-start mb-3 mb-md-0">
							<Link to="/" className="navbar-brand text-black h3 mb-0">
								<h2>ASAD-APP</h2>
							</Link>
						</div>

						{/* SE CAMBIO: ahora el botón cambia de destino y texto según la ruta */}
						<div className="col-12 col-md-6 d-flex justify-content-center justify-content-md-end gap-2">
							{/* SE CAMBIO: si estamos en AboutUs, el botón lleva a Home */}
							<Link to={isAboutPage ? "/" : "/aboutus"}>
								<button className="btn btn-outline-black">
									{/* Esto es para cambiar el texto del botón dinámicamente */}
									{isAboutPage ? <i className="fas fa-home"></i> : "About Us"}
								</button>
							</Link>

							{/* SE AGREGÓ: botón Logout solo visible en la página principal */}
							{isHomePage && (
								<button className="btn btn-outline-black" onClick={handleLogout}>
									Logout
								</button>
							)}

							{/* SE AGREGÓ: botón para ir a Mis Invitaciones */}
							{isMisInvitaciones && (
								<Link to="/">
									<button className="btn btn-outline-black">
										<i className="fas fa-home me-1"></i>
									</button>
								</Link>
							)}

						</div>
					</div>
				</div>
			</nav>
		</header>
	);
};
