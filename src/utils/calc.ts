export interface Coordenadas {
  latitude: number;
  longitude: number;
}

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // Raio da Terra em metros
  const p1 = lat1 * Math.PI / 180;
  const p2 = lat2 * Math.PI / 180;
  const deltaP = (lat2 - lat1) * Math.PI / 180;
  const deltaL = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(deltaP / 2) * Math.sin(deltaP / 2) +
            Math.cos(p1) * Math.cos(p2) *
            Math.sin(deltaL / 2) * Math.sin(deltaL / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distância em metros
};