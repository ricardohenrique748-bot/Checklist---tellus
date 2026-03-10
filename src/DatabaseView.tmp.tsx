function DatabaseView() {
  const [activeForm, setActiveForm] = useState<'frotas' | 'funcionarios' | 'logins'>('frotas');

  return (
    <div className="max-w-[850px] mx-auto pb-24">
      <header className="mb-8 pt-2">
        <h1 className="text-[28px] font-extrabold tracking-tight text-slate-800">Gestão de Cadastros</h1>
        <p className="text-slate-500 mt-2 font-medium">Cadastre frotas, funcionários e acessos ao sistema.</p>
      </header>

      {/* Tabs para os formulários */}
      <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
        <button
          onClick={() => setActiveForm('frotas')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${activeForm === 'frotas'
            ? 'bg-blue-600 text-white shadow-md'
            : 'text-slate-500 hover:bg-slate-50'
            }`}
        >
          <Truck className="w-[18px] h-[18px]" />
          Frotas
        </button>
        <button
          onClick={() => setActiveForm('funcionarios')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${activeForm === 'funcionarios'
            ? 'bg-blue-600 text-white shadow-md'
            : 'text-slate-500 hover:bg-slate-50'
            }`}
        >
          <Users className="w-[18px] h-[18px]" />
          Funcionários
        </button>
        <button
          onClick={() => setActiveForm('logins')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${activeForm === 'logins'
            ? 'bg-blue-600 text-white shadow-md'
            : 'text-slate-500 hover:bg-slate-50'
            }`}
        >
          <Key className="w-[18px] h-[18px]" />
          Acessos
        </button>
      </div>

      {/* Formulários */}
      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgb(0,0,0,0.03)] border border-slate-200 p-6 sm:p-8">

        {/* Formulário de Frotas */}
        {activeForm === 'frotas' && (
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                <Truck className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-extrabold text-slate-800 tracking-wide uppercase">Cadastro de Veículo / Equipamento</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-7">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-extrabold text-[#7b8193] uppercase tracking-wide mb-2.5">
                  Placa / Identificação <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: ABC-1234"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/30 text-slate-800 text-[15px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium placeholder:text-slate-400 hover:border-slate-300 transition-colors shadow-sm"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-extrabold text-[#7b8193] uppercase tracking-wide mb-2.5">
                  Modelo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Volvo FH 460"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/30 text-slate-800 text-[15px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium placeholder:text-slate-400 hover:border-slate-300 transition-colors shadow-sm"
                />
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="flex items-center gap-1.5 text-xs font-extrabold text-[#7b8193] uppercase tracking-wide mb-2.5">
                  Tipo de Equipamento <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-slate-800 text-[15px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium appearance-none hover:border-slate-300 transition-colors shadow-sm">
                    <option value="">Selecione...</option>
                    <option value="caminhao">Caminhão Baú</option>
                    <option value="carreta">Carreta</option>
                    <option value="empilhadeira">Empilhadeira</option>
                    <option value="van">Van / Utilitário</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 flex justify-end">
              <button
                type="submit"
                onClick={() => alert('Veículo cadastrado com sucesso!')}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-6 py-3.5 rounded-xl shadow-md active:scale-[0.98] transition-all text-[14px] uppercase tracking-wide w-full sm:w-auto"
              >
                <Save className="w-[18px] h-[18px]" />
                Salvar Veículo
              </button>
            </div>
          </form>
        )}

        {/* Formulário de Funcionários */}
        {activeForm === 'funcionarios' && (
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-lg font-extrabold text-slate-800 tracking-wide uppercase">Cadastro de Funcionário</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-7">
              <div className="col-span-1 md:col-span-2">
                <label className="flex items-center gap-1.5 text-xs font-extrabold text-[#7b8193] uppercase tracking-wide mb-2.5">
                  Nome Completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: João da Silva"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/30 text-slate-800 text-[15px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium placeholder:text-slate-400 hover:border-slate-300 transition-colors shadow-sm"
                />
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="flex items-center gap-1.5 text-xs font-extrabold text-[#7b8193] uppercase tracking-wide mb-2.5">
                  Cargo / Função <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-slate-800 text-[15px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium appearance-none hover:border-slate-300 transition-colors shadow-sm">
                    <option value="">Selecione...</option>
                    <option value="motorista">Motorista</option>
                    <option value="mecanico">Mecânico</option>
                    <option value="eletricista">Eletricista</option>
                    <option value="encarregado">Encarregado</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 flex justify-end">
              <button
                type="submit"
                onClick={() => alert('Funcionário cadastrado com sucesso!')}
                className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-extrabold px-6 py-3.5 rounded-xl shadow-md active:scale-[0.98] transition-all text-[14px] uppercase tracking-wide w-full sm:w-auto"
              >
                <Save className="w-[18px] h-[18px]" />
                Salvar Funcionário
              </button>
            </div>
          </form>
        )}

        {/* Formulário de Acessos */}
        {activeForm === 'logins' && (
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                <Key className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-lg font-extrabold text-slate-800 tracking-wide uppercase">Cadastro de Acesso</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-7">
              <div className="col-span-1 md:col-span-2">
                <label className="flex items-center gap-1.5 text-xs font-extrabold text-[#7b8193] uppercase tracking-wide mb-2.5">
                  E-mail <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="Ex: usuario@empresa.com"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/30 text-slate-800 text-[15px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium placeholder:text-slate-400 hover:border-slate-300 transition-colors shadow-sm"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-extrabold text-[#7b8193] uppercase tracking-wide mb-2.5">
                  Senha <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/30 text-slate-800 text-[15px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium placeholder:text-slate-400 hover:border-slate-300 transition-colors shadow-sm"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-extrabold text-[#7b8193] uppercase tracking-wide mb-2.5">
                  Nível de Acesso <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-slate-800 text-[15px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium appearance-none hover:border-slate-300 transition-colors shadow-sm">
                    <option value="">Selecione...</option>
                    <option value="admin">Administrador (Acesso Total)</option>
                    <option value="operador">Operador (Apenas Checklists)</option>
                    <option value="gestor">Gestor (Relatórios e Aprovações)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 flex justify-end">
              <button
                type="submit"
                onClick={() => alert('Acesso cadastrado com sucesso!')}
                className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold px-6 py-3.5 rounded-xl shadow-md active:scale-[0.98] transition-all text-[14px] uppercase tracking-wide w-full sm:w-auto"
              >
                <Save className="w-[18px] h-[18px]" />
                Salvar Acesso
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

