const PINCODE_ZONES: Record<string, string> = {
  '110': 'North',  // Delhi
  '400': 'West',   // Mumbai
  '600': 'South',  // Chennai
  '700': 'East',   // Kolkata
  '500': 'South',  // Hyderabad
  '560': 'South',  // Bangalore
  '380': 'West',   // Ahmedabad
  '302': 'North',  // Jaipur
  '226': 'North',  // Lucknow
  '800': 'East',   // Patna
};

const ZONE_RATE_MATRIX: Record<string, Record<string, number>> = {
  North: { North: 10, South: 18, East: 15, West: 14 },
  South: { North: 18, South: 10, East: 17, West: 16 },
  East:  { North: 15, South: 17, East: 10, West: 19 },
  West:  { North: 14, South: 16, East: 19, West: 10 },
};

export const VEHICLE_TYPES = [
  { type: 'Bike',       capacityKg: 20,   baseCost: 0 },
  { type: 'Mini Van',   capacityKg: 200,  baseCost: 0 },
  { type: 'Truck',      capacityKg: 1000, baseCost: 0 },
  { type: 'Heavy Truck',capacityKg: 5000, baseCost: 0 },
] as const;

const DIM_FACTOR = 5000;

export function getZone(pincode: string): string | null {
  const prefix = pincode.slice(0, 3);
  return PINCODE_ZONES[prefix] ?? null;
}

export function getRate(originZone: string, destZone: string): number | null {
  return ZONE_RATE_MATRIX[originZone]?.[destZone] ?? null;
}

export function chargeableWeight(
  actualKg: number,
  lengthCm: number,
  widthCm: number,
  heightCm: number
): number {
  const volumetric = (lengthCm * widthCm * heightCm) / DIM_FACTOR;
  return Math.max(actualKg, volumetric);
}

export interface ShipmentInput {
  sku: string;
  quantity: number;
  weightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
}

export interface VehicleLoad {
  vehicleType: string;
  capacityKg: number;
  items: ShipmentInput[];
  totalChargeableKg: number;
  cost: number;
}

export interface RateQuoteResult {
  originPincode: string;
  destinationPincode: string;
  originZone: string;
  destinationZone: string;
  ratePerKg: number;
  vehicles: VehicleLoad[];
  totalCost: number;
  justification: string;
}

export function computeRateQuote(
  originPincode: string,
  destinationPincode: string,
  items: ShipmentInput[]
): RateQuoteResult {
  const originZone = getZone(originPincode);
  const destZone = getZone(destinationPincode);

  if (!originZone) throw new Error(`Unknown origin pincode: ${originPincode}`);
  if (!destZone) throw new Error(`Unknown destination pincode: ${destinationPincode}`);

  const ratePerKg = getRate(originZone, destZone);
  if (ratePerKg === null) throw new Error(`No rate found for ${originZone} → ${destZone}`);

  // Expand items into units with individual chargeable weights
  const units: { sku: string; chargeableKg: number; source: ShipmentInput }[] = [];
  for (const item of items) {
    const cw = chargeableWeight(item.weightKg, item.lengthCm, item.widthCm, item.heightCm);
    for (let i = 0; i < item.quantity; i++) {
      units.push({ sku: item.sku, chargeableKg: cw, source: item });
    }
  }

  const totalChargeableKg = units.reduce((s, u) => s + u.chargeableKg, 0);

  // Sort vehicles ascending by capacity
  const vehicles = [...VEHICLE_TYPES].sort((a, b) => a.capacityKg - b.capacityKg);
  const maxVehicle = vehicles[vehicles.length - 1];

  const loads: VehicleLoad[] = [];
  let remaining = [...units];

  while (remaining.length > 0) {
    const remainingWeight = remaining.reduce((s, u) => s + u.chargeableKg, 0);

    // Pick smallest vehicle that fits all remaining units
    const fit = vehicles.find(v => v.capacityKg >= remainingWeight);
    const chosen = fit ?? maxVehicle;

    // Pack as many units as fit into this vehicle
    const load: typeof remaining = [];
    let loadWeight = 0;

    for (const unit of remaining) {
      if (loadWeight + unit.chargeableKg <= chosen.capacityKg) {
        load.push(unit);
        loadWeight += unit.chargeableKg;
      }
    }

    // If nothing fits (single unit > max capacity), force it in
    if (load.length === 0) {
      load.push(remaining[0]);
      loadWeight = remaining[0].chargeableKg;
    }

    const loadCost = Math.ceil(loadWeight * ratePerKg);

    loads.push({
      vehicleType: chosen.type,
      capacityKg: chosen.capacityKg,
      items: load.map(u => u.source),
      totalChargeableKg: Math.round(loadWeight * 100) / 100,
      cost: loadCost,
    });

    const loadedSkus = new Set(load);
    remaining = remaining.filter(u => !loadedSkus.has(u));
  }

  const totalCost = loads.reduce((s, l) => s + l.cost, 0);

  // Build justification
  const usedTypes = [...new Set(loads.map(l => l.vehicleType))];
  const dimNote = units.some(u => {
    const vol = (u.source.lengthCm * u.source.widthCm * u.source.heightCm) / DIM_FACTOR;
    return vol > u.source.weightKg;
  });

  const justification = [
    `Route: ${originZone} (${originPincode}) → ${destZone} (${destinationPincode}) @ ₹${ratePerKg}/kg.`,
    `Total chargeable weight: ${Math.round(totalChargeableKg * 100) / 100} kg across ${loads.length} vehicle(s).`,
    dimNote ? 'Volumetric weight exceeded actual weight for some items — dimensional weight used.' : 'Actual weight used (heavier than volumetric).',
    `Vehicles: ${usedTypes.join(', ')}. Smallest vehicle(s) that fit the load were chosen to minimise cost.`,
    loads.length > 1 ? `Order split across ${loads.length} vehicles because total weight exceeded one ${loads[0].vehicleType}'s capacity.` : '',
  ].filter(Boolean).join(' ');

  return {
    originPincode,
    destinationPincode,
    originZone,
    destinationZone: destZone,
    ratePerKg,
    vehicles: loads,
    totalCost,
    justification,
  };
}
