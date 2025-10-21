// server/utils/calculate_fitting.js

/**
 * Calculate railway track fittings
 * @param {number} line_length_km - Length of railway line in km
 * @param {string} gauge_type - "BG", "MG", or "NG"
 * @returns {object} - sleepers, railpads, liners, gauge_type, line_length_km
 */
function calculateFitting(line_length_km, gauge_type) {
  // Validate inputs
  if (typeof line_length_km !== 'number' || line_length_km <= 0) {
    throw new Error("Line length must be a positive number.");
  }

  if (typeof gauge_type !== 'string') {
    throw new Error("Gauge type must be a string ('BG', 'MG', or 'NG').");
  }

  let sleepersPerKm;
  switch (gauge_type.toUpperCase()) {
    case "BG":
      sleepersPerKm = 1660;
      break;
    case "MG":
      sleepersPerKm = 1430;
      break;
    case "NG":
      sleepersPerKm = 1200;
      break;
    default:
      throw new Error("Invalid gauge_type. Use 'BG', 'MG', or 'NG'.");
  }

  const totalSleepers = Math.round(sleepersPerKm * line_length_km);
  const totalRailpads = totalSleepers * 2;
  const totalLiners = totalSleepers * 2;

  return {
    gauge_type: gauge_type.toUpperCase(),
    line_length_km,
    sleepers: totalSleepers,
    railpads: totalRailpads,
    liners: totalLiners,
  };
}

module.exports = calculateFitting;
