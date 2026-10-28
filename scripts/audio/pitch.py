# 基频中位数（Hz）：python3 pitch.py 音频文件。逐帧自相关，只算有声的帧
import subprocess, sys
import numpy as np
sr = 16000
raw = subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-i", sys.argv[1], "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"], capture_output=True).stdout
x = np.frombuffer(raw, dtype=np.float32)
f0 = []
for s in range(0, len(x) - 1024, 256):
    w = x[s:s + 1024] * np.hanning(1024)
    if np.sqrt(np.mean(w ** 2)) < 0.01:
        continue
    ac = np.correlate(w, w, "full")[1023:]
    lo, hi = sr // 600, sr // 80
    lag = lo + np.argmax(ac[lo:hi])
    if ac[lag] > 0.4 * ac[0]:
        f0.append(sr / lag)
print(f"中位基频 {np.median(f0):.0f} Hz（{len(f0)} 帧）" if f0 else "测不出")
