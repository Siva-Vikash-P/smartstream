from flask import Flask, send_from_directory
import os

# Initialize Flask application
app = Flask(__name__)

# Project directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))


# Homepage
@app.route("/")
def home():
    return send_from_directory(BASE_DIR, "index.html")


# CSS
@app.route("/style.css")
def style():
    return send_from_directory(BASE_DIR, "style.css")


# JavaScript
@app.route("/script.js")
def script():
    return send_from_directory(BASE_DIR, "script.js")


# Video files
@app.route("/videos/<path:filename>")
def videos(filename):
    video_folder = os.path.join(BASE_DIR, "videos")
    return send_from_directory(video_folder, filename)


# Run the application
if __name__ == "__main__":
    app.run(debug=True)