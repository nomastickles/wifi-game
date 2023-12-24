#!/bin/bash

if [ ! $# -eq 1 ]; then
  echo "one arumentent needed"
  exit 1
fi

# wlan1mon
MONITOR_DEVICE=$1

./blink1-tool --off

while true; do
  timeout 120s sudo airodump-ng "$MONITOR_DEVICE" --band abg -w wifigamedata --output-format csv --ignore-negative-one --manufacturer
done
