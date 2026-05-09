import re
from flask import Flask, render_template, request, jsonify, session
import secrets

app = Flask(__name__)
app.secret_key = secrets.token_hex(24)

def analyze_password(password):
    checks = {
        "length_8":   len(password) >= 8,
        "length_12":  len(password) >= 12,
        "length_16":  len(password) >= 16,
        "uppercase":  bool(re.search(r'[A-Z]', password)),
        "lowercase":  bool(re.search(r'[a-z]', password)),
        "digits":     bool(re.search(r'\d', password)),
        "special":    bool(re.search(r'[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?`~]', password)),
        "no_spaces":  ' ' not in password,
        "no_repeat":  not re.search(r'(.)\1{2,}', password),
    }

    score = 0
    score += 1 if checks["length_8"] else 0
    score += 1 if checks["length_12"] else 0
    score += 1 if checks["length_16"] else 0
    score += 1 if checks["uppercase"] else 0
    score += 1 if checks["lowercase"] else 0
    score += 1 if checks["digits"] else 0
    score += 1 if checks["special"] else 0
    score += 1 if checks["no_repeat"] else 0

    max_score = 8

    if score <= 2:
        strength = "Very Weak"
        color = "red"
    elif score <= 4:
        strength = "Weak"
        color = "orange"
    elif score <= 5:
        strength = "Moderate"
        color = "yellow"
    elif score <= 6:
        strength = "Strong"
        color = "lightgreen"
    else:
        strength = "Very Strong"
        color = "green"

    tips = []
    if not checks["length_8"]:
        tips.append("Use at least 8 characters")
    if not checks["length_12"]:
        tips.append("Try to reach 12+ characters for better security")
    if not checks["uppercase"]:
        tips.append("Add at least one uppercase letter (A-Z)")
    if not checks["lowercase"]:
        tips.append("Add at least one lowercase letter (a-z)")
    if not checks["digits"]:
        tips.append("Include a number (0-9)")
    if not checks["special"]:
        tips.append("Use a special character like !@#$%^&*")
    if not checks["no_repeat"]:
        tips.append("Avoid repeating the same character 3+ times in a row")

    return {
        "score": score,
        "max_score": max_score,
        "percentage": round((score / max_score) * 100),
        "strength": strength,
        "color": color,
        "checks": checks,
        "tips": tips,
        "length": len(password),
    }

@app.route('/')
def index():
    # track how many checks this session has done
    if 'check_count' not in session:
        session['check_count'] = 0
    return render_template('index.html', check_count=session['check_count'])

@app.route('/check', methods=['POST'])
def check_password():
    data = request.get_json()
    if not data or 'password' not in data:
        return jsonify({"error": "No password provided"}), 400

    password = data['password']

    if len(password) > 256:
        return jsonify({"error": "Password too long (max 256 chars)"}), 400

    result = analyze_password(password)

    session['check_count'] = session.get('check_count', 0) + 1
    session['last_strength'] = result['strength']
    result['session_count'] = session['check_count']

    return jsonify(result)

@app.route('/session-info')
def session_info():
    return jsonify({
        "checks_done": session.get('check_count', 0),
        "last_strength": session.get('last_strength', 'N/A'),
    })

if __name__ == '__main__':
    app.run(debug=True)
