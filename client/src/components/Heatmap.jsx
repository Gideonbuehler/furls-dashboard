import { useState } from "react";
import "./Heatmap.css";

function Heatmap({ heatmapData, currentStats }) {
  const [selectedZone, setSelectedZone] = useState("all");

  if (!heatmapData || !heatmapData.shots) {
    return (
      <div className="heatmap-container">
        <div className="no-data">
          <h2>No heatmap data available</h2>
          <p>Start playing to generate heatmap data!</p>
        </div>
      </div>
    );
  }

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

  const getZoneStats = () => {
    const data = heatmapData.shots;
    const goalData = heatmapData.goals;

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

  return (
    <div className="heatmap-container">
      <div className="heatmap-header">
        <h2> Shot Analysis by Zone</h2>
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
            <div className="stat-icon"></div>
            <div className="stat-content">
              <div className="stat-label">Total Shots</div>
              <div className="stat-value">{stats.shots}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon"></div>
            <div className="stat-content">
              <div className="stat-label">Goals Scored</div>
              <div className="stat-value">{stats.goals}</div>
            </div>
          </div>

          <div className="stat-card highlight">
            <div className="stat-icon"></div>
            <div className="stat-content">
              <div className="stat-label">Accuracy</div>
              <div className="stat-value">{stats.accuracy}%</div>
            </div>
          </div>
        </div>

        <div className="zone-tips">
          <h4> Tips for This Zone</h4>
          <ul>
            <li>Practice power shots from this area</li>
            <li>Work on shot placement and accuracy</li>
            <li>Try different angles and techniques</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Heatmap;
