from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import anthropic
import os
import base64

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"]}})

client = anthropic.Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))

SYSTEM_PROMPT = """Tu es l'assistant virtuel de la CIMR (Caisse Interprofessionnelle Marocaine de Retraite).
Tu aides les affiliés et agents à:
- Comprendre le système de retraite CIMR
- Calculer les cotisations et points de retraite
- Traiter les demandes de liquidation
- Gérer les dossiers de réversion
- Répondre aux questions sur les prestations

Réponds toujours en français de manière claire, professionnelle et concise."""


@app.route('/api/ai/chat', methods=['POST'])
def chat():
    data = request.json or {}
    message = data.get('message') or data.get('query', '')

    if not message:
        return jsonify({'error': 'Message requis'}), 400

    try:
        response = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": message}]
        )
        return jsonify({'response': response.content[0].text})
    except Exception as e:
        return jsonify({'error': str(e), 'response': "Désolé, une erreur s'est produite. Veuillez réessayer."}), 500


@app.route('/api/ai/analyze', methods=['POST'])
def analyze():
    data = request.json or {}
    text = data.get('text', '')

    if not text:
        return jsonify({'error': 'Texte requis'}), 400

    try:
        response = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=1024,
            messages=[{
                "role": "user",
                "content": f"Analyse ce document CIMR et donne un résumé structuré:\n\n{text}"
            }]
        )
        return jsonify({'analysis': response.content[0].text})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/ai/verify-id', methods=['POST'])
def verify_id():
    """Analyse une image de CIN avec Claude Vision."""
    if 'file' not in request.files:
        return jsonify({'status': 'error', 'message': 'Aucun fichier fourni'}), 400

    file = request.files['file']
    if not file.filename:
        return jsonify({'status': 'error', 'message': 'Fichier invalide'}), 400

    try:
        image_data = file.read()
        image_b64 = base64.standard_b64encode(image_data).decode('utf-8')
        media_type = file.content_type or 'image/jpeg'

        response = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=512,
            messages=[{
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": media_type,
                            "data": image_b64
                        }
                    },
                    {
                        "type": "text",
                        "text": "Extrais le numéro CIN (Carte d'Identité Nationale) et le nom complet de cette carte d'identité marocaine. Réponds uniquement en JSON avec: {\"cin\": \"...\", \"full_name\": \"...\"}"
                    }
                ]
            }]
        )

        import json
        text = response.content[0].text.strip()
        # Nettoyer si la réponse contient du markdown
        if '```' in text:
            text = text.split('```')[1]
            if text.startswith('json'):
                text = text[4:]

        extracted = json.loads(text)
        return jsonify({
            'status': 'success',
            'extracted': {
                'cin': extracted.get('cin', ''),
                'full_name': extracted.get('full_name', ''),
                'verified': bool(extracted.get('cin'))
            }
        })

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e),
            'extracted': {'cin': '', 'full_name': '', 'verified': False}
        }), 500


@app.route('/api/ai/simulate', methods=['POST'])
def simulate_pension():
    """Simulation de pension basée sur les paramètres de l'affilié."""
    data = request.json or {}

    try:
        prompt = f"""Calcule une simulation de pension CIMR avec ces données:
- Salaire mensuel moyen: {data.get('salaireMoyen', 'inconnu')} MAD
- Nombre d'années de cotisation: {data.get('anneesCotisation', 'inconnu')}
- Taux de cotisation: {data.get('tauxCotisation', '6%')}
- Points accumulés: {data.get('totalPoints', 'inconnu')}
- Valeur du point: {data.get('valeurPoint', '1.5')} MAD

Donne une estimation de la pension mensuelle et des recommandations."""

        response = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=512,
            messages=[{"role": "user", "content": prompt}]
        )
        return jsonify({'simulation': response.content[0].text})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'cimr-ai-assistant'})


if __name__ == '__main__':
    port = int(os.getenv('PORT', 8000))
    app.run(debug=True, port=port, host='0.0.0.0')
