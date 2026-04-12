import Image from "next/image";
import { Position, POSITION_ICON_URLS, POSITION_LABELS } from "@/types";

export default function PositionIcon({ position, size = 16, className = "" }: {
  position: Position;
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src={POSITION_ICON_URLS[position]}
      alt={POSITION_LABELS[position]}
      width={size}
      height={size}
      className={`inline-block ${className}`}
      unoptimized
    />
  );
}
