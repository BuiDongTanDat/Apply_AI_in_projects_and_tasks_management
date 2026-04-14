export enum DocumentType {
  PROJECT = "PROJECT",
  TASK_DESCRIPTION = "TASK_DESCRIPTION",
  TASK_RESULT = "TASK_RESULT",
}

export interface Document {
  id: number;
  name: string;
  url: string;
  mimeType?: string;
  size?: number;
  type: DocumentType;
  projectId: number;
  taskId?: number;
  uploadedById?: number;
  createdAt: string;
  updatedAt: string;
}
