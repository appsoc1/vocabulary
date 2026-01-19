export function ProgressBar({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-between text-xs font-medium text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border">
      <span>Session Progress</span>
      <span className="font-mono">{text}</span>
    </div>
  );
}
