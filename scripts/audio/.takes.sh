#!/bin/bash
D=/mnt/c/Users/29037/AppData/Local/Temp/claude/F--Wolf/f6b96f1d-4815-4e4c-a55f-311fadeca63b/scratchpad/sophia-takes
V=SYjaeawCEiQrxiyl1IWh
node scripts/audio/audition.mjs $D s=$V -- \
 "[quietly] わたくしは、生き延びる。" \
 "[firmly] わたくしは、報酬を手にする。" \
 "[shouting proudly] わたくしは、もう一度、ソフィア・アシュフォード嬢に戻ってみせるわ！" > /dev/null
for f in $D/s-*.mp3; do echo "$(basename $f) $(ffmpeg -nostdin -i $f -f null - 2>&1 | grep -o 'time=[0-9:.]*' | tail -1)"; python3 scripts/audio/segments.py $f 1; done
