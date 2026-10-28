#!/bin/bash
# 从 Windows 调：wsl.exe -d Ubuntu-24.04 -- bash /mnt/f/Wolf/scripts/audio/run.sh <脚本> [参数…]，输出写到 scripts/audio/.out.txt
source ~/.nvm/nvm.sh >/dev/null
export NODE_USE_ENV_PROXY=1 https_proxy=${https_proxy:-http://172.29.208.1:7897} HTTPS_PROXY=${https_proxy:-http://172.29.208.1:7897}
cd /mnt/f/Wolf
"$@" > scripts/audio/.out.txt 2>&1
