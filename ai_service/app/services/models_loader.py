from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_huggingface import HuggingFaceEmbeddings
import joblib
from pathlib import Path
from dotenv import load_dotenv
import app.config as config
import os

#Load environment variables
load_dotenv()


class ModelsLoader:
    _llm = None
    _emb = None
    _xgb = None
    _scaler = None

    @staticmethod
    def llm():
        if ModelsLoader._llm is not None:
            return ModelsLoader._llm

        api_key = config.GEMINI_API_KEY or os.getenv("GOOGLE_API_KEY", "")

        if not api_key:
            print("[ModelsLoader] Gemini disabled — missing GOOGLE_API_KEY")
            ModelsLoader._llm = None
            return None

        model_name = (
            config.GEMINI_MODEL_GENERIC
            or "gemini-2.5-flash"
        )

        print(f"[ModelsLoader] Gemini enabled — model: {model_name}")

        ModelsLoader._llm = ChatGoogleGenerativeAI(
            model=model_name,
            temperature=0.7,
            max_tokens=None,
            max_retries=2,
        )

        return ModelsLoader._llm

    @staticmethod
    def embeddings():
        if ModelsLoader._emb is None:
            ModelsLoader._emb = HuggingFaceEmbeddings(
                model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
                model_kwargs={"device": "cpu"},
            )
        print("[ModelsLoader] Đã load model Embedding")
        return ModelsLoader._emb

    @staticmethod
    def xgb_model():
        if ModelsLoader._xgb is None:
            model_dir = Path(__file__).resolve().parent.parent / "models"
            ModelsLoader._xgb = joblib.load(model_dir / "xgb_storypoint.pkl")
        print("[ModelsLoader] Đã load model XGB")
        return ModelsLoader._xgb

    @staticmethod
    def scaler():
        if ModelsLoader._scaler is None:
            model_dir = Path(__file__).resolve().parent.parent / "models"
            ModelsLoader._scaler = joblib.load(model_dir / "scaler.pkl")
        return ModelsLoader._scaler
