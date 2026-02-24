import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Cliente } from "@/types/consults";
import { calcularDistanciaMetros, Coordenadas } from "@/utils/calc";
import { NavigationIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface DetectClientCardProps {
  clientes: Cliente[]
  detectedClient?: (cliente: Cliente) => void
}
export default function DetectClientCard({ clientes, detectedClient }: DetectClientCardProps) {

  // ============ STATES ===========
  const [spinners, setSpinners] = useState({
    localizacao: false,
  });
  const [currentPosition, setCurrentPosition] = useState<Coordenadas | null>(null);

  const clientesProximos = useMemo(() => {
    if (!currentPosition) return [];

    return clientes.filter(cliente => {
      const distancia = calcularDistanciaMetros(currentPosition, cliente);
      return distancia <= 100; // Raio de 100 metros
    });
  }, [currentPosition, clientes]);

  // Função para disparar a captura
  const ativarLocalizacao = () => {
    setSpinners(prev => ({ ...prev, localizacao: true }));
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCurrentPosition({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        });
        setSpinners(prev => ({ ...prev, localizacao: false }));
      },
      () => setSpinners(prev => ({ ...prev, localizacao: false }))
    );
  };

  useEffect(() => {
    ativarLocalizacao();
  }, [])

  useEffect(() => {
    if (clientesProximos.length === 1 && detectedClient) {
      detectedClient(clientesProximos[0]);
    }
  }, [clientesProximos, detectedClient])

  // =========== HELPERS ===========
  const getLocationTitle = () => {
    if (spinners.localizacao) return "Detectando localização...";
    if (!currentPosition) return "Localização não detectada";
    if (clientesProximos.length === 1) return clientesProximos[0].nome_fantasia;
    if (clientesProximos.length > 0) return "Clientes próximos encontrados!";
    return "Nenhum cliente próximo encontrado";
  }

  const getLocationDescription = () => {
    if (spinners.localizacao) return "Por favor, aguarde enquanto detectamos sua localização.";
    if (!currentPosition) return "Ative a localização para encontrar clientes próximos.";
    if (clientesProximos.length === 1) return 'Cliente detectado automaticamente';
    if (clientesProximos.length > 0) return `Encontramos ${clientesProximos.length} cliente(s) próximo(s) de você.`;
    return "Nenhum cliente encontrado perto de você.";
  }

  return (
    <Card className="flex items-center">
      <CardHeader className="p-4">
        <div className={cn(
          "size-12 flex items-center justify-center rounded-full p-2",
          {
            "bg-yellow-100": !spinners.localizacao,
            "bg-blue-200 animate-pulse": spinners.localizacao,
            "bg-green-200": !spinners.localizacao && clientesProximos.length > 0,
            "bg-red-200": !spinners.localizacao && clientesProximos.length === 0,
          }
        )}>
          <NavigationIcon className={cn(
            {
              "text-yellow-500": !spinners.localizacao,
              "text-blue-500": spinners.localizacao,
              "text-green-500": !spinners.localizacao && clientesProximos.length > 0,
              "text-red-500": !spinners.localizacao && clientesProximos.length === 0,
            }
          )} />
        </div>
      </CardHeader>
      <CardContent className="py-4 px-0">
        <h2 className="text-lg font-semibold">{getLocationTitle()}</h2>
        <p className="text-sm text-muted-foreground">{getLocationDescription()}</p>
      </CardContent>
    </Card>
  )
}