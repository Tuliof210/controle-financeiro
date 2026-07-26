export type UploadCardProps = {
  error: string | null;
  loading: boolean;
  onFile: (file: File) => void;
};

export function useUploadCard({ error, loading, onFile }: UploadCardProps) {
  return {
    error,
    loading,
    onFile,
    note: loading
      ? "Lendo o arquivo…"
      : "Lê o arquivo e mostra entradas e saídas por mês. Nada é salvo no banco.",
  };
}
