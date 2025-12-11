# Chạy Ollama server nền
/bin/ollama serve &

# Record Process ID.
pid=$!

# Pause for Ollama to start up.
sleep 5

echo "[Ollama] Tìm tên model từ env: $OLLAMA_MODEL"

# Check if the model is already pulled
if ! ollama list | grep -q "$OLLAMA_MODEL"; then
  echo "[Ollama] Model $OLLAMA_MODEL không tìm thấy. Pulling now..."
  ollama pull $OLLAMA_MODEL
  echo "[Ollama] Model pulled thành công!"
else
  echo "[Ollama] Model $OLLAMA_MODEL đã tồn tại trong thư mục. Skipping pull."
fi

# Cài thư viện curl nếu chưa có
echo "[Ollama] Installing curl..."
apt-get update -y
apt-get install -y curl

curl -s -X POST http://localhost:11434/api/chat \
  -d "{\"model\":\"$OLLAMA_MODEL\", \"messages\":[{\"role\":\"user\",\"content\":\"ping\"}]}" \
  > /dev/null

  
echo "[Ollama] Model Warmed Up!"

# Wait for the Ollama process to finish.
wait $pid