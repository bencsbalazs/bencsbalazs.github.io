from flask import Flask
import os
from google import genai
from google.genai.errors import APIError

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
port = int(os.environ.get("PORT", 8080))
ALLOWED_ORIGIN = "https://bencsbalazs.github.io"

ai = genai.Client()

INSTRUCTIONS_FOR_GEMINI = """
You are now a helpful agent, who tells the user about Balázs Bencs.
Title: Balázs Bencs, Senior Full Stack Engineer, 15 years of experience
Skills: Frontend (HTML5, CSS3, JavaScript, TypeScript, Angular, React, jQuery, Bootstrap, Carbon, Material, Tailwind, WebPack); Backend (Node, Java, Python, Django, Rest API, PHP); Databases (MySQL, MongoDB, Cloudant, PostgreSQL, MariaDB); Cloud & DevOps (Docker, Kubernetes, GitLab CI/CD, Jenkins, Travis CI, AWS, Nginx, Apache); Testing & Quality (Pytest, Jest, Cucumber, SonarQube, Snyk, Black, Ruff); Methodologies (Agile, Scrum, Extreme Programming (XP), TDD, BDD); AI & Automation (ChatGPT API, TensorFlow, PyTorch, Gemini CLI).
"""
app = Flask(__name__)


@app.route("/")
def generate_content(request):
    """
    HTTP Cloud Function, what accepts the post and communicate with gemini model.
    """
    request_origin = request.headers.get("Origin")
    if request_origin and request_origin != ALLOWED_ORIGIN:
        print(f"BIZTONSÁGI HIBA: Tiltott Origin: {request_origin}")
        return ('{"error": "Hozzáférés megtagadva. Tiltott forrás."}', 403, {})
    response_headers = {
        "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    }
    if request.method == "OPTIONS":
        response_headers["Access-Control-Allow-Methods"] = "POST"
        response_headers["Access-Control-Allow-Headers"] = "Content-Type"
        response_headers["Access-Control-Max-Age"] = "3600"
        return ("", 204, response_headers)

    try:
        request_json = request.get_json(silent=True)
        print(request_json)
        if request_json and "prompt" in request_json:
            prompt = request_json["prompt"]
        else:
            return ('{"error": "Missing or invalid prompt in the request body."}', 400, response_headers)

        result = ai.models.generate_content(
            model="gemini-2.5-flash",
            contents=[{"role": "user", "parts": [{"text": prompt}]}],
            config={
                "system_instruction": INSTRUCTIONS_FOR_GEMINI,
            },
        )

        return ({"text": result.text}, 200, response_headers)

    except APIError as e:
        print(f"Error from Gemini model: {e}")
        return ({"error": "Error from Gemini model"}, 500, response_headers)
    except Exception as e:
        print(f"General error: {e}")
        return ({"error": "Internal server error"}, 500, response_headers)


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=port)
