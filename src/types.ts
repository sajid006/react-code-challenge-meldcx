export type Shape = "triangle" | "square" | "circle";

export interface GridCell {
    id: number;
    hasShape: boolean;
    shape: Shape | null;
    isSelected: boolean;
  }