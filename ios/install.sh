#!/bin/bash
# Build, sign, install and launch on the first paired iPhone. Run via `npm run device`.
# TEAM is the Apple Developer team used to sign — override to use your own:
#   TEAM=XXXXXXXXXX npm run device
set -euo pipefail
TEAM="${TEAM:-ZZT9HHZQNA}"
DD="${TMPDIR:-/tmp}metromosaic-dd"

DEVICE=$(xcrun devicectl list devices | grep 'available (paired)' | grep -oE '[0-9A-F]{8}(-[0-9A-F]{4}){3}-[0-9A-F]{12}' | head -1)
[ -n "$DEVICE" ] || { echo "No paired iPhone found — unlock it and plug it in."; exit 1; }
echo "→ device $DEVICE, team $TEAM"

xcodebuild -project "$(dirname "$0")/App/App.xcodeproj" -scheme App \
  -destination "id=$DEVICE" -derivedDataPath "$DD" \
  -allowProvisioningUpdates DEVELOPMENT_TEAM="$TEAM" build -quiet

APP="$DD/Build/Products/Debug-iphoneos/App.app"
xcrun devicectl device install app --device "$DEVICE" "$APP"
xcrun devicectl device process launch --device "$DEVICE" com.metromosaic.app
