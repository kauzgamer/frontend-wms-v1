import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export default function PickingConfiguracaoPage() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-1 flex-col gap-6 p-6 pt-4">
      <div>
        <Breadcrumb>
          <BreadcrumbList className="bg-background rounded-md border px-3 py-2 shadow-xs">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/dashboard">Início</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/picking">Picking</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Configuração</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold leading-tight" style={{ color: '#4a5c60' }}>
          Configurações de picking
        </h1>
        <Button
          className="border text-[#008bb1] border-[#008bb1] bg-transparent hover:bg-cyan-50"
          onClick={() => navigate(-1)}
        >
          Voltar
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="divide-y">
          {/* Reabastecimento */}
          <section className="p-4">
            <div className="mb-2 text-base font-semibold" style={{ color: '#4a5c60' }}>Reabastecimento</div>
            <p className="text-xs mb-3" style={{ color: '#4a5c60' }}>
              Selecione a configuração do reabastecimento na lista abaixo:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Link to="/picking/configuracao/movimento-vertical" className="block text-left w-full hover:underline py-2" style={{ color: '#0c9abe' }}>
                Movimento vertical
              </Link>
              <Link to="/picking/configuracao/troca-estoque" className="block text-left w-full hover:underline py-2" style={{ color: '#0c9abe' }}>
                Troca de estoque
              </Link>
              <Link to="/picking/configuracao/unitizador-completo" className="block text-left w-full hover:underline py-2" style={{ color: '#0c9abe' }}>
                Unitizador completo
              </Link>
            </div>
          </section>

          {/* Seleção de estoque */}
          <section className="p-4">
            <div className="mb-2 text-base font-semibold" style={{ color: '#4a5c60' }}>Seleção de estoque</div>
            <p className="text-xs mb-3" style={{ color: '#4a5c60' }}>
              Selecione a configuração da seleção de estoque na lista abaixo:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Link to="/picking/configuracao/caracteristicas-estoque" className="block text-left w-full hover:underline py-2" style={{ color: '#0c9abe' }}>
                Características de estoque
              </Link>
              <Link to="/picking/configuracao/reserva-estoque" className="block text-left w-full hover:underline py-2" style={{ color: '#0c9abe' }}>
                Reserva de estoque
              </Link>
            </div>
          </section>
        </div>
      </Card>
    </div>
  );
}
