from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from flask import request, jsonify
from flask_mail import Message
from .models import db, User, Evento, Invitacion, Gasto, Participante, Tarea
from datetime import timedelta
import os
from itsdangerous import URLSafeTimedSerializer
from flask import current_app
import requests
from dotenv import load_dotenv
from .utils import send_invitation_email
from flask import url_for

load_dotenv()

MAPBOX_ACCESS_TOKEN = os.getenv("MAPBOX_ACCESS_TOKEN")
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")

api = Blueprint('api', __name__)


def geocode_address(address):
    access_token = MAPBOX_ACCESS_TOKEN
    print("== GEOCODING ==")
    print("Address:", address)
    print("Token (last 4 chars):",
          access_token[-4:] if access_token else "Ninguno")
    url = f"https://api.mapbox.com/geocoding/v5/mapbox.places/{address}.json"
    params = {
        "access_token": access_token,
        "limit": 1,
        "language": "es"
    }
    response = requests.get(url, params=params)

    print("Status code:", response.status_code)
    print("Response:", response.text[:300])  # Para no saturar la consola

    if response.status_code == 200:
        data = response.json()
        if data['features']:
            lng, lat = data['features'][0]['center']
            return lat, lng
        print("== Geocoding falló")
    return None, None


def token_required(func):
    @jwt_required()
    def wrapper(*args, **kwargs):
        current_user_id = get_jwt_identity()
        if current_user_id is None:
            return jsonify({"message": "Token inválido o expirado"}), 401
        try:
            current_user_id = int(current_user_id)
        except ValueError:
            return jsonify({"message": "ID de usuario inválido en token"}), 401

        return func(current_user_id, *args, **kwargs)
    wrapper.__name__ = func.__name__
    return wrapper

def es_creador_evento(user_id, evento_id):
    # Retorna True si user_id es creador del evento
    evento = Evento.query.get(evento_id)
    return evento and evento.creador_id == user_id

def es_participante_evento(user_id, evento_id):
    # Retorna True si user_id es participante del evento (incluye creador)
    # Suponiendo que tienes un modelo Participante con user_id y evento_id
    if es_creador_evento(user_id, evento_id):
        return True
    participante = Participante.query.filter_by(user_id=user_id, evento_id=evento_id).first()
    return participante is not None

def puede_modificar_tarea(user_id, tarea_id):
    # Retorna True si user_id puede modificar la tarea
    # Puede modificar si es creador del evento o si la tarea fue creada por él
    tarea = Tarea.query.get(tarea_id)
    if not tarea:
        return False
    if es_creador_evento(user_id, tarea.evento_id):
        return True
    return tarea.asignado_a == obtener_mail_usuario(user_id)  # Asumiendo que asignado_a guarda email

def obtener_mail_usuario(user_id):
    usuario = Usuario.query.get(user_id)
    return usuario.email if usuario else None


# ------------------ AUTH ------------------

# Ruta para registrar un nuevo usuario. Recibe email, password y nombre. Valida campos, verifica si el usuario ya existe,
# hashea la contraseña y crea el usuario en la base de datos.


@api.route('/signup', methods=['POST'])
def signup():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    nombre = data.get('nombre')

    if not email or not password or not nombre:
        return jsonify({"message": "Faltan campos obligatorios"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"message": "El usuario ya existe"}), 400

    hashed_password = generate_password_hash(password)
    new_user = User(email=email, password=hashed_password, nombre=nombre)

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "Usuario creado exitosamente"}), 201


# Ruta para login. Recibe email y password, verifica credenciales y devuelve un JWT (access token) si son correctas.
@api.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password, password):
        return jsonify({"message": "Credenciales inválidas"}), 401

    access_token = create_access_token(identity=str(user.id))
    return jsonify({"access_token": access_token, "user": user.serialize()})


# ------------------ USUARIOS ------------------

# Ruta para obtener todos los usuarios registrados. Requiere token válido.
@api.route('/usuarios', methods=['GET'])
@token_required
def obtener_usuarios(current_user_id):
    usuarios = User.query.all()
    return jsonify([usuario.serialize() for usuario in usuarios])


# ------------------ EVENTOS ------------------

# Ruta para obtener todos los eventos creados por un usuario específico. Solo puede acceder el propio usuario.
@api.route('/<int:user_id>/eventos', methods=['GET'])
@token_required
def obtener_eventos_usuario(current_user_id, user_id):
    if current_user_id != user_id:
        return jsonify({"message": "No autorizado"}), 403
    eventos = Evento.query.filter_by(creador_id=user_id).all()
    return jsonify([evento.serialize() for evento in eventos]), 200

# Ruta para obtener un evento específico. Permite acceso al creador, participantes o invitados.


@api.route('/eventos/<int:evento_id>', methods=['GET'])
@jwt_required()
def get_evento_individual(evento_id):
    current_user_id = get_jwt_identity()
    # Buscar el evento
    evento = Evento.query.filter_by(id=evento_id).first()
    if not evento:
        return jsonify({"message": "Evento no encontrado"}), 404
    # Verificar si el usuario tiene permisos de acceso
    es_creador = evento.creador_id == current_user_id
    es_participante = Participante.query.filter_by(
        evento_id=evento_id, usuario_id=current_user_id
    ).first() is not None
    usuario = User.query.get(current_user_id)
    es_invitado = False
    if usuario:
        es_invitado = Invitacion.query.filter(
            Invitacion.evento_id == evento_id,
            ((Invitacion.usuario_id == current_user_id)
             | (Invitacion.email == usuario.email))
        ).first() is not None
    if not (es_creador or es_participante or es_invitado):
        return jsonify({"message": "No autorizado para ver este evento"}), 403
    return jsonify(evento.serialize()), 200

# Ruta para obtener un evento específico de un usuario. Solo puede acceder el propio usuario.


