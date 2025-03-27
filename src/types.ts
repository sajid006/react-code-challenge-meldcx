export type Shape = "triangle" | "square" | "circle";

export type ShapeColor = "red" | "green" | "blue";

export interface GridCell {
    id: number;
    hasShape: boolean;
    shape: Shape | null;
    color: ShapeColor | null;
    isSelected: boolean;
  }