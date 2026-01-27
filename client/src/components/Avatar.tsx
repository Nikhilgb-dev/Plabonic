import React from "react";
import { User } from "lucide-react";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ src, alt = "Avatar", className = "" }) => {
  if (!src) {
    return (
      <div
        className={`overflow-hidden flex items-center justify-center ${className}`}
        aria-label={alt}
        role="img"
      >
        <div className="h-full w-full bg-gradient-to-br from-blue-200 via-blue-300 to-blue-200 border border-blue-300 shadow-inner flex items-center justify-center">
          <User className="w-1/2 h-1/2 text-blue-700" />
        </div>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden ${className}`}>
      <img src={src} alt={alt} className="h-full w-full object-cover" />
    </div>
  );
};

export default Avatar;