@api.route('/<int:user_id>/eventos/<int:evento_id>', methods=['GET'])
@jwt_required()
def get_evento(user_id, evento_id):
    current_user_id = get_jwt_identity()

    if str(current_user_id) != str(user_id):
        return jsonify({"message": "No autorizado"}), 403

    # Buscar el evento
    evento = Evento.query.filter_by(id=evento_id).first()
    if not evento:
        return jsonify({"message": "Evento no encontrado"}), 404

    # Verificar permisos:
    es_creador = (evento.creador_id == current_user_id)
    es_participante = Participante.query.filter_by(
        evento_id=evento_id, usuario_id=current_user_id).first() is not None

    usuario = User.query.get(current_user_id)
    es_invitado = False
    if usuario:
        es_invitado = Invitacion.query.filter(
            Invitacion.evento_id == evento_id,
            ((Invitacion.usuario_id == current_user_id)
             | (Invitacion.email == usuario.email))
        ).first() is not None

    if not (es_creador or es_participante or es_invitado):
        return jsonify({"message": "No autorizado para ver este evento"}), 403

    return jsonify(evento.serialize()), 200


# Ruta para obtener todas las tareas asignadas a un usuario específico. Solo puede acceder el propio usuario.
@api.route('/<int:user_id>/tareas', methods=['GET'])
@token_required
def obtener_tareas_usuario(current_user_id, user_id):
    if current_user_id != user_id:
        return jsonify({"message": "No autorizado"}), 403
    tareas = Tarea.query.filter_by(asignado_a=user_id).all()
    return jsonify([tarea.serialize() for tarea in tareas]), 200

# Ruta para crear un nuevo evento. Solo puede acceder el propio usuario.


@api.route('/<int:user_id>/eventos', methods=['POST'])
@token_required
def crear_evento(current_user_id, user_id):
    if current_user_id != user_id:
        return jsonify({"message": "No autorizado"}), 403

    data = request.json
    nombre = data.get('nombre')
    descripcion = data.get('descripcion')
    fecha_str = data.get('fecha')
    ubicacion = data.get('ubicacion')
    direccion = data.get('direccion')
    acepta_colaboradores = data.get('acepta_colaboradores', True)
    invitados = data.get('invitados')
    max_invitados = data.get('max_invitados')
    tipo_actividad = data.get('tipo_actividad')
    vestimenta = data.get('vestimenta')
    servicios = data.get('servicios')
    recursos = data.get('recursos')

    if not nombre or not fecha_str or not ubicacion:
        return jsonify({"message": "Nombre, fecha y ubicación son obligatorios"}), 400

    try:
        fecha = datetime.fromisoformat(fecha_str)
    except ValueError:
        return jsonify({"message": "Formato de fecha inválido. Usa YYYY-MM-DDTHH:MM:SS"}), 400

    if max_invitados is not None:
        try:
            max_invitados = int(max_invitados)
        except (ValueError, TypeError):
            return jsonify({"message": "max_invitados debe ser un número entero"}), 400

    nuevo_evento = Evento(
        nombre=nombre,
        descripcion=descripcion,
        fecha=fecha,
        ubicacion=ubicacion,
        direccion=direccion,
        acepta_colaboradores=acepta_colaboradores,
        invitados=invitados,
        max_invitados=max_invitados,
        tipo_actividad=tipo_actividad,
        vestimenta=vestimenta,
        servicios=servicios,
        recursos=recursos,
        creador_id=user_id
    )

    db.session.add(nuevo_evento)
    db.session.commit()

    # Geocodificar dirección (prioriza direccion, si no existe usa ubicacion)
    addr_for_geocode = direccion if direccion else ubicacion
    lat, lng = geocode_address(addr_for_geocode)
    if lat and lng:
        nuevo_evento.latitud = lat
        nuevo_evento.longitud = lng
        db.session.commit()

    # Agregar creador como participante aceptado
    nuevo_participante = Participante(
        evento_id=nuevo_evento.id,
        usuario_id=user_id,
        aceptado=True
    )
    db.session.add(nuevo_participante)

    if invitados:
        for correo in invitados:
            usuario = User.query.filter_by(email=correo).first()
            nueva_invitacion = Invitacion(
                evento_id=nuevo_evento.id,
                email=correo,
                estado="pendiente",
                usuario_id=usuario.id if usuario else None
            )
            db.session.add(nueva_invitacion)

    db.session.commit()

    return jsonify({
        "message": "Evento creado exitosamente",
        "evento": nuevo_evento.serialize()
    }), 201


# Ruta para modificar un evento existente. Solo el creador del evento puede modificarlo.
@api.route('/<int:user_id>/eventos/<int:evento_id>', methods=['PUT'])
@token_required
def actualizar_evento(current_user_id, user_id, evento_id):
    if str(current_user_id) != str(user_id):
        return jsonify({"message": "No autorizado"}), 403

    evento = Evento.query.filter_by(id=evento_id, creador_id=user_id).first()
    if not evento:
        return jsonify({"message": "Evento no encontrado"}), 404

    data = request.json

    nombre = data.get('nombre')
    descripcion = data.get('descripcion')
    fecha_str = data.get('fecha')
    ubicacion = data.get('ubicacion')
    direccion = data.get('direccion')
    acepta_colaboradores = data.get('acepta_colaboradores')
    invitados = data.get('invitados')
    max_invitados = data.get('max_invitados')
    tipo_actividad = data.get('tipo_actividad')
    vestimenta = data.get('vestimenta')
    servicios = data.get('servicios')
    recursos = data.get('recursos')

    if nombre is not None:
        evento.nombre = nombre
    if descripcion is not None:
        evento.descripcion = descripcion
    if fecha_str is not None:
        try:
            evento.fecha = datetime.fromisoformat(fecha_str)
        except ValueError:
            return jsonify({"message": "Formato de fecha inválido. Usa YYYY-MM-DDTHH:MM:SS"}), 400
    if ubicacion is not None:
        evento.ubicacion = ubicacion
    if direccion is not None:
        evento.direccion = direccion
    if acepta_colaboradores is not None:
        evento.acepta_colaboradores = bool(acepta_colaboradores)
    if invitados is not None:
        evento.invitados = invitados
    if max_invitados is not None:
        try:
            evento.max_invitados = int(max_invitados)
        except (ValueError, TypeError):
            return jsonify({"message": "max_invitados debe ser un número entero"}), 400
    if tipo_actividad is not None:
        evento.tipo_actividad = tipo_actividad
    if vestimenta is not None:
        evento.vestimenta = vestimenta
    if servicios is not None:
        evento.servicios = servicios
    if recursos is not None:
        evento.recursos = recursos

    db.session.commit()

    # Geocodificar dirección (prioriza direccion, si no existe usa ubicacion)
    addr_for_geocode = evento.direccion if evento.direccion else evento.ubicacion
    lat, lng = geocode_address(addr_for_geocode)
    if lat and lng:
        evento.latitud = lat
        evento.longitud = lng
        db.session.commit()

    return jsonify(evento.serialize()), 200

