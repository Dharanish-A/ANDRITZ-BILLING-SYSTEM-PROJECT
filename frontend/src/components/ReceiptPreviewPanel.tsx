import { Download, Maximize2, Minus, Plus, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "./ui/Button";
import { Card, CardTitle } from "./ui/Card";
import { cn } from "../utils/cn";

type Props = {
  file: File | null;
  url: string | null;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onRemove: () => void;
};

export function ReceiptPreviewPanel({ file, url, zoom, onZoomChange, onRemove }: Props) {
  const isPdf = file?.type === "application/pdf";

  function fullscreen() {
    const element = document.getElementById("receipt-preview-frame");
    void element?.requestFullscreen?.();
  }

  return (
    <Card className="min-h-[360px]">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <CardTitle>Receipt Preview</CardTitle>
          <p className="mt-1 truncate text-sm text-slate-500">{file?.name ?? "No receipt selected"}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" className="h-9 w-9 px-0" onClick={() => onZoomChange(Math.max(0.5, zoom - 0.1))} title="Zoom out">
            <Minus size={16} />
          </Button>
          <Button type="button" variant="secondary" className="h-9 w-9 px-0" onClick={() => onZoomChange(Math.min(2, zoom + 0.1))} title="Zoom in">
            <Plus size={16} />
          </Button>
          <Button type="button" variant="secondary" className="h-9 w-9 px-0" onClick={() => onZoomChange(1)} title="Reset zoom">
            <RotateCcw size={16} />
          </Button>
          <Button type="button" variant="secondary" className="h-9 w-9 px-0" onClick={fullscreen} disabled={!url} title="Fullscreen">
            <Maximize2 size={16} />
          </Button>
          <a
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-andritz-dark transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white",
              !url && "pointer-events-none opacity-50"
            )}
            href={url ?? "#"}
            download={file?.name}
            title="Download receipt"
          >
            <Download size={16} />
          </a>
          <Button type="button" variant="danger" className="h-9 w-9 px-0" onClick={onRemove} disabled={!file} title="Remove receipt">
            <Trash2 size={16} />
          </Button>
        </div>
      </div>

      <div id="receipt-preview-frame" className="mt-4 flex h-[420px] items-center justify-center overflow-auto rounded-md border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
        {!url ? (
          <div className="text-center text-sm text-slate-500">Upload a PDF or image to preview it here.</div>
        ) : isPdf ? (
          <iframe
            src={url}
            title="Receipt PDF preview"
            className="h-full min-h-full w-full border-0 bg-white"
            style={{ transform: `scale(${zoom})`, transformOrigin: "top center", width: `${100 / zoom}%`, height: `${100 / zoom}%` }}
          />
        ) : (
          <img
            src={url}
            alt="Receipt preview"
            className="max-h-full max-w-full object-contain transition-transform"
            style={{ transform: `scale(${zoom})` }}
          />
        )}
      </div>
    </Card>
  );
}
