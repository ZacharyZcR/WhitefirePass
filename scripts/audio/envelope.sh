#!/bin/bash
# 每 N 秒的平均响度，看配乐的起伏：bash scripts/audio/envelope.sh 文件 [N=5]
n=${2:-5}
ffmpeg -i "$1" -af "aresample=44100,asetnsamples=$((44100*n)),astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.RMS_level" -f null - 2>&1 \
 | grep -o 'RMS_level=[-0-9.inf]*' | cut -d= -f2 | awk -v n=$n '{printf "%3ds %6.1f dB\n", (NR-1)*n, $1}'