# Ruta para eliminar un evento específico. Solo el creador del evento puede eliminarlo.
@api.route('/<int:user_id>/eventos/<int:evento_id>', methods=['DELETE'])
@token_required
def eliminar_evento(current_user_id, user_id, evento_id):
    if current_user_id != user_id:
        return jsonify({"message": "No autorizado"}), 403

    evento = Evento.query.get(evento_id)
    if not evento or evento.creador_id != user_id:
        return jsonify({"message": "Evento no encontrado o sin permiso"}), 404

    try:
        db.session.delete(evento)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error eliminando evento", "error": str(e)}), 500

    return jsonify({"message": "Evento eliminado exitosamente"}), 200


# Ruta para obtener todos los gastos de un usuario en un evento específico.
# Solo puede acceder el propio usuario.
@api.route('/<int:user_id>/<int:evento_id>/gastos', methods=['GET'])
@token_required
def obtener_gastos_evento_usuario(current_user_id, user_id, evento_id):
    if current_user_id != user_id:
        return jsonify({"message": "No autorizado"}), 403

    evento = Evento.query.get(evento_id)
    if not evento:
        return jsonify({"message": "Evento no encontrado"}), 404

    gastos = Gasto.query.filter_by(
        usuario_id=user_id, evento_id=evento_id).all()
    return jsonify([g.serialize() for g in gastos]), 200


# Ruta para eliminar un gasto específico de un usuario en un evento. Solo el propio usuario puede eliminarlo.
@api.route('/<int:user_id>/<int:evento_id>/gastos/<int:gasto_id>', methods=['DELETE'])
@token_required
def eliminar_gasto(current_user_id, user_id, evento_id, gasto_id):
    if current_user_id != user_id:
        return jsonify({"message": "No autorizado"}), 403

    gasto = Gasto.query.filter_by(
        id=gasto_id, usuario_id=user_id, evento_id=evento_id).first()
    if not gasto:
        return jsonify({"message": "Gasto no encontrado"}), 404
    db.session.delete(gasto)
    db.session.commit()
    return jsonify({"message": "Gasto eliminado"}), 200

# ------------------ INVITACIONES ------------------

# Ruta para obtener todas las invitaciones que un usuario ha recibido.
# Ruta se modifica para incluir la info del evento para la pagina Mis Invitaciones.


@api.route('/<int:user_id>/invitaciones', methods=['GET'])
@token_required
def obtener_invitaciones_usuario(current_user_id, user_id):
    if current_user_id != user_id:
        return jsonify({"message": "No autorizado"}), 403

    usuario = User.query.get(user_id)
    if not usuario:
        return jsonify({"message": "Usuario no encontrado"}), 404

    invitaciones = Invitacion.query.filter(
        (Invitacion.usuario_id == user_id) | (
            Invitacion.email == usuario.email)
    ).all()

    resultado = []
    for inv in invitaciones:
        invitacion_serializada = inv.serialize()
        if inv.evento:
            evento = inv.evento
            invitacion_serializada["evento"] = {
                "nombre": evento.nombre,
                "ubicacion": evento.ubicacion,
                "fecha": evento.fecha.isoformat() if evento.fecha else None
            }
        resultado.append(invitacion_serializada)

    return jsonify(resultado), 200

# Ruta para obtener todas las invitaciones de un evento específico.
@api.route('/<int:user_id>/eventos/<int:evento_id>/invitaciones', methods=['GET'])
@token_required
def obtener_invitaciones_evento(current_user_id, user_id, evento_id):
    if current_user_id != user_id:
        return jsonify({"message": "No autorizado"}), 403

    evento = Evento.query.get(evento_id)
    if not evento:
        return jsonify({"message": "Evento no encontrado"}), 404

    # Permitimos acceso si es creador
    if evento.creador_id == user_id:
        invitaciones = Invitacion.query.filter_by(evento_id=evento_id).all()
        return jsonify([inv.serialize() for inv in invitaciones]), 200

    # Si no es creador, verificamos si es participante
    participante = Participante.query.filter_by(evento_id=evento_id, usuario_id=user_id).first()
    if participante:
        invitaciones = Invitacion.query.filter_by(evento_id=evento_id).all()
        return jsonify([inv.serialize() for inv in invitaciones]), 200

    # Si no es creador ni participante, denegamos acceso
    return jsonify({"message": "No autorizado"}), 403



