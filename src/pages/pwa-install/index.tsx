import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { CloudDownloadIcon, ShieldCheckIcon, SmartphoneIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

export default function PWAInstall() {

  // ===================== Hooks =========================
  const navigate = useNavigate();

  // ===================== States =========================
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  useEffect(() => {
    // 1. Captura o evento nativo de instalação
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault(); // Impede o banner padrão do navegador
      setDeferredPrompt(e); // Guarda o evento para usar depois
    };

    // 2. Verifica se o app já está rodando no modo standalone (instalado)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsAppInstalled(true);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Opcional: Detectar se o usuário instalou o app com sucesso
    window.addEventListener('appinstalled', () => {
      setIsAppInstalled(true);
      setDeferredPrompt(null);
      console.log('PWA instalado com sucesso!');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert('O app já está instalado ou seu navegador não suporta a instalação automática. Procure a opção "Adicionar à tela inicial" no menu do navegador.');
      return;
    }

    // Mostra o prompt nativo do sistema
    deferredPrompt.prompt();

    // Limpa o prompt acumulado, pois ele só pode ser usado uma vez
    setDeferredPrompt(null);
  };

  if (isAppInstalled) {
    navigate('/auth/login'); // Redireciona para a tela de login se o app já estiver instalado
  }

  // return (
  //   <div style={{ padding: '20px', textAlign: 'center' }}>
  //     <h1>Instale nosso Aplicativo</h1>
  //     <p>Tenha acesso rápido direto da sua tela inicial, carregamento mais rápido e suporte offline.</p>

  //     {/* Botão customizado que chama a ação de instalação */}
  //     <button
  //       onClick={handleInstallClick}
  //       disabled={!deferredPrompt}
  //       style={{
  //         padding: '12px 24px',
  //         fontSize: '16px',
  //         backgroundColor: deferredPrompt ? '#0070f3' : '#ccc',
  //         color: '#fff',
  //         border: 'none',
  //         borderRadius: '8px',
  //         cursor: deferredPrompt ? 'pointer' : 'not-allowed'
  //       }}
  //     >
  //       {deferredPrompt ? 'Instalar no meu Celular' : 'Preparando instalação...'}
  //     </button>

  //     {/* Dica para usuários de iOS (Safari), que não suportam o beforeinstallprompt nativo */}
  //     {!deferredPrompt && (
  //       <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
  //         <p>Se estiver no iPhone/iPad (Safari):</p>
  //         <p>Clique no botão de <strong>Compartilhar</strong> (ícone de seta) e escolha <strong>&quot;Adicionar à Tela de Início&quot;</strong>.</p>
  //       </div>
  //     )}
  //   </div>
  // );
  return (
    <div className='flex flex-col h-full items-center justify-center'>
      <Card className='w-100 flex flex-col gap-6'>
        <CardHeader className='items-center gap-3'>

          <div className='relative bg-primary border rounded-4xl w-32 h-32 flex items-center justify-center'>
            <img
              src='brand-dark.png'
              alt='AppBrand COBEB - Gestão de Reposição'
              width={70}
              height={70}
            />

            <Badge className='absolute -bottom-1 -right-1 border-white border-3'>PWA</Badge>
          </div>

          <CardTitle className="text-center">INSTALAR NOSSO APP</CardTitle>
          <CardDescription className="text-center">Instale agora o app &quot;COBEB - Gestão de Reposição&quot; para acesso mais rápido, modo offline e sincronização automática. Leve sua produtividade no bolso.</CardDescription>
        </CardHeader>

        <CardContent className='space-y-2'>
          <Button
            onClick={handleInstallClick}
            disabled={!deferredPrompt}
            className={cn('cursor-pointer w-full h-12', {
              'cursor-not-allowed': !deferredPrompt,
            })}
          >
            <CloudDownloadIcon />
            {deferredPrompt ? 'Instalar agora' : 'Preparando instalação...'}
          </Button>

          <Button
            onClick={() => navigate('/install/guide')}
            variant='outline'
            className='cursor-pointer w-full h-12 text-primary flex justify-between'
          >
            <SmartphoneIcon />
            <span className='flex-1'>Como instalar no iPhone/iPad (Safari)<br></br>(Manual)</span>
          </Button>
        </CardContent>

        <CardFooter className='flex gap-2 justify-center'>
          <ShieldCheckIcon className='text-emerald-500' />
          <span className='text-sm text-muted-foreground'>Homologado e seguro pela COBEB</span>
        </CardFooter>
      </Card>
    </div>
  )
}