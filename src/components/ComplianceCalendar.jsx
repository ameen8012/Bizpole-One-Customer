import { useState, useEffect } from "react";

const ComplianceCalendar = ({ value = 27.5 }) => {
  const [animatedValue, setAnimatedValue] = useState(0);

  // Animate needle smoothly when value changes
  useEffect(() => {
    let start = animatedValue;
    let end = value;
    let step = (end - start) / 60; // smoother steps
    let current = start;

    const interval = setInterval(() => {
      current += step;
      if ((step > 0 && current >= end) || (step < 0 && current <= end)) {
        current = end;
        clearInterval(interval);
      }
      setAnimatedValue(current);
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [value]);

  // Gauge config (improved calculation and visual)
  const totalSegments = 60;
  const minValue = 0;
  const maxValue = 100;
  const gaugeStart = -135;
  const gaugeEnd = 135;
  const gaugeRange = gaugeEnd - gaugeStart;
  const valuePercent = Math.max(0, Math.min(1, (animatedValue - minValue) / (maxValue - minValue)));
  const filledSegments = Math.round(valuePercent * totalSegments);

  const segments = Array.from({ length: totalSegments }, (_, i) => {
    const angle = gaugeStart + (i / (totalSegments - 1)) * gaugeRange;
    let segmentColor;
    if (i < totalSegments * 0.4) {
      segmentColor = "#10b981"; // Green
    } else if (i < totalSegments * 0.7) {
      segmentColor = "#f59e0b"; // Yellow/Orange
    } else {
      segmentColor = "#ef4444"; // Red
    }
    return {
      angle,
      color: segmentColor,
      isActive: i < filledSegments,
    };
  });

  // Needle angle based on animated value
  // const needleAngle = gaugeStart + valuePercent * gaugeRange;

  return (
    <div className="flex flex-col items-center justify-start w-full max-w-xl mx-auto bg-gray-50 rounded-3xl ">
      {/* Title */}
      <h2 className="text-lg font-bold text-gray-600 mb-8">
        Compliance Score
      </h2>

      {/* Gauge */}
      <div className="relative w-70 h-70  flex flex-col items-center justify-center" style={{ transform: 'rotate(-90deg)' }}>
        <svg className="w-full h-full" viewBox="0 0 240 240">
          {/* Segments */}
          {segments.map((segment, index) => {
            const innerRadius = 88;
            const outerRadius = 108;
            const angleRad = (segment.angle * Math.PI) / 180;
            const segmentWidth = 3.2;

            const x1 = 120 + innerRadius * Math.cos(angleRad);
            const y1 = 120 + innerRadius * Math.sin(angleRad);
            const x2 = 120 + outerRadius * Math.cos(angleRad);
            const y2 = 120 + outerRadius * Math.sin(angleRad);

            return (
              <line
                key={index}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={segment.color}
                strokeWidth={segmentWidth}
                strokeLinecap="round"
                opacity={segment.isActive ? 1 : 0.18}
              />
            );
          })}

          {/* Needle */}
          <g>
            {/* Needle connects to the end of the active segment */}
            {(() => {
              // Find the last active segment (green or filled)
              const lastActive = segments.filter(s => s.isActive).slice(-1)[0];
              if (lastActive) {
                // const innerRadius = 0; // center
                const outerRadius = 108; // same as segment outer
                const angleRad = (lastActive.angle * Math.PI) / 180;
                const x2 = 120 + outerRadius * Math.cos(angleRad);
                const y2 = 120 + outerRadius * Math.sin(angleRad);
                return (
                  <line
                    x1="120"
                    y1="120"
                    x2={x2}
                    y2={y2}
                    stroke="#374151"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                );
              } else {
                // fallback to original needle
                return (
                  <line
                    x1="120"
                    y1="120"
                    x2="120"
                    y2="32"
                    stroke="#374151"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                );
              }
            })()}
            {/* Needle center */}
            <circle cx="120" cy="120" r="5" fill="#374151" />
            <circle cx="120" cy="120" r="2" fill="white" />
          </g>

          {/* Tick marks */}
          {Array.from({ length: 12 }, (_, i) => {
            const angle = i * 22.5 - 135;
            const angleRad = (angle * Math.PI) / 180;
            const innerRadius = 78;
            const outerRadius = 85;

            const x1 = 120 + innerRadius * Math.cos(angleRad);
            const y1 = 120 + innerRadius * Math.sin(angleRad);
            const x2 = 120 + outerRadius * Math.cos(angleRad);
            const y2 = 120 + outerRadius * Math.sin(angleRad);

            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#6b7280"
                strokeWidth="1.5"
              />
            );
          })}
        </svg>
      </div>

      {/* Value */}
      <div className="text-center mb-8">
        <div className="text-4xl font-bold text-gray-700 mb-1">
          {animatedValue.toFixed(1)}
        </div>
        <div className="text-base text-gray-500 font-medium">Calendar</div>
      </div>
    </div>
  );
};

export default ComplianceCalendar;