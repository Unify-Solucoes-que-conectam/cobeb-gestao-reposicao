import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Cliente } from "@/types/consults";
import { calculateDistance, Coordenadas } from "@/utils/calc";
import { Geolocation } from '@capacitor/geolocation';
import { SendIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
// import { toast } from "sonner";

interface DetectClientCardProps {
  clientes: Cliente[]
  currentDetected?: Cliente | null
  selected?: Cliente | null
  onSelect?: (cliente: Cliente) => void
  detectedClient?: (cliente: Cliente) => void
}
export default function DetectClientCard({ clientes, currentDetected, selected, onSelect, detectedClient }: DetectClientCardProps) {

  // ============ APP MODE ===========
  // Para mobile, usamos Capacitor Geolocation.
  const isMobile = useIsMobile();

  // ============ STATES ===========
  const [spinners, setSpinners] = useState({
    localizacao: false,
  });
  const [currentPosition, setCurrentPosition] = useState<Coordenadas | null>(null);

  // ========== HANDLERS
  const clientesProximos = useMemo(() => {
    if (!currentPosition) return [];
    if (currentDetected) return [currentDetected]; // Se já detectou um cliente, não precisa calcular os próximos, só retorna ele mesmo

    return clientes.filter(cliente => {
      const distancia = calculateDistance(currentPosition.latitude, currentPosition.longitude, cliente.latitude, cliente.longitude);
      return distancia <= 100; // Raio de 100 metros
    });
  }, [currentPosition, clientes]);

  // Função para disparar a captura
  const getNativeLocation = async () => {
    setSpinners(prev => ({ ...prev, localizacao: true }));

    try {
      // 1. Verificar/Solicitar Permissão
      const permission = await Geolocation.checkPermissions();

      if (permission.location !== 'granted') {
        const request = await Geolocation.requestPermissions();
        if (request.location !== 'granted') {
          return;
        }
      }

      // 2. Obter posição com GPS de hardware (High Accuracy)
      const coordinates = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true, // Crucial para o raio de 100m
        timeout: 10000
      });

      setCurrentPosition({
        latitude: coordinates.coords.latitude,
        longitude: coordinates.coords.longitude
      });

    } catch (e) {
      console.error(e);
    } finally {
      setSpinners(prev => ({ ...prev, localizacao: false }));
    }
  };

  const requestLocation = () => {
    setSpinners(prev => ({ ...prev, localizacao: true }));

    const options: PositionOptions = {
      enableHighAccuracy: true, // FORÇA o uso do GPS de hardware (essencial para os 100m)
      timeout: 15000,          // Tempo máximo de espera (15 segundos)
      maximumAge: 0            // Não aceita localização em cache (queremos a posição exata de agora)
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCurrentPosition({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        });
        setSpinners(prev => ({ ...prev, localizacao: false }));
      },
      () => {
        setSpinners(prev => ({ ...prev, localizacao: false }));
      },
      options
    );
  };

  // =========== EFFECTS ===========
  useEffect(() => {
    if (isMobile) {
      getNativeLocation();
    } else {
      requestLocation();
    }
  }, [])

  useEffect(() => {
    if (clientesProximos.length === 1 && detectedClient && !currentDetected) {
      detectedClient(clientesProximos[0]);
    }
  }, [clientesProximos, detectedClient, currentDetected])

  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' as PermissionName }).then((result) => {
        if (result.state === 'denied') {
          alert("Atenção: O acesso à localização está bloqueado. O aplicativo não funcionará corretamente.");
        }

        // Opcional: Monitorar se ele mudar a permissão nas configs enquanto o app tá aberto
        // result.onchange = () => {
        //   toast.info(`Status da permissão de GPS alterado para: ${result.state}`);
        // };
      });
    }
  }, []);

  // =========== HELPERS ===========
  const getLocationTitle = () => {
    if (spinners.localizacao) return "Detectando localização...";
    if (!currentPosition) return "Localização não detectada";
    if (clientesProximos.length === 1) return `[${clientesProximos[0].codigo}] ${clientesProximos[0].nome_fantasia}`;
    if (clientesProximos.length > 0) return "Clientes próximos encontrados!";
    return "Nenhum cliente próximo encontrado";
  }

  const getLocationDescription = () => {
    if (spinners.localizacao) return "Detecção de localização em andamento...";
    if (!currentPosition) return "Ative a localização para encontrar clientes próximos.";
    if (clientesProximos.length === 1) {
      if (selected && selected.id === clientesProximos[0].id) {
        return "Cliente mais próximo selecionado.";
      } else {
        return "Cliente mais próximo, toque para selecionar.";
      }
    };
    if (clientesProximos.length > 0) return `Encontramos ${clientesProximos.length} cliente(s) próximo(s) de você.`;
    return "Nenhum cliente encontrado perto de você.";
  }

  return (
    <Card 
  className={cn(
    "flex items-center shadow-sm rounded-xl cursor-pointer transition-colors border-slate-200",
    {
      // Cores de fundo do Card para cada estado
      "bg-blue-50": spinners.localizacao,
      "bg-green-50": !spinners.localizacao && clientesProximos.length > 0,
      "bg-amber-50": !spinners.localizacao && clientesProximos.length === 0,
    }
  )} 
  onClick={() => onSelect && onSelect(clientesProximos[0])}
>
  <CardHeader className="p-2 shrink-0 ">
    <div className={cn(
      "size-14 flex items-center justify-center rounded-full",
      {
        // Cores de fundo do círculo do Ícone
        "bg-blue-200 animate-pulse": spinners.localizacao,
        "bg-green-200": !spinners.localizacao && clientesProximos.length > 0,
        "bg-amber-200": !spinners.localizacao && clientesProximos.length === 0,
      }
    )}>
      <SendIcon className={cn(
        {
          // Cores do Ícone em si
          "text-blue-500": spinners.localizacao,
          "text-green-600": !spinners.localizacao && clientesProximos.length > 0,
          "text-amber-700": !spinners.localizacao && clientesProximos.length === 0,
        }
      )} />
    </div>
  </CardHeader>
  
  <CardContent className="p-2">
    <h2 className="font-bold">{getLocationTitle()}</h2>
    <p className={cn(
      "text-xs font-medium",
      {
        // Cores do texto da descrição seguindo o mesmo padrão
        "text-blue-600": spinners.localizacao,
        "text-green-700": !spinners.localizacao && clientesProximos.length > 0,
        "text-yellow-700": !spinners.localizacao && clientesProximos.length === 0,
      }
    )}>
      {getLocationDescription()}
    </p>
  </CardContent>
</Card>
  )
}