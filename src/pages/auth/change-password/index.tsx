import PasswordChangerDialog from "@/components/custom/password-changer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useHeader } from "@/hooks/mobile/use-header";
import { useAuth } from "@/hooks/use-auth";
import { ShieldCheckIcon } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router";

export default function ChangePasswordPage() {
  // ============ HOOKS ===========
  const { user } = useAuth();
  const { setShowBackButton, setPageDescription, setPageTitle, setShowLogoutButton } = useHeader();
  const navigate = useNavigate();

  // ============ EFFECTS ===========
  useEffect(() => {
    setShowBackButton(false);
    setPageTitle("Primeiro Acesso");
    setPageDescription("Configure sua senha de acesso ao aplicativo");
    setShowLogoutButton(true);
  }, [setShowBackButton, setPageDescription, setPageTitle, setShowLogoutButton]);

  /**
   * On password change success, redirect to the login page.
   */
  const onSuccess = () => {
    navigate('/auth/login')
  };

  // Pega o primeiro nome do usuário para uma saudação amigável
  const firstName = user?.nome ? user.nome.split(" ")[0] : "Usuário";

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[calc(100vh-6rem)] p-4 bg-slate-50/50 dark:bg-transparent">

      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500 space-y-8">

        {/* Cabeçalho de Boas-vindas */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-500 rounded-full flex items-center justify-center mb-2 ring-4 ring-white dark:ring-slate-950 shadow-sm">
            <ShieldCheckIcon size={32} strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Bem-vindo(a), {firstName}!
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-70">
            Como este é o seu primeiro acesso, precisamos que você defina uma nova senha para proteger sua conta.
          </p>
        </div>

        {/* Card do Formulário */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              Nova Senha
            </CardTitle>
            <CardDescription>
              Crie uma credencial forte e que você não esqueça.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="flex w-full justify-center">
              {/* O seu componente original mantido intacto */}
              <PasswordChangerDialog
                user_id={user?.id ?? ""}
                onSuccess={onSuccess}
                pageMode="first-access"
              />
            </div>
          </CardContent>
        </Card>

        {/* Rodapé Informativo */}
        <p className="text-[11px] text-center text-slate-400 font-medium uppercase tracking-wider flex items-center justify-center gap-1">
          <ShieldCheckIcon size={20} className="text-emerald-500" />
          Ambiente Seguro e Criptografado
        </p>
      </div>

    </div>
  );
}