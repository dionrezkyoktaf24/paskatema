"use client";

import Image from "next/image";

interface LogoBadgeProps {
  size?: number;
  className?: string;
}

export function LogoBadge({ size = 40, className = "" }: LogoBadgeProps) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative overflow-hidden border-rose-500 ${className}`}
    >
      <Image src="/logo.png" alt="Paskatema" fill className="object-cover" />
    </div>
  );
}