# Ruta para agregar múltiples invitaciones a un evento. Requiere lista de emails y valida permisos.
@api.route('/<int:user_id>/eventos/<int:evento_id>/invitaciones', methods=['POST'])
@token_required
def agregar_invitaciones(current_user_id, user_id, evento_id):
    if current_user_id != user_id:
        return jsonify({"message": "No autorizado"}), 403

    data = request.json
    emails = data.get('emails', [])
    if not emails or not isinstance(emails, list):
        return jsonify({"message": "Lista de emails inválida"}), 400

    evento = Evento.query.get(evento_id)
    if not evento:
        return jsonify({"message": "Evento no encontrado"}), 404

    if evento.creador_id != user_id:
        return jsonify({"message": "No autorizado"}), 403

    nuevas_invitaciones = []
    for email in emails:
        invitacion = Invitacion(
            evento_id=evento_id,
            email=email,
            estado="pendiente"
        )
        db.session.add(invitacion)
        nuevas_invitaciones.append(invitacion)

    db.session.commit()

    # Enviar mails después de commit
    for invitacion in nuevas_invitaciones:
        send_invitation_email(invitacion.email, evento.nombre)

    return jsonify([inv.serialize() for inv in nuevas_invitaciones]), 201


# Ruta para crear una invitación a un usuario a un evento. Valida permisos, existencia de evento e invitado.


@api.route('/<int:user_id>/invitaciones', methods=['POST'])
@token_required
def crear_invitacion(current_user_id, user_id):
    if current_user_id != user_id:
        return jsonify({"message": "No autorizado"}), 403

    data = request.json
    invitado_id = data.get('invitado_id')
    evento_id = data.get('evento_id')

    if not invitado_id or not evento_id:
        return jsonify({"message": "Faltan campos obligatorios"}), 400

    evento = Evento.query.get(evento_id)
    if not evento:
        return jsonify({"message": "Evento no encontrado"}), 404

    invitado = User.query.get(invitado_id)
    if not invitado:
        return jsonify({"message": "Usuario invitado no encontrado"}), 404

    nueva_invitacion = Invitacion(
        invitado_id=invitado_id, evento_id=evento_id)

    db.session.add(nueva_invitacion)
    db.session.commit()

    return jsonify(nueva_invitacion.serialize()), 201

# Ruta para obtener un usuario por su email. Permite buscar usuarios por email.


@api.route('/usuarios/email/<string:email>', methods=['GET'])
@token_required
def buscar_usuario_por_email(current_user_id, email):
    usuario = User.query.filter_by(email=email).first()
    if not usuario:
        return jsonify({"message": "Usuario no encontrado"}), 404
    return jsonify({"id": usuario.id, "email": usuario.email}), 200


# Ruta para eliminar una invitación específica.
@api.route('/<int:user_id>/invitaciones/<int:invitacion_id>', methods=['DELETE'])
@token_required
def eliminar_invitacion(current_user_id, user_id, invitacion_id):
    if current_user_id != user_id:
        return jsonify({"message": "No autorizado"}), 403

    invitacion = Invitacion.query.filter_by(
        id=invitacion_id, invitado_id=user_id).first()
    if not invitacion:
        return jsonify({"message": "Invitación no encontrada"}), 404

    db.session.delete(invitacion)
    db.session.commit()

    return jsonify({"message": "Invitación eliminada exitosamente"}), 200


# ------------------ PARTICIPANTES ------------------

# Ruta para obtener todos los participantes de un evento específico.
@api.route('/<int:evento_id>/participantes', methods=['GET'])
@token_required
def obtener_participantes_evento(current_user_id, evento_id):
    participantes = Participante.query.filter_by(evento_id=evento_id).all()
    return jsonify([p.serialize() for p in participantes]), 200

# Ruta para obtener todos los eventos en los que un usuario es participante
@api.route('/usuarios/<int:usuario_id>/eventos-participados', methods=['GET'])
@token_required
def obtener_eventos_donde_participa(current_user_id, usuario_id):
    if current_user_id != usuario_id:
        return jsonify({"message": "No autorizado"}), 403
    participantes = Participante.query.filter_by(usuario_id=usuario_id).all()
    eventos = [p.evento.serialize() for p in participantes if p.evento]
    return jsonify(eventos), 200

# Ruta para agregar un participante a un evento. Requiere datos: usuario_id y evento_id.
@api.route('/<int:evento_id>/participantes', methods=['POST'])
@token_required
def agregar_participante_evento(current_user_id, evento_id):
    data = request.json
    usuario_id = data.get('usuario_id')

    if not usuario_id:
        return jsonify({"message": "Usuario ID es obligatorio"}), 400

    participante_existente = Participante.query.filter_by(
        evento_id=evento_id, usuario_id=usuario_id).first()
    if participante_existente:
        return jsonify({"message": "El usuario ya es participante"}), 400

    participante = Participante(evento_id=evento_id, usuario_id=usuario_id)
    db.session.add(participante)
    db.session.commit()

    return jsonify(participante.serialize()), 201


# Ruta para eliminar un participante de un evento.
@api.route('/<int:evento_id>/participantes/<int:participante_id>', methods=['DELETE'])
@token_required
def eliminar_participante_evento(current_user_id, evento_id, participante_id):
    participante = Participante.query.filter_by(
        id=participante_id, evento_id=evento_id).first()
    if not participante:
        return jsonify({"message": "Participante no encontrado"}), 404

    db.session.delete(participante)
    db.session.commit()

    return jsonify({"message": "Participante eliminado exitosamente"}), 200


# ------------------ TAREAS ------------------

# Ruta para obtener todas las tareas asignadas a un usuario en un evento específico.
@api.route('/<int:user_id>/<int:evento_id>/tareas', methods=['GET'])
@token_required
def obtener_tareas_usuario_evento(current_user_id, user_id, evento_id):
    if current_user_id != user_id:
        return jsonify({"message": "No autorizado"}), 403

    tareas = Tarea.query.filter_by(
        asignado_a=user_id, evento_id=evento_id).all()
    return jsonify([t.serialize() for t in tareas]), 200

# Ruta para obtener todas las tareas de un evento especifico. Tienen acceso el creador del evento y los participantes.


