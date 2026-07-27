export type UploadCardProps = {
  error: string | null;
  loading: boolean;
  onFile: (file: File) => void;
};

// A pass-through now: the idle copy moved into DropZone, and the "Lendo o
// arquivo…" note this used to swap in became LoadingCard, a state of its own.
export function useUploadCard({ error, loading, onFile }: UploadCardProps) {
  return { error, loading, onFile };
}
