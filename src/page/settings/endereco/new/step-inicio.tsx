import { Input } from '@/components/ui/input';
import { useDeposits } from '@/lib/hooks/use-organization';
import type { AddressWizardState } from '@/lib/types/addresses';
import type { PhysicalStructureSummary } from '@/lib/types/physical-structures';

interface StepInicioProps {
  wizardState: AddressWizardState;
  setWizardState: React.Dispatch<React.SetStateAction<AddressWizardState>>;
  physicalStructures?: PhysicalStructureSummary[];
  activeTab: 'armazenagem' | 'funcional';
  setActiveTab: (tab: 'armazenagem' | 'funcional') => void;
}

export function StepInicio({
  wizardState,
  setWizardState,
  physicalStructures,
  activeTab,
  setActiveTab,
}: StepInicioProps) {
  const { data: depositos } = useDeposits();
  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('armazenagem')}
          className={`flex-1 py-4 px-6 text-base font-medium transition-colors relative ${
            activeTab === 'armazenagem'
              ? 'text-white bg-[#1a3b47]'
              : 'text-gray-600 bg-white hover:bg-gray-50'
          }`}
        >
          Endereços de armazenagem
        </button>
        <button
          onClick={() => setActiveTab('funcional')}
          className={`flex-1 py-4 px-6 text-base font-medium transition-colors relative ${
            activeTab === 'funcional'
              ? 'text-white bg-[#1a3b47]'
              : 'text-gray-600 bg-white hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <span className="text-cyan-500">ⓘ</span>
            <span>Endereços funcionais</span>
          </div>
        </button>
      </div>

      {activeTab === 'armazenagem' && (
        <div className="space-y-8 pt-4">
          {/* Seção DADOS */}
          <div>
            <h4 className="text-xs font-semibold mb-4 text-cyan-600 tracking-wider">DADOS</h4>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-normal mb-2 block">
                  Depósito
                  <button className="ml-2 text-cyan-600 text-xs font-medium hover:underline">
                    Novo
                  </button>
                </label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2.5 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  value={wizardState.depositoId}
                  onChange={(e) =>
                    setWizardState((s) => ({ ...s, depositoId: e.target.value }))
                  }
                >
                  <option value="">Selecione o depósito</option>
                  {depositos?.map((deposito) => (
                    <option key={deposito.id} value={deposito.id}>
                      {deposito.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-normal mb-2 block">Estrutura física</label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2.5 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  value={wizardState.estruturaFisicaId}
                  onChange={(e) => {
                    const selected = physicalStructures?.find((s) => s.id === e.target.value);
                    setWizardState((s) => ({
                      ...s,
                      estruturaFisicaId: e.target.value,
                      estruturaFisicaNome: selected?.titulo || '',
                      coordenadas: [], // Reset coordenadas ao mudar estrutura
                    }));
                  }}
                >
                  <option value="">Selecione a estrutura física</option>
                  {physicalStructures
                    ?.filter(s => s.situacao === 'ATIVO')
                    .map((structure) => (
                      <option key={structure.id} value={structure.id}>
                        {structure.titulo}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          {/* Seção CAPACIDADE */}
          <div>
            <h4 className="text-xs font-semibold mb-4 text-cyan-600 tracking-wider">CAPACIDADE</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
              <div>
                <label className="text-sm font-normal mb-2 block">Unitizador</label>
                <Input
                  placeholder="Capacidade unitizador"
                  className="bg-white"
                  value={wizardState.capacidade?.unitizador || ''}
                  onChange={(e) =>
                    setWizardState((s) => ({
                      ...s,
                      capacidade: { ...s.capacidade, unitizador: e.target.value },
                    }))
                  }
                />
              </div>
              <div>
                <label className="text-sm font-normal mb-2 block">Peso</label>
                <Input
                  placeholder="Capacidade peso"
                  type="number"
                  className="bg-white"
                  value={wizardState.capacidade?.peso || ''}
                  onChange={(e) =>
                    setWizardState((s) => ({
                      ...s,
                      capacidade: { ...s.capacidade, peso: Number(e.target.value) },
                    }))
                  }
                />
              </div>
              <div>
                <label className="text-sm font-normal mb-2 block">Altura</label>
                <Input
                  placeholder="Capacidade altura"
                  type="number"
                  className="bg-white"
                  value={wizardState.capacidade?.altura || ''}
                  onChange={(e) =>
                    setWizardState((s) => ({
                      ...s,
                      capacidade: { ...s.capacidade, altura: Number(e.target.value) },
                    }))
                  }
                />
              </div>
              <div>
                <label className="text-sm font-normal mb-2 block">Largura</label>
                <Input
                  placeholder="Capacidade largura"
                  type="number"
                  className="bg-white"
                  value={wizardState.capacidade?.largura || ''}
                  onChange={(e) =>
                    setWizardState((s) => ({
                      ...s,
                      capacidade: { ...s.capacidade, largura: Number(e.target.value) },
                    }))
                  }
                />
              </div>
              <div>
                <label className="text-sm font-normal mb-2 block">Comprimento</label>
                <Input
                  placeholder="Capacidade comprimento"
                  type="number"
                  className="bg-white"
                  value={wizardState.capacidade?.comprimento || ''}
                  onChange={(e) =>
                    setWizardState((s) => ({
                      ...s,
                      capacidade: { ...s.capacidade, comprimento: Number(e.target.value) },
                    }))
                  }
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
