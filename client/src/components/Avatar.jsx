import { getInitials } from "../utils/format.js";

const colors = [
  "bg-purple-600",
  "bg-blue-600",
  "bg-green-600",
  "bg-pink-600",
  "bg-orange-600",
  "bg-teal-600",
];

const getColor = (name) => {
  if (!name) return colors[0];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
};

export default function Avatar({ src, name, size = "md", online }) {
  const sizeClass = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  }[size];

  const dotSize = {
    sm: "w-2 h-2",
    md: "w-2.5 h-2.5",
    lg: "w-3 h-3",
  }[size];

  return (
    <div className="relative flex-shrink-0">
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${sizeClass} rounded-full object-cover`}
        />
      ) : (
        <div
          className={`${sizeClass} ${getColor(name)} rounded-full flex items-center justify-center font-medium text-white`}
        >
          {getInitials(name)}
        </div>
      )}
      {online !== undefined && (
        <span
          className={`absolute bottom-0 right-0 ${dotSize} rounded-full border-2 border-dark-800 ${
            online ? "bg-green-400" : "bg-gray-500"
          }`}
        />
      )}
    </div>
  );
}
