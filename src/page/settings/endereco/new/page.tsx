import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Check } from 'lucide-react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { usePhysicalStructures, usePhysicalStructure } from '@/lib/hooks/use-physical-structures';
import { usePreviewAddresses, useCreateAddresses } from '@/lib/hooks/use-addresses';
import { useToast } from '@/components/ui/toast-context';
import type { AddressWizardState, AddressPreview, CoordinateRange } from '@/lib/types/addresses';
import type { CoordConfig } from '@/lib/types/physical-structures';
import { StepInicio } from './step-inicio';

export default function NewEnderecoPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { data: physicalStructures } = usePhysicalStructures();
  const previewMutation = usePreviewAddresses();
  const createMutation = useCreateAddresses();

  const [wizardState, setWizardState] = useState<AddressWizardState>({
    step: 1,
    depositoId: '',
    estruturaFisicaId: '',
    estruturaFisicaNome: '',
    coordenadas: [],
  });

  const [preview, setPreview] = useState<AddressPreview[]>([]);
  const [activeTab, setActiveTab] = useState<'armazenagem' | 'funcional'>('armazenagem');

  // Buscar detalhes da estrutura física selecionada
  const { data: physicalStructureDetail } = usePhysicalStructure(wizardState.estruturaFisicaId);

  // Extrair coordenadas ativas da estrutura física
  const activeCoordinates = useMemo<CoordConfig[]>(() => {
    if (!physicalStructureDetail) return [];
    return Object.values(physicalStructureDetail.coords)
      .filter(coord => coord.ativo)
      .sort((a, b) => {
        // Ordenar por tipo para manter consistência
        const order = ['B', 'SE', 'R', 'Q', 'C', 'CO', 'N', 'A', 'P', 'AP', 'G', 'E', 'AR'];
        const indexA = order.indexOf(a.tipo);
        const indexB = order.indexOf(b.tipo);
        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
  }, [physicalStructureDetail]);

  // Pré-calcular listas de valores para cada coordenada
  const coordinateValuesLists = useMemo(() => {
    return wizardState.coordenadas.map(coord => {
      if (!coord.inicio || !coord.fim) return [];
      
      const isNumeric = ['C', 'N', 'P', 'A', 'G', 'Q', 'B', 'SE', 'CO', 'E', 'AR'].includes(coord.tipo);
      const isAlpha = coord.tipo === 'R';
      
      if (isNumeric) {
        const start = Number(coord.inicio);
        const end = Number(coord.fim);
        if (isNaN(start) || isNaN(end)) return [];
        const count = end - start + 1;
        return Array.from({ length: count }, (_, i) => start + i);
      }
      
      if (isAlpha) {
        const start = String(coord.inicio).toUpperCase().charCodeAt(0);
        const end = String(coord.fim).toUpperCase().charCodeAt(0);
        const count = end - start + 1;
        return Array.from({ length: count }, (_, i) => String.fromCharCode(start + i));
      }
      
      return [];
    });
  }, [wizardState.coordenadas]);

  // Inicializar coordenadas quando estrutura física é selecionada
  useEffect(() => {
    if (activeCoordinates.length > 0 && wizardState.coordenadas.length === 0) {
      const initialCoordenadas: CoordinateRange[] = activeCoordinates.map(coord => ({
        tipo: coord.tipo,
        nome: coord.nomeCustom || coord.nomePadrao,
        abrev: coord.abrevCustom || coord.abrevPadrao,
        inicio: '',
        fim: '',
        usarPrefixo: true,
      }));
      setWizardState(s => ({ ...s, coordenadas: initialCoordenadas }));
    }
  }, [activeCoordinates, wizardState.coordenadas.length]);

  // Gerar etapas dinâmicas
  const steps = useMemo(() => {
    const baseSteps = [{ id: 1, label: 'Início' }];
    const coordSteps = activeCoordinates.map((coord, index) => ({
      id: index + 2,
      label: `Criar ${coord.nomeCustom || coord.nomePadrao}`,
    }));
    const finalStep = { id: coordSteps.length + 2, label: 'Criar endereços' };
    return [...baseSteps, ...coordSteps, finalStep];
  }, [activeCoordinates]);

  const totalSteps = steps.length;

  // Atualizar coordenada específica
  const updateCoordinate = (index: number, updates: Partial<CoordinateRange>) => {
    setWizardState(s => ({
      ...s,
      coordenadas: s.coordenadas.map((coord, i) => 
        i === index ? { ...coord, ...updates } : coord
      ),
    }));
  };


  // Renderizar etapa de coordenada dinâmica
  const renderCoordinateStep = (coordIndex: number) => {
    const coord = wizardState.coordenadas[coordIndex];
    if (!coord) return null;

    // Determinar se é numérico ou alfabético
    const isNumeric = ['C', 'N', 'P', 'A', 'G', 'Q', 'B', 'SE', 'CO', 'E', 'AR'].includes(coord.tipo);
    const isAlpha = coord.tipo === 'R';

    // Usar lista de valores pré-calculada
    const valuesList = coordinateValuesLists[coordIndex] || [];
    const totalCoords = valuesList.length;

    // Permitir marcar acessíveis à mão apenas para níveis e andares
    const canMarkHandAccessible = ['N', 'A'].includes(coord.tipo) || 
      coord.nome.toLowerCase().includes('nível') || 
      coord.nome.toLowerCase().includes('andar');

    return (
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-medium mb-2 text-cyan-600">
            {coord.nome.toUpperCase()} ({coord.abrev})
          </h3>
          
          <div className="space-y-4">
            {isAlpha && (
              <div>
                <label className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    checked={!coord.usarPrefixo}
                    onChange={(e) =>
                      updateCoordinate(coordIndex, { usarPrefixo: !e.target.checked })
                    }
                    className="size-4"
                  />
                  <span className="text-sm">Não utilizo prefixo para identificar: {coord.nome.toLowerCase()}</span>
                </label>
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-2 block">
                Criar {coord.nome.toLowerCase()} De/Até
                <div className="text-xs text-gray-500">Informe o valor inicial e final</div>
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder={isAlpha ? 'A' : '0'}
                  maxLength={isAlpha ? 1 : undefined}
                  type={isNumeric ? 'number' : 'text'}
                  value={coord.inicio}
                  onChange={(e) => {
                    const value = isAlpha ? e.target.value.toUpperCase() : e.target.value;
                    updateCoordinate(coordIndex, { inicio: value });
                  }}
                />
                <Input
                  placeholder={isAlpha ? 'Z' : '10'}
                  maxLength={isAlpha ? 1 : undefined}
                  type={isNumeric ? 'number' : 'text'}
                  value={coord.fim}
                  onChange={(e) => {
                    const value = isAlpha ? e.target.value.toUpperCase() : e.target.value;
                    updateCoordinate(coordIndex, { fim: value });
                  }}
                />
              </div>
            </div>

            {canMarkHandAccessible && totalCoords > 0 && (
              <div>
                <label className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    checked={(coord.acessiveisAMao?.length || 0) > 0}
                    onChange={(e) => {
                      if (e.target.checked && (!coord.acessiveisAMao || coord.acessiveisAMao.length === 0)) {
                        updateCoordinate(coordIndex, { acessiveisAMao: [coord.inicio] });
                      } else if (!e.target.checked) {
                        updateCoordinate(coordIndex, { acessiveisAMao: [] });
                      }
                    }}
                    className="size-4"
                  />
                  <span className="text-sm font-medium">Marcar acessíveis à mão</span>
                </label>

                {(coord.acessiveisAMao?.length || 0) > 0 && (
                  <div className="space-y-2 pl-6 max-h-60 overflow-y-auto">
                    {valuesList.map((value) => (
                      <label key={value} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={coord.acessiveisAMao?.includes(value) || false}
                          onChange={(e) => {
                            const current = coord.acessiveisAMao || [];
                            if (e.target.checked) {
                              updateCoordinate(coordIndex, {
                                acessiveisAMao: [...current, value].sort(),
                              });
                            } else {
                              updateCoordinate(coordIndex, {
                                acessiveisAMao: current.filter((v) => v !== value),
                              });
                            }
                          }}
                          className="size-4"
                        />
                        <span className="text-sm">{value}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2 text-cyan-600">VISUALIZAÇÃO</h3>
          <div className="text-cyan-600 mb-2">{coord.nome.toUpperCase()} ({coord.abrev})</div>
          
          {totalCoords > 0 && (
            <div className="bg-gray-800 text-white rounded-lg p-4">
              <div className="text-xs mb-2">{totalCoords} COORDENADAS A SEREM CRIADAS</div>
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {valuesList.slice(0, 20).map((value) => (
                  <div key={value} className="text-sm">{coord.nome} {value};</div>
                ))}
                {totalCoords > 20 && (
                  <div className="text-xs text-gray-400">... e mais {totalCoords - 20} coordenadas</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Step final: Visualizar endereços
  const renderStepVisualizacao = () => {
    const totalEnderecos = preview.length;

    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold mb-2">Visualizar endereços a serem criados</h3>
          <Badge className="bg-green-500 text-white">{totalEnderecos} ENDEREÇOS</Badge>
        </div>

        <div className="border rounded-lg p-4 bg-amber-50 border-amber-200">
          <p className="text-sm text-amber-800">
            Esta visualização apenas simula a criação dos endereços, porém, a criação efetiva será
            processada posteriormente ao salvar os dados.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <h4 className="font-semibold mb-2">Depósito</h4>
            <p className="text-sm">{wizardState.depositoId}</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Estrutura física</h4>
            <p className="text-sm">{wizardState.estruturaFisicaNome}</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Unitizadores por endereço</h4>
            <p className="text-sm">1</p>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3 text-sm font-medium">
                  Endereço completo (Desktop)
                  <ChevronRight className="inline size-4 ml-1" />
                </th>
                <th className="text-left p-3 text-sm font-medium">
                  Endereço abreviado (Dispositivos Móveis)
                  <ChevronRight className="inline size-4 ml-1" />
                </th>
                <th className="text-left p-3 text-sm font-medium">
                  Alcance
                  <ChevronRight className="inline size-4 ml-1" />
                </th>
              </tr>
            </thead>
            <tbody>
              {preview.slice(0, 10).map((addr, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-3 text-sm">{addr.enderecoCompleto}</td>
                  <td className="p-3 text-sm">{addr.enderecoAbreviado}</td>
                  <td className="p-3 text-sm">
                    {addr.alcance === 'ACESSÍVEL A MÃO' ? (
                      <Badge className="bg-green-500 text-white">ACESSÍVEL A MÃO</Badge>
                    ) : (
                      <Badge variant="secondary">NÃO ACESSÍVEL A MÃO</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {preview.length > 10 && (
            <div className="border-t p-3 text-center text-sm text-muted-foreground">
              ... e mais {preview.length - 10} endereços
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleNext = async () => {
    if (wizardState.step === totalSteps - 1) {
      // Última etapa antes da visualização - gerar preview
      try {
        // Sanitizar capacidade: remover números <= 0 e strings vazias
        const cap = wizardState.capacidade
          ? {
              ...(wizardState.capacidade.unitizador && wizardState.capacidade.unitizador.trim()
                ? { unitizador: wizardState.capacidade.unitizador.trim() }
                : {}),
              ...(wizardState.capacidade.peso && wizardState.capacidade.peso > 0
                ? { peso: wizardState.capacidade.peso }
                : {}),
              ...(wizardState.capacidade.altura && wizardState.capacidade.altura > 0
                ? { altura: wizardState.capacidade.altura }
                : {}),
              ...(wizardState.capacidade.largura && wizardState.capacidade.largura > 0
                ? { largura: wizardState.capacidade.largura }
                : {}),
              ...(wizardState.capacidade.comprimento && wizardState.capacidade.comprimento > 0
                ? { comprimento: wizardState.capacidade.comprimento }
                : {}),
            }
          : undefined;

        const result = await previewMutation.mutateAsync({
          depositoId: wizardState.depositoId,
          estruturaFisicaId: wizardState.estruturaFisicaId,
          coordenadas: wizardState.coordenadas,
          capacidade: cap && Object.keys(cap).length > 0 ? cap : undefined,
        });
        setPreview(result.enderecos);
        setWizardState((s) => ({ ...s, step: s.step + 1 }));
      } catch {
        toast.show({ message: 'Erro ao gerar preview dos endereços', kind: 'error' });
      }
    } else if (wizardState.step < totalSteps) {
      setWizardState((s) => ({ ...s, step: s.step + 1 }));
    }
  };

  const handlePrevious = () => {
    if (wizardState.step > 1) {
      setWizardState((s) => ({ ...s, step: s.step - 1 }));
    }
  };

  const handleSave = async () => {
    try {
      const cap = wizardState.capacidade
        ? {
            ...(wizardState.capacidade.unitizador && wizardState.capacidade.unitizador.trim()
              ? { unitizador: wizardState.capacidade.unitizador.trim() }
              : {}),
            ...(wizardState.capacidade.peso && wizardState.capacidade.peso > 0
              ? { peso: wizardState.capacidade.peso }
              : {}),
            ...(wizardState.capacidade.altura && wizardState.capacidade.altura > 0
              ? { altura: wizardState.capacidade.altura }
              : {}),
            ...(wizardState.capacidade.largura && wizardState.capacidade.largura > 0
              ? { largura: wizardState.capacidade.largura }
              : {}),
            ...(wizardState.capacidade.comprimento && wizardState.capacidade.comprimento > 0
              ? { comprimento: wizardState.capacidade.comprimento }
              : {}),
          }
        : undefined;
      await createMutation.mutateAsync({
        depositoId: wizardState.depositoId,
        estruturaFisicaId: wizardState.estruturaFisicaId,
        coordenadas: wizardState.coordenadas,
        capacidade: cap && Object.keys(cap).length > 0 ? cap : undefined,
      });
      toast.show({ message: `${preview.length} endereços criados com sucesso!`, kind: 'success' });
      navigate('/settings/endereco');
    } catch {
      toast.show({ message: 'Erro ao criar endereços', kind: 'error' });
    }
  };

  const canGoNext = () => {
    if (wizardState.step === 1) {
      return wizardState.depositoId && wizardState.estruturaFisicaId;
    }
    
    if (wizardState.step >= 2 && wizardState.step < totalSteps) {
      const coordIndex = wizardState.step - 2;
      const coord = wizardState.coordenadas[coordIndex];
      return coord && coord.inicio && coord.fim;
    }
    
    return true;
  };

  // Renderizar conteúdo da etapa atual
  const renderCurrentStep = () => {
    if (wizardState.step === 1) {
      return (
        <StepInicio
          wizardState={wizardState}
          setWizardState={setWizardState}
          physicalStructures={physicalStructures}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      );
    }
    
    if (wizardState.step === totalSteps) {
      return renderStepVisualizacao();
    }
    
    // Etapas de coordenadas
    const coordIndex = wizardState.step - 2;
    return renderCoordinateStep(coordIndex);
  };

  // Breadcrumb dinâmico baseado na etapa
  const renderBreadcrumb = () => {
    const isFirstStep = wizardState.step === 1;
    
    return (
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
            <BreadcrumbLink asChild>
              <Link to="/settings/endereco">Cadastro de endereço</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            {isFirstStep ? (
              <BreadcrumbPage>Criar endereços</BreadcrumbPage>
            ) : (
              <BreadcrumbLink asChild>
                <button onClick={() => setWizardState(s => ({ ...s, step: 1 }))}>
                  Criar endereços
                </button>
              </BreadcrumbLink>
            )}
          </BreadcrumbItem>
          {!isFirstStep && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {activeTab === 'armazenagem' ? 'Endereços de armazenagem' : 'Endereços funcionais'}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    );
  };

  return (
    <div className="flex flex-col gap-6 p-6 pt-4">
      <div>
        {renderBreadcrumb()}

        <div className="mt-4 flex items-center justify-between">
          <h1 className="text-3xl font-semibold leading-tight" style={{ color: '#4a5c60' }}>
            Criar endereços
          </h1>
          <div className="flex gap-2">
            {wizardState.step > 1 && (
              <Button variant="outline" onClick={handlePrevious}>
                Anterior
              </Button>
            )}
            {wizardState.step < totalSteps ? (
              <Button onClick={handleNext} disabled={!canGoNext() || previewMutation.isPending}>
                {previewMutation.isPending ? 'Carregando...' : 'Próximo'}
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => navigate('/settings/endereco')}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Salvando...' : 'Salvar'}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Progress stepper dinâmico */}
      <div className="overflow-x-auto">
        <div className="flex items-center justify-start gap-2 min-w-max pb-2">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`size-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    wizardState.step === step.id
                      ? 'bg-cyan-500 text-white'
                      : wizardState.step > step.id
                      ? 'bg-cyan-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {wizardState.step > step.id ? <Check className="size-5" /> : step.id}
                </div>
                <div
                  className={`mt-2 text-xs font-medium whitespace-nowrap ${
                    wizardState.step >= step.id ? 'text-cyan-600' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-0.5 w-16 mx-2 transition-colors ${
                    wizardState.step > step.id ? 'bg-cyan-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content card */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-semibold mb-6">
            {wizardState.estruturaFisicaNome || 'Selecione uma estrutura física'}
          </h2>

          {renderCurrentStep()}
        </CardContent>
      </Card>
    </div>
  );
}