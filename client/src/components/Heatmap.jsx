import { useState } from 'react';
import './Heatmap.css';

function Heatmap({ heatmapData, currentStats }) {
  const [showGoals, setShowGoals] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);

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

  const data = showGoals ? heatmapData.goals : heatmapData.shots;
  
  // Find max value for normalization
  const maxValue = Math.max(...data.flat());
  
  // Calculate accuracy for each zone
  const getZoneAccuracy = (y, x) => {
    const shots = heatmapData.shots[y]?.[x] || 0;
    const goals = heatmapData.goals[y]?.[x] || 0;
    return shots > 0 ? ((goals / shots) * 100).toFixed(1) : 0;
  };

  const getColor = (value) => {
    if (value === 0) return 'rgba(50, 50, 50, 0.3)';
    
    const intensity = Math.min(value / maxValue, 1);
    
    if (showGoals) {
      // Green for goals
      return `rgba(76, 175, 80, ${0.3 + intensity * 0.7})`;
    } else {
      // Blue to red gradient for shots
      if (intensity < 0.5) {
        return `rgba(33, 150, 243, ${0.3 + intensity * 0.7})`;
      } else {
        return `rgba(255, 152, 0, ${0.3 + intensity * 0.7})`;
      }
    }
  };

  const handleZoneClick = (y, x) => {
    setSelectedZone({ y, x });
  };

  return (
    <div className="heatmap-container">
      <div className="heatmap-header">
        <h2>🔥 Shot Heatmap</h2>
        <div className="heatmap-controls">
          <button 
            className={`toggle-btn ${!showGoals ? 'active' : ''}`}
            onClick={() => setShowGoals(false)}
          >
            📍 Shots
          </button>
          <button 
            className={`toggle-btn ${showGoals ? 'active' : ''}`}
            onClick={() => setShowGoals(true)}
          >
            ⚽ Goals
          </button>
        </div>
      </div>

      <div className="heatmap-content">
        <div className="field-container">
          <div className="field-label top">🥅 Opponent Goal</div>
          <div className="heatmap-grid">
            {data.map((row, y) => (
              <div key={y} className="heatmap-row">
                {row.map((value, x) => (
                  <div
                    key={`${y}-${x}`}
                    className={`heatmap-cell ${selectedZone?.y === y && selectedZone?.x === x ? 'selected' : ''}`}
                    style={{ backgroundColor: getColor(value) }}
                    onClick={() => handleZoneClick(y, x)}
                    title={`Zone (${x}, ${y}): ${value} ${showGoals ? 'goals' : 'shots'} | Accuracy: ${getZoneAccuracy(y, x)}%`}
                  >
                    {value > 0 && value}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="field-label bottom">Your Goal 🥅</div>
        </div>

        {selectedZone && (
          <div className="zone-details">
            <h3>Zone Details</h3>
            <p><strong>Position:</strong> ({selectedZone.x}, {selectedZone.y})</p>
            <p><strong>Shots:</strong> {heatmapData.shots[selectedZone.y]?.[selectedZone.x] || 0}</p>
            <p><strong>Goals:</strong> {heatmapData.goals[selectedZone.y]?.[selectedZone.x] || 0}</p>
            <p><strong>Accuracy:</strong> {getZoneAccuracy(selectedZone.y, selectedZone.x)}%</p>
            <button onClick={() => setSelectedZone(null)}>Close</button>
          </div>
        )}

        <div className="heatmap-legend">
          <h4>Legend</h4>
          <div className="legend-scale">
            <span>Low</span>
            <div className="legend-gradient"></div>
            <span>High</span>
          </div>
          <p className="legend-info">
            {showGoals 
              ? 'Green intensity shows successful goal frequency from each zone'
              : 'Color intensity shows shot frequency from each zone (blue = low, orange = high)'
            }
          </p>
        </div>
      </div>
    </div>
  );
}

export default Heatmap;
