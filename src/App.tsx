import React, { useEffect, useRef, useState } from "react";
import { Shape, ShapeColor, GridCell } from "./types";
import { GRID_ROWS, GRID_COLS, SHAPE_CHANCE, SQUARE_MOVE_INTERVAL } from "./constants";
import { renderShape } from "./utils";

const App: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // The data URL of the captured image
  const [capturedImage, setCapturedImage] = useState<string>("");

  // Step in the CAPTCHA flow: "video" -> "selectShapes" -> "result"
  const [captchaStep, setCaptchaStep] = useState<"video" | "selectShapes" | "result">("video");

  // Randomly chosen shape that the user must select
  const [targetShape, setTargetShape] = useState<Shape>("triangle");
  const [targetColor, setTargetColor] = useState<ShapeColor>("red");

  // Tracks bounding box position (top, left, size in pixels)
  const [boxPos, setBoxPos] = useState({ top: 50, left: 50, size: 150 });

  // The grid cells for shape selection
  const [gridCells, setGridCells] = useState<GridCell[]>([]);

  // The final result of the CAPTCHA (true = pass, false = fail)
  const [captchaResult, setCaptchaResult] = useState<boolean | null>(null);

  // UseEffect: Access user camera
  useEffect(() => {
    // Request camera access
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      })
      .catch((err) => {
        console.error("Camera access error: ", err);
      });

    // Periodically move the bounding box (only while in "video" step)
    let moveInterval: number | null = null;
    if (captchaStep === "video") {
      moveInterval = setInterval(() => {
        moveBoundingBox();
      }, SQUARE_MOVE_INTERVAL);
    }

    // Cleanup on unmount or step change
    return () => {
      if (moveInterval) clearInterval(moveInterval);
    };
  }, [captchaStep]);


  // Function to move bounding box randomly
  const moveBoundingBox = () => {
    if (!videoRef.current) return;

    // Suppose video width/height is unknown until it starts playing.
    // For simplicity, I am doing a rough bounding
    const maxTop = 200;
    const maxLeft = 200;
    const size = 150;    // Keep the box size fixed in this example

    const top = Math.floor(Math.random() * maxTop);
    const left = Math.floor(Math.random() * maxLeft);

    setBoxPos({ top, left, size });
  };


  // Function to capture the image + lock bounding box
  const handleContinue = () => {
    if (!videoRef.current || !canvasRef.current) return;

    // Set canvas size to match the video (for a full capture).
    const videoWidth = videoRef.current.videoWidth;
    const videoHeight = videoRef.current.videoHeight;
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    // Draw current video frame onto the canvas
    ctx.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight);

    // Convert the canvas to a data URL
    const dataUrl = canvasRef.current.toDataURL("image/png");
    setCapturedImage(dataUrl);

    // Generate the random shapes for the next step
    const shapeToFind = randomShape();
    const colorToFind = randomColor();
    setTargetShape(shapeToFind);
    setTargetColor(colorToFind);

    // Create the grid for the bounding box area
    const cells = createGrid(GRID_ROWS, GRID_COLS);
    setGridCells(cells);

    // Switch to the shape selection step
    setCaptchaStep("selectShapes");
  };

  // Function to Generate grid cells
  const createGrid = (rows: number, cols: number): GridCell[] => {
    const totalCells = rows * cols;
    const newGrid: GridCell[] = [];
    // Randomly choose shapes in half of the cells or so
    for (let i = 0; i < totalCells; i++) {
      // Decide whether this cell will have a shape
      const hasShape = Math.random() < SHAPE_CHANCE; // ~50% chance
      // If it has a shape, choose from the three shapes randomly
      const cellShape = hasShape ? randomShape() : null;
      const cellColor = hasShape ? randomColor() : null;

      newGrid.push({
        id: i,
        hasShape,
        shape: cellShape,
        color: cellColor,
        isSelected: false,
      });
    }
    return newGrid;
  };

  // Function to randomly choose a shape
  const randomShape = (): Shape => {
    const shapes: Shape[] = ["triangle", "square", "circle"];
    return shapes[Math.floor(Math.random() * shapes.length)];
  };

  //Function to randomly choose a color
  const randomColor = (): ShapeColor => {
    const colors: ShapeColor[] = ["red", "green", "blue"];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Handler: User clicks a cell to select/unselect
  const handleCellClick = (cellId: number) => {
    setGridCells((prevCells) =>
      prevCells.map((cell) =>
        cell.id === cellId ? { ...cell, isSelected: !cell.isSelected } : cell
      )
    );
  };

  // Validation: Check if user selected all cells with the target shape
  const handleValidate = () => {
    let isCorrect = true;

    for (const cell of gridCells) {
      // The correct cell is one that has the target shape and color
      const cellIsTarget = cell.shape === targetShape && cell.color === targetColor;

      // If it's a target cell but not selected -> fail
      if (cellIsTarget && !cell.isSelected) {
        isCorrect = false;
        break;
      }
      // If it's not a target cell but is selected -> fail
      if (!cellIsTarget && cell.isSelected) {
        isCorrect = false;
        break;
      }
    }

    setCaptchaResult(isCorrect);
    setCaptchaStep("result");
  };


  // Render element
  return (
    <div style={{ margin: "20px" }}>
      <h1>Custom CAPTCHA Demo (Task 2)</h1>

      {captchaStep === "video" && (
        <div>
          <p>1) Position your face in front of the camera and wait for the box to move.</p>
          <video ref={videoRef} style={{ width: "400px", height: "300px", backgroundColor: "#000" }} />
          <div
            style={{
              position: "relative",
              top: `-${300 - boxPos.top}px`,
              left: `${boxPos.left}px`,
              width: `${boxPos.size}px`,
              height: `${boxPos.size}px`,
              border: "2px solid #fff",
              boxSizing: "border-box",
            }}
          ></div>

          <button onClick={handleContinue}>Continue</button>
        </div>
      )}

      {captchaStep === "selectShapes" && (
        <div>
          <p>
            2) We captured your image. Now select all <strong>{targetColor} {targetShape}</strong>(s) in the grid below, then click "Validate".
          </p>
          <div style={{ position: "relative" }}>
            {/* Display the captured image as background */}
            <img
              src={capturedImage}
              alt="Captured"
              style={{ width: "400px", height: "300px", objectFit: "cover" }}
            />

            {/* Over the locked bounding box area, place a grid */}
            <div
              style={{
                position: "absolute",
                top: `${boxPos.top}px`,
                left: `${boxPos.left}px`,
                width: `${boxPos.size}px`,
                height: `${boxPos.size}px`,
                display: "grid",
                gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
                gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
                pointerEvents: "none",
              }}
            >
              {gridCells.map((cell) => (
                <div
                  key={cell.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCellClick(cell.id);
                  }}
                  style={{
                    border: "1px solid #ccc",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    backgroundColor: cell.isSelected ? "rgba(0, 255, 0, 0.3)" : "transparent",
                    pointerEvents: "auto",
                  }}
                >
                  {cell.hasShape && cell.shape && cell.color && renderShape(cell.shape, cell.color)}
                </div>
              ))}
            </div>
          </div>

          <button onClick={handleValidate}>Validate</button>
        </div>
      )}

      {captchaStep === "result" && (
        <div>
          <p>
            3) {captchaResult
              ? "Congratulations! You passed the CAPTCHA."
              : "Sorry, that was incorrect. You failed the CAPTCHA."}
          </p>
        </div>
      )}

      {/* Hidden canvas for capturing the video frame */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
};


export default App;
