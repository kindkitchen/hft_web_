FROM denoland/deno:latest
WORKDIR /app
COPY . .
RUN deno install --allow-scripts
CMD ["deno", "run", "-A", "main.ts"]