@api.route('/eventos/<int:evento_id>/tareas', methods=['GET'])
@token_required
def obtener_tareas_evento(current_user_id, evento_id):
    evento = Evento.query.get(evento_id)
    if not evento:
        return jsonify({"message": "Evento no encontrado"}), 404

    es_creador = (evento.creador_id == current_user_id)
    es_participante = Participante.query.filter_by(
        evento_id=evento_id, usuario_id=current_user_id).first() is not None

    if not (es_creador or es_participante):
        return jsonify({"message": "No autorizado para ver las tareas de este evento"}), 403

    tareas = Tarea.query.filter_by(evento_id=evento_id).all()
    return jsonify([t.serialize() for t in tareas]), 200


# Ruta para crear una tarea para un usuario en un evento. Valida campos obligatorios.
@api.route('/<int:user_id>/<int:evento_id>/tareas', methods=['POST'])
@token_required
def crear_tarea_usuario_evento(current_user_id, user_id, evento_id):
    if current_user_id != user_id:
        return jsonify({"message": "No autorizado"}), 403

    if not es_participante_evento(user_id, evento_id):
        return jsonify({"message": "No es participante del evento"}), 403

    data = request.json
    descripcion = data.get('descripcion')
    asignado_a = data.get('asignado_a')  # puede ser email u None

    if not descripcion:
        return jsonify({"message": "Descripción es obligatoria"}), 400

    # Si no asignan, asignamos al usuario que crea la tarea
    if not asignado_a:
        asignado_a = obtener_mail_usuario(user_id)

    # Opcional: validar que asignado_a sea un participante válido
    if asignado_a != obtener_mail_usuario(user_id):
        # Si asignado a otro usuario, chequeamos que ese mail pertenezca a un participante
        participante_mail_list = [p.email for p in obtener_participantes_evento(evento_id)]
        if asignado_a not in participante_mail_list:
            return jsonify({"message": "Usuario asignado no es participante"}), 400

    tarea = Tarea(
        descripcion=descripcion,
        completada=False,
        asignado_a=asignado_a,
        evento_id=evento_id
    )

    db.session.add(tarea)
    db.session.commit()

    return jsonify(tarea.serialize()), 201

# Ruta para completar una tarea específica. Solo el asignado puede completarla.
@api.route('/<int:user_id>/<int:evento_id>/tareas/<int:tarea_id>/completar', methods=['PATCH'])
@token_required
def completar_tarea(current_user_id, user_id, evento_id, tarea_id):
    if current_user_id != user_id:
        return jsonify({"message": "No autorizado"}), 403

    tarea = Tarea.query.filter_by(id=tarea_id, evento_id=evento_id).first()
    if not tarea:
        return jsonify({"message": "Tarea no encontrada"}), 404

    evento = Evento.query.get(evento_id)
    if not evento:
        return jsonify({"message": "Evento no encontrado"}), 404

    if tarea.asignado_a is not None and tarea.asignado_a != user_id and evento.creador_id != user_id:
        return jsonify({"message": "No autorizado para completar esta tarea"}), 403

    tarea.completada = True
    db.session.commit()

    return jsonify(tarea.serialize()), 200



# Ruta para actualizar una tarea existente. Solo el asignado puede actualizarla.
@api.route('/<int:user_id>/<int:evento_id>/tareas/<int:tarea_id>', methods=['PUT'])
@token_required
def actualizar_tarea(current_user_id, user_id, evento_id, tarea_id):
    if current_user_id != user_id:
        return jsonify({"message": "No autorizado"}), 403

    tarea = Tarea.query.filter_by(
        id=tarea_id, asignado_a=user_id, evento_id=evento_id).first()
    if not tarea:
        return jsonify({"message": "Tarea no encontrada"}), 404

    data = request.json
    descripcion = data.get('descripcion')
    estado = data.get('estado')

    if descripcion:
        tarea.descripcion = descripcion
    if estado:
        tarea.estado = estado

    db.session.commit()
    return jsonify(tarea.serialize()), 200

# Ruta para autoasignarse una tarea. Cualquiera puede autoasignarse una tarea si no está asignada a otro usuario.
@api.route('/eventos/<int:evento_id>/tareas/<int:tarea_id>/asignar', methods=['PATCH'])
@jwt_required()
def asignar_tarea(evento_id, tarea_id):
    usuario_id = get_jwt_identity()  # o cómo tengas el usuario logueado

    tarea = Tarea.query.filter_by(id=tarea_id, evento_id=evento_id).first()
    if not tarea:
        return jsonify({"message": "Tarea no encontrada"}), 404

    # Solo puedes asignar tareas sin asignar o si eres creador (lógica que uses)
    if tarea.asignado_a and tarea.asignado_a != usuario_id:
        return jsonify({"message": "Tarea ya asignada a otro usuario"}), 403

    tarea.asignado_a = usuario_id
    db.session.commit()

    return jsonify(tarea.serialize()), 200


# Ruta para eliminar una tarea específica. Solo el asignado puede eliminarla.
@api.route('/<int:user_id>/<int:evento_id>/tareas/<int:tarea_id>', methods=['DELETE'])
@token_required
def eliminar_tarea_propia(current_user_id, user_id, evento_id, tarea_id):
    if current_user_id != user_id:
        return jsonify({"message": "No autorizado"}), 403

    tarea = Tarea.query.filter_by(
        id=tarea_id, asignado_a=user_id, evento_id=evento_id).first()
    if not tarea:
        return jsonify({"message": "Tarea no encontrada"}), 404

    db.session.delete(tarea)
    db.session.commit()
    return jsonify({"message": "Tarea eliminada exitosamente"}), 200


