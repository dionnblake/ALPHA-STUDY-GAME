import { PropsWithChildren } from "react";

export default function GlassCard({ children }: PropsWithChildren) {
  return <div className="glass-card">{children}</div>;
}
