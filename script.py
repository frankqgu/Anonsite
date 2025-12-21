import cv2, json

cap = cv2.VideoCapture('result1761112259.mp4')
frames = []
frame_i = 0
while True:
    ret, frame = cap.read()
    if not ret: break
    if frame_i % 2:  # skip every other frame
        frame_i += 1
        continue
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 80, 150)
    ys, xs = (edges > 0).nonzero()
    pts = [{"x": int(x), "y": int(y)} for x, y in zip(xs[::4], ys[::4])]
    frames.append({
        "w": int(edges.shape[1]),
        "h": int(edges.shape[0]),
        "cx": int(edges.shape[1] / 2),
        "cy": int(edges.shape[0] / 2),
        "points": pts
    })
    frame_i += 1

with open("whiplash_frames.js", "w") as f:
    f.write("export const frames = " + json.dumps(frames) + ";")
print("Saved whiplash_frames.js with", len(frames), "frames")
