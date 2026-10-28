# 按停顿把一条台词切成几句，逐句给出时长、响度、基频——看语气有没有一句比一句高
# 用法：python3 segments.py 音频文件 [最短停顿秒数=0.35]
import subprocess, sys
import numpy as np
sr = 16000
raw = subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-i", sys.argv[1], "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"], capture_output=True).stdout
x = np.frombuffer(raw, dtype=np.float32)
gap = float(sys.argv[2]) if len(sys.argv) > 2 else 0.35
hop = 160
rms = np.array([np.sqrt(np.mean(x[i:i + 400] ** 2)) for i in range(0, len(x) - 400, hop)])
voiced = rms > 0.02
segs, start, quiet = [], None, 0
for i, v in enumerate(voiced):
    if v:
        if start is None: start = i
        quiet = 0
    elif start is not None:
        quiet += 1
        if quiet * hop / sr >= gap:
            segs.append((start, i - quiet)); start, quiet = None, 0
if start is not None: segs.append((start, len(voiced)))
def f0(seg):
    out = []
    for s in range(0, len(seg) - 1024, 256):
        w = seg[s:s + 1024] * np.hanning(1024)
        if np.sqrt(np.mean(w ** 2)) < 0.01: continue
        ac = np.correlate(w, w, "full")[1023:]
        lag = sr // 600 + np.argmax(ac[sr // 600:sr // 80])
        if ac[lag] > 0.4 * ac[0]: out.append(sr / lag)
    return np.median(out) if out else 0
for a, b in segs:
    seg = x[a * hop:b * hop]
    if len(seg) < sr * 0.3: continue
    print(f"  {a*hop/sr:5.2f}-{b*hop/sr:5.2f}s  {20*np.log10(np.sqrt(np.mean(seg**2))):6.1f} dB  {f0(seg):4.0f} Hz")
