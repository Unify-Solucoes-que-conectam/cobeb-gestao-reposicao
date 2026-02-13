import * as Icons from "lucide-react";

export const getLucideIcon = (iconName: string) => {
  const IconComponent = (Icons as unknown as Record<string, React.FC<unknown>>)[iconName];

  if (!IconComponent) {
    return null;
  }

  return IconComponent;
};
