import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search as SearchIcon, SlidersHorizontal, MoreVertical, Eye, Pencil, Maximize2 } from 'lucide-react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useAddresses } from '@/lib/hooks/use-addresses';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { AddressDetail } from '@/lib/types/addresses';

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
          <div className="flex gap-3">
            <Button asChild size="lg" variant="outline" className="border-2 border-cyan-600 text-cyan-700 hover:bg-cyan-50">
              <Link to="/settings">Voltar</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-2 border-cyan-600 text-cyan-700 hover:bg-cyan-50">
              Imprimir em lote
            </Button>
            <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-white">
              Alterar em lote
            </Button>
          </div>
        </div>
      </div>

      {/* Card de endereços */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Endereços</h2>

            {/* Toolbar superior (filtros, export, busca, avançada, tela cheia) */}
            <div className="hidden md:flex items-center text-cyan-700">
              <div className="h-6 w-px bg-gray-200 mx-3" />
              <button className="p-2 rounded hover:bg-cyan-50" title="Filtros">
                <SlidersHorizontal className="size-5" />
              </button>
              <div className="h-6 w-px bg-gray-200 mx-3" />
              <div className="flex items-center gap-2">
                <button className="rounded border border-cyan-600 text-cyan-700 px-2 py-1 text-xs font-semibold hover:bg-cyan-50">
                  XLS
                </button>
                <button className="rounded border border-cyan-600 text-cyan-700 px-2 py-1 text-xs font-semibold hover:bg-cyan-50">
                  PDF
                </button>
              </div>
              <div className="h-6 w-px bg-gray-200 mx-3" />
              <div className="relative">
                <Input
                  placeholder="Pesquisar"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 w-[340px]"
                />
                <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-cyan-700" />
              </div>
              <button className="ml-3 text-cyan-700 font-medium hover:underline">
                Pesquisa.Avançada
              </button>
              <div className="h-6 w-px bg-gray-200 mx-3" />
              <button className="p-2 rounded hover:bg-cyan-50" title="Tela cheia">
                <Maximize2 className="size-5" />
              </button>
            </div>
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
              <SlidersHorizontal className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filtrando por:</span>
              <Badge 
                variant={filterSituacao === 'ATIVO' ? 'default' : 'outline'}
                className="cursor-pointer bg-cyan-600 hover:bg-cyan-700"
                onClick={() => setFilterSituacao(filterSituacao === 'ATIVO' ? 'ALL' : 'ATIVO')}
              >
                Situação: {filterSituacao === 'ALL' ? 'Todos' : filterSituacao === 'ATIVO' ? 'Ativo, Bloqueado' : filterSituacao}
              </Badge>
            </div>
            {/* Campo de busca movido para a barra superior */}
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
              {/* Limitamos a largura visível para caber até a coluna "Acessível a mão"; colunas seguintes exigem scroll */}
              <div className="overflow-x-auto overflow-y-auto max-h-[600px] max-w-[1100px]">
                <table className="w-full" style={{ minWidth: '2000px' }}>
                  <thead className="bg-gray-100 sticky top-0 z-10">
                    <tr className="text-gray-700 divide-x divide-gray-200">
                      {/* Cabeçalho da coluna de ações vazio, igual ao print */}
                      <th className="p-3 sticky left-0 z-20 bg-gray-100" style={{ width: '64px' }} />
                      <th className="p-3 font-medium text-xs whitespace-nowrap" style={{ width: '100px' }}>
                        <div className="relative flex items-center justify-between">
                          <span className="text-cyan-700">Depósito</span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="text-cyan-700 hover:bg-cyan-50 rounded p-1">
                                <MoreVertical className="size-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Ocultar coluna</DropdownMenuItem>
                              <DropdownMenuItem>Fixar à esquerda</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </th>
                      <th className="p-3 font-medium text-xs whitespace-nowrap" style={{ width: '280px' }}>
                        <div className="relative flex items-center justify-between">
                          <span className="text-cyan-700">Endereço completo (Desktop)</span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="text-cyan-700 hover:bg-cyan-50 rounded p-1">
                                <MoreVertical className="size-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Ocultar coluna</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </th>
                      <th className="p-3 font-medium text-xs whitespace-nowrap" style={{ width: '220px' }}>
                        <div className="relative flex items-center justify-between">
                          <span className="text-cyan-700">Endereço abreviado (Dispositivos móveis)</span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="text-cyan-700 hover:bg-cyan-50 rounded p-1">
                                <MoreVertical className="size-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Ocultar coluna</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </th>
                      <th className="p-3 font-medium text-xs whitespace-nowrap" style={{ width: '140px' }}>
                        <div className="relative flex items-center justify-between">
                          <span className="text-cyan-700">Estrutura física</span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="text-cyan-700 hover:bg-cyan-50 rounded p-1">
                                <MoreVertical className="size-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Ocultar coluna</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </th>
                      <th className="p-3 font-medium text-xs whitespace-nowrap" style={{ width: '120px' }}>
                        <div className="relative flex items-center justify-between">
                          <span className="text-cyan-700">Função</span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="text-cyan-700 hover:bg-cyan-50 rounded p-1">
                                <MoreVertical className="size-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Ocultar coluna</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </th>
                      <th className="p-3 font-medium text-xs whitespace-nowrap" style={{ width: '180px' }}>
                        <div className="relative flex items-center justify-between">
                          <span className="text-cyan-700">Acessível a mão</span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="text-cyan-700 hover:bg-cyan-50 rounded p-1">
                                <MoreVertical className="size-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Ocultar coluna</DropdownMenuItem>
                              <DropdownMenuItem>Fixar à direita</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
                    {paginatedAddresses.map((addr) => {
                      const det = addr as Partial<AddressDetail>;
                      return (
                      <tr 
                        key={addr.id}
                        className="border-t hover:bg-muted/30 cursor-pointer transition-colors divide-x divide-gray-200"
                        onClick={() => navigate(`/settings/endereco/${addr.id}`)}
                      >
                        <td className="p-3 text-sm whitespace-nowrap sticky left-0 z-10 bg-white">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                className="inline-flex items-center justify-center rounded-md border bg-white hover:bg-muted/50 w-8 h-8"
                                onClick={(e) => e.stopPropagation()}
                                aria-label="Ações do endereço"
                              >
                                <MoreVertical className="size-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" onClick={(e) => e.stopPropagation()}>
                              <DropdownMenuItem onClick={() => navigate(`/settings/endereco/${addr.id}`)}>
                                <Eye className="size-4" /> Visualizar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigate(`/settings/endereco/${addr.id}?edit=1`)}>
                                <Pencil className="size-4" /> Editar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
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
                        <td className="p-3 text-sm whitespace-nowrap">{det.unitizador || '-'}</td>
                        <td className="p-3 text-sm whitespace-nowrap">{det.altura != null ? `${det.altura}cm` : '-'}</td>
                        <td className="p-3 text-sm whitespace-nowrap">{det.comprimento != null ? `${det.comprimento}cm` : '-'}</td>
                        <td className="p-3 text-sm whitespace-nowrap">{det.largura != null ? `${det.largura}cm` : '-'}</td>
                        <td className="p-3 text-sm whitespace-nowrap">{det.peso != null ? `${det.peso}kg` : '-'}</td>
                        <td className="p-3 text-sm whitespace-nowrap text-right">-</td>
                        <td className="p-3 text-sm whitespace-nowrap text-right">-</td>
                        <td className="p-3 text-sm whitespace-nowrap text-right">-</td>
                        <td className="p-3 text-sm whitespace-nowrap text-right">-</td>
                        <td className="p-3 text-sm whitespace-nowrap text-right">-</td>
                        <td className="p-3 text-sm whitespace-nowrap text-right">-</td>
                        <td className="p-3 text-sm whitespace-nowrap">-</td>
                        <td className="p-3 text-sm whitespace-nowrap">
                          <Badge variant={addr.situacao === 'ATIVO' ? 'default' : 'warning'}>
                            {addr.situacao}
                          </Badge>
                        </td>
                        <td className="p-3 text-sm whitespace-nowrap text-muted-foreground">-</td>
                      </tr>
                    )})}
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
