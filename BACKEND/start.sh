#!/bin/bash
set -e

cd /app/encryption-service
uvicorn app.main:app --host 127.0.0.1 --port 8001 &
ENCRYPTION_PID=$!

cd /app/node-backend
node src/server.js &
NODE_PID=$!

# If either process dies, tear down the container so Render restarts a clean pair.
trap 'kill -TERM $ENCRYPTION_PID $NODE_PID 2>/dev/null' TERM INT

wait -n "$ENCRYPTION_PID" "$NODE_PID"
EXIT_CODE=$?
kill -TERM $ENCRYPTION_PID $NODE_PID 2>/dev/null
exit $EXIT_CODE
