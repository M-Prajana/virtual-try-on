#!/usr/bin/env python3
"""
Color analysis script — port of ReStyle/Interface/model.py without Streamlit.
Usage: python3 color_analysis.py <image_path>
Outputs a JSON object to stdout.
"""
import sys
import json
import cv2
import numpy as np
from sklearn.cluster import KMeans
import colorsys


def detect_faces(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    cascade = cv2.CascadeClassifier(
        cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
    )
    return cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5)


def crop_to_face(image, faces):
    if len(faces) == 0:
        return None
    x, y, w, h = faces[0]
    return image[y : y + h, x : x + w]


def detect_colors(image, num_colors=20):
    img = cv2.cvtColor(np.array(image), cv2.COLOR_BGR2RGB)
    img = img.reshape((-1, 3))
    kmeans = KMeans(n_clusters=num_colors, n_init=10, random_state=42)
    kmeans.fit(img)
    colors = kmeans.cluster_centers_

    filtered = []
    for c in colors:
        r, g, b = c
        if not (abs(r - g) < 15 and abs(r - b) < 15 and abs(g - b) < 15):
            filtered.append(tuple(map(int, c)))

    # Pad if we filtered too many neutrals
    rng = np.random.default_rng(42)
    while len(filtered) < num_colors:
        filtered.append(tuple(rng.integers(0, 256, 3).tolist()))

    return filtered[:num_colors]


def rgb_to_hsl(r, g, b):
    h, l, s = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
    return h * 360, s * 100, l * 100


def determine_temperature(hues):
    warm = sum(1 for h in hues if 0 <= h <= 60 or 300 <= h <= 360)
    return "Warm" if warm >= len(hues) / 2 else "Cool"


def determine_depth(lightness_values):
    avg = sum(lightness_values) / len(lightness_values)
    if avg < 20:
        return "Very Dark"
    if avg < 40:
        return "Dark"
    if avg < 60:
        return "Medium"
    if avg < 80:
        return "Light"
    return "Very Light"


def determine_chroma(saturation_values):
    avg = sum(saturation_values) / len(saturation_values)
    if avg < 20:
        return "Low"
    if avg < 40:
        return "Medium"
    return "High"


def map_to_season(hues, lightness_values, saturation_values):
    seasons = {
        "Bright Spring": 0, "True Spring": 0, "Light Spring": 0,
        "Light Summer": 0, "True Summer": 0, "Soft Summer": 0,
        "Soft Autumn": 0, "True Autumn": 0, "Deep Autumn": 0,
        "Deep Winter": 0, "True Winter": 0, "Bright Winter": 0,
    }
    for h, l, s in zip(hues, lightness_values, saturation_values):
        if 0 <= h < 45 or 330 <= h <= 360:
            if s > 50 and l > 50:
                seasons["Bright Spring"] += 1
            elif s > 50:
                seasons["True Spring"] += 1
            else:
                seasons["Light Spring"] += 1
        elif 45 <= h < 170:
            if s <= 50 and l > 50:
                seasons["Light Summer"] += 1
            elif s <= 50:
                seasons["True Summer"] += 1
            else:
                seasons["Soft Summer"] += 1
        elif 170 <= h < 260:
            if s <= 50 and l <= 50:
                seasons["Soft Autumn"] += 1
            elif s > 50 and l <= 50:
                seasons["True Autumn"] += 1
            else:
                seasons["Deep Autumn"] += 1
        elif 260 <= h < 330:
            if s > 50 and l <= 50:
                seasons["Deep Winter"] += 1
            elif s > 50:
                seasons["True Winter"] += 1
            else:
                seasons["Bright Winter"] += 1
    return max(seasons, key=seasons.get)


def recommend_colors(season):
    color_map = {
        "Bright Spring": "red-yellow-blue",
        "True Spring": "yellow-green-blue",
        "Light Spring": "pink-beige-blue",
        "Light Summer": "pastel-blue-green",
        "True Summer": "blue-green-pink",
        "Soft Summer": "grey-blue-green",
        "Soft Autumn": "earth-tone",
        "True Autumn": "orange-brown-green",
        "Deep Autumn": "dark-brown-green",
        "Deep Winter": "black-grey-blue",
        "True Winter": "black-white-red",
        "Bright Winter": "bright-blue-red-white",
    }
    palette_map = {
        "Bright Spring": [[255, 0, 0], [255, 255, 0], [0, 0, 255]],
        "True Spring": [[255, 255, 0], [0, 255, 0], [0, 0, 255]],
        "Light Spring": [[255, 192, 203], [255, 228, 225], [0, 191, 255]],
        "Light Summer": [[173, 216, 230], [144, 238, 144], [152, 251, 152]],
        "True Summer": [[70, 130, 180], [0, 255, 255], [255, 192, 203]],
        "Soft Summer": [[128, 128, 128], [192, 192, 192], [0, 128, 128]],
        "Soft Autumn": [[139, 69, 19], [160, 82, 45], [205, 133, 63]],
        "True Autumn": [[255, 69, 0], [139, 69, 19], [0, 128, 0]],
        "Deep Autumn": [[101, 67, 33], [139, 69, 19], [0, 100, 0]],
        "Deep Winter": [[0, 0, 0], [169, 169, 169], [0, 0, 139]],
        "True Winter": [[0, 0, 0], [255, 255, 255], [255, 0, 0]],
        "Bright Winter": [[0, 0, 255], [255, 0, 0], [255, 255, 255]],
    }

    colors_str = color_map.get(season, "black")
    color_query = "+".join(colors_str.split("-"))
    url = f"https://www.myntra.com/{colors_str}?rawQuery={color_query}"
    palette = palette_map.get(season, [])
    return url, palette


def analyze(image_path):
    image = cv2.imread(image_path)
    if image is None:
        return {"error": "Could not read image"}

    faces = detect_faces(image)
    face_img = crop_to_face(image, faces)

    # Fall back to the full image if no face detected
    if face_img is None:
        face_img = image

    colors = detect_colors(face_img, num_colors=20)
    hsl = [rgb_to_hsl(r, g, b) for r, g, b in colors]
    hues = [h for h, s, l in hsl]
    lightness = [l for h, s, l in hsl]
    saturation = [s for h, s, l in hsl]

    temperature = determine_temperature(hues)
    depth = determine_depth(lightness)
    chroma = determine_chroma(saturation)
    season = map_to_season(hues, lightness, saturation)
    myntra_url, palette = recommend_colors(season)

    return {
        "season": season,
        "temperature": temperature,
        "depth": depth,
        "chroma": chroma,
        "myntra_url": myntra_url,
        "palette": palette,
        "detected_colors": [list(c) for c in colors[:8]],
    }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image path provided"}))
        sys.exit(1)

    result = analyze(sys.argv[1])
    print(json.dumps(result))
