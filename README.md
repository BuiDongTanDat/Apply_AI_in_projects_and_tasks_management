RUN: docker compose up --build -d

Notes:
* Change model to pull in docker-compose.yaml file.
* To load the pulled model in llm_service, please set the variable OLLAMA_MODEL={Pulled model} (ex: llama3.2:3, gemma3:1b)
* To tracking the request, please add your LangSmith key in .env file.
