// Helper function to render shape in each grid cell
import { Shape } from "./types"

export function renderShape(shape: Shape) {
    switch (shape) {
      case "triangle":
        return (
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: "10px solid transparent",
              borderRight: "10px solid transparent",
              borderBottom: "20px solid red",
            }}
          />
        );
      case "square":
        return (
          <div
            style={{
              width: "20px",
              height: "20px",
              backgroundColor: "blue",
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
              backgroundColor: "green",
            }}
          />
        );
      default:
        return null;
    }
  }