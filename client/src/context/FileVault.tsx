import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

export interface VaultFile {
  id: string;
  file: File;
  /** object URL for images / pdf, revoked on removal */
  url: string;
  kind: "pdf" | "image" | "other";
}

interface FileVaultValue {
  files: VaultFile[];
  addFiles: (files: File[]) => VaultFile[];
  replaceFile: (id: string, file: File) => void;
  removeFile: (id: string) => void;
  clear: () => void;
  /** files matching an `accept` string such as ".pdf,application/pdf" */
  match: (accept?: string) => VaultFile[];
}

const FileVaultContext = createContext<FileVaultValue | null>(null);

const kindOf = (file: File): VaultFile["kind"] => {
  if (file.type === "application/pdf" || /\.pdf$/i.test(file.name)) return "pdf";
  if (file.type.startsWith("image/") || /\.(png|jpe?g|webp|gif|bmp)$/i.test(file.name)) return "image";
  return "other";
};

export const fileMatchesAccept = (file: File, accept?: string): boolean => {
  if (!accept || accept.trim() === "" || accept === "*") return true;
  const ext = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;
  return accept.split(",").map((t) => t.trim().toLowerCase()).some((type) => {
    if (!type) return false;
    if (type === "*" || type === "*/*") return true;
    if (type.endsWith("/*")) return file.type.startsWith(`${type.slice(0, -2)}/`);
    if (type.includes("/")) return file.type === type;
    return ext === type;
  });
};

let counter = 0;

export const FileVaultProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [files, setFiles] = useState<VaultFile[]>([]);

  const addFiles = useCallback((incoming: File[]) => {
    const created = incoming.map((file) => ({
      id: `vf_${Date.now()}_${counter++}`,
      file,
      url: URL.createObjectURL(file),
      kind: kindOf(file),
    }));
    setFiles((prev) => {
      const seen = new Set(prev.map((f) => `${f.file.name}:${f.file.size}:${f.file.lastModified}`));
      const deduped = created.filter(
        (f) => !seen.has(`${f.file.name}:${f.file.size}:${f.file.lastModified}`)
      );
      return [...prev, ...deduped];
    });
    return created;
  }, []);

  const replaceFile = useCallback((id: string, file: File) => {
    setFiles((prev) =>
      prev.map((f) => {
        if (f.id !== id) return f;
        URL.revokeObjectURL(f.url);
        return { ...f, file, url: URL.createObjectURL(file), kind: kindOf(file) };
      })
    );
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const clear = useCallback(() => {
    setFiles((prev) => {
      prev.forEach((f) => URL.revokeObjectURL(f.url));
      return [];
    });
  }, []);

  const match = useCallback(
    (accept?: string) => files.filter((f) => fileMatchesAccept(f.file, accept)),
    [files]
  );

  const value = useMemo(
    () => ({ files, addFiles, replaceFile, removeFile, clear, match }),
    [files, addFiles, replaceFile, removeFile, clear, match]
  );

  return <FileVaultContext.Provider value={value}>{children}</FileVaultContext.Provider>;
};

export const useFileVault = (): FileVaultValue => {
  const ctx = useContext(FileVaultContext);
  if (!ctx) throw new Error("useFileVault must be used inside FileVaultProvider");
  return ctx;
};
