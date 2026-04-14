export type ApiProvider = "groq" | "gemini";

export enum GroqModelName {
  OPENAI_GPT_OSS_20B = "openai/gpt-oss-20b",
  GROQ_COMPOUND = "groq/compound",
  META_LLAMA_4_SCOUT_17B_16E_INSTRUCT = "meta-llama/llama-4-scout-17b-16e-instruct",
  META_LLAMA_GUARD_4_12B = "meta-llama/llama-guard-4-12b",
  QWEN3_32B = "qwen/qwen3-32b",
  GROQ_COMPOUND_MINI = "groq/compound-mini",
  META_LLAMA_PROMPT_GUARD_2_22M = "meta-llama/llama-prompt-guard-2-22m",
  META_LLAMA_PROMPT_GUARD_2_86M = "meta-llama/llama-prompt-guard-2-86m",
  MOONSHOTAI_KIMI_K2_INSTRUCT = "moonshotai/kimi-k2-instruct",
  CANOPYLABS_ORPHEUS_ARABIC_SAUDI = "canopylabs/orpheus-arabic-saudi",
  ALLAM_2_7B = "allam-2-7b",
  OPENAI_GPT_OSS_120B = "openai/gpt-oss-120b",
  WHISPER_LARGE_V3 = "whisper-large-v3",
  LLAMA_3_1_8B_INSTANT = "llama-3.1-8b-instant",
  LLAMA_3_3_70B_VERSATILE = "llama-3.3-70b-versatile",
  CANOPYLABS_ORPHEUS_V1_ENGLISH = "canopylabs/orpheus-v1-english",
  MOONSHOTAI_KIMI_K2_INSTRUCT_0905 = "moonshotai/kimi-k2-instruct-0905",
  WHISPER_LARGE_V3_TURBO = "whisper-large-v3-turbo",
  OPENAI_GPT_OSS_SAFEGUARD_20B = "openai/gpt-oss-safeguard-20b",
}

export enum GeminiModelName {
  GEMINI_2_5_FLASH = "models/gemini-2.5-flash",
  GEMINI_2_5_PRO = "models/gemini-2.5-pro",
  GEMINI_2_0_FLASH = "models/gemini-2.0-flash",
  GEMINI_2_0_FLASH_001 = "models/gemini-2.0-flash-001",
  GEMINI_2_0_FLASH_LITE_001 = "models/gemini-2.0-flash-lite-001",
  GEMINI_2_0_FLASH_LITE = "models/gemini-2.0-flash-lite",
  GEMINI_2_5_FLASH_LITE = "models/gemini-2.5-flash-lite",
}

export interface ApiKey {
  id: number;
  name: string;
  provider: ApiProvider;
  modelname: GroqModelName | GeminiModelName;
  isActive: boolean;
  userId: number;
  createdAt: string;
  updatedAt: string;
  /**
   * Aggregated total tokens used for this key.
   * Only present on list responses that join with usages.
   */
  totalTokensUsed?: number;
  /**
   * Whether this key is currently selected as the user's default.
   */
  isSelected?: boolean;
}



export interface ApiKeyUsage {
  id: number;
  apiKeyId: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  reasoningTokens: number | null;
  promptTime: number;
  completionTime: number;
  totalTime: number;
  requestType: "chat" | "vision" | string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface ApiKeyUsagePage {
  usages: ApiKeyUsage[];
  page: {
    total: number;
    currentPage: number;
    pages: number;
  };
}

export interface ApiKeyUsageOverview {
  apiKeyId: number;
  apiKeyName: string;
  totalRequests: number;
  totalTokens: number;
  totalPromptTokens: number;
  totalCompletionTokens: number;
  totalReasoningTokens: number;
  avgTotalTime: number;
  avgPromptTime: number;
  avgCompletionTime: number;
  totalChatRequests: number;
  totalVisionRequests: number;
}

export interface CreateApiKeyRequest {
  name: string;
  key: string;
  provider: ApiProvider;
  modelname: GroqModelName | GeminiModelName;
}

export interface UpdateApiKeyRequest {
  name?: string;
  isActive?: boolean;
  provider?: ApiProvider;
  modelname?: GroqModelName | GeminiModelName;
}

export interface SetSelectedApiKeyRequest {
  selectedApiKeyId: number | null;
}

export interface ApiResponse<T> {
  message: string;
  code: number;
  metadata: T;
}

