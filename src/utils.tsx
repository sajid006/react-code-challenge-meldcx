// Helper function to render shape in each grid cell
import { Shape, ShapeColor } from "./types"

export function renderShape(shape: Shape, color: ShapeColor) {
  switch (shape) {
    case "triangle":
      // Using a CSS triangle; the color is the border-bottom
      return (
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: "10px solid transparent",
            borderRight: "10px solid transparent",
            borderBottom: `20px solid ${color}`,
          }}
        />
      );
    case "square":
      return (
        <div
          style={{
            width: "20px",
            height: "20px",
            backgroundColor: color,
          }}
        />
      );
    case "circle":
      return (
        <div
          style={{
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            backgroundColor: color,
          }}
        />
      );
    default:
      return null;
  }
}
