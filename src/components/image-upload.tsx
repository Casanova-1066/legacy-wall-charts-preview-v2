// Local image picker for Legacy Wall Charts.
//
// This version has no external upload-service dependency.
// It converts the selected image to a data URL and stores that value in the chart settings.
// This is fine for testing and small background images on Vercel.
// Before public launch, replace this with real object storage such as Cloudflare R2,
// Supabase Storage, UploadThing, or a Vercel API route that uploads to storage.
import { useRef, useState } from "react";

const MAX_SIZE_MB = 5;

export function ImageUpload({
  value,
  onChange,
  accept = "image/*",
  label = "Upload image",
  className = "",
}: {
  value?: string | null;
  onChange: (url: string) => void;
  accept?: string;
  label?: string;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setBusy(true);
    setError(null);
    try {
      if (!file.type.startsWith("image/")) {
        throw new Error("Please choose an image file.");
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        throw new Error(`Image is too large. Maximum size is ${MAX_SIZE_MB}MB.`);
      }

      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Could not read image file."));
        reader.readAsDataURL(file);
      });

      onChange(dataUrl);
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {value ? <img src={value} alt="" className="h-28 w-auto rounded-md border object-cover" /> : null}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void upload(f);
          e.target.value = "";
        }}
      />
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:opacity-50"
        >
          {busy ? "Loading…" : value ? "Change image" : label}
        </button>
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Remove
          </button>
        ) : null}
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
