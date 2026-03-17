import { motion } from "framer-motion";

const CibilScoreSemiProgress = ({ score, size = 120, strokeWidth = 8 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius;

  // Convert score → percentage (out of 900)
  const percentage = Math.min((score / 900) * 100, 100);
  const offset = circumference - (percentage / 100) * circumference;

  const gradientId = `cibil-gradient-${Math.random().toString(36).substr(2, 9)}`;

  // Dot position (animated)
  const angle = (percentage / 100) * Math.PI;
  const dotX = size / 2 + radius * Math.cos(Math.PI - angle);
  const dotY = size / 2 - radius * Math.sin(Math.PI - angle);

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <svg width={size} height={size / 2 + strokeWidth} className="overflow-visible">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F5C842" />
            <stop offset="30%" stopColor="#E8B53A" />
            <stop offset="60%" stopColor="#FF9B5A" />
            <stop offset="80%" stopColor="#7B9AE8" />
            <stop offset="100%" stopColor="#5A7BC8" />
          </linearGradient>
        </defs>

        {/* Background semi-circle (dotted) */}
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2
            } ${size / 2}`}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray="3 3"
        />

        {/* Animated progress semi-circle */}
        <motion.path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2
            } ${size / 2}`}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />

        {/* Animated indicator dot */}
        <motion.circle
          cx={dotX}
          cy={dotY}
          r="6"
          fill="#5A7BC8"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.2, duration: 0.5, ease: "easeOut" }}
        />
      </svg>
    </motion.div>
  );
};

export default CibilScoreSemiProgress;