# Ruta para actualizar una invitación específica de un usuario
@api.route('/<int:user_id>/invitaciones/<int:invitacion_id>', methods=['PUT'])
@token_required
def actualizar_invitacion(current_user_id, user_id, invitacion_id):
    if current_user_id != user_id:
        return jsonify({"message": "No autorizado"}), 403

    invitacion = Invitacion.query.filter_by(
        id=invitacion_id, usuario_id=user_id).first()
    if not invitacion:
        return jsonify({"message": "Invitación no encontrada"}), 404
    data = request.json
    invitacion.estado = data.get('estado', invitacion.estado)
    db.session.commit()
    return jsonify(invitacion.serialize()), 200


# Ruta para eliminar una invitación de un evento, solo permitido al creador del evento
@api.route('/eventos/<int:evento_id>/invitaciones/<int:invitacion_id>', methods=['DELETE'])
@token_required
def eliminar_invitacion_evento(current_user_id, evento_id, invitacion_id):
    evento = Evento.query.get(evento_id)
    if not evento:
        return jsonify({"message": "Evento no encontrado"}), 404

    if evento.creador_id != current_user_id:
        return jsonify({"message": "No autorizado"}), 403

    invitacion = Invitacion.query.filter_by(
        id=invitacion_id, evento_id=evento_id).first()
    if not invitacion:
        return jsonify({"message": "Invitación no encontrada"}), 404

    db.session.delete(invitacion)
    db.session.commit()

    return jsonify({"message": "Invitación eliminada correctamente"}), 200

# Ruta para aceptar una invitación a un evento, solo permitido al usuario invitado


@api.route('/eventos/<int:evento_id>/invitacion/aceptar', methods=['POST'])
def aceptar_invitacion(evento_id):
    data = request.json
    email = data.get('email')

    if not email:
        return jsonify({"message": "Email requerido"}), 400

    invitacion = Invitacion.query.filter_by(
        evento_id=evento_id, email=email).first()

    if not invitacion:
        return jsonify({"message": "Invitación no encontrada"}), 404

    # Buscar usuario con ese email
    usuario = User.query.filter_by(email=email).first()

    # Crear participante con usuario_id si existe
    participante = Participante(
        evento_id=evento_id,
        usuario_id=usuario.id if usuario else None,
        aceptado=True
    )

    # Eliminar invitación
    db.session.delete(invitacion)
    # Agregar participante
    db.session.add(participante)
    db.session.commit()

    return jsonify({"message": "Invitación aceptada y participante agregado", "participante": participante.serialize()}), 200

# Ruta para rechazar una invitación a un evento
@api.route('/eventos/<int:evento_id>/invitacion/rechazar', methods=['POST'])
def rechazar_invitacion(evento_id):
    data = request.json
    email = data.get('email')

    if not email:
        return jsonify({"message": "Email requerido"}), 400

    invitacion = Invitacion.query.filter_by(
        evento_id=evento_id, email=email).first()

    if not invitacion:
        return jsonify({"message": "Invitación no encontrada"}), 404

    # Eliminar invitación sin agregar participante
    db.session.delete(invitacion)
    db.session.commit()


    return jsonify({"message": "Invitación rechazada y eliminada"}), 200

# ------------------ PARTICIPANTES ------------------


# Ruta para obtener la lista de participantes de un evento, solo para el usuario autorizado y creador del evento
@api.route('/<int:user_id>/<int:evento_id>/participantes', methods=['GET'])
@token_required
def obtener_participantes(current_user_id, user_id, evento_id):
    if current_user_id != user_id:
        return jsonify({"message": "No autorizado"}), 403

    evento = Evento.query.get(evento_id)
    if not evento:
        return jsonify({"message": "Evento no encontrado"}), 404

    if evento.creador_id != current_user_id:
        return jsonify({"message": "No autorizado"}), 403

    participantes = Participante.query.filter_by(evento_id=evento_id).all()
    return jsonify([p.serialize() for p in participantes]), 200


# Ruta para crear un participante en un evento, validando invitación y usuario autorizado
@api.route('/<int:user_id>/<int:evento_id>/participantes', methods=['POST'])
@token_required
def crear_participante(current_user_id, user_id, evento_id):
    if current_user_id != user_id:
        return jsonify({"message": "No autorizado"}), 403

    existe = Participante.query.filter_by(
        usuario_id=user_id, evento_id=evento_id).first()
    if existe:
        return jsonify({"message": "Este usuario ya es participante del evento"}), 400

    invitacion = Invitacion.query.filter_by(
        usuario_id=user_id, evento_id=evento_id).first()
    if not invitacion:
        return jsonify({"message": "No hay invitación para este evento"}), 400
    if invitacion.estado != "aceptada":
        return jsonify({"message": "La invitación no ha sido aceptada"}), 400

    participante = Participante(usuario_id=user_id, evento_id=evento_id)
    db.session.add(participante)
    db.session.commit()

    return jsonify(participante.serialize()), 201


# Ruta para actualizar la información de un participante específico, solo autorizado para el usuario
@api.route('/<int:user_id>/<int:evento_id>/participantes/<int:participante_id>', methods=['PUT'])
@token_required
def actualizar_participante(current_user_id, user_id, evento_id, participante_id):
    if current_user_id != user_id:
        return jsonify({"message": "No autorizado"}), 403
    participante = Participante.query.filter_by(
        id=participante_id, usuario_id=user_id, evento_id=evento_id).first()
    if not participante:
        return jsonify({"message": "Participante no encontrado"}), 404
    data = request.json
    participante.aceptado = data.get('aceptado', participante.aceptado)
    db.session.commit()
    return jsonify(participante.serialize()), 200


# Ruta para eliminar un participante específico, solo autorizado para el usuario
@api.route('/<int:user_id>/<int:evento_id>/participantes/<int:participante_id>', methods=['DELETE'])
@token_required
def eliminar_participante(current_user_id, user_id, evento_id, participante_id):
    if current_user_id != user_id:
        return jsonify({"message": "No autorizado"}), 403
    participante = Participante.query.filter_by(
        id=participante_id, usuario_id=user_id, evento_id=evento_id).first()
    if not participante:
        return jsonify({"message": "Participante no encontrado"}), 404
    db.session.delete(participante)
    db.session.commit()
    return jsonify({"message": "Participante eliminado"}), 200

