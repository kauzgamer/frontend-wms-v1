import { Link, useNavigate } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function ReservaEstoqueConfigPage() {
  const navigate = useNavigate();
  const [momento, setMomento] = useState<'IMEDIATO'|'POSTERIOR'|''>('');
  const [coletaParcial, setColetaParcial] = useState<'SIM'|'NAO'|''>('');
  return (
    <div className="flex flex-1 flex-col gap-6 p-6 pt-4">
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
            <BreadcrumbLink asChild>
              <Link to="/picking/configuracao">Configuração</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Reserva de estoque</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold leading-tight" style={{ color: '#4a5c60' }}>Reserva de estoque</h1>
        <Button
          className="border text-[#008bb1] border-[#008bb1] bg-transparent hover:bg-cyan-50"
          onClick={() => navigate(-1)}
        >
          Voltar
        </Button>
      </div>

      <Card className="p-4 space-y-8">
        <p className="text-xs" style={{ color: '#4a5c60' }}>
          As configurações abaixo, quando alteradas, serão aplicadas no processamento da seleção de estoque.
        </p>

        <section className="space-y-2">
          <div className="text-sm font-medium" style={{ color: '#4a5c60' }}>
            Reserva de estoque picking na seleção de estoque automática
          </div>
          <div className="flex flex-col gap-3 mt-2" role="radiogroup" aria-label="Momento da reserva">
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="radio" name="momento" checked={momento==='IMEDIATO'} onChange={()=>setMomento('IMEDIATO')} /> Imediato, no processamento da seleção
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="radio" name="momento" checked={momento==='POSTERIOR'} onChange={()=>setMomento('POSTERIOR')} /> Posterior, na etapa de separação mobile
            </label>
          </div>
        </section>

        <section className="space-y-2">
          <div className="text-sm font-medium" style={{ color: '#4a5c60' }}>
            Permitir coleta parcial ao separar
          </div>
          <div className="flex flex-col gap-3 mt-2" role="radiogroup" aria-label="Coleta parcial">
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="radio" name="coleta" checked={coletaParcial==='SIM'} onChange={()=>setColetaParcial('SIM')} /> Sim, até atingir o total solicitado
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="radio" name="coleta" checked={coletaParcial==='NAO'} onChange={()=>setColetaParcial('NAO')} /> Não, apenas coleta total
            </label>
          </div>
        </section>
      </Card>
    </div>
  );
}
