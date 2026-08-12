export interface UploadCardProps {
  error: string | null;
  onFile: (file: File) => void;
}

// A pass-through now: the idle copy moved into DropZone, and the "Lendo o
// arquivo…" note this used to swap in became LoadingCard, a state of its own.
export function useUploadCard({ error, onFile }: UploadCardProps) {
  return { error, onFile };
}
