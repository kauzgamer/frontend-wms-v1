import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, ArrowLeft, Search, Filter, Maximize2, Printer, ArrowUpDown } from 'lucide-react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useAddresses } from '@/lib/hooks/use-addresses';
import type { AddressSummary } from '@/lib/types/addresses';

export default function EnderecoPage() {
  const navigate = useNavigate();
  const { data: addresses, isLoading, error } = useAddresses();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSituacao, setFilterSituacao] = useState<'ALL' | 'ATIVO' | 'BLOQUEADO'>('ATIVO');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

  const paginatedAddresses = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredAddresses.slice(startIndex, endIndex);
  }, [filteredAddresses, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredAddresses.length / pageSize);
  const startResult = filteredAddresses.length > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endResult = Math.min(currentPage * pageSize, filteredAddresses.length);

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
          </div>

          {/* Botão Novo endereço e Filtros na mesma linha */}
          <div className="flex items-center gap-4 mb-4">
            <Button 
              onClick={() => navigate('/settings/endereco/new')}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              <Plus className="size-4" /> Novo endereço
            </Button>
            
            <div className="flex items-center gap-2">
              <Filter className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filtrando por:</span>
              <Badge 
                variant={filterSituacao === 'ATIVO' ? 'default' : 'outline'}
                className="cursor-pointer bg-cyan-600 hover:bg-cyan-700"
                onClick={() => setFilterSituacao(filterSituacao === 'ATIVO' ? 'ALL' : 'ATIVO')}
              >
                Situação: {filterSituacao === 'ALL' ? 'Todos' : filterSituacao === 'ATIVO' ? 'Ativo, Bloqueado' : filterSituacao}
              </Badge>
            </div>

            <div className="flex-1 max-w-md relative ml-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Área de agrupamento */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 mb-4 text-center text-sm text-muted-foreground bg-gray-50">
            Arraste a coluna até aqui para agrupar
          </div>

          {/* Tabela de endereços */}
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando endereços...
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-amber-600 font-medium mb-2">
                Backend não configurado
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Os endpoints de endereços ainda não foram implementados no backend.
              </p>
              <Button onClick={() => navigate('/settings/endereco/new')}>
                <Plus className="size-4" /> Criar novos endereços
              </Button>
            </div>
          ) : filteredAddresses.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-2">
                Nenhum endereço cadastrado
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Comece criando seu primeiro endereço.
              </p>
              <Button onClick={() => navigate('/settings/endereco/new')}>
                <Plus className="size-4" /> Criar primeiro endereço
              </Button>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto overflow-y-auto max-h-[600px]">
                <table className="w-full" style={{ minWidth: '2000px' }}>
                  <thead className="bg-gray-100 sticky top-0 z-10">
                    <tr className="text-gray-700">
                      <th className="text-left p-3 font-medium text-xs whitespace-nowrap" style={{ width: '100px' }}>
                        <div className="flex items-center gap-1 cursor-pointer hover:text-cyan-600">
                          Depósito <ArrowUpDown className="size-3" />
                        </div>
                      </th>
                      <th className="text-left p-3 font-medium text-xs whitespace-nowrap" style={{ width: '280px' }}>
                        <div className="flex items-center gap-1 cursor-pointer hover:text-cyan-600">
                          Endereço completo (Desktop) <ArrowUpDown className="size-3" />
                        </div>
                      </th>
                      <th className="text-left p-3 font-medium text-xs whitespace-nowrap" style={{ width: '220px' }}>
                        <div className="flex items-center gap-1 cursor-pointer hover:text-cyan-600">
                          Endereço abreviado (Dispositivos móveis) <ArrowUpDown className="size-3" />
                        </div>
                      </th>
                      <th className="text-left p-3 font-medium text-xs whitespace-nowrap" style={{ width: '140px' }}>
                        <div className="flex items-center gap-1 cursor-pointer hover:text-cyan-600">
                          Estrutura física <ArrowUpDown className="size-3" />
                        </div>
                      </th>
                      <th className="text-left p-3 font-medium text-xs whitespace-nowrap" style={{ width: '120px' }}>
                        <div className="flex items-center gap-1 cursor-pointer hover:text-cyan-600">
                          Função <ArrowUpDown className="size-3" />
                        </div>
                      </th>
                      <th className="text-left p-3 font-medium text-xs whitespace-nowrap" style={{ width: '180px' }}>
                        <div className="flex items-center gap-1 cursor-pointer hover:text-cyan-600">
                          Acessível a mão <ArrowUpDown className="size-3" />
                        </div>
                      </th>
                      <th className="text-left p-3 font-medium text-xs whitespace-nowrap min-w-[160px]">Cap. Unitizador</th>
                      <th className="text-left p-3 font-medium text-xs whitespace-nowrap min-w-[120px]">Cap. Altura</th>
                      <th className="text-left p-3 font-medium text-xs whitespace-nowrap min-w-[150px]">Cap. Comprimento</th>
                      <th className="text-left p-3 font-medium text-xs whitespace-nowrap min-w-[120px]">Cap. Largura</th>
                      <th className="text-left p-3 font-medium text-xs whitespace-nowrap min-w-[120px]">Cap. Peso</th>
                      <th className="text-left p-3 font-medium text-xs whitespace-nowrap min-w-[150px]">Ocup. Cubagem</th>
                      <th className="text-left p-3 font-medium text-xs whitespace-nowrap min-w-[180px]">Ocup. Cubagem Prev.</th>
                      <th className="text-left p-3 font-medium text-xs whitespace-nowrap min-w-[140px]">Ocup. Peso</th>
                      <th className="text-left p-3 font-medium text-xs whitespace-nowrap min-w-[160px]">Ocup. Peso Prev.</th>
                      <th className="text-left p-3 font-medium text-xs whitespace-nowrap min-w-[180px]">Ocup. Unitizador</th>
                      <th className="text-left p-3 font-medium text-xs whitespace-nowrap min-w-[200px]">Ocup. Unitizador Prev.</th>
                      <th className="text-left p-3 font-medium text-xs whitespace-nowrap min-w-[160px]">Código de barras</th>
                      <th className="text-left p-3 font-medium text-xs whitespace-nowrap min-w-[100px]">Situação</th>
                      <th className="text-left p-3 font-medium text-xs whitespace-nowrap min-w-[180px]">Motivo bloqueio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedAddresses.map((addr) => (
                      <tr 
                        key={addr.id}
                        className="border-t hover:bg-muted/30 cursor-pointer transition-colors"
                        onClick={() => navigate(`/settings/endereco/${addr.id}`)}
                      >
                        <td className="p-3 text-sm whitespace-nowrap">{addr.deposito}</td>
                        <td className="p-3 text-sm whitespace-nowrap">{addr.enderecoCompleto}</td>
                        <td className="p-3 text-sm whitespace-nowrap">{addr.enderecoAbreviado}</td>
                        <td className="p-3 text-sm whitespace-nowrap">{addr.estruturaFisica}</td>
                        <td className="p-3 text-sm whitespace-nowrap">{addr.funcao}</td>
                        <td className="p-3 text-sm whitespace-nowrap">
                          {addr.acessivelAMao ? (
                            <Badge className="bg-green-600 hover:bg-green-700 text-white">ACESSÍVEL A MÃO</Badge>
                          ) : (
                            <Badge className="bg-orange-500 hover:bg-orange-600 text-white">NÃO ACESSÍVEL A MÃO</Badge>
                          )}
                        </td>
                        <td className="p-3 text-sm whitespace-nowrap">{addr.unitizador || '-'}</td>
                        <td className="p-3 text-sm whitespace-nowrap">{addr.altura ? `${addr.altura}cm` : '-'}</td>
                        <td className="p-3 text-sm whitespace-nowrap">{addr.comprimento ? `${addr.comprimento}cm` : '-'}</td>
                        <td className="p-3 text-sm whitespace-nowrap">{addr.largura ? `${addr.largura}cm` : '-'}</td>
                        <td className="p-3 text-sm whitespace-nowrap">{addr.peso ? `${addr.peso}kg` : '-'}</td>
                        <td className="p-3 text-sm whitespace-nowrap text-right">-</td>
                        <td className="p-3 text-sm whitespace-nowrap text-right">-</td>
                        <td className="p-3 text-sm whitespace-nowrap text-right">-</td>
                        <td className="p-3 text-sm whitespace-nowrap text-right">-</td>
                        <td className="p-3 text-sm whitespace-nowrap text-right">-</td>
                        <td className="p-3 text-sm whitespace-nowrap text-right">-</td>
                        <td className="p-3 text-sm whitespace-nowrap">-</td>
                        <td className="p-3 text-sm whitespace-nowrap">
                          <Badge variant={addr.situacao === 'ATIVO' ? 'default' : 'destructive'}>
                            {addr.situacao}
                          </Badge>
                        </td>
                        <td className="p-3 text-sm whitespace-nowrap text-muted-foreground">-</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Footer com paginação */}
              <div className="border-t p-3 bg-white">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                  <span className="font-medium">
                    {startResult} - {endResult} DE {filteredAddresses.length} RESULTADOS
                  </span>
                  <div className="flex items-center gap-4">
                    {currentPage < totalPages && (
                      <Button 
                        variant="link" 
                        className="text-cyan-600 hover:text-cyan-700 h-auto p-0 font-medium"
                        onClick={() => setCurrentPage(p => p + 1)}
                      >
                        Carregar mais {Math.min(pageSize, filteredAddresses.length - endResult)} resultados
                      </Button>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="uppercase font-medium">EXIBIR</span>
                      <select 
                        className="border border-gray-300 rounded px-3 py-1.5 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        value={pageSize}
                        onChange={(e) => {
                          setPageSize(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                      >
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                      </select>
                      <span className="uppercase font-medium">RESULTADOS POR VEZ</span>
                    </div>
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
