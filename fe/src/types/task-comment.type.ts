export interface TaskCommentAuthor {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  position?: string;
}

export interface TaskCommentDocument {
  id: number;
  name: string;
  url: string;
  mimeType?: string;
  size?: number;
  type: "COMMENT";
  projectId: number;
  taskId?: number;
  uploadedById?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskComment {
  id: number;
  taskId: number;
  authorId: number;
  content?: string;
  documentId?: number;
  document?: TaskCommentDocument | null;
  author?: TaskCommentAuthor;
  createdAt: string;
  updatedAt: string;
}
