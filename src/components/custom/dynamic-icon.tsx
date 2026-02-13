"use client";

import { useEffect, useState } from "react";

import { LucideProps } from "lucide-react";

import { getLucideIcon } from "@/lib/lucide-icon";

type LucideIconProps = Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>;

type DynamicIconProps = LucideIconProps & { iconName: string };

export default function DynamicIcon({ iconName, ...props }: DynamicIconProps) {
  const [Icon, setIcon] = useState<React.FC<LucideIconProps> | null>(null);

  useEffect(() => {
    const icon = getLucideIcon(iconName);
    setIcon(() => icon);
  }, [iconName]);

  if (!Icon) return null;

  return <Icon {...props} />;
}
