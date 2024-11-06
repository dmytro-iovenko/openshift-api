import stringHash from "string-hash";
import tinycolor from "tinycolor2";

/**
 * Generates a color based on the specified name.
 *
 * @param {string} name - The name of the application.
 * @returns {string} - Hex color string.
 */
export const getColorFromName = (name: string): string => {
  if (!name) return "#f5f5f6";
  const hash = stringHash(name);
  const hue = hash % 360;
  return tinycolor({ h: hue, s: 70, l: 50 }).toHexString();
};


/**
 * Status colors for deployment status representation.
 */
export const statusColors = {
  available: "#388e3c",
  notAvailable: "#d32f2f",
  notProgressing: "#ff9800",
  pending: "rgba(0, 0, 0, 0.12)",
};

