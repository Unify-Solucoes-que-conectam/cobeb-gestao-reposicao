import { Button } from "@/components/ui/button";
import { CameraIcon, CheckIcon, RotateCcwIcon, SwitchCameraIcon, XIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64Image: string) => void;
}

export function CameraModal({ isOpen, onClose, onCapture }: CameraModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Parar stream atual
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Iniciar câmera
  const startCamera = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    // Parar stream anterior se existir
    stopCamera();

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = newStream;

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;

        // Garantir que o vídeo comece a reproduzir
        try {
          await videoRef.current.play();
          setIsLoading(false);
        } catch (playErr) {
          console.error("Erro ao reproduzir vídeo:", playErr);
          setError("Não foi possível iniciar a visualização da câmera.");
          setIsLoading(false);
        }
      }
    } catch (err) {
      console.error("Erro ao acessar a câmera:", err);
      setError("Não foi possível acessar a câmera. Verifique as permissões no navegador.");
      setIsLoading(false);
    }
  }, [facingMode, stopCamera]);

  // Gerenciar abertura/fechamento do modal
  useEffect(() => {
    if (isOpen) {
      setCapturedImage(null); // Resetar prévia ao abrir
      startCamera();
    } else {
      stopCamera();
      setCapturedImage(null); // Limpar prévia ao fechar
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode, startCamera, stopCamera]);

  // Capturar o frame do vídeo e converter em Canvas / Base64 comprimido
  const handleCapture = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement("canvas");

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const context = canvas.getContext("2d");
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Comprime a foto diretamente na renderização do canvas em JPEG qualidade 0.7 (~200KB-400KB)
      const base64Image = canvas.toDataURL("image/jpeg", 0.7);

      // Salvar imagem capturada para prévia
      setCapturedImage(base64Image);

      // Parar câmera para economizar recursos enquanto mostra prévia
      stopCamera();
    }
  };

  // Confirmar uso da foto
  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      setCapturedImage(null);
    }
  };

  // Retornar para tirar outra foto
  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  // Alternar entre câmera traseira e frontal
  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 bg-black flex flex-col items-center justify-between p-4">
      {/* Top Bar */}
      <div className="w-full flex justify-between items-center text-white z-10 pt-2">
        <span className="font-semibold text-sm">
          {capturedImage ? "Prévia da foto" : "Posicione a avaria no quadro"}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-white hover:bg-white/20 rounded-full"
        >
          <XIcon size={24} />
        </Button>
      </div>

      {/* ÁREA DE VISUALIZAÇÃO DA CÂMERA OU PRÉVIA */}
      <div className="relative w-full flex-1 flex items-center justify-center overflow-hidden my-4 rounded-xl bg-neutral-900">
        {capturedImage ? (
          // PRÉVIA DA IMAGEM CAPTURADA
          <img
            src={capturedImage}
            alt="Prévia da foto capturada"
            className="w-full h-full object-cover"
          />
        ) : error ? (
          <div className="text-red-400 text-center p-4 text-sm">{error}</div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline // Fundamental para rodar inline em navegadores móveis (Safari/Chrome Android)
              muted
              className="w-full h-full object-cover"
            />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-white text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-2"></div>
                  <p className="text-sm">Carregando câmera...</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* CONTROLES DE CAPTURA OU PRÉVIA */}
      {capturedImage ? (
        // BOTÕES DE CONFIRMAÇÃO DA PRÉVIA
        <div className="w-full flex gap-4 pb-6 z-10">
          <Button
            type="button"
            onClick={handleRetake}
            className="flex-1 h-14 bg-red-600 hover:bg-red-700 text-white font-semibold text-lg gap-2"
          >
            <RotateCcwIcon size={24} />
            Tirar outra
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            className="flex-1 h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-lg gap-2"
          >
            <CheckIcon size={24} />
            Usar esta foto
          </Button>
        </div>
      ) : (
        // CONTROLES DE CAPTURA
        <div className="w-full flex justify-around items-center pb-6 z-10">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={toggleFacingMode}
            disabled={isLoading || !!error}
            className="rounded-full bg-white/10 text-white border-none hover:bg-white/20 h-12 w-12 disabled:opacity-50"
          >
            <SwitchCameraIcon size={24} />
          </Button>

          {/* Botão do Obturador */}
          <Button
            type="button"
            onClick={handleCapture}
            disabled={isLoading || !!error}
            className="w-20 h-20 rounded-full bg-white text-black hover:bg-gray-200 flex items-center justify-center p-0 border-4 border-gray-400 shadow-lg active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-16 h-16 rounded-full bg-white border-2 border-black flex items-center justify-center">
              <CameraIcon className="size-8 text-slate-800" />
            </div>
          </Button>

          <div className="w-12" /> {/* Espaçador para centralizar o botão principal */}
        </div>
      )}
    </div>
  );
}