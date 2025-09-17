import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Lock } from 'lucide-react'
import logo from '@/assets/logo-simple.svg'

export function LoginPage() {
  const navigate = useNavigate()
  const [login, setLogin] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const versao = '1.0.0'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    // mock auth success
    navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-14 px-4 bg-[#fbfbfb] relative text-[#334b52]">
      <div className="w-full max-w-sm flex flex-col items-center">
        <img src={logo} alt="Logo" className="mb-6 select-none" draggable={false} />
        <h2 className="text-3xl font-light tracking-wide mb-2">WMS</h2>
        <h3 className="text-center text-[#0790a8] font-semibold text-sm leading-snug mb-6 uppercase">
          INDUSTRIA E COMERCIO SANTA MARIA<br/> LTDA
        </h3>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
          <div className="relative">
            <User className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#0790a8]" />
            <input
              placeholder="Inserir seu login"
              value={login}
              onChange={e => setLogin(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded border text-sm bg-white shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]"
            />
          </div>
          <div className="relative">
            <Lock className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#0790a8]" />
            <input
              placeholder="Insira sua senha"
              value={senha}
              type="password"
              onChange={e => setSenha(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded border text-sm bg-white shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0c9abe]"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !login || !senha}
            className="h-10 rounded bg-[#008bb1] hover:bg-[#007697] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm shadow-sm transition"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <div className="mt-5 flex flex-col items-center gap-2 text-[12px]">
          <button className="text-[#008bb1] hover:underline" type="button">Esqueceu sua senha?</button>
          <button className="text-[#008bb1] hover:underline" type="button">Alterar senha</button>
        </div>
        <div className="mt-10 opacity-55 text-[12px] font-medium tracking-wide select-none flex items-center gap-1">
          <span className="inline-block w-5 h-5 rounded-full border-2 border-[#0c5669] flex items-center justify-center text-[9px] font-bold text-[#0c5669]">T</span>
          <span>TOTUS</span>
        </div>
      </div>
      <span className="absolute left-4 bottom-2 text-[11px] text-[#6b7f85] select-none">Version {versao}</span>
    </div>
  )
}

export default LoginPage
