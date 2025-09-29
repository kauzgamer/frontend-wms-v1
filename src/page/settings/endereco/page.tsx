import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, ArrowLeft, Search, Filter, Maximize2, Printer } from 'lucide-react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useAddresses } from '@/lib/hooks/use-addresses';
import type { AddressSummary } from '@/lib/types/addresses';

export default function EnderecoPage() {
  const navigate = useNavigate();
  const { data: addresses, isLoading } = useAddresses();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSituacao, setFilterSituacao] = useState<'ALL' | 'ATIVO' | 'BLOQUEADO'>('ATIVO');

  const filteredAddresses = useMemo(() => {
    if (!addresses) return [];
    
    return addresses.filter((addr) => {
      // Filtro de situação
      if (filterSituacao !== 'ALL' && addr.situacao !== filterSituacao) {
        return false;
      }
      
      // Filtro de busca
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          addr.enderecoCompleto.toLowerCase().includes(term) ||
          addr.enderecoAbreviado.toLowerCase().includes(term) ||
          addr.deposito.toLowerCase().includes(term)
        );
      }
      
      return true;
    });
  }, [addresses, searchTerm, filterSituacao]);

  return (
    <div className="flex flex-col gap-6 p-6 pt-4">
      {/* Breadcrumb e header */}
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
                <Link to="/settings">Configurador</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Cadastro de endereço</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <div className="mt-4 flex items-center justify-between">
          <h1 className="text-3xl font-semibold leading-tight" style={{ color: '#4a5c60' }}>
            Cadastro de endereço
          </h1>
          <div className="flex gap-2">
            <Button variant="outline">
              <Printer className="size-4" /> Imprimir em lote
            </Button>
            <Button variant="outline">
              <Maximize2 className="size-4" /> Alterar em lote
            </Button>
            <Button asChild variant="outline">
              <Link to="/settings">
                <ArrowLeft className="size-4" /> Voltar
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Card de endereços */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Endereços</h2>
            <Button onClick={() => navigate('/settings/endereco/new')}>
              <Plus className="size-4" /> Novo endereço
            </Button>
          </div>

          {/* Filtros */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Filter className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filtrando por:</span>
              <Badge 
                variant={filterSituacao === 'ATIVO' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setFilterSituacao(filterSituacao === 'ATIVO' ? 'ALL' : 'ATIVO')}
              >
                Situação: {filterSituacao === 'ALL' ? 'Todos' : filterSituacao === 'ATIVO' ? 'Ativo, Bloqueado' : filterSituacao}
              </Badge>
            </div>
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Tabela de endereços */}
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando endereços...
            </div>
          ) : filteredAddresses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum endereço encontrado
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 font-medium text-sm">Depósito</th>
                      <th className="text-left p-3 font-medium text-sm">Endereço completo (Desktop)</th>
                      <th className="text-left p-3 font-medium text-sm">Endereço abreviado (Dispositivos móveis)</th>
                      <th className="text-left p-3 font-medium text-sm">Estrutura física</th>
                      <th className="text-left p-3 font-medium text-sm">Função</th>
                      <th className="text-left p-3 font-medium text-sm">Acessível a mão</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAddresses.map((addr) => (
                      <tr 
                        key={addr.id}
                        className="border-t hover:bg-muted/30 cursor-pointer transition-colors"
                        onClick={() => navigate(`/settings/endereco/${addr.id}`)}
                      >
                        <td className="p-3 text-sm">{addr.deposito}</td>
                        <td className="p-3 text-sm">{addr.enderecoCompleto}</td>
                        <td className="p-3 text-sm">{addr.enderecoAbreviado}</td>
                        <td className="p-3 text-sm">{addr.estruturaFisica}</td>
                        <td className="p-3 text-sm">{addr.funcao}</td>
                        <td className="p-3 text-sm">
                          {addr.acessivelAMao ? (
                            <Badge variant="default" className="bg-green-500">ACESSÍVEL A MÃO</Badge>
                          ) : (
                            <Badge variant="secondary">NÃO APLICÁVEL</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Footer */}
              <div className="border-t p-3 flex items-center justify-between text-sm text-muted-foreground">
                <span>1 - 10 DE ... RESULTADOS</span>
                <div className="flex items-center gap-4">
                  <Button variant="link" className="text-cyan-600">
                    Carregar mais 10 resultados
                  </Button>
                  <div className="flex items-center gap-2">
                    <span>EXIBIR</span>
                    <select className="border rounded px-2 py-1">
                      <option>10</option>
                      <option>25</option>
                      <option>50</option>
                      <option>100</option>
                    </select>
                    <span>RESULTADOS POR VEZ</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
