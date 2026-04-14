import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import "./AvatarStack.scss";

export interface AvatarItem {
  id: string | number;
  name?: string;
  avatar?: string | null;
  email?: string;
}

interface AvatarStackProps {
  avatars: AvatarItem[];
  maxVisible?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  showTooltip?: boolean;
}

const AvatarStack: React.FC<AvatarStackProps> = ({
  avatars,
  maxVisible = 5,
  size = "md",
  className = "",
  showTooltip = true,
}) => {
  // debugger;
  const visibleAvatars = avatars.slice(0, maxVisible);
  const remainingCount = avatars.length - maxVisible;

  const getSizeClass = () => {
    switch (size) {
      case "sm":
        return "avatar-stack--sm";
      case "lg":
        return "avatar-stack--lg";
      default:
        return "avatar-stack--md";
    }
  };

  return (
    <div className={`avatar-stack ${getSizeClass()} ${className}`}>
      <div className="avatar-stack__container">
        {visibleAvatars.map((item, index) => (
          <div
            key={item.id}
            className="avatar-stack__item"
            style={{ zIndex: maxVisible - index }}
            title={showTooltip ? item.name || item.email || "Dev" : undefined}
          >
            <Avatar className="avatar-stack__avatar">
              <AvatarImage
                src={item.avatar || undefined}
                alt={item.name || item.email || "Avatar"}
                className="object-cover shadow-xs"
              />
              <AvatarFallback>
                {item.name
                  ? item.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)
                  : "?"}
              </AvatarFallback>
            </Avatar>
          </div>
        ))}

        {remainingCount > 0 && (
          <div
            className="avatar-stack__item avatar-stack__more"
            style={{ zIndex: 0 }}
            title={showTooltip ? `+${remainingCount} others` : undefined}
          >
            <Avatar className="avatar-stack__avatar">
              <AvatarFallback className="avatar-stack__more-text">
                +{remainingCount}
              </AvatarFallback>
            </Avatar>
          </div>
        )}
      </div>
    </div>
  );
};

export default AvatarStack;
