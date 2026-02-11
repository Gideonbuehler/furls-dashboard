import { useState, useEffect, useRef } from "react";
import "./Heatmap.css";

function Heatmap({ heatmapData, currentStats }) {
  const [selectedZone, setSelectedZone] = useState("all");
  const [hoveredCell, setHoveredCell] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Define zones
  const zones = [
    { id: "all", name: "All Field", description: "Entire field" },
    {
      id: "attacking-third",
      name: "Attacking Third",
      description: "Near opponent goal",
    },
    { id: "midfield", name: "Midfield", description: "Middle of the field" },
    {
      id: "defensive-third",
      name: "Defensive Third",
      description: "Near your goal",
    },
    { id: "left-wing", name: "Left Wing", description: "Left side of field" },
    { id: "center", name: "Center", description: "Center of field" },
    {
      id: "right-wing",
      name: "Right Wing",
      description: "Right side of field",
    },
  ];

  // Debug: Log heatmap data
  console.log("Heatmap data received:", heatmapData);
  console.log("Heatmap has shots array:", heatmapData?.shots);
  console.log("Heatmap has goals array:", heatmapData?.goals);

  if (!heatmapData) {
    return (
      <div className="heatmap-container">
        <div className="no-data">
          <h2>🔥 Shot Heatmap</h2>
          <div className="no-data-message">
            <p style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>
              ⚠️ No heatmap data available yet
            </p>
            <p>
              Play some Rocket League matches and your shot locations will be
              tracked and displayed here!
            </p>
            <p style={{ marginTop: "1rem", color: "#888" }}>
              Tip: Make sure your BakkesMod plugin is properly configured and
              uploading stats.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate stats for selected zone
  const getZoneStats = () => {
    const data = heatmapData.shots;
    const goalData = heatmapData.goals;

    // Simple aggregation - sum all values
    let totalShots = 0;
    let totalGoals = 0;

    data.forEach((row, y) => {
      row.forEach((shots, x) => {
        totalShots += shots || 0;
        totalGoals += goalData[y]?.[x] || 0;
      });
    });

    const accuracy =
      totalShots > 0 ? ((totalGoals / totalShots) * 100).toFixed(1) : 0;

    return {
      shots: totalShots,
      goals: totalGoals,
      accuracy,
    };
  };

  const stats = getZoneStats();
  const hasData = stats.shots > 0 || stats.goals > 0;

  // Render fluid heatmap on canvas
  useEffect(() => {
    if (!canvasRef.current || !heatmapData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const width = 400;
    const height = 600;

    canvas.width = width;
    canvas.height = height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Get max value for normalization
    const maxValue = Math.max(...heatmapData.shots.flat().filter((v) => v > 0));
    if (maxValue === 0) return;

    // Create data points for rendering
    const dataPoints = [];
    heatmapData.shots.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          dataPoints.push({
            x: (x + 0.5) * (width / row.length),
            y: (y + 0.5) * (height / heatmapData.shots.length),
            value: value,
            intensity: value / maxValue,
            gridX: x,
            gridY: y,
          });
        }
      });
    });

    // Function to get color based on intensity
    const getHeatColor = (intensity) => {
      const colors = [
        { pos: 0, r: 40, g: 120, b: 220 },
        { pos: 0.25, r: 80, g: 220, b: 150 },
        { pos: 0.5, r: 180, g: 255, b: 80 },
        { pos: 0.75, r: 255, g: 200, b: 0 },
        { pos: 1, r: 255, g: 50, b: 50 },
      ];

      let c1 = colors[0],
        c2 = colors[1];
      for (let i = 0; i < colors.length - 1; i++) {
        if (intensity >= colors[i].pos && intensity <= colors[i + 1].pos) {
          c1 = colors[i];
          c2 = colors[i + 1];
          break;
        }
      }

      const t = (intensity - c1.pos) / (c2.pos - c1.pos);
      const r = Math.round(c1.r + t * (c2.r - c1.r));
      const g = Math.round(c1.g + t * (c2.g - c1.g));
      const b = Math.round(c1.b + t * (c2.b - c1.b));

      return { r, g, b };
    }; // Render each data point with radial gradient
    dataPoints.forEach((point) => {
      const radius = 12 + point.intensity * 10; // Half the previous size for more refined points
      const gradient = ctx.createRadialGradient(
        point.x,
        point.y,
        0,
        point.x,
        point.y,
        radius
      );

      const color = getHeatColor(point.intensity);
      const alpha = 0.4 + point.intensity * 0.5;

      gradient.addColorStop(
        0,
        `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`
      );
      gradient.addColorStop(
        0.5,
        `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha * 0.5})`
      );
      gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);

      ctx.fillStyle = gradient;
      ctx.fillRect(point.x - radius, point.y - radius, radius * 2, radius * 2);
    });

    // Apply smoothing filter
    ctx.filter = "blur(8px)";
    ctx.drawImage(canvas, 0, 0);
    ctx.filter = "none";
  }, [heatmapData]);

  // Handle mouse move for hover effects
  const handleCanvasMouseMove = (e) => {
    if (!containerRef.current || !heatmapData) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMousePos({ x: e.clientX, y: e.clientY });

    // Calculate grid position
    const gridWidth = heatmapData.shots[0].length;
    const gridHeight = heatmapData.shots.length;
    const cellWidth = 400 / gridWidth;
    const cellHeight = 600 / gridHeight;

    const gridX = Math.floor(x / cellWidth);
    const gridY = Math.floor(y / cellHeight);

    if (gridX >= 0 && gridX < gridWidth && gridY >= 0 && gridY < gridHeight) {
      const value = heatmapData.shots[gridY][gridX];
      if (value > 0) {
        setHoveredCell({
          x: gridX,
          y: gridY,
          value,
          screenX: e.clientX,
          screenY: e.clientY,
        });
        return;
      }
    }

    setHoveredCell(null);
  };

  const handleCanvasMouseLeave = () => {
    setHoveredCell(null);
  };

  const handleCanvasClick = (e) => {
    if (hoveredCell) {
      setSelectedZone(`cell-${hoveredCell.x}-${hoveredCell.y}`);
    }
  };
  return (
    <div className="heatmap-container">
      <h2
        style={{ color: "#bb86fc", marginBottom: "2rem", textAlign: "center" }}
      >
        🔥 Shot Heatmap
      </h2>{" "}
      {/* Main Layout: Heatmap + Stats Cards Side by Side */}
      <div
        style={{
          display: "flex",
          gap: "2rem",
          alignItems: "flex-start",
          justifyContent: "center",
          flexWrap: "wrap",
          width: "100%",
        }}
      >
        {/* Left Side Stats */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "2rem",
            minWidth: "120px",
            justifyContent: "center",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "2rem",
                fontWeight: "bold",
                color: "#4fc3f7",
              }}
            >
              {stats.shots}
            </div>
            <div
              style={{
                fontSize: "0.85rem",
                color: "#888",
                marginTop: "0.25rem",
              }}
            >
              Total Shots
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "2rem",
                fontWeight: "bold",
                color: "#66bb6a",
              }}
            >
              {stats.goals}
            </div>
            <div
              style={{
                fontSize: "0.85rem",
                color: "#888",
                marginTop: "0.25rem",
              }}
            >
              Goals
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "2rem",
                fontWeight: "bold",
                color: "#bb86fc",
              }}
            >
              {stats.accuracy}%
            </div>
            <div
              style={{
                fontSize: "0.85rem",
                color: "#888",
                marginTop: "0.25rem",
              }}
            >
              Accuracy
            </div>
          </div>
        </div>

        {/* Heatmap Section */}
        <div style={{ flex: "0 0 auto", maxWidth: "100%" }}>
          <p
            style={{
              fontSize: "0.95rem",
              color: "#aaa",
              marginBottom: "1rem",
              textAlign: "center",
            }}
          >
            Rocket League field from above – hover for details
          </p>
          <div
            ref={containerRef}
            style={{
              position: "relative",
              width: "min(400px, 90vw)",
              height: "min(600px, 135vw)",
              maxHeight: "80vh",
              margin: "0 auto",
              cursor: hoveredCell ? "pointer" : "default",
              aspectRatio: "2/3",
            }}
            onMouseMove={handleCanvasMouseMove}
            onMouseLeave={handleCanvasMouseLeave}
            onClick={handleCanvasClick}
          >
            {" "}
            {/* Field markings overlay */}
            <svg
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: 3,
                pointerEvents: "none",
              }}
              viewBox="0 0 400 600"
            >
              {/* Goal lines - horizontal lines in front of goals */}
              <line
                x1="120"
                y1="15"
                x2="280"
                y2="15"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="4"
              />
              <line
                x1="120"
                y1="585"
                x2="280"
                y2="585"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="4"
              />
              {/* Center circle */}
              <circle
                cx="200"
                cy="300"
                r="70"
                fill="none"
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="2"
              />
              {/* Center line */}
              <line
                x1="0"
                y1="300"
                x2="400"
                y2="300"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="2"
              />
            </svg>
            {/* Canvas for fluid heatmap */}
            <canvas
              ref={canvasRef}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: 1,
                borderRadius: "12px",
              }}
            />{" "}
            {/* Background container */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                boxShadow: "0 4px 32px rgba(0,0,0,0.6)",
                borderRadius: "12px",
                border: "1px solid rgba(187,134,252,0.3)",
                background: "rgba(10,10,20,0.85)",
                width: "100%",
                height: "100%",
                zIndex: 0,
              }}
            />
            {/* Hover tooltip */}
            {hoveredCell && (
              <div
                style={{
                  position: "fixed",
                  top: hoveredCell.screenY + 15,
                  left: hoveredCell.screenX + 15,
                  transform: "translateX(-50%)",
                  background: "rgba(15,15,25,0.98)",
                  color: "#fff",
                  borderRadius: "10px",
                  boxShadow:
                    "0 4px 24px rgba(0,0,0,0.8), 0 0 0 1px rgba(187,134,252,0.5)",
                  padding: "12px 16px",
                  zIndex: 1000,
                  minWidth: "140px",
                  fontSize: "0.9rem",
                  pointerEvents: "none",
                  whiteSpace: "nowrap",
                  backdropFilter: "blur(8px)",
                }}
              >
                <div
                  style={{
                    fontWeight: "bold",
                    marginBottom: "6px",
                    color: "#bb86fc",
                    fontSize: "0.95rem",
                  }}
                >
                  Zone ({hoveredCell.x}, {hoveredCell.y})
                </div>
                <div style={{ marginBottom: "2px" }}>
                  📍 Shots:{" "}
                  <span style={{ color: "#4fc3f7", fontWeight: "bold" }}>
                    {hoveredCell.value}
                  </span>
                </div>
                <div style={{ marginBottom: "2px" }}>
                  ⚽ Goals:{" "}
                  <span style={{ color: "#66bb6a", fontWeight: "bold" }}>
                    {heatmapData.goals[hoveredCell.y]?.[hoveredCell.x] || 0}
                  </span>
                </div>
                <div>
                  🎯 Accuracy:{" "}
                  <span
                    style={{
                      color:
                        (heatmapData.goals[hoveredCell.y]?.[hoveredCell.x] ||
                          0) /
                          hoveredCell.value >
                        0.5
                          ? "#66bb6a"
                          : "#ff9800",
                      fontWeight: "bold",
                    }}
                  >
                    {(
                      ((heatmapData.goals[hoveredCell.y]?.[hoveredCell.x] ||
                        0) /
                        hoveredCell.value) *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                </div>
              </div>
            )}{" "}
          </div>
          <div
            className="heatmap-legend"
            style={{
              marginTop: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              justifyContent: "center",
            }}
          >
            <span
              style={{ color: "#888", fontSize: "0.9rem", fontWeight: "500" }}
            >
              Cold
            </span>
            <div
              className="legend-gradient"
              style={{
                width: 220,
                height: 20,
                background:
                  "linear-gradient(90deg, rgba(40,120,220,0.4) 0%, rgba(80,220,150,0.6) 25%, rgba(180,255,80,0.7) 50%, rgba(255,200,0,0.8) 75%, rgba(255,50,50,0.9) 100%)",
                borderRadius: 10,
                boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
              }}
            ></div>
            <span
              style={{
                color: "#bb86fc",
                fontSize: "0.9rem",
                fontWeight: "500",
              }}
            >
              Hot
            </span>
          </div>{" "}
        </div>

        {/* Right Side Stats */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "2rem",
            minWidth: "120px",
            justifyContent: "center",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "2rem",
                fontWeight: "bold",
                color: "#ff9800",
              }}
            >
              {stats.shots > 0
                ? ((stats.goals / stats.shots) * 100).toFixed(1)
                : 0}
              %
            </div>
            <div
              style={{
                fontSize: "0.85rem",
                color: "#888",
                marginTop: "0.25rem",
              }}
            >
              Conversion
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "2rem",
                fontWeight: "bold",
                color: "#f44336",
              }}
            >
              {stats.shots - stats.goals}
            </div>
            <div
              style={{
                fontSize: "0.85rem",
                color: "#888",
                marginTop: "0.25rem",
              }}
            >
              Misses
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "2rem",
                fontWeight: "bold",
                color: "#03dac6",
              }}
            >
              {currentStats?.shotsPerMinute?.toFixed(1) || "0.0"}
            </div>
            <div
              style={{
                fontSize: "0.85rem",
                color: "#888",
                marginTop: "0.25rem",
              }}
            >
              Shots/Min
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Heatmap;
