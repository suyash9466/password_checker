# Password Complexity Checker

## Stack
- **Backend**: Python / Flask
- **Frontend**: HTML + CSS + JS (separate files)
- **Sessions**: Flask server-side sessions track how many checks you've done

## How to run
```bash
pip install -r requirements.txt
python app.py
```
Then open http://127.0.0.1:5000

## Features
- Live feedback as you type (200ms debounce)
- Scores 8 criteria: length tiers, uppercase, lowercase, digits, symbols, no consecutive repeats
- Strength levels: Very Weak → Weak → Moderate → Strong → Very Strong
- Actionable suggestions for improving the password
- Session counter (how many passwords checked this session)
- Show/hide password toggle

## File structure
```
task03_password_checker/
├── app.py               ← Flask backend + scoring logic
├── requirements.txt
├── templates/
│   └── index.html       ← HTML template
└── static/
    ├── css/style.css    ← All styling
    └── js/main.js       ← Frontend logic + fetch calls
```
