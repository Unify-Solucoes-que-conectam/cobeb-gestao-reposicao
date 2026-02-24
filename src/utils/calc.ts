export interface Coordenadas {
  latitude: number;
  longitude: number;
}

export const calcularDistanciaMetros = (ponto1: Coordenadas, ponto2: Coordenadas): number => {
  const R = 6371e3; // Raio da Terra em metros
  const dLat = (ponto2.latitude - ponto1.latitude) * (Math.PI / 180);
  const dLon = (ponto2.longitude - ponto1.longitude) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(ponto1.latitude * (Math.PI / 180)) *
      Math.cos(ponto2.latitude * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
};