from flask import Flask, request, jsonify, send_from_directory
import os
from flask_cors import CORS 
import cv2
from ultralytics import YOLO

app = Flask(__name__)
CORS(app) 
UPLOAD_FOLDER = 'uploads'
FRAMES_FOLDER = 'frames'
RESULTS_FOLDER = 'inference_results'
ALLOWED_EXTENSIONS = {'mp4', 'avi', 'mov'}

# Setup folders
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(FRAMES_FOLDER, exist_ok=True)
os.makedirs(RESULTS_FOLDER, exist_ok=True)

# Load YOLOv5 model once
model = YOLO("yolov5n.pt")  

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_frames(video_path, output_folder, fps_interval=1):
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    frame_interval = int(fps * fps_interval)
    count = saved = 0

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        if count % frame_interval == 0:
            cv2.imwrite(f"{output_folder}/frame_{saved:04d}.jpg", frame)
            saved += 1
        count += 1
    cap.release()

@app.route('/detect', methods=['POST'])
def detect():
    if 'video' not in request.files:
        return jsonify({'error': 'No video file uploaded'}), 400

    video = request.files['video']
    if not allowed_file(video.filename):
        return jsonify({'error': 'Invalid file type'}), 400

    video_path = os.path.join(UPLOAD_FOLDER, 'input.mp4')
    video.save(video_path)

    for folder in [FRAMES_FOLDER, RESULTS_FOLDER]:
        for f in os.listdir(folder):
            os.remove(os.path.join(folder, f))

    extract_frames(video_path, FRAMES_FOLDER)

    results = []
    num_detections = 0
    total_frames = 0

    for img_name in os.listdir(FRAMES_FOLDER):
        frame_path = os.path.join(FRAMES_FOLDER, img_name)
        result = model(frame_path)
        result[0].save(filename=os.path.join(RESULTS_FOLDER, img_name))
        detections = result[0].boxes.data.cpu().numpy().tolist()

        num_detections += len(detections)
        total_frames += 1

        results.append({
            "frame": img_name,
            "detections": detections,
            "url": f"http://localhost:5000/results/{img_name}"
        })

    accuracy = (num_detections / total_frames) * 100 if total_frames > 0 else 0

    return jsonify({
        "results": results,
        "accuracy": round(accuracy, 1),
        "false_positives": 0,
        "accuracy_gain": 0
    })

@app.route('/results/<filename>')
def get_result_image(filename):
    return send_from_directory(RESULTS_FOLDER, filename)

if __name__ == '__main__':
    app.run(debug=True)
