// Statistics Calculator Functions based on the provided TypeScript code
// Implementing loop-based logic to iterate through all objects in JSON

export const calculateStatistics = (tripData, distanceUnit = 'km') => {
  // Initialize statistics object
  const stats = {
    plannedTrucks: 0,
    numberOfTrips: 0,
    plannedOrders: 0,
    preplannedOrders: 0,
    unPlannedTrucks: 0,
    unplannedMustGos: 0,
    totalVolume: 0,
    totalVolumeVMI: 0,
    totalVolumeNonVMI: 0,
    unplannedNonVMIVolume: 0,
    averagePayloadUtilization: 0,
    averageShiftUtilization: 0,
    averageUnplannedTimePerTruck: 0,
    averageNumberOfDrops: 0,
    totalUsedTime: 0,
    delay: 0,
    totalUsedKMs: 0,
    wayBackKm: 0,
    kmPerM3: 0,
    m3PerHour: 0
  };

  // Variables for calculations
  let totalShiftTime = 0;
  let totalPayloadUtilization = 0;
  let totalTripsCount = 0;
  let totalTrucks = 0;

  // Main loop through all trip data
  for (let i = 0; i < tripData.length; i++) {
    const trip = tripData[i];
    totalTrucks++;

    // Calculate shift utilization data
    stats.totalUsedTime += trip.shiftUsedDurationInMinute || 0;
    totalShiftTime += trip.shiftDurationInMinute || 0;

    // Check if truck has trips (planned vs unplanned)
    const tripLoadAndOrders = trip.tripEvents?.tripLoadAndOrders || [];
    
    if (tripLoadAndOrders.length > 0) {
      stats.plannedTrucks++;
      
      // Loop through each trip load and order
      for (let j = 0; j < tripLoadAndOrders.length; j++) {
        const tripLoadOrder = tripLoadAndOrders[j];
        stats.numberOfTrips++;
        totalTripsCount++;

        // Calculate KM metrics
        stats.totalUsedKMs += tripLoadOrder.totalKM || 0;
        stats.wayBackKm += tripLoadOrder.customerToUBORLPDistanceKM || 0;

        // Calculate payload utilization
        if (tripLoadOrder.totalWorkingCapacity > 0 && tripLoadOrder.maxPayload > 0) {
          const payloadUtilization = Math.round((tripLoadOrder.payload / tripLoadOrder.maxPayload) * 100);
          totalPayloadUtilization += payloadUtilization;
        }

        // Loop through orders
        const orders = tripLoadOrder.orders || [];
        for (let k = 0; k < orders.length; k++) {
          const order = orders[k];
          stats.plannedOrders++;

          // Check if order is preplanned
          if (tripLoadOrder.isPreplanned === true) {
            stats.preplannedOrders++;
          }

          // Loop through order positions to calculate volumes
          const orderPositions = order.orderPositions || [];
          for (let l = 0; l < orderPositions.length; l++) {
            const orderPosition = orderPositions[l];
            const quantity = orderPosition.quantity || 0;

            // Calculate VMI vs Non-VMI volumes
            if (order.isVMI) {
              stats.totalVolumeVMI += quantity;
            } else {
              stats.totalVolumeNonVMI += quantity;
              
              // If this is from an unplanned trip, add to unplanned non-VMI volume
              if (tripLoadOrder.isUnplannedTrip === true) {
                stats.unplannedNonVMIVolume += quantity;
              }
            }
          }
        }

        // Check for unplanned must-go's
        if (tripLoadOrder.isUnplannedTrip === true) {
          stats.unplannedMustGos++;
        }
      }
    } else {
      stats.unPlannedTrucks++;
    }
  }

  // Calculate derived statistics
  stats.totalVolume = stats.totalVolumeVMI + stats.totalVolumeNonVMI;
  
  // Average shift utilization
  stats.averageShiftUtilization = totalShiftTime > 0 ? (stats.totalUsedTime / totalShiftTime) * 100 : 0;
  
  // Average unplanned time per truck
  stats.averageUnplannedTimePerTruck = totalTrucks > 0 ? (totalShiftTime - stats.totalUsedTime) / totalTrucks : 0;
  
  // Average payload utilization
  stats.averagePayloadUtilization = totalTripsCount > 0 ? totalPayloadUtilization / totalTripsCount : 0;
  
  // Average number of drops
  stats.averageNumberOfDrops = stats.numberOfTrips > 0 ? stats.plannedOrders / stats.numberOfTrips : 0;
  
  // km/m³ calculation (convert liters to m³)
  const totalVolumeM3 = stats.totalVolume / 1000;
  stats.kmPerM3 = totalVolumeM3 > 0 ? stats.totalUsedKMs / totalVolumeM3 : 0;
  
  // m³/hour calculation (convert minutes to hours)
  const totalUsedTimeHours = stats.totalUsedTime / 60;
  stats.m3PerHour = totalUsedTimeHours > 0 ? totalVolumeM3 / totalUsedTimeHours : 0;

  return stats;
};
