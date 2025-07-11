from flask import jsonify, url_for
from flask_mail import Mail, Message
import os

# ✅ Instancia global de Flask-Mail
mail = Mail()

class APIException(Exception):
    status_code = 400

    def __init__(self, message, status_code=None, payload=None):
        Exception.__init__(self)
        self.message = message
        if status_code is not None:
            self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        rv = dict(self.payload or ())
        rv['message'] = self.message
        return rv

def has_no_empty_params(rule):
    defaults = rule.defaults if rule.defaults is not None else ()
    arguments = rule.arguments if rule.arguments is not None else ()
    return len(defaults) >= len(arguments)

def generate_sitemap(app):
    links = ['/admin/']
    for rule in app.url_map.iter_rules():
        if "GET" in rule.methods and has_no_empty_params(rule):
            url = url_for(rule.endpoint, **(rule.defaults or {}))
            if "/admin/" not in url:
                links.append(url)

    links_html = "".join(["<li><a href='" + y + "'>" + y + "</a></li>" for y in links])
    return f"""
        <div style="text-align: center;">
        <img style="max-height: 80px" src='https://storage.googleapis.com/breathecode/boilerplates/rigo-baby.jpeg' />
        <h1>Rigo welcomes you to your API!!</h1>
        <p>API HOST: <script>document.write('<input style="padding: 5px; width: 300px" type="text" value="'+window.location.href+'" />');</script></p>
        <p>Start working on your project by following the <a href="https://start.4geeksacademy.com/starters/full-stack" target="_blank">Quick Start</a></p>
        <p>Remember to specify a real endpoint path like: </p>
        <ul style="text-align: left;">{links_html}</ul></div>
    """

def send_invitation_email(receiver_email, event_name):
    frontend_url = os.getenv("FRONTEND_URL", "https://tu-frontend.com")
    invitation_link = f"{frontend_url}/mis-invitaciones"

    subject = f"¡Estás invitado a {event_name}!"
    html_body = f"""
    <h2>Has sido invitado al evento: {event_name}</h2>
    <p>Para ver los detalles y responder a la invitación, hacé clic aquí:</p>
    <a href="{invitation_link}">Ver invitación</a>
    """

    msg = Message(subject, recipients=[receiver_email], html=html_body)

    try:
        mail.send(msg)
        print(f"✔️ Invitación enviada a {receiver_email}")
    except Exception as e:
        print(f"❌ Error al enviar invitación a {receiver_email}: {e}")
