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

  return (
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

        {/* Improved Visual Heatmap Grid */}
        <div className="heatmap-grid-container">
          <h4 style={{ color: '#bb86fc', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.5rem' }}>📍 Shot Heatmap</h4>
          <p style={{ fontSize: "0.95rem", color: "#aaa", marginBottom: "1rem" }}>
            Rocket League field from above – brighter cells = more shots taken from that location
          </p>
          <div className="heatmap-grid" style={{ boxShadow: '0 2px 16px #0008', borderRadius: '12px', overflow: 'hidden', border: '2px solid #bb86fc', background: 'rgba(30,30,50,0.7)' }}>
            {heatmapData.shots.map((row, y) => (
              <div key={y} className="heatmap-row" style={{ display: 'flex' }}>
                {row.map((value, x) => {
                  const maxValue = Math.max(...heatmapData.shots.flat().filter((v) => v > 0));
                  const intensity = maxValue > 0 ? value / maxValue : 0;
                  const backgroundColor =
                    intensity > 0
                      ? `linear-gradient(135deg, rgba(187,134,252,${0.15 + intensity * 0.85}), rgba(123,31,162,${0.12 + intensity * 0.7}))`
                      : "rgba(40, 40, 60, 0.5)";
                  return (
                    <div
                      key={x}
                      className="heatmap-cell"
                      style={{
                        background: backgroundColor,
                        border: "1px solid rgba(255,255,255,0.08)",
                        width: 36,
                        height: 36,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: value > 0 ? '1.1rem' : '0.9rem',
                        color: value > 0 ? '#fff' : '#888',
                        transition: 'background 0.3s',
                        boxShadow: intensity > 0 ? '0 0 8px #bb86fc88' : 'none',
                        borderRadius: '6px',
                      }}
                      title={`Position (${x}, ${y}): ${value} shots`}
                    >
                      {value > 0 && <span className="cell-value">{value}</span>}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="heatmap-legend" style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: '#888', fontSize: '0.95rem' }}>Less Activity</span>
            <div className="legend-gradient" style={{ width: 120, height: 12, background: 'linear-gradient(90deg, #282828 0%, #bb86fc 100%)', borderRadius: 6 }}></div>
            <span style={{ color: '#bb86fc', fontSize: '0.95rem' }}>More Activity</span>
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
  );
}

export default Heatmap;