# Ruta para que un participante salga de un evento (se elimine de participantes)
@api.route('/eventos/<int:evento_id>/participantes/salir', methods=['DELETE'])
@token_required
def participante_salir_evento(current_user_id, evento_id):
    evento = Evento.query.get(evento_id)
    if not evento:
        return jsonify({"message": "Evento no encontrado"}), 404

    participante = Participante.query.filter_by(evento_id=evento_id, usuario_id=current_user_id).first()
    if not participante:
        return jsonify({"message": "No estás participando en este evento"}), 404

    # No permitimos que el creador se "salga" del evento (opcional)
    if evento.creador_id == current_user_id:
        return jsonify({"message": "El creador no puede salir del evento"}), 403

    db.session.delete(participante)
    db.session.commit()

    return jsonify({"message": "Has salido del evento correctamente"}), 200



# ------------------ TAREAS ------------------


# Ruta para crear una tarea en un evento, solo permitido para el creador o participantes
@api.route('/eventos/<int:evento_id>/tareas', methods=['POST'])
@token_required
def crear_tarea_evento(current_user_id, evento_id):
    # Verificar que el usuario sea creador o participante del evento
    evento = Evento.query.get(evento_id)
    if not evento:
        return jsonify({"message": "Evento no encontrado"}), 404

    # Permitir solo al creador o participantes crear tareas
    usuario_es_creador = (evento.creador_id == current_user_id)
    usuario_es_participante = any(
        p.usuario_id == current_user_id for p in evento.participantes)

    if not (usuario_es_creador or usuario_es_participante):
        return jsonify({"message": "No autorizado"}), 403

    data = request.json
    descripcion = data.get('descripcion')
    asignado_a = data.get('asignado_a')

    if not descripcion:
        return jsonify({"message": "La descripción es obligatoria"}), 400

    # Si asignado_a está presente, validar que el usuario existe (opcional)
    if asignado_a is not None:
        usuario_asignado = User.query.filter_by(id=asignado_a).first()
        if not usuario_asignado:
            return jsonify({"message": "Usuario asignado no encontrado"}), 404

    tarea = Tarea(
        evento_id=evento_id,
        descripcion=descripcion,
        asignado_a=asignado_a  # Puede ser None
    )
    db.session.add(tarea)
    db.session.commit()
    return jsonify(tarea.serialize()), 201

@api.route('/eventos/<int:evento_id>/tareas/<int:tarea_id>/gastos', methods=['POST'])
@jwt_required()
def crear_gasto(evento_id, tarea_id):
    usuario_id = get_jwt_identity()
    data = request.get_json()

    monto = data.get('monto')
    # Quitamos la etiqueta recibida y usamos la descripción de la tarea
    # etiqueta = data.get('etiqueta', 'Gasto tarea')

    if monto is None:
        return jsonify({"message": "Monto es requerido"}), 400

    tarea = Tarea.query.filter_by(id=tarea_id, evento_id=evento_id).first()
    if not tarea:
        return jsonify({"message": "Tarea no encontrada"}), 404

    etiqueta = tarea.descripcion or "Gasto tarea"

    gasto = Gasto(
        monto=monto,
        etiqueta=etiqueta,
        usuario_id=usuario_id,
        evento_id=evento_id,
        tarea_id=tarea_id
    )
    db.session.add(gasto)
    db.session.commit()

    return jsonify(gasto.serialize()), 201

# Ruta para eliminar un gasto específico de un evento especifico.
@api.route('/eventos/<int:evento_id>/gastos/<int:gasto_id>', methods=['DELETE'])
@jwt_required()
def eliminar_gasto_evento(evento_id, gasto_id):
    usuario_id = get_jwt_identity()
    gasto = Gasto.query.filter_by(id=gasto_id, evento_id=evento_id, usuario_id=usuario_id).first()
    if not gasto:
        return jsonify({"message": "Gasto no encontrado"}), 404

    db.session.delete(gasto)
    db.session.commit()

    return jsonify({"message": "Gasto eliminado exitosamente"}), 200


# Ruta para obtener todos los gastos de un evento específico.
@api.route('/eventos/<int:evento_id>/gastos', methods=['GET'])
@jwt_required()
def get_gastos(evento_id):
    gastos = Gasto.query.filter_by(evento_id=evento_id).all()
    gastos_serializados = []
    for g in gastos:
        gasto_dict = g.serialize()
        if g.usuario:  # suponiendo relación usuario
            gasto_dict['usuario_email'] = g.usuario.email
        else:
            gasto_dict['usuario_email'] = "Desconocido"
        gastos_serializados.append(gasto_dict)
    return jsonify(gastos_serializados), 200


# Ruta para marcar una tarea como realizada, opcionalmente asociando un gasto
@api.route('/tareas/<int:tarea_id>/realizar', methods=['PUT'])
@jwt_required()
def marcar_tarea_realizada(tarea_id):
    tarea = db.session.get(Tarea, tarea_id)
    if not tarea:
        return jsonify({"msg": "Tarea no encontrada"}), 404

    data = request.get_json()
    gasto_nombre = data.get("nombre_gasto")
    monto = data.get("monto")

    tarea.completada = True

    # Si hay gasto, lo guardamos
    if gasto_nombre and monto:
        current_user_id = get_jwt_identity()
        nuevo_gasto = Gasto(
            nombre=gasto_nombre,
            monto=monto,
            tarea_id=tarea.id,
            usuario_id=current_user_id
        )
        db.session.add(nuevo_gasto)

    db.session.commit()
    return jsonify({"msg": "Tarea marcada como realizada"}), 200

# Ruta para eliminar una tarea específica, solo permitido para el creador del evento o usuario asignado


