// Navbar.jsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { AiOutlineUser } from "react-icons/ai"; // Icono de usuario

export const Navbar = () => {
	const location = useLocation();
	const navigate = useNavigate();

	const isHomePage = location.pathname === "/";
	const isAboutPage = location.pathname === "/aboutus";
	const isDashboardPage = location.pathname === "/dashboard";
	const isMisInvitacionesPage = location.pathname === "/mis-invitaciones";

	const hideAboutUsButton = ["/registro", "/aboutus", "/mis-invitaciones"].includes(location.pathname);
	const isLoggedIn = !!sessionStorage.getItem("token");

	// Extraer nombre del usuario desde sessionStorage
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

	const handleLogout = () => {
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
					title: `¡Hasta luego, ${userName || "amigo"}!`,
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
			<nav className="navbar navbar-expand-md px-4 py-3" style={{ backgroundColor: "#FF2E63", backdropFilter: "blur(6px)" }}>
				<div className="container-fluid">
					<div className="d-flex align-items-center">

						{/* Logo del sitio - ahora no clickeable */}
						<div className="navbar-brand text-black h3 mb-0">
							<h2 className="mb-0">ASAD-APP</h2>
						</div>

						{/* Nombre del usuario con icono (solo si está logueado) - Pantallas grandes */}
						{isLoggedIn && (
							<div
								className="d-none d-md-flex align-items-center ms-4"
								style={{
									fontSize: "1.4rem",
									color: "#000000",
									fontWeight: "600",
									fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
								}}
							>
								<div
									style={{
										borderRadius: "50%",
										border: "2px solid black",
										padding: "4px",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										marginRight: "8px",
									}}
								>
									<AiOutlineUser size={24} color="#000" />
								</div>
								Bienvenido, {userName}
							</div>
						)}
					</div>

					{/* Botón hamburguesa para pantallas pequeñas */}
					<button
						className="navbar-toggler"
						type="button"
						data-bs-toggle="collapse"
						data-bs-target="#navbarMenu"
						aria-controls="navbarMenu"
						aria-expanded="false"
						aria-label="Toggle navigation"
					>
						<span className="navbar-toggler-icon"></span>
					</button>

					{/* Botones de navegación */}
					<div className="collapse navbar-collapse justify-content-end mt-3 mt-md-0" id="navbarMenu">
						<div className="d-flex flex-column flex-md-row gap-2 align-items-center">

							{/* About Us (oculto en páginas específicas) */}
							{!hideAboutUsButton && (
								<Link to={isAboutPage ? "/" : "/aboutus"}>
									<button className="btn btn-outline-black w-100 w-md-auto">
										{isAboutPage ? (
											<i className="fas fa-home"></i>
										) : (
											<>
												<i className="fas fa-info-circle me-1"></i> About Us
											</>
										)}
									</button>
								</Link>
							)}

							{/* Home (oculto si estás en Home o si ya iniciaste sesión) */}
							{!isHomePage && !isLoggedIn && (
								<Link to="/">
									<button className="btn btn-outline-black w-100 w-md-auto">
										<i className="fas fa-home me-1"></i> Home
									</button>
								</Link>
							)}

							{/* Dashboard (solo si está logueado y NO estás ya en dashboard) */}
							{isLoggedIn && !isDashboardPage && (
								<Link to="/dashboard">
									<button className="btn btn-outline-black w-100 w-md-auto">
										<i className="fas fa-tachometer-alt me-1"></i> Dashboard
									</button>
								</Link>
							)}

							{/* Mis Invitaciones (solo si está logueado y NO estás ya en esa página) */}
							{isLoggedIn && !isMisInvitacionesPage && (
								<Link to="/mis-invitaciones">
									<button className="btn btn-outline-black w-100 w-md-auto">
										<i className="fas fa-envelope-open-text me-1"></i> Mis Invitaciones
									</button>
								</Link>
							)}

							{/* Logout (solo si está logueado) */}
							{isLoggedIn && (
								<button className="btn btn-outline-black w-100 w-md-auto" onClick={handleLogout}>
									<i className="fas fa-sign-out-alt me-1"></i> Logout
								</button>
							)}
						</div>
					</div>

					{/* Nombre del usuario con icono en pantallas pequeñas */}
					{isLoggedIn && (
						<div
							className="d-block d-md-none text-center mt-3 w-100"
							style={{
								fontSize: "1.2rem",
								color: "#000000",
								fontWeight: "600",
								fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
							}}
						>
							<div
								style={{
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									marginBottom: "4px",
								}}
							>
								<div
									style={{
										borderRadius: "50%",
										border: "2px solid black",
										padding: "4px",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										marginRight: "6px",
									}}
								>
									<AiOutlineUser size={20} color="#000" />
								</div>
							</div>
							Bienvenido, {userName}
						</div>
					)}
				</div>
			</nav>
		</header>
	);
};
