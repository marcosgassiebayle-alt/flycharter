export interface Airport {
  code: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
}

export const airports: Airport[] = [
  { code: "SFN", name: "Aeropuerto de San Fernando", city: "San Fernando", lat: -34.453, lng: -58.590 },
  { code: "AEP", name: "Aeroparque Jorge Newbery", city: "Buenos Aires", lat: -34.559, lng: -58.416 },
  { code: "EZE", name: "Ezeiza Internacional", city: "Buenos Aires", lat: -34.822, lng: -58.536 },
  { code: "MRQ", name: "Aeródromo de Morón", city: "Morón", lat: -34.677, lng: -58.643 },
  { code: "EPA", name: "Aeródromo El Palomar", city: "El Palomar", lat: -34.610, lng: -58.613 },
  { code: "BRC", name: "Aeropuerto de Bariloche", city: "San Carlos de Bariloche", lat: -41.151, lng: -71.158 },
  { code: "MDZ", name: "Aeropuerto de Mendoza", city: "Mendoza", lat: -32.832, lng: -68.793 },
  { code: "IGR", name: "Aeropuerto de Iguazú", city: "Puerto Iguazú", lat: -25.737, lng: -54.474 },
  { code: "USH", name: "Aeropuerto de Ushuaia", city: "Ushuaia", lat: -54.843, lng: -68.296 },
  { code: "FTE", name: "Aeropuerto de El Calafate", city: "El Calafate", lat: -50.281, lng: -72.053 },
  { code: "SLA", name: "Aeropuerto de Salta", city: "Salta", lat: -24.856, lng: -65.486 },
  { code: "TUC", name: "Aeropuerto de Tucumán", city: "Tucumán", lat: -26.841, lng: -65.105 },
  { code: "COR", name: "Aeropuerto de Córdoba", city: "Córdoba", lat: -31.324, lng: -64.208 },
  { code: "ROS", name: "Aeropuerto de Rosario", city: "Rosario", lat: -32.904, lng: -60.785 },
  { code: "NQN", name: "Aeropuerto de Neuquén", city: "Neuquén", lat: -38.949, lng: -68.156 },
  { code: "CPC", name: "Aeropuerto Chapelco", city: "San Martín de los Andes", lat: -40.075, lng: -71.137 },
  { code: "PMY", name: "Aeropuerto de Puerto Madryn", city: "Puerto Madryn", lat: -42.759, lng: -65.103 },
  { code: "REL", name: "Aeropuerto de Trelew", city: "Trelew", lat: -43.210, lng: -65.270 },
  { code: "CRD", name: "Aeropuerto Comodoro Rivadavia", city: "Comodoro Rivadavia", lat: -45.785, lng: -67.466 },
  { code: "VDM", name: "Aeropuerto de Viedma", city: "Viedma", lat: -40.869, lng: -63.000 },
  { code: "HBA", name: "Helipuerto Buenos Aires", city: "Buenos Aires", lat: -34.592, lng: -58.370 },
  { code: "HPR", name: "Helipuerto Puerto Madero", city: "Buenos Aires", lat: -34.614, lng: -58.362 },
];

export function searchAirports(query: string): Airport[] {
  const q = query.toLowerCase();
  return airports.filter(
    (a) =>
      a.code.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      a.city.toLowerCase().includes(q)
  );
}

export function getAirportByCode(code: string): Airport | undefined {
  return airports.find((a) => a.code === code);
}