@api.route('/tareas/<int:tarea_id>', methods=['DELETE'])
@jwt_required()
def eliminar_tarea(tarea_id):
    tarea = db.session.get(Tarea, tarea_id)
    if not tarea:
        return jsonify({"msg": "Tarea no encontrada"}), 404

    db.session.delete(tarea)
    db.session.commit()
    return jsonify({"msg": "Tarea eliminada"}), 200

# Ruta para actualizar una tarea específica, permitida solo para creador del evento o usuario asignado


@api.route('/<int:user_id>/tareas/<int:tarea_id>', methods=['PUT'])
@token_required
def actualizar_tarea_admin(current_user_id, user_id, tarea_id):
    if current_user_id != user_id:
        return jsonify({"message": "No autorizado"}), 403

    tarea = Tarea.query.filter_by(id=tarea_id).first()
    if not tarea:
        return jsonify({"message": "Tarea no encontrada"}), 404

    # Verificamos si current_user es creador del evento o asignado a la tarea
    if tarea.asignado_a != user_id and tarea.evento.creador_id != user_id:
        return jsonify({"message": "No autorizado para modificar esta tarea"}), 403

    data = request.json
    tarea.descripcion = data.get('descripcion', tarea.descripcion)

    # Opcional: permitir actualizar asignado_a
    if 'asignado_a' in data:
        tarea.asignado_a = data['asignado_a']

    db.session.commit()
    return jsonify(tarea.serialize()), 200


# ------------------ RESTABLECER CONTRASEÑA ------------------

# Utiliza Flask-Mail para enviar un correo de restablecimiento de contraseña.
def generate_reset_token(user_id, expires_sec=1800):
    serializer = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
    return serializer.dumps({"user_id": user_id}, salt='reset-password-salt')

# Verifica el token de restablecimiento de contraseña. Devuelve el ID del usuario si es válido.


def verify_reset_token(token, expires_sec=1800):
    serializer = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
    try:
        data = serializer.loads(
            token, salt='reset-password-salt', max_age=expires_sec)
        return data["user_id"]
    except (SignatureExpired, BadSignature):
        return None

# Ruta para restablecer la contraseña de un usuario. Envía un email con un enlace de restablecimiento.


@api.route('/forgot-password', methods=['POST'])
def forgot_password():
    email = request.json.get("email")
    if not email:
        return jsonify({"error": "Email requerido"}), 400

    user = db.session.query(User).filter_by(email=email).first()
    if not user:
        # No revelamos si el usuario existe o no
        return jsonify({"msg": "Si el email está registrado, recibirás instrucciones"}), 200

    token = generate_reset_token(user.id)
    frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
    reset_url = f"{frontend_url}/reset-password?token={token}"

    msg = Message("Recuperar contraseña", recipients=[email])
    msg.body = f"Para restablecer tu contraseña, visita este enlace:\n{reset_url}\n\nEste enlace expirará en 30 minutos."
    from app import mail
    mail.send(msg)

    return jsonify({"msg": "Email enviado si está registrado"}), 200

# Ruta para restablecer la contraseña de un usuario. Requiere token válido y nueva contraseña.


@api.route('/reset-password/<token>', methods=['POST'])
def reset_password(token):
    data = request.get_json()
    nueva_clave = data.get("password")

    if not nueva_clave:
        return jsonify({"error": "La contraseña es requerida"}), 400

    user_id = verify_reset_token(token)
    if not user_id:
        return jsonify({"error": "Token inválido o expirado"}), 400

    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404

    user.password = generate_password_hash(nueva_clave)
    db.session.commit()

    return jsonify({"msg": "Contraseña actualizada exitosamente"}), 200


# Ruta para solicitar un enlace de restablecimiento de contraseña. Envía un email con el enlace.
@api.route('/request-password-reset', methods=['POST'])
def request_password_reset():
    data = request.get_json()
    email = data.get("email")

    if not email:
        return jsonify({"msg": "Email es requerido"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"msg": "Usuario no encontrado con ese email"}), 404

    # Crear token válido por 15 minutos (ajustable)
    expires = timedelta(minutes=15)
    reset_token = create_access_token(identity=user.id, expires_delta=expires)

    # URL completa para el frontend
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    reset_link = f"{frontend_url}/reset-password/{reset_token}"

    # Aquí normalmente enviarías un correo, pero vamos a imprimirlo o devolverlo
    print("Enlace para restablecer contraseña:", reset_link)

    # Solo para desarrollo. En producción, enviá el link por email.
    return jsonify({"msg": "Si el email está registrado, se envió un enlace", "reset_link": reset_link}), 200


# # Ruta para enviar invitaciones a un evento. Requiere lista de emails y valida permisos.
# @api.route('/api/<int:user_id>/eventos/<int:event_id>/invitaciones', methods=['POST'])
# def agregar_invitaciones(user_id, event_id):
#     data = request.get_json()
#     emails = data.get('emails', [])

#     # Validar que sean correos válidos (opcional pero recomendable)
#     valid_emails = [email.strip() for email in emails if '@' in email]

#     # Lógica para crear invitaciones en base de datos aquí
#     # Por ejemplo:
#     invitaciones_creadas = []
#     for email in valid_emails:
#         invitacion = Invitacion(event_id=event_id, email=email)
#         db.session.add(invitacion)
#         invitaciones_creadas.append(email)

#     db.session.commit()

#     # Enviar emails a cada invitado
#     errores_envio = []
#     evento = Evento.query.get(event_id)
#     for email in invitaciones_creadas:
#         if not enviar_invitacion_email(email, evento):
#             errores_envio.append(email)

#     if errores_envio:
#         return jsonify({
#             "message": f"Invitaciones creadas, pero no se pudieron enviar emails a: {', '.join(errores_envio)}"
#         }), 207  # 207 Multi-Status

#     return jsonify({"message": "Invitaciones creadas y emails enviados correctamente"}), 201