import { Link, useNavigate } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function TrocaEstoqueConfigPage() {
  const navigate = useNavigate();
  const [option, setOption] = useState<'NAO'|'IGUAIS'|'QUALQUER'|''>('');
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
            <BreadcrumbPage>Troca de estoque</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold leading-tight" style={{ color: '#4a5c60' }}>Troca estoque no reabastecimento</h1>
        <Button
          className="border text-[#008bb1] border-[#008bb1] bg-transparent hover:bg-cyan-50"
          onClick={() => navigate(-1)}
        >
          Voltar
        </Button>
      </div>

      <Card className="p-4">
        <p className="text-xs mb-4" style={{ color: '#4a5c60' }}>
          As configurações abaixo, quando alteradas, serão aplicadas apenas para novos processos de reabastecimento.
        </p>
        <div className="space-y-2">
          <div className="text-sm font-medium" style={{ color: '#4a5c60' }}>
            Deseja permitir a troca de estoque no reabastecimento?
          </div>
          <div className="flex flex-col gap-3 mt-2" role="radiogroup" aria-label="Troca de estoque">
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="radio" name="troca-estoque" checked={option==='NAO'} onChange={()=>setOption('NAO')} /> Não permite troca
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="radio" name="troca-estoque" checked={option==='IGUAIS'} onChange={()=>setOption('IGUAIS')} /> Permitir troca apenas para características iguais
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="radio" name="troca-estoque" checked={option==='QUALQUER'} onChange={()=>setOption('QUALQUER')} /> Permitir troca por qualquer característica
            </label>
          </div>
        </div>
      </Card>
    </div>
  );
}
