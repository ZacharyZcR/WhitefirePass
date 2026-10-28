#!/bin/bash
# 用 Scribe 核对开场 CG 的配音
node scripts/audio/el-check.mjs narrator/op_
for w in nora marcus eileen thomas lydia oliver sophia samuel claire victor emily benjamin isabella alexander charlotte; do
  node scripts/audio/el-check.mjs $w/opening
done
