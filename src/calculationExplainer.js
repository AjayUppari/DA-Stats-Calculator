// Function to generate detailed mathematical calculation explanations

import { formatDistance, getDistanceUnitLabel, getDistancePerVolumeLabel, formatTimeToHoursMinutes } from './utils';

export const generateCalculationExplanation = (tripData, statistics, distanceUnit = 'km') => {
  let explanation = "DETAILED MATHEMATICAL CALCULATION EXPLANATION\n";
  explanation += "=" .repeat(60) + "\n\n";
  
  const distanceLabel = getDistanceUnitLabel(distanceUnit);
  const distancePerVolumeLabel = getDistancePerVolumeLabel(distanceUnit);

  // Variables for intermediate calculations
  let totalShiftTime = 0;
  let totalPayloadUtilization = 0;
  let totalTripsCount = 0;
  let totalTrucks = tripData.length;

  explanation += `INPUT DATA ANALYSIS:\n`;
  explanation += `- Total number of trip records: ${tripData.length}\n\n`;

  // Step 1: Basic Counts
  explanation += "STEP 1: BASIC COUNTING CALCULATIONS\n";
  explanation += "-".repeat(40) + "\n";

  let plannedTrucksCount = 0;
  let unplannedTrucksCount = 0;
  let totalTrips = 0;
  let totalOrders = 0;
  let preplannedOrdersCount = 0;

  explanation += "Iterating through each trip record:\n";
  
  for (let i = 0; i < tripData.length; i++) {
    const trip = tripData[i];
    const tripLoadAndOrders = trip.tripEvents?.tripLoadAndOrders || [];
    
    explanation += `\nTrip ${i + 1}:\n`;
    explanation += `  - Shift Duration: ${trip.shiftDurationInMinute || 0} minutes\n`;
    explanation += `  - Shift Used Duration: ${trip.shiftUsedDurationInMinute || 0} minutes\n`;
    explanation += `  - Number of trip loads: ${tripLoadAndOrders.length}\n`;
    
    totalShiftTime += trip.shiftDurationInMinute || 0;
    
    if (tripLoadAndOrders.length > 0) {
      plannedTrucksCount++;
      explanation += `  → Classified as PLANNED TRUCK\n`;
      
      for (let j = 0; j < tripLoadAndOrders.length; j++) {
        const tripLoadOrder = tripLoadAndOrders[j];
        totalTrips++;
        totalTripsCount++;
        
        const totalDistance = formatDistance(tripLoadOrder.totalKM || 0, distanceUnit);
        const customerDistance = formatDistance(tripLoadOrder.customerToUBORLPDistanceKM || 0, distanceUnit);
        
        explanation += `    Trip Load ${j + 1}:\n`;
        explanation += `      - Total Distance: ${totalDistance.toFixed(1)} ${distanceLabel}\n`;
        explanation += `      - Customer to UB/LP Distance: ${customerDistance.toFixed(1)} ${distanceLabel}\n`;
        explanation += `      - Is Preplanned: ${tripLoadOrder.isPreplanned}\n`;
        explanation += `      - Number of orders: ${tripLoadOrder.orders?.length || 0}\n`;
        
        if (tripLoadOrder.totalWorkingCapacity > 0 && tripLoadOrder.maxPayload > 0) {
          const payloadUtilization = Math.round((tripLoadOrder.payload / tripLoadOrder.maxPayload) * 100);
          totalPayloadUtilization += payloadUtilization;
          explanation += `      - Payload Utilization: (${tripLoadOrder.payload} / ${tripLoadOrder.maxPayload}) × 100 = ${payloadUtilization}%\n`;
        }
        
        const orders = tripLoadOrder.orders || [];
        totalOrders += orders.length;
        
        if (tripLoadOrder.isPreplanned === true) {
          preplannedOrdersCount += orders.length;
        }
      }
    } else {
      unplannedTrucksCount++;
      explanation += `  → Classified as UNPLANNED TRUCK\n`;
    }
  }

  explanation += `\nCOUNTING RESULTS:\n`;
  explanation += `- Planned Trucks = ${plannedTrucksCount}\n`;
  explanation += `- Unplanned Trucks = ${unplannedTrucksCount}\n`;
  explanation += `- Total Trips = ${totalTrips}\n`;
  explanation += `- Total Orders = ${totalOrders}\n`;
  explanation += `- Preplanned Orders = ${preplannedOrdersCount}\n\n`;

  // Step 2: Volume Calculations
  explanation += "STEP 2: VOLUME CALCULATIONS\n";
  explanation += "-".repeat(40) + "\n";
  
  let vmiVolume = 0;
  let nonVmiVolume = 0;
  let unplannedNonVmiVolume = 0;
  
  explanation += "Calculating volumes by iterating through order positions:\n";
  
  for (let i = 0; i < tripData.length; i++) {
    const trip = tripData[i];
    const tripLoadAndOrders = trip.tripEvents?.tripLoadAndOrders || [];
    
    for (let j = 0; j < tripLoadAndOrders.length; j++) {
      const tripLoadOrder = tripLoadAndOrders[j];
      const orders = tripLoadOrder.orders || [];
      
      for (let k = 0; k < orders.length; k++) {
        const order = orders[k];
        const orderPositions = order.orderPositions || [];
        
        explanation += `\nTrip ${i + 1}, Load ${j + 1}, Order ${k + 1} (VMI: ${order.isVMI}):\n`;
        
        for (let l = 0; l < orderPositions.length; l++) {
          const orderPosition = orderPositions[l];
          const quantity = orderPosition.quantity || 0;
          
          explanation += `  - Position ${l + 1}: ${quantity}L (${orderPosition.productName || 'Unknown'})\n`;
          
          if (order.isVMI) {
            vmiVolume += quantity;
            explanation += `    → Added to VMI Volume\n`;
          } else {
            nonVmiVolume += quantity;
            explanation += `    → Added to Non-VMI Volume\n`;
            
            if (tripLoadOrder.isUnplannedTrip === true) {
              unplannedNonVmiVolume += quantity;
              explanation += `    → Also added to Unplanned Non-VMI Volume\n`;
            }
          }
        }
      }
    }
  }
  
  explanation += `\nVOLUME CALCULATION RESULTS:\n`;
  explanation += `- Total VMI Volume = ${vmiVolume}L\n`;
  explanation += `- Total Non-VMI Volume = ${nonVmiVolume}L\n`;
  explanation += `- Total Volume = ${vmiVolume} + ${nonVmiVolume} = ${vmiVolume + nonVmiVolume}L\n`;
  explanation += `- Unplanned Non-VMI Volume = ${unplannedNonVmiVolume}L\n\n`;

  // Step 3: Time and Distance Calculations
  explanation += "STEP 3: TIME AND DISTANCE CALCULATIONS\n";
  explanation += "-".repeat(40) + "\n";
  
  let totalUsedTime = 0;
  let totalUsedKMs = 0;
  let wayBackKm = 0;
  
  for (let i = 0; i < tripData.length; i++) {
    const trip = tripData[i];
    totalUsedTime += trip.shiftUsedDurationInMinute || 0;
    
    const tripLoadAndOrders = trip.tripEvents?.tripLoadAndOrders || [];
    for (let j = 0; j < tripLoadAndOrders.length; j++) {
      const tripLoadOrder = tripLoadAndOrders[j];
      totalUsedKMs += tripLoadOrder.totalKM || 0;
      wayBackKm += tripLoadOrder.customerToUBORLPDistanceKM || 0;
    }
  }
  
  const totalUsedDistance = formatDistance(totalUsedKMs, distanceUnit);
  const totalWayBackDistance = formatDistance(wayBackKm, distanceUnit);
  
  explanation += `Total Used Time = Sum of all shiftUsedDurationInMinute = ${totalUsedTime} minutes (${formatTimeToHoursMinutes(totalUsedTime)})\n`;
  explanation += `Total Shift Time = Sum of all shiftDurationInMinute = ${totalShiftTime} minutes (${formatTimeToHoursMinutes(totalShiftTime)})\n`;
  explanation += `Total Used Distance = Sum of all totalKM = ${totalUsedKMs} km = ${totalUsedDistance.toFixed(1)} ${distanceLabel}\n`;
  explanation += `Way Back Distance = Sum of all customerToUBORLPDistanceKM = ${wayBackKm} km = ${totalWayBackDistance.toFixed(1)} ${distanceLabel}\n\n`;

  // Step 4: Average Calculations
  explanation += "STEP 4: AVERAGE AND DERIVED CALCULATIONS\n";
  explanation += "-".repeat(40) + "\n";
  
  explanation += `Average Shift Utilization:\n`;
  explanation += `= (Total Used Time / Total Shift Time) × 100\n`;
  explanation += `= (${totalUsedTime} / ${totalShiftTime}) × 100 = ${statistics.averageShiftUtilization.toFixed(2)}%\n\n`;
  
  explanation += `Average Unplanned Time per Truck:\n`;
  explanation += `= (Total Shift Time - Total Used Time) / Total Trucks\n`;
  explanation += `= (${totalShiftTime} - ${totalUsedTime}) / ${totalTrucks} = ${statistics.averageUnplannedTimePerTruck.toFixed(2)} minutes\n\n`;
  
  explanation += `Average Payload Utilization:\n`;
  explanation += `= Sum of all payload utilizations / Number of trips\n`;
  explanation += `= ${totalPayloadUtilization} / ${totalTripsCount} = ${statistics.averagePayloadUtilization.toFixed(2)}%\n\n`;
  
  explanation += `Average Number of Drops:\n`;
  explanation += `= Total Orders / Total Trips\n`;
  explanation += `= ${totalOrders} / ${totalTrips} = ${statistics.averageNumberOfDrops.toFixed(2)}\n\n`;
  
  const totalVolumeM3 = (vmiVolume + nonVmiVolume) / 1000;
  const convertedDistanceForCalc = formatDistance(totalUsedKMs, distanceUnit);
  const convertedKmPerM3 = formatDistance(statistics.kmPerM3, distanceUnit);
  
  explanation += `${distancePerVolumeLabel} Calculation:\n`;
  explanation += `= Total Used Distance / Total Volume in m³\n`;
  explanation += `= ${totalUsedKMs} km (${convertedDistanceForCalc.toFixed(1)} ${distanceLabel}) / (${vmiVolume + nonVmiVolume} / 1000)\n`;
  explanation += `= ${convertedDistanceForCalc.toFixed(1)} / ${totalVolumeM3.toFixed(3)} = ${convertedKmPerM3.toFixed(2)} ${distancePerVolumeLabel}\n\n`;
  
  const totalUsedTimeHours = totalUsedTime / 60;
  explanation += `m³/hour Calculation:\n`;
  explanation += `= Total Volume in m³ / Total Used Time in hours\n`;
  explanation += `= ${totalVolumeM3.toFixed(3)} / (${totalUsedTime} / 60)\n`;
  explanation += `= ${totalVolumeM3.toFixed(3)} / ${totalUsedTimeHours.toFixed(2)} = ${statistics.m3PerHour.toFixed(2)} m³/hour\n\n`;

  // Final Summary
  explanation += "FINAL CALCULATED STATISTICS SUMMARY:\n";
  explanation += "=".repeat(60) + "\n";
  explanation += `Planned Trucks: ${statistics.plannedTrucks}\n`;
  explanation += `Number of Trips: ${statistics.numberOfTrips}\n`;
  explanation += `Planned Orders: ${statistics.plannedOrders}\n`;
  explanation += `Preplanned Orders: ${statistics.preplannedOrders}\n`;
  explanation += `Unplanned Trucks: ${statistics.unPlannedTrucks}\n`;
  explanation += `Unplanned Must-Go's: ${statistics.unplannedMustGos}\n`;
  explanation += `Total Volume: ${statistics.totalVolume}L\n`;
  explanation += `Total Volume VMI Orders: ${statistics.totalVolumeVMI}L\n`;
  explanation += `Total Volume Non-VMI Orders: ${statistics.totalVolumeNonVMI}L\n`;
  explanation += `Unplanned Non-VMI Volume: ${statistics.unplannedNonVMIVolume}L\n`;
  explanation += `Average Payload Utilization: ${statistics.averagePayloadUtilization.toFixed(2)}%\n`;
  explanation += `Average Shift Utilization: ${statistics.averageShiftUtilization.toFixed(2)}%\n`;
  explanation += `Average Unplanned Time per Truck: ${formatTimeToHoursMinutes(statistics.averageUnplannedTimePerTruck)}\n`;
  explanation += `Average Number of Drops: ${statistics.averageNumberOfDrops.toFixed(2)}\n`;
  explanation += `Total Used Time: ${formatTimeToHoursMinutes(statistics.totalUsedTime)}\n`;
  explanation += `Delay: ${formatTimeToHoursMinutes(statistics.delay)}\n`;
  explanation += `Total Used Distance: ${formatDistance(statistics.totalUsedKMs, distanceUnit).toFixed(1)} ${distanceLabel}\n`;
  explanation += `Way Back Distance: ${formatDistance(statistics.wayBackKm, distanceUnit).toFixed(1)} ${distanceLabel}\n`;
  explanation += `${distancePerVolumeLabel}: ${formatDistance(statistics.kmPerM3, distanceUnit).toFixed(2)}\n`;
  explanation += `m³/hour: ${statistics.m3PerHour.toFixed(2)}\n`;

  return explanation;
};
