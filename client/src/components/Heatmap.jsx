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
      {/* Heatmap Grid - TOP SECTION, RECTANGULAR */}
      <div className="heatmap-grid-container" style={{ marginBottom: '2rem' }}>
        <h4 style={{ color: '#bb86fc', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.5rem' }}>📍 Shot Heatmap</h4>        <p style={{ fontSize: "0.95rem", color: "#aaa", marginBottom: "1rem" }}>
          Rocket League field from above – click cells for details
        </p>
        <div style={{ position: 'relative', width: 400, height: 600, margin: '0 auto' }}>
          {/* Field markings overlay - like plugin */}
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2, pointerEvents: 'none' }} viewBox="0 0 400 600">
            {/* Goal boxes */}
            <rect x="145" y="8" width="110" height="55" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
            <rect x="145" y="537" width="110" height="55" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
            {/* Center circle */}
            <circle cx="200" cy="300" r="70" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
            {/* Center line */}
            <line x1="0" y1="300" x2="400" y2="300" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
          </svg>
          
          <div className="heatmap-grid" style={{ 
            boxShadow: '0 4px 32px rgba(0,0,0,0.6)', 
            borderRadius: '12px', 
            overflow: 'visible', 
            border: '1px solid rgba(187,134,252,0.3)', 
            background: 'rgba(10,10,20,0.85)', 
            width: 400, 
            height: 600, 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center',
            position: 'relative',
            zIndex: 1
          }}>
            {heatmapData.shots.map((row, y) => (
              <div key={y} className="heatmap-row" style={{ display: 'flex', gap: 0 }}>
                {row.map((value, x) => {
                  const maxValue = Math.max(...heatmapData.shots.flat().filter((v) => v > 0));
                  const intensity = maxValue > 0 ? value / maxValue : 0;
                  
                  function getFrequencyColor(intensity) {
                    if (intensity === 0) return 'rgba(15,15,30,0.3)';
                    const colors = [[40, 120, 220], [80, 220, 150], [180, 255, 80], [255, 200, 0], [255, 50, 50]];
                    const stops = [0, 0.25, 0.5, 0.75, 1];
                    let idx = stops.findIndex(s => intensity <= s);
                    if (idx === -1) idx = colors.length - 1;
                    if (idx === 0) {
                      const t = intensity / stops[0];
                      return `rgba(${colors[0][0]},${colors[0][1]},${colors[0][2]},${0.3 + intensity * 0.6})`;
                    }
                    const t = (intensity - stops[idx-1]) / (stops[idx] - stops[idx-1]);
                    const c1 = colors[idx-1], c2 = colors[idx];
                    const r = Math.round(c1[0] + t * (c2[0] - c1[0]));
                    const g = Math.round(c1[1] + t * (c2[1] - c1[1]));
                    const b = Math.round(c1[2] + t * (c2[2] - c1[2]));
                    const a = 0.3 + intensity * 0.6;
                    return `rgba(${r},${g},${b},${a})`;
                  }
                  
                  const zoneShots = value;
                  const zoneGoals = heatmapData.goals[y]?.[x] || 0;
                  const accuracy = zoneShots > 0 ? Math.min(zoneGoals / zoneShots, 1) : 0;
                  const cellColor = getFrequencyColor(intensity);
                  const isSelected = selectedZone === `cell-${x}-${y}`;
                  
                  return (
                    <div
                      key={x}                      className="heatmap-cell"                      style={{
                        background: cellColor,
                        border: 'none',
                        width: 36,
                        height: 56,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: value > 0 ? '0.9rem' : '0',
                        color: intensity > 0.5 ? '#fff' : 'rgba(255,255,255,0.85)',
                        textShadow: intensity > 0.5 ? '0 0 6px rgba(0,0,0,0.9)' : 'none',
                        transition: 'all 0.2s ease-out',
                        boxShadow: intensity > 0 ? `0 0 ${15 + intensity * 25}px rgba(${intensity > 0.5 ? '255,50,50' : '40,120,220'},${0.3 + intensity * 0.5})` : 'none',
                        cursor: value > 0 ? 'pointer' : 'default',
                        position: 'relative',
                        filter: intensity > 0 ? `blur(${0.3 + intensity * 1}px) brightness(${1 + intensity * 0.2})` : 'none',
                        outline: isSelected ? '2px solid rgba(255,255,255,0.9)' : 'none',
                        outlineOffset: '-2px',
                        borderRadius: '50%',
                      }}
                      title={value > 0 ? `Position (${x}, ${y}): ${value} shots` : ''}
                      onClick={() => value > 0 && setSelectedZone(`cell-${x}-${y}`)}
                      onMouseEnter={(e) => {
                        if (value > 0) {
                          e.currentTarget.style.transform = 'scale(1.1)';
                          e.currentTarget.style.zIndex = '5';
                          e.currentTarget.style.filter = `blur(${0.2 + intensity * 0.8}px) brightness(${1.3 + intensity * 0.2})`;
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.zIndex = '1';
                        e.currentTarget.style.filter = intensity > 0 ? `blur(${0.3 + intensity * 1}px) brightness(${1 + intensity * 0.2})` : 'none';
                      }}
                    >
                      {value > 0 && <span className="cell-value" style={{ position: 'relative', zIndex: 10 }}>{value}</span>}                      {isSelected && (
                        <div style={{
                          position: 'absolute',
                          top: y < 3 ? '50px' : '-80px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          background: 'rgba(15,15,25,0.98)',
                          color: '#fff',
                          borderRadius: '10px',
                          boxShadow: '0 4px 24px rgba(0,0,0,0.8), 0 0 0 1px rgba(187,134,252,0.5)',
                          padding: '12px 16px',
                          zIndex: 100,
                          minWidth: '140px',
                          fontSize: '0.9rem',
                          pointerEvents: 'none',
                          whiteSpace: 'nowrap',
                          filter: 'none',
                          backdropFilter: 'blur(8px)',
                        }}>
                          <div style={{ fontWeight: 'bold', marginBottom: '6px', color: '#bb86fc', fontSize: '0.95rem' }}>Zone ({x}, {y})</div>
                          <div style={{ marginBottom: '2px' }}>📍 Shots: <span style={{ color: '#4fc3f7', fontWeight: 'bold' }}>{zoneShots}</span></div>
                          <div style={{ marginBottom: '2px' }}>⚽ Goals: <span style={{ color: '#66bb6a', fontWeight: 'bold' }}>{zoneGoals}</span></div>
                          <div>🎯 Accuracy: <span style={{ color: accuracy > 0.5 ? '#66bb6a' : '#ff9800', fontWeight: 'bold' }}>{zoneShots > 0 ? (accuracy * 100).toFixed(1) : '0'}%</span></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <div className="heatmap-legend" style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
          <span style={{ color: '#888', fontSize: '0.9rem', fontWeight: '500' }}>Cold</span>
          <div className="legend-gradient" style={{ width: 220, height: 20, background: 'linear-gradient(90deg, rgba(40,120,220,0.4) 0%, rgba(80,220,150,0.6) 25%, rgba(180,255,80,0.7) 50%, rgba(255,200,0,0.8) 75%, rgba(255,50,50,0.9) 100%)', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}></div>
          <span style={{ color: '#bb86fc', fontSize: '0.9rem', fontWeight: '500' }}>Hot</span>
        </div>
      </div>

      {/* Shot Analysis Section - BELOW HEATMAP */}
      <div className="heatmap-header">
        <h2>🔥 Shot Analysis by Zone</h2>
        {!hasData && (
          <div className="no-data-banner" style={{
            padding: "10px",
            background: "rgba(255, 193, 7, 0.1)",
            border: "1px solid rgba(255, 193, 7, 0.3)",
            borderRadius: "8px",
            margin: "10px 0",
            color: "#ffc107",
          }}>
            <p style={{ margin: 0 }}>⚠️ No shot data recorded yet. Play some Rocket League to see your heatmap!</p>
          </div>
        )}
        <div className="zone-selector">
          <label htmlFor="zone-select">Select Zone:</label>
          <select id="zone-select" value={selectedZone} onChange={(e) => setSelectedZone(e.target.value)} className="zone-select">
            {zones.map((zone) => (
              <option key={zone.id} value={zone.id}>{zone.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="heatmap-content">
        <div className="zone-info">
          <h3>{zones.find((z) => z.id === selectedZone)?.name}</h3>
          <p className="zone-description">{zones.find((z) => z.id === selectedZone)?.description}</p>
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
