
from flask import Flask, render_template, send_from_directory
import os

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "static")
VIDEO_DIR = os.path.join(BASE_DIR, "videos")


# Homepage
@app.route("/")
def home():
    return render_template("index.html")


# CSS
@app.route("/style.css")
def style():
    return send_from_directory(STATIC_DIR, "style.css")


# JavaScript
@app.route("/script.js")
def script():
    return send_from_directory(STATIC_DIR, "script.js")


# Video files
@app.route("/videos/<path:filename>")
def videos(filename):
    return send_from_directory(VIDEO_DIR, filename)


# Start Flask application
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
