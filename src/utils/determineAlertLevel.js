const alertLevel = function alertLevel(heartRate, oxygenLevel) {
  if (heartRate < 30 || oxygenLevel < 85) return "codeBlue";
  if (heartRate < 40 || heartRate > 120 || oxygenLevel < 90) return "critical";
  if (heartRate < 60 || heartRate > 100 || oxygenLevel <= 94) return "warning";
  return "normal";
};

module.exports = alertLevel;
