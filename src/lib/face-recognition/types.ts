// Face Recognition Types for Fotiqo
// Supports Face++ (primary) and mock provider for development

export interface DetectedFace {
  faceToken: string;
  bounds: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  confidence?: number;
}

export interface FaceMatch {
  photoId: string;
  galleryId: string;
  confidence: number;
  faceToken: string;
  bounds: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
}

export interface FaceSearchResult {
  matches: FaceMatch[];
  totalFound: number;
  searchTimeMs: number;
  provider: string;
}

export type FaceProvider = "FACEPP" | "REKOGNITION" | "MOCK";

export interface IndexResult {
  photoId: string;
  facesFound: number;
  faceTokens: string[];
}

export interface FaceSetResult {
  facesetToken?: string;
  outerKey: string;
  faceCount: number;
}

export interface SearchHit {
  face_token: string;
  confidence: number;
}
