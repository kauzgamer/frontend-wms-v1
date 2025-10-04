import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HomeIcon, Lock, Shield, Bell, Eye, EyeOff, Globe, Moon, Sun, Smartphone } from 'lucide-react';
import { useProfile } from '@/lib/hooks/use-profile';
import { useUpdatePassword } from '@/lib/hooks/use-update-password';
import { useUpdatePreferences } from '@/lib/hooks/use-update-preferences';
import { useDeactivateAccount } from '@/lib/hooks/use-deactivate-account';
import { useDeleteAccount } from '@/lib/hooks/use-delete-account';
import { useToast } from '@/components/ui/toast-context';
import { useNavigate } from 'react-router-dom';

export default function AccountPage() {
  const navigate = useNavigate();
  const { data: profileData } = useProfile();
  const updatePasswordMutation = useUpdatePassword();
  const updatePreferencesMutation = useUpdatePreferences();
  const deactivateAccountMutation = useDeactivateAccount();
  const deleteAccountMutation = useDeleteAccount();
  const { show } = useToast();

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [preferences, setPreferences] = useState({
    language: 'pt-BR',
    timezone: 'America/Sao_Paulo',
    theme: 'light',
    emailNotifications: true,
    pushNotifications: false,
    weeklyDigest: true,
  });

  useEffect(() => {
    if (profileData) {
      setPreferences({
        language: profileData.language || 'pt-BR',
        timezone: profileData.timezone || 'America/Sao_Paulo',
        theme: profileData.theme || 'light',
        emailNotifications: profileData.emailNotifications ?? true,
        pushNotifications: profileData.pushNotifications ?? false,
        weeklyDigest: profileData.weeklyDigest ?? true,
      });
    }
  }, [profileData]);

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      show({ kind: 'error', message: 'As senhas não coincidem.' });
      return;
    }
    if (passwordData.newPassword.length < 8) {
      show({ kind: 'error', message: 'A senha deve ter no mínimo 8 caracteres.' });
      return;
    }
    try {
      await updatePasswordMutation.mutateAsync(passwordData);
      show({ kind: 'success', message: 'Senha alterada com sucesso.' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch {
      show({ kind: 'error', message: 'Erro ao alterar senha. Verifique a senha atual.' });
    }
  };

  const handlePreferencesChange = async () => {
    try {
      await updatePreferencesMutation.mutateAsync(preferences);
      show({ kind: 'success', message: 'Preferências atualizadas com sucesso.' });
    } catch {
      show({ kind: 'error', message: 'Erro ao atualizar preferências.' });
    }
  };

  const handleDeactivate = async () => {
    if (confirm('Tem certeza que deseja desativar sua conta?')) {
      try {
        await deactivateAccountMutation.mutateAsync();
        show({ kind: 'success', message: 'Conta desativada com sucesso.' });
        navigate('/login');
      } catch {
        show({ kind: 'error', message: 'Erro ao desativar conta.' });
      }
    }
  };

  const handleDelete = async () => {
    if (confirm('Tem certeza que deseja EXCLUIR sua conta permanentemente? Esta ação não pode ser desfeita!')) {
      try {
        await deleteAccountMutation.mutateAsync();
        show({ kind: 'success', message: 'Conta marcada para exclusão.' });
        navigate('/login');
      } catch {
        show({ kind: 'error', message: 'Erro ao excluir conta.' });
      }
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 pt-4 max-w-[calc(100vw-80px)]">
      {/* Breadcrumb */}
      <div className="w-full">
        <Breadcrumb>
          <BreadcrumbList className="bg-background rounded-md border px-3 py-2 shadow-xs">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/dashboard">
                  <HomeIcon size={16} aria-hidden="true" />
                  <span className="sr-only">Home</span>
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/settings">Configurador</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Conta</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold leading-tight flex-shrink-0" style={{ color: '#4a5c60' }}>
          Configurações da Conta
        </h1>
        <div className="flex gap-3 flex-shrink-0">
          <Button asChild size="lg" variant="outline" className="border-2 border-cyan-600 text-cyan-700 hover:bg-cyan-50 whitespace-nowrap">
            <Link to="/settings">Voltar</Link>
          </Button>
          <Button
            size="lg"
            className="bg-cyan-600 hover:bg-cyan-700 text-white whitespace-nowrap"
            onClick={handlePreferencesChange}
            disabled={updatePreferencesMutation.isPending}
          >
            {updatePreferencesMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </div>

      {/* Card de Segurança */}
      <Card className="p-0 overflow-hidden border w-full">
        <div className="px-5 py-4 border-b bg-white/60">
          <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: '#4a5c60' }}>
            <Lock className="size-5" />
            Segurança
          </h2>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-1 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Senha Atual</label>
              <div className="relative">
                <Input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder="Digite sua senha atual"
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showCurrentPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Nova Senha</label>
              <div className="relative">
                <Input
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="Digite sua nova senha"
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500">A senha deve ter no mínimo 8 caracteres</p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Confirmar Nova Senha</label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="Confirme sua nova senha"
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <Button
              className="bg-cyan-600 hover:bg-cyan-700 text-white w-fit"
              onClick={handlePasswordChange}
              disabled={updatePasswordMutation.isPending}
            >
              {updatePasswordMutation.isPending ? 'Alterando...' : 'Alterar Senha'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Card de Autenticação em Dois Fatores */}
      <Card className="p-0 overflow-hidden border w-full">
        <div className="px-5 py-4 border-b bg-white/60">
          <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: '#4a5c60' }}>
            <Shield className="size-5" />
            Autenticação em Dois Fatores (2FA)
          </h2>
        </div>
        <div className="p-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">Autenticação em Dois Fatores</h3>
              <p className="text-sm text-gray-600">
                Adicione uma camada extra de segurança à sua conta
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
            </label>
          </div>
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <Smartphone className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-blue-900 font-medium mb-1">Configure o 2FA</p>
              <p className="text-blue-700">
                Use um aplicativo autenticador como Google Authenticator ou Authy para gerar códigos de verificação.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Card de Notificações */}
      <Card className="p-0 overflow-hidden border w-full">
        <div className="px-5 py-4 border-b bg-white/60">
          <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: '#4a5c60' }}>
            <Bell className="size-5" />
            Notificações
          </h2>
        </div>
        <div className="p-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <h3 className="font-semibold text-gray-900">Notificações por E-mail</h3>
                <p className="text-sm text-gray-600">Receba atualizações importantes por e-mail</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <h3 className="font-semibold text-gray-900">Notificações Push</h3>
                <p className="text-sm text-gray-600">Receba notificações no navegador</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <h3 className="font-semibold text-gray-900">Resumo Semanal</h3>
                <p className="text-sm text-gray-600">Receba um resumo semanal das atividades</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
              </label>
            </div>
          </div>
        </div>
      </Card>

      {/* Card de Preferências */}
      <Card className="p-0 overflow-hidden border w-full">
        <div className="px-5 py-4 border-b bg-white/60">
          <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: '#4a5c60' }}>
            <Globe className="size-5" />
            Preferências
          </h2>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Idioma</label>
              <select className="h-11 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <option value="pt-BR">Português (Brasil)</option>
                <option value="en-US">English (US)</option>
                <option value="es-ES">Español</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Fuso Horário</label>
              <select className="h-11 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <option value="America/Sao_Paulo">Brasília (GMT-3)</option>
                <option value="America/New_York">New York (GMT-5)</option>
                <option value="Europe/London">London (GMT+0)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-gray-700 mb-3 block">Tema</label>
              <div className="grid grid-cols-3 gap-4">
                <button className="flex flex-col items-center gap-2 p-4 border-2 border-cyan-600 rounded-lg bg-cyan-50 hover:bg-cyan-100 transition-colors">
                  <Sun className="size-6 text-cyan-700" />
                  <span className="text-sm font-medium text-cyan-900">Claro</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-4 border-2 border-gray-300 rounded-lg hover:border-cyan-600 hover:bg-cyan-50 transition-colors">
                  <Moon className="size-6 text-gray-700" />
                  <span className="text-sm font-medium text-gray-900">Escuro</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-4 border-2 border-gray-300 rounded-lg hover:border-cyan-600 hover:bg-cyan-50 transition-colors">
                  <div className="flex">
                    <Sun className="size-5 text-gray-700" />
                    <Moon className="size-5 text-gray-700 -ml-2" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">Sistema</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Card de Zona de Perigo */}
      <Card className="p-0 overflow-hidden border border-red-200 w-full">
        <div className="px-5 py-4 border-b bg-red-50">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-red-900">
            <Shield className="size-5" />
            Zona de Perigo
          </h2>
        </div>
        <div className="p-8">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Desativar Conta</h3>
                <p className="text-sm text-gray-600">
                  Sua conta será temporariamente desativada. Você pode reativá-la a qualquer momento fazendo login.
                </p>
              </div>
              <Button
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-50 whitespace-nowrap flex-shrink-0"
                onClick={handleDeactivate}
                disabled={deactivateAccountMutation.isPending}
              >
                {deactivateAccountMutation.isPending ? 'Desativando...' : 'Desativar'}
              </Button>
            </div>

            <div className="border-t pt-4" />

            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Excluir Conta</h3>
                <p className="text-sm text-gray-600">
                  Uma vez excluída, não há como voltar atrás. Por favor, tenha certeza.
                </p>
              </div>
              <Button
                variant="destructive"
                className="bg-red-600 hover:bg-red-700 text-white whitespace-nowrap flex-shrink-0"
                onClick={handleDelete}
                disabled={deleteAccountMutation.isPending}
              >
                {deleteAccountMutation.isPending ? 'Excluindo...' : 'Excluir Conta'}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
