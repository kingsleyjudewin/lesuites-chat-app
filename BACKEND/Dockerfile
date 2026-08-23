FROM node:20-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 python3-venv \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# --- Node backend ---
COPY node-backend/package*.json ./node-backend/
RUN npm --prefix ./node-backend install --omit=dev
COPY node-backend/src ./node-backend/src

# --- Encryption microservice (Python), reachable only on localhost ---
COPY encryption-service/requirements.txt ./encryption-service/
RUN python3 -m venv /opt/venv \
  && /opt/venv/bin/pip install --no-cache-dir -r ./encryption-service/requirements.txt
COPY encryption-service/app ./encryption-service/app

COPY start.sh ./start.sh
RUN chmod +x ./start.sh

ENV PATH="/opt/venv/bin:$PATH" \
    NODE_ENV=production \
    ENCRYPTION_SERVICE_URL=http://127.0.0.1:8001

EXPOSE 4000
CMD ["./start.sh"]
