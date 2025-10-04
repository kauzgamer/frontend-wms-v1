import { Link } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HomeIcon, Camera, Mail, Phone, MapPin, Briefcase, Calendar } from 'lucide-react';
import { useAuth } from '@/lib/use-auth';

export default function ProfilePage() {
  const { user } = useAuth();

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
              <BreadcrumbPage>Perfil</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold leading-tight flex-shrink-0" style={{ color: '#4a5c60' }}>
          Perfil do Usuário
        </h1>
        <div className="flex gap-3 flex-shrink-0">
          <Button asChild size="lg" variant="outline" className="border-2 border-cyan-600 text-cyan-700 hover:bg-cyan-50 whitespace-nowrap">
            <Link to="/settings">Voltar</Link>
          </Button>
          <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-white whitespace-nowrap">
            Salvar Alterações
          </Button>
        </div>
      </div>

      {/* Card de Perfil */}
      <Card className="p-0 overflow-hidden border w-full">
        <div className="p-8">
          {/* Foto de Perfil */}
          <div className="flex items-center gap-8 mb-8 pb-8 border-b">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <button className="absolute bottom-0 right-0 bg-cyan-600 hover:bg-cyan-700 text-white rounded-full p-2 shadow-lg transition-colors">
                <Camera className="size-5" />
              </button>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold mb-1" style={{ color: '#4a5c60' }}>
                {user?.name || 'Usuário'}
              </h2>
              <p className="text-gray-600 mb-2">{user?.email || 'email@exemplo.com'}</p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="size-4" />
                <span>Membro desde {new Date().toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </div>

          {/* Formulário de Informações */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Nome Completo</label>
              <Input
                defaultValue={user?.name || ''}
                placeholder="Digite seu nome completo"
                className="h-11"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Mail className="size-4" />
                E-mail
              </label>
              <Input
                type="email"
                defaultValue={user?.email || ''}
                placeholder="seu.email@exemplo.com"
                className="h-11"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Phone className="size-4" />
                Telefone
              </label>
              <Input
                type="tel"
                placeholder="(00) 00000-0000"
                className="h-11"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Briefcase className="size-4" />
                Cargo
              </label>
              <Input
                placeholder="Seu cargo ou função"
                className="h-11"
              />
            </div>

            <div className="md:col-span-2 flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <MapPin className="size-4" />
                Localização
              </label>
              <Input
                placeholder="Cidade, Estado"
                className="h-11"
              />
            </div>

            <div className="md:col-span-2 flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Bio</label>
              <textarea
                rows={4}
                placeholder="Conte um pouco sobre você..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          </div>

          {/* Informações do Sistema */}
          <div className="mt-8 pt-8 border-t">
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#4a5c60' }}>
              Informações do Sistema
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between py-2 px-4 bg-gray-50 rounded-md">
                <span className="text-gray-600">Provedor de Login:</span>
                <span className="font-medium text-gray-900">{user?.provider || 'Local'}</span>
              </div>
              <div className="flex justify-between py-2 px-4 bg-gray-50 rounded-md">
                <span className="text-gray-600">E-mail:</span>
                <span className="font-medium text-gray-900 font-mono text-xs">{user?.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 px-4 bg-gray-50 rounded-md">
                <span className="text-gray-600">Status da Conta:</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                  Ativo
                </span>
              </div>
              <div className="flex justify-between py-2 px-4 bg-gray-50 rounded-md">
                <span className="text-gray-600">Último Acesso:</span>
                <span className="font-medium text-gray-900">{new Date().toLocaleString('pt-BR')}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
