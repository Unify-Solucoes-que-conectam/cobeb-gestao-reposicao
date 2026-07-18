import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeftIcon, CircleHelpIcon, EllipsisVerticalIcon } from 'lucide-react';
import { useNavigate } from 'react-router';

export default function PWAInstallGuide() {

  // ====================== Hooks ======================
  const navigate = useNavigate();

  // ====================== States =====================
  const steps = [
    {
      component: (
        <p>
          Verifique se você está usando o navegador <strong>Safari</strong>.
        </p>
      )
    },
    {
      component: (
        <p className='flex gap-1 items-center flex-wrap'>
          Toque no ícone de
          <EllipsisVerticalIcon className='w-4 h-4'/>
          na barra de navegação inferior.
        </p>
      )
    },
    {
      component: (
        <p>Toque no botão <strong>Compartilhar</strong></p>
      )
    },
    {
      component: (
        <p>
          Role o menu de opções para baixo e selecione <strong>&quot;Adicionar à Tela de Início&quot;</strong>
        </p>
      )
    },
    {
      component: (
        <p>
          Toque em <strong>Adicionar</strong> no canto superior direito da tela para confirmar.
        </p>
      )
    }
  ]

  return (
    <div className='flex flex-col h-full items-center justify-center'>
      <Card className='w-100 flex flex-col gap-6'>
        <CardHeader className='items-center gap-3 flex-row border-b'>
          
          <div className='bg-primary/10 p-2 rounded-md'>
            <CircleHelpIcon className='text-primary' />
          </div>

          <div className='flex flex-col justify-start w-full'>
            <CardTitle>Guia de instalação iOS</CardTitle>
            <CardDescription>Exclusivo para navegadores Safari</CardDescription>
          </div>
        </CardHeader>

        <CardContent className='space-y-2 border-b'>
          <p>
            Como a Apple não permite a instalação direta, siga os passos abaixo para adicionar o app à sua tela inicial:
          </p>

          {
            steps.map((step, index) => (
              <div key={index} className='flex gap-2 items-center'>
                <div className='rounded-full p-2 bg-primary/10 min-w-10 min-h-10 text-center text-primary font-bold'>{index+1}</div>
                {step.component}
              </div>
            ))
          }
        </CardContent>

        <CardFooter className='flex gap-2 justify-center'>
          <Button onClick={() => navigate('/install')} variant='outline' className='w-full h-12'>
            <ArrowLeftIcon />
            Voltar para instalação
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}