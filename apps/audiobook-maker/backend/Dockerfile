FROM python:3.11-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

ARG PIPER_VOICE=en_US-lessac-medium
ENV PIPER_VOICE=${PIPER_VOICE}
ENV VOICES_DIR=/app/voices
RUN python -m piper.download_voices ${PIPER_VOICE} --download-dir ${VOICES_DIR}

COPY app ./app

ENV DATA_DIR=/data
VOLUME ["/data"]

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
