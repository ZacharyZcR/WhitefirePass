#!/bin/bash
# 台词的实际时长（解码量出来的，比 ogg 头里的估计准）：bash scripts/audio/durations.sh <manifest 里 f 的前缀筛选，正则>
python3 -c "
import json,sys
d=json.load(open('public/audio/voice/manifest.json'))
for k,l in d['lines'].items():
  for x in l: print(k, x['f'])
" | grep -E "$1" | while read k f; do
  t=$(ffmpeg -nostdin -i "public/audio/voice/$f" -f null - 2>&1 | grep -o 'time=[0-9:.]*' | tail -1 | cut -d= -f2)
  echo "$k $t"
done
