#!/bin/bash
# 列出音频的时长和平均响度：bash scripts/audio/probe.sh public/audio/sfx
for f in $(find "$1" -name '*.ogg' | sort); do
  d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f")
  v=$(ffmpeg -i "$f" -af volumedetect -f null - 2>&1 | grep -oE '(mean|max)_volume: [-0-9.]+' | cut -d' ' -f2 | paste -sd/)
  echo "$f ${d:0:5}s ${v}dB"
done
