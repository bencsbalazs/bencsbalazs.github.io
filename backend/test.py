from urllib import request
from flask import Flask, request as flask_request, jsonify
from generator import generate_content
import os

if "GEMINI_API_KEY" not in os.environ:
    print("WARNING: Missing Gemini API key!")

app = Flask(__name__)


@app.route("/gemini_query", methods=["POST", "OPTIONS"])
def handle_gemini_request():
    result = generate_content(flask_request)
    body, status_code, headers = result
    if isinstance(body, str):
        response = app.response_class(
            response=body,
            status=status_code,
            mimetype="application/json",  # JSON body esetén
        )
    elif isinstance(body, dict):
        response = jsonify(body)
        response.status_code = status_code
    else:
        response = app.response_class(response=body, status=status_code)

    for key, value in headers.items():
        response.headers[key] = value

    return response


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=8080)
