import { useState } from "react";
import "./Heatmap.css";

function Heatmap({ heatmapData, currentStats }) {
  const [selectedZone, setSelectedZone] = useState("all");

  // Define zones
  const zones = [
    { id: "all", name: "All Field", description: "Entire field" },
    { id: "attacking-third", name: "Attacking Third", description: "Near opponent goal" },
    { id: "midfield", name: "Midfield", description: "Middle of the field" },
    { id: "defensive-third", name: "Defensive Third", description: "Near your goal" },
    { id: "left-wing", name: "Left Wing", description: "Left side of field" },
    { id: "center", name: "Center", description: "Center of field" },
    { id: "right-wing", name: "Right Wing", description: "Right side of field" },
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

  // Debug: Show the entire heatmapData object
  return (
    <div>
      <pre
        style={{
          color: "red",
          background: "#222",
          padding: "8px",
          fontSize: "1rem",
        }}
      >
        {JSON.stringify(heatmapData, null, 2)}
      </pre>
      <div className="heatmap-container">
        <div className="heatmap-header">
          <h2>🔥 Shot Analysis by Zone</h2>
          {!hasData && (
            <div
              className="no-data-banner"
              style={{
                padding: "10px",
                background: "rgba(255, 193, 7, 0.1)",
                border: "1px solid rgba(255, 193, 7, 0.3)",
                borderRadius: "8px",
                margin: "10px 0",
                color: "#ffc107",
              }}
            >
              <p style={{ margin: 0 }}>
                ⚠️ No shot data recorded yet. Play some Rocket League to see
                your heatmap!
              </p>
            </div>
          )}
          <div className="zone-selector">
            <label htmlFor="zone-select">Select Zone:</label>
            <select
              id="zone-select"
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="zone-select"
            >
              {zones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="heatmap-content">
          <div className="zone-info">
            <h3>{zones.find((z) => z.id === selectedZone)?.name}</h3>
            <p className="zone-description">
              {zones.find((z) => z.id === selectedZone)?.description}
            </p>
          </div>

          <div className="zone-stats">
            <div className="stat-card">
              <div className="stat-icon">📍</div>
              <div className="stat-content">
                <div className="stat-label">Total Shots</div>
                <div className="stat-value">{stats.shots}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">⚽</div>
              <div className="stat-content">
                <div className="stat-label">Goals Scored</div>
                <div className="stat-value">{stats.goals}</div>
              </div>
            </div>

            <div className="stat-card highlight">
              <div className="stat-icon">🎯</div>
              <div className="stat-content">
                <div className="stat-label">Accuracy</div>
                <div className="stat-value">{stats.accuracy}%</div>
              </div>
            </div>
          </div>

          {/* Visual Heatmap Grid */}
          <div className="heatmap-grid-container">
            <div
              style={{ color: "red", fontWeight: "bold", fontSize: "1.2rem" }}
            >
              DEBUG: Heatmap grid section is rendering
            </div>
            <h4>📍 Shot Heatmap</h4>
            <p
              style={{
                fontSize: "0.9rem",
                color: "#888",
                marginBottom: "1rem",
              }}
            >
              Rocket League field from above - brighter cells = more shots taken
              from that location
            </p>
            <div className="heatmap-grid">
              {heatmapData.shots.map((row, y) => (
                <div key={y} className="heatmap-row">
                  {row.map((value, x) => {
                    const maxValue = Math.max(
                      ...heatmapData.shots.flat().filter((v) => v > 0)
                    );
                    const intensity = maxValue > 0 ? value / maxValue : 0;
                    const backgroundColor =
                      intensity > 0
                        ? `rgba(187, 134, 252, ${0.1 + intensity * 0.9})`
                        : "rgba(40, 40, 40, 0.5)";

                    return (
                      <div
                        key={x}
                        className="heatmap-cell"
                        style={{
                          backgroundColor,
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                        }}
                        title={`Position (${x}, ${y}): ${value} shots`}
                      >
                        {value > 0 && (
                          <span className="cell-value">{value}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Debug: Show raw heatmap data */}
            <pre
              style={{
                color: "#fff",
                background: "#222",
                padding: "8px",
                fontSize: "0.8rem",
                marginTop: "1rem",
              }}
            >
              {JSON.stringify(heatmapData.shots, null, 2)}
            </pre>

            <div className="heatmap-legend">
              <span>Less Activity</span>
              <div className="legend-gradient"></div>
              <span>More Activity</span>
            </div>
          </div>

          <div className="zone-tips">
            <h4>💡 Tips for This Zone</h4>
            <ul>
              <li>Practice power shots from this area</li>
              <li>Work on shot placement and accuracy</li>
              <li>Try different angles and techniques</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Heatmap;
