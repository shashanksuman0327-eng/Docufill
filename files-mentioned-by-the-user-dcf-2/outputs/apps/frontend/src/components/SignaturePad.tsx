import ClearIcon from "@mui/icons-material/Clear";
import { Button } from "@mui/material";
import { MouseEvent, TouchEvent, useRef, useState } from "react";

interface Props {
  value?: string;
  onChange: (value: string) => void;
}

export const SignaturePad = ({ onChange }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [drawing, setDrawing] = useState(false);

  const point = (event: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const client = "touches" in event ? event.touches[0] : event;
    return { x: client.clientX - rect.left, y: client.clientY - rect.top };
  };

  const draw = (event: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const next = point(event);
    if (!canvas || !ctx || !next) return;
    ctx.lineTo(next.x, next.y);
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke();
    onChange(canvas.toDataURL("image/png"));
  };

  const start = (event: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const next = point(event);
    if (!ctx || !next) return;
    setDrawing(true);
    ctx.beginPath();
    ctx.moveTo(next.x, next.y);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    canvas?.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
    onChange("");
  };

  return (
    <div className="space-y-2">
      <canvas
        ref={canvasRef}
        width={520}
        height={140}
        className="h-28 w-full touch-none rounded border border-slate-300 bg-white"
        onMouseDown={start}
        onMouseMove={draw}
        onMouseUp={() => setDrawing(false)}
        onMouseLeave={() => setDrawing(false)}
        onTouchStart={start}
        onTouchMove={draw}
        onTouchEnd={() => setDrawing(false)}
      />
      <Button size="small" startIcon={<ClearIcon />} onClick={clear}>
        Clear
      </Button>
    </div>
  );
};
