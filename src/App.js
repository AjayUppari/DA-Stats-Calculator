import React, { useState } from 'react';
import { calculateStatistics } from './statisticsCalculator';
import { generateCalculationExplanation } from './calculationExplainer';
import { sampleTripData } from './sampleData';
import { formatValue, getDistanceUnitLabel, getDistancePerVolumeLabel } from './utils';

const App = () => {
  const [jsonInput, setJsonInput] = useState('');
  const [statistics, setStatistics] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [copyStatus, setCopyStatus] = useState('Copy');
  const [distanceUnit, setDistanceUnit] = useState('km');

  const handleCalculate = () => {
    setError('');
    setIsLoading(true);
    
    try {
      if (!jsonInput.trim()) {
        throw new Error('Please enter JSON data');
      }
      
      const tripData = JSON.parse(jsonInput);
      
      if (!Array.isArray(tripData)) {
        throw new Error('Input must be an array of trip data');
      }
      
      const calculatedStats = calculateStatistics(tripData, distanceUnit);
      const calculationExplanation = generateCalculationExplanation(tripData, calculatedStats, distanceUnit);
      
      setStatistics(calculatedStats);
      setExplanation(calculationExplanation);
      setShowExplanation(false); // Reset explanation visibility
      setCopyStatus('Copy'); // Reset copy status
    } catch (err) {
      setError(err.message);
      setStatistics(null);
      setExplanation('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleExplanation = () => {
    setShowExplanation(!showExplanation);
  };

  const handleCopyExplanation = async () => {
    try {
      await navigator.clipboard.writeText(explanation);
      setCopyStatus('Copied!');
      setTimeout(() => setCopyStatus('Copy'), 2000);
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = explanation;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopyStatus('Copied!');
      setTimeout(() => setCopyStatus('Copy'), 2000);
    }
  };

  const handleLoadSampleData = () => {
    setJsonInput(JSON.stringify(sampleTripData, null, 2));
    setError('');
    setStatistics(null);
  };

  const StatCard = ({ label, value, type = 'number' }) => (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{formatValue(value, type, distanceUnit)}</div>
    </div>
  );

  return (
    <div className="container">
      <div className="header">
        <h1>DA Statistics Calculator</h1>
        <p>Calculate comprehensive statistics from trip data JSON</p>
      </div>

      <div className="sample-data-section">
        <h3>Sample Data</h3>
        <p>Load sample data to test the calculator:</p>
        <button className="sample-button" onClick={handleLoadSampleData}>
          Load Sample Data
        </button>
      </div>

      <div className="input-section">
        <h3>JSON Input</h3>
        <div className="unit-selection">
          <label htmlFor="distance-unit">Distance Unit:</label>
          <select 
            id="distance-unit"
            value={distanceUnit} 
            onChange={(e) => setDistanceUnit(e.target.value)}
            className="unit-select"
          >
            <option value="km">Kilometers (km)</option>
            <option value="miles">Miles</option>
          </select>
        </div>
        <textarea
          className="textarea"
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder="Paste your trip data JSON here..."
        />
        <button 
          className="button" 
          onClick={handleCalculate}
          disabled={isLoading}
        >
          {isLoading ? 'Calculating...' : 'Calculate Statistics'}
        </button>
        
        {error && (
          <div className="error">
            Error: {error}
          </div>
        )}
      </div>

      {statistics && (
        <div className="results-section">
          <h3>Statistics Summary</h3>
          <div className="stats-grid">
            <StatCard 
              label="Planned Trucks" 
              value={statistics.plannedTrucks} 
              type="integer"
            />
            <StatCard 
              label="Number of Trips" 
              value={statistics.numberOfTrips} 
              type="integer"
            />
            <StatCard 
              label="Planned Orders" 
              value={statistics.plannedOrders} 
              type="integer"
            />
            <StatCard 
              label="Preplanned Orders" 
              value={statistics.preplannedOrders} 
              type="integer"
            />
            <StatCard 
              label="Unplanned Trucks" 
              value={statistics.unPlannedTrucks} 
              type="integer"
            />
            <StatCard 
              label="Unplanned Must-Go's" 
              value={statistics.unplannedMustGos} 
              type="integer"
            />
            <StatCard 
              label="Total Volume (L)" 
              value={statistics.totalVolume} 
              type="integer"
            />
            <StatCard 
              label="Total Volume VMI Orders (L)" 
              value={statistics.totalVolumeVMI} 
              type="integer"
            />
            <StatCard 
              label="Total Volume Non-VMI Orders (L)" 
              value={statistics.totalVolumeNonVMI} 
              type="integer"
            />
            <StatCard 
              label="Unplanned Non-VMI Volume (L)" 
              value={statistics.unplannedNonVMIVolume} 
              type="integer"
            />
            <StatCard 
              label="Average Payload Utilization" 
              value={statistics.averagePayloadUtilization} 
              type="percentage"
            />
            <StatCard 
              label="Average Shift Utilization" 
              value={statistics.averageShiftUtilization} 
              type="percentage"
            />
            <StatCard 
              label="Average Unplanned Time per Truck" 
              value={statistics.averageUnplannedTimePerTruck} 
              type="time"
            />
            <StatCard 
              label="Average Number of Drops" 
              value={statistics.averageNumberOfDrops} 
              type="decimal"
            />
            <StatCard 
              label="Total Used Time" 
              value={statistics.totalUsedTime} 
              type="time"
            />
            <StatCard 
              label="Delay" 
              value={statistics.delay} 
              type="time"
            />
            <StatCard 
              label={`Total Used ${getDistanceUnitLabel(distanceUnit)}`}
              value={statistics.totalUsedKMs} 
              type="distance"
            />
            <StatCard 
              label={`Way Back ${getDistanceUnitLabel(distanceUnit)}`}
              value={statistics.wayBackKm} 
              type="distance"
            />
            <StatCard 
              label={getDistancePerVolumeLabel(distanceUnit)}
              value={statistics.kmPerM3} 
              type="distance-decimal"
            />
            <StatCard 
              label="m³/hour" 
              value={statistics.m3PerHour} 
              type="decimal"
            />
          </div>
          
          <button 
            className="toggle-explanation-button" 
            onClick={handleToggleExplanation}
          >
            {showExplanation ? 'Hide Calculation Details' : 'Show Calculation Details'}
          </button>
        </div>
      )}

      {statistics && showExplanation && (
        <div className="explanation-section">
          <div className="explanation-header">
            <h3>Mathematical Calculation Explanation</h3>
            <button 
              className={`copy-button ${copyStatus === 'Copied!' ? 'copied' : ''}`}
              onClick={handleCopyExplanation}
            >
              <svg className="copy-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
              </svg>
              {copyStatus}
            </button>
          </div>
          <div className="explanation-text">
            {explanation}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
