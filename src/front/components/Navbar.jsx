// Navbar.jsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export const Navbar = () => {
	const location = useLocation();
	const navigate = useNavigate();

	const isHomePage = location.pathname === "/";
	const isAboutPage = location.pathname === "/aboutus";
	const isDashboardPage = location.pathname === "/dashboard";
	const isMisInvitacionesPage = location.pathname === "/mis-invitaciones";

	const hideAboutUsButton = ["/registro", "/aboutus", "/mis-invitaciones"].includes(location.pathname);
	const isLoggedIn = !!sessionStorage.getItem("token");

	const handleLogout = () => {
		const userStr = sessionStorage.getItem("user");
		let userName = "";

		if (userStr) {
			try {
				const userObj = JSON.parse(userStr);
				userName = userObj.nombre || userObj.email || "";
			} catch (e) {
				userName = "";
			}
		}

		Swal.fire({
			title: "¿Cerrar sesión?",
			text: "¿Estás seguro que deseas cerrar tu sesión?",
			icon: "warning",
			showCancelButton: true,
			confirmButtonColor: "#FF2E63",
			cancelButtonColor: "#6c757d",
			confirmButtonText: "Sí, cerrar sesión",
			cancelButtonText: "Cancelar",
			background: "#1A1A1D",
			color: "#FFFFFF",
		}).then((result) => {
			if (result.isConfirmed) {
				sessionStorage.clear();

				Swal.fire({
					title: `¡Hasta luego, ${userName || "amigo"}! 👋`,
					text: "Has cerrado sesión correctamente.",
					icon: "success",
					confirmButtonColor: "#FF2E63",
					background: "#1A1A1D",
					color: "#FFFFFF",
				}).then(() => {
					navigate("/loginform");
				});
			}
		});
	};

	return (
		<header>
			<nav className="px-4 py-3" style={{ backgroundColor: "#FF2E63", backdropFilter: "blur(6px)" }}>
				<div className="container">
					<div className="row align-items-center">
						{/* Logo del sitio - ahora no clickeable */}
						<div className="col-12 col-md-6 text-center text-md-start mb-3 mb-md-0">
							<div className="navbar-brand text-black h3 mb-0">
								<h2>ASAD-APP</h2>
							</div>
						</div>

						{/* Botones de navegación */}
						<div className="col-12 col-md-6 d-flex justify-content-center justify-content-md-end gap-2">

							{/* About Us (oculto en páginas específicas) */}
							{!hideAboutUsButton && (
								<Link to={isAboutPage ? "/" : "/aboutus"}>
									<button className="btn btn-outline-black">
										{isAboutPage ? (
											<i className="fas fa-home"></i>
										) : (
											<>
												<i className="fas fa-info-circle me-1"></i> Sobre Nosotros
											</>
										)}
									</button>
								</Link>
							)}

							{/* Home (oculto si estás en Home o si ya iniciaste sesión) */}
							{!isHomePage && !isLoggedIn && (
								<Link to="/">
									<button className="btn btn-outline-black w-100 w-md-auto">
										<i className="fas fa-home me-1"></i> Principal
									</button>
								</Link>
							)}

							{/* Dashboard (solo si está logueado y NO estás ya en dashboard) */}
							{isLoggedIn && !isDashboardPage && (
								<Link to="/dashboard">
									<button className="btn btn-outline-black">
										<i className="fas fa-tachometer-alt me-1"></i> Dashboard
									</button>
								</Link>
							)}

							{/* Mis Invitaciones (solo si está logueado y NO estás ya en esa página) */}
							{isLoggedIn && !isMisInvitacionesPage && (
								<Link to="/mis-invitaciones">
									<button className="btn btn-outline-black">
										<i className="fas fa-envelope-open-text me-1"></i> Mis Invitaciones
									</button>
								</Link>
							)}

							{/* Logout (solo si está logueado) */}
							{isLoggedIn && (
								<button className="btn btn-outline-black w-100 w-md-auto" onClick={handleLogout}>
									<i className="fas fa-sign-out-alt me-1"></i> Cerrar Sesión
								</button>
							)}
						</div>
					</div>
				</div>
			</nav>
		</header>
	);
};
