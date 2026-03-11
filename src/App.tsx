import React, { useState, useRef, useEffect } from 'react';
import { Truck, Calendar, Clock, User, CheckCircle, XCircle, MinusCircle, ChevronUp, ChevronDown, ListChecks, Database, Menu, X, Camera, ImagePlus, Trash2, Users, Key, Save, Droplet, Gauge, ClipboardCheck, BarChart3, Lock, Wrench, Pencil, Sun, Moon, Building2, Share2, ClipboardList } from 'lucide-react';
import { supabase } from './lib/supabase';

const mechanicallyItems = [
  'Motor', 'Sistema de arrefecimento', 'Óleo do motor', 'Filtros',
  'Correias', 'Sistema de freio', 'Sistema hidráulico',
  'Sistema pneumático', 'Suspensão', 'Direção', 'Vazamentos'
].map(item => item.toUpperCase());

const electricalItems = [
  'Bateria', 'Alternador', 'Motor de partida', 'Iluminação',
  'Sinalização', 'Painel'
].map(item => item.toUpperCase());

const externalItems = [
  'Pneus', 'Rodas', 'Estepe', 'Extintor', 'Triângulo',
  'Retrovisores', 'Limpadores de para-brisa'
].map(item => item.toUpperCase());

const lubricationItems = [
  'pontos cardan ponta dianteira',
  'pontos meio do cardan',
  'pontos final do cardan',
  'pontos cardan TRAÇÃO',
  'pontos nas duas rodas dianteiras',
  'pontos nas rodas traseiras'
].map(item => item.toUpperCase());

const calibrationItems = [
  'INTERNOS:',
  'EXTERNOS:',
  'DIANTEIROS:',
  'ESTEPE:'
].map(item => item.toUpperCase());

type Status = 'CONFORME' | 'NÃO CONFORME' | 'N/A' | null;

interface ItemState {
  status: Status;
  problemPhotos: string[];
  resolutionPhotos: string[];
  problemNote?: string;
  resolutionNote?: string;
  foundPressure?: string;
  adjustedPressure?: string;
}

type SectionState = Record<number, ItemState>;

interface SectionProps {
  title: string;
  items: string[];
  state: SectionState;
  onUpdateStatus: (index: number, status: Status) => void;
  onAddPhotos: (index: number, type: 'problem' | 'resolution', files: FileList) => void;
  onRemovePhoto: (index: number, type: 'problem' | 'resolution', photoIndex: number) => void;
  onUpdateNote: (index: number, type: 'problem' | 'resolution', note: string) => void;
  onUpdatePressure?: (index: number, type: 'found' | 'adjusted', value: string) => void;
  colorClass?: string;
  isCalibration?: boolean;
}

function Section({ title, items, state, onUpdateStatus, onAddPhotos, onRemovePhoto, onUpdateNote, onUpdatePressure, colorClass = "bg-green-600", isCalibration }: SectionProps) {
  const [open, setOpen] = useState(true);

  const completedCount = Object.values(state).filter(v => v.status !== null).length;
  const totalCount = items.length;

  return (
    <div className="bg-white rounded-xl shadow-[0_2px_12px_rgb(0,0,0,0.03)] border border-slate-200 mb-6 overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${colorClass}`}></div>
          <h2 className="font-extrabold text-slate-800 tracking-wide uppercase text-[15px]">{title}</h2>
          <span className="bg-slate-100 text-slate-500 text-xs font-bold px-3 py-1 rounded-full ml-1">
            {completedCount}/{totalCount}
          </span>
        </div>
        <div className="text-slate-400">
          {open ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </div>

      {/* Content */}
      {open && (
        <div className="border-t border-slate-100 p-0">
          {items.map((item, index) => (
            <ItemRow
              key={index}
              number={index + 1}
              label={item}
              data={state[index] || { status: null, problemPhotos: [], resolutionPhotos: [], problemNote: '', resolutionNote: '' }}
              onChangeStatus={(newStatus) => onUpdateStatus(index, newStatus)}
              onAddPhotos={(type, files) => onAddPhotos(index, type, files)}
              onRemovePhoto={(type, pIndex) => onRemovePhoto(index, type, pIndex)}
              onUpdateNote={(type, note) => onUpdateNote(index, type, note)}
              onUpdatePressure={onUpdatePressure ? (type, value) => onUpdatePressure(index, type, value) : undefined}
              isCalibration={isCalibration}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ItemRow({
  number,
  label,
  data,
  onChangeStatus,
  onAddPhotos,
  onRemovePhoto,
  onUpdateNote,
  onUpdatePressure,
  isCalibration
}: {
  number: number,
  label: string,
  data: ItemState,
  onChangeStatus: (status: Status) => void,
  onAddPhotos: (type: 'problem' | 'resolution', files: FileList) => void,
  onRemovePhoto: (type: 'problem' | 'resolution', photoIndex: number) => void,
  onUpdateNote: (type: 'problem' | 'resolution', note: string) => void,
  onUpdatePressure?: (type: 'found' | 'adjusted', value: string) => void,
  isCalibration?: boolean
}) {
  return (
    <div className="p-5 border-b border-slate-100 last:border-b-0 group hover:bg-slate-50/50 transition-colors">
      <div className="flex items-start gap-4 sm:gap-5">
        {/* Number Badge */}
        <div className="flex-shrink-0 w-9 h-9 border border-slate-200 rounded-xl flex items-center justify-center font-bold text-slate-600 text-sm bg-white shadow-sm font-mono mt-0.5">
          {number}
        </div>

        <div className="flex-1 overflow-hidden">
          {/* Label */}
          <div className="font-bold text-slate-800 text-[14px] uppercase tracking-wide">
            {label} {!isCalibration && <span className="text-red-500 font-normal ml-0.5">*</span>}
          </div>

          {isCalibration && onUpdatePressure && (
            <div className="flex gap-4 mt-3">
              <div className="flex-1">
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Pressão Encontrada</label>
                <div className="relative">
                  <input type="number"
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 text-[14px] text-slate-800 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 hover:border-slate-300 transition-colors bg-slate-50/50"
                    placeholder="Ex: 110"
                    value={data.foundPressure || ''}
                    onChange={(e) => onUpdatePressure('found', e.target.value)} />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold pt-[1px]">PSI</span>
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Pressão Ajustada</label>
                <div className="relative">
                  <input type="number"
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 text-[14px] text-slate-800 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 hover:border-slate-300 transition-colors bg-slate-50/50"
                    placeholder="Ex: 110"
                    value={data.adjustedPressure || ''}
                    onChange={(e) => onUpdatePressure('adjusted', e.target.value)} />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold pt-[1px]">PSI</span>
                </div>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-wrap gap-3 mt-3.5">
            <button
              type="button"
              onClick={() => onChangeStatus('CONFORME')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${data.status === 'CONFORME'
                ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/30'
                : 'bg-slate-50 text-slate-500 hover:bg-slate-100/80 ring-1 ring-slate-200/50'
                }`}
            >
              <CheckCircle className="w-[14px] h-[14px]" />
              CONFORME
            </button>
            <button
              type="button"
              onClick={() => onChangeStatus('NÃO CONFORME')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${data.status === 'NÃO CONFORME'
                ? 'bg-red-50 text-red-700 ring-1 ring-red-600/30'
                : 'bg-slate-50 text-slate-500 hover:bg-slate-100/80 ring-1 ring-slate-200/50'
                }`}
            >
              <XCircle className="w-[14px] h-[14px]" />
              NÃO CONFORME
            </button>
            <button
              type="button"
              onClick={() => onChangeStatus('N/A')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${data.status === 'N/A'
                ? 'bg-slate-200 text-slate-700 ring-1 ring-slate-400/50'
                : 'bg-slate-50 text-slate-500 hover:bg-slate-100/80 ring-1 ring-slate-200/50'
                }`}
            >
              <MinusCircle className="w-[14px] h-[14px]" />
              N/A
            </button>
          </div>

          {/* Photo Upload Area - Only visible if "NÃO CONFORME" */}
          {data.status === 'NÃO CONFORME' && (
            <div className="mt-5 p-4 bg-red-50/50 border border-red-100 rounded-xl flex flex-col gap-5 animate-in fade-in slide-in-from-top-2 duration-200">

              {/* Problem Section */}
              <div className="flex flex-col gap-3">
                <h4 className="text-[11px] font-extrabold text-red-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5" />
                  Detalhes do Problema
                </h4>
                <textarea
                  className="w-full min-h-[60px] p-3 rounded-lg border border-red-200 bg-white text-[13px] text-slate-700 focus:outline-none focus:ring-1 focus:ring-red-400 placeholder:text-slate-400 resize-none"
                  placeholder="Descreva o problema encontrado..."
                  value={data.problemNote || ''}
                  onChange={(e) => onUpdateNote('problem', e.target.value)}
                />
                <div className="flex flex-wrap gap-2.5">
                  {data.problemPhotos?.map((photo, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-red-200 group">
                      <img src={photo} alt="Problema" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => onRemovePhoto('problem', i)}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  ))}
                  <label className="flex flex-col items-center justify-center w-20 h-20 rounded-lg border-2 border-dashed border-red-200 text-red-400 hover:text-red-600 hover:border-red-400 hover:bg-red-50 cursor-pointer transition-colors bg-white">
                    <Camera className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-bold">Adicionar</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      multiple
                      className="hidden"
                      onChange={(e) => e.target.files && onAddPhotos('problem', e.target.files)}
                    />
                  </label>
                </div>
              </div>

              <div className="h-px w-full bg-red-100/80 my-2"></div>

              {/* Resolution Section */}
              <div className="flex flex-col gap-3">
                <h4 className="text-[11px] font-extrabold text-green-600 uppercase tracking-wider flex items-center gap-1.5">
                  <ImagePlus className="w-3.5 h-3.5" />
                  Resolução Aplicada
                </h4>
                <textarea
                  className="w-full min-h-[60px] p-3 rounded-lg border border-green-200 bg-white text-[13px] text-slate-700 focus:outline-none focus:ring-1 focus:ring-green-400 placeholder:text-slate-400 resize-none"
                  placeholder="Como o problema foi resolvido?"
                  value={data.resolutionNote || ''}
                  onChange={(e) => onUpdateNote('resolution', e.target.value)}
                />
                <div className="flex flex-wrap gap-2.5">
                  {data.resolutionPhotos?.map((photo, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-green-200 group">
                      <img src={photo} alt="Resolução" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => onRemovePhoto('resolution', i)}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  ))}
                  <label className="flex flex-col items-center justify-center w-20 h-20 rounded-lg border-2 border-dashed border-green-300 text-green-500 hover:text-green-600 hover:border-green-500 hover:bg-green-50 cursor-pointer transition-colors bg-white">
                    <ImagePlus className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-bold">Adicionar</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      multiple
                      className="hidden"
                      onChange={(e) => e.target.files && onAddPhotos('resolution', e.target.files)}
                    />
                  </label>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  )
}

function SignatureField({ label }: { label: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        // Get container dimensions
        const rect = parent.getBoundingClientRect();

        // Store existing image before resize to avoid clearing signature on device rotation etc
        const ctx = canvas.getContext('2d');
        let tempCanvas: HTMLCanvasElement | null = null;

        if (ctx && canvas.width > 0 && canvas.height > 0) {
          tempCanvas = document.createElement('canvas');
          tempCanvas.width = canvas.width;
          tempCanvas.height = canvas.height;
          tempCanvas.getContext('2d')?.drawImage(canvas, 0, 0);
        }

        // Handle pixel density for crisp lines on retina and mobile displays
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = rect.width * ratio;
        canvas.height = 120 * ratio; // 120px visual height

        if (ctx) {
          ctx.scale(ratio, ratio);
          ctx.strokeStyle = '#0f172a'; // slate-900 (black/dark blue for pen)
          ctx.lineWidth = 3;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          // Restore drawing
          if (tempCanvas) {
            ctx.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 0, 0, tempCanvas.width / ratio, tempCanvas.height / ratio);
          }
        }
      }
    };

    resizeCanvas();

    // Slight delay to ensure layout is applied
    setTimeout(resizeCanvas, 100);

    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    // Draw a dot if it's just a click/tap
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</label>
        <button
          type="button"
          onClick={clearSignature}
          className="text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1 bg-slate-100 hover:bg-red-50 px-2.5 py-1 rounded border border-transparent hover:border-red-200"
        >
          <Trash2 className="w-3 h-3" /> Limpar
        </button>
      </div>
      <div
        className="w-full bg-slate-50/70 border-2 border-slate-200 border-dashed rounded-xl overflow-hidden relative group"
        style={{ touchAction: 'none' }} /* Prevents page scroll when drawing on mobile */
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={endDrawing}
          onTouchCancel={endDrawing}
          className="w-full h-[120px] cursor-crosshair relative z-10"
        />
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30 group-hover:opacity-10 transition-opacity">
          <span className="text-slate-400 font-medium italic text-sm">Assine aqui</span>
        </div>
      </div>
    </div>
  );
}

function ChecklistView() {
  const [viewMode, setViewMode] = useState<'nova' | 'historico' | 'visualizar'>('nova');
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    async function loadInspecoes() {
      const { data } = await supabase.from('inspecoes').select('*').order('created_at', { ascending: false });
      if (data) setHistory(data);
    }
    if (viewMode === 'historico') {
      loadInspecoes();
    }
  }, [viewMode]);

  const [, setSelectedInspection] = useState<any>(null);

  const [frotasLocal, setFrotasLocal] = useState<any[]>([]);
  const [funcionariosLocal, setFuncionariosLocal] = useState<any[]>([]);
  const [acessosLocal, setAcessosLocal] = useState<any[]>([]);

  useEffect(() => {
    async function loadInspecoes() {
      const { data } = await supabase.from('inspecoes').select('*').order('created_at', { ascending: false });
      if (data) setHistory(data);
    }

    async function loadOptions() {
      const { data: df } = await supabase.from('frotas').select('placa, modelo').order('placa', { ascending: true });
      if (df) setFrotasLocal(df);

      const { data: dfunc } = await supabase.from('funcionarios').select('nome').order('nome', { ascending: true });
      if (dfunc) setFuncionariosLocal(dfunc);

      const { data: dac } = await supabase.from('acessos').select('nome, email').order('nome', { ascending: true });
      if (dac) setAcessosLocal(dac);
    }

    loadOptions();

    // Check query params if we want to open a new inspection directly or wait
    if (viewMode === 'historico') {
      loadInspecoes();
    }
  }, [viewMode]);

  const [inspectionTab, setInspectionTab] = useState<'checklist' | 'lubrificacao' | 'calibragem'>('checklist');

  const [headerPlaca, setHeaderPlaca] = useState('');
  const [headerResponsavel, setHeaderResponsavel] = useState(() => localStorage.getItem('tellus_user_name') || '');
  const [headerData, setHeaderData] = useState(() => new Date().toISOString().split('T')[0]);
  const [headerHora, setHeaderHora] = useState(() => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
  const [headerKM, setHeaderKM] = useState('');

  const [mecanica, setMecanica] = useState<SectionState>({});
  const [eletrica, setEletrica] = useState<SectionState>({});
  const [externa, setExterna] = useState<SectionState>({});
  const [lubrificacao, setLubrificacao] = useState<SectionState>({});
  const [calibragem, setCalibragem] = useState<SectionState>({});

  // Helpers to update deeply nested states
  const handleUpdateStatus = (setter: React.Dispatch<React.SetStateAction<SectionState>>) => (idx: number, status: Status) => {
    setter(prev => ({
      ...prev,
      [idx]: {
        ...(prev[idx] || {}),
        problemPhotos: prev[idx]?.problemPhotos || [],
        resolutionPhotos: prev[idx]?.resolutionPhotos || [],
        problemNote: prev[idx]?.problemNote || '',
        resolutionNote: prev[idx]?.resolutionNote || '',
        status
      }
    }));
  };

  const handleAddPhotos = (setter: React.Dispatch<React.SetStateAction<SectionState>>) => (idx: number, type: 'problem' | 'resolution', files: FileList) => {
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setter(prev => {
          const current = prev[idx] || { status: null, problemPhotos: [], resolutionPhotos: [], problemNote: '', resolutionNote: '' };
          const photoTypeKey = type === 'problem' ? 'problemPhotos' : 'resolutionPhotos';
          return {
            ...prev,
            [idx]: {
              ...current,
              [photoTypeKey]: [...(current[photoTypeKey] || []), e.target?.result as string]
            }
          };
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (setter: React.Dispatch<React.SetStateAction<SectionState>>) => (idx: number, type: 'problem' | 'resolution', photoIndex: number) => {
    setter(prev => {
      const current = prev[idx];
      if (!current) return prev;

      const photoTypeKey = type === 'problem' ? 'problemPhotos' : 'resolutionPhotos';
      const updatedPhotos = [...(current[photoTypeKey] || [])];
      updatedPhotos.splice(photoIndex, 1);

      return {
        ...prev,
        [idx]: {
          ...current,
          [photoTypeKey]: updatedPhotos
        }
      };
    });
  };

  const handleUpdateNote = (setter: React.Dispatch<React.SetStateAction<SectionState>>) => (idx: number, type: 'problem' | 'resolution', text: string) => {
    setter(prev => {
      const current = prev[idx] || { status: null, problemPhotos: [], resolutionPhotos: [], problemNote: '', resolutionNote: '' };
      const noteTypeKey = type === 'problem' ? 'problemNote' : 'resolutionNote';

      return {
        ...prev,
        [idx]: {
          ...current,
          [noteTypeKey]: text
        }
      };
    });
  };

  const handleUpdatePressure = (setter: React.Dispatch<React.SetStateAction<SectionState>>) => (idx: number, type: 'found' | 'adjusted', value: string) => {
    setter(prev => {
      const current = prev[idx] || { status: null, problemPhotos: [], resolutionPhotos: [], problemNote: '', resolutionNote: '', foundPressure: '', adjustedPressure: '' };
      const pressureTypeKey = type === 'found' ? 'foundPressure' : 'adjustedPressure';

      return {
        ...prev,
        [idx]: {
          ...current,
          [pressureTypeKey]: value
        }
      };
    });
  };

  const totalItemsCount = mechanicallyItems.length + electricalItems.length + externalItems.length + lubricationItems.length + calibrationItems.length;
  const totalCompleted =
    Object.values(mecanica).filter(i => i.status !== null).length +
    Object.values(eletrica).filter(i => i.status !== null).length +
    Object.values(externa).filter(i => i.status !== null).length +
    Object.values(lubrificacao).filter(i => i.status !== null).length +
    Object.values(calibragem).filter(i => i.status !== null).length;

  const handleSave = async () => {
    if (!headerPlaca || !headerResponsavel) {
      alert('Por favor, identifique o veículo e o responsável!');
      return;
    }

    const inspectionData = {
      placa: headerPlaca,
      responsavel: headerResponsavel,
      data: headerData,
      hora: headerHora,
      km: headerKM,
      mecanica,
      eletrica,
      externa,
      lubrificacao,
      calibragem
    };

    try {
      const { data, error } = await supabase.from('inspecoes').insert([inspectionData]).select();
      if (error) throw error;

      const newHistory = data ? [...data, ...history] : [];
      setHistory(newHistory);

      // Clear forms
      setHeaderPlaca('');
      setHeaderKM('');
      setMecanica({}); setEletrica({}); setExterna({}); setLubrificacao({}); setCalibragem({});

      alert('Inspeção salva com sucesso!');
      setViewMode('historico');
    } catch (e: any) {
      alert(`Erro ao salvar inspeção: ${e.message}`);
    }
  };

  const handleShare = (inspeccao: any) => {
    const text = `*Checklist - Equipamento ${inspeccao.placa}*
*KM:* ${inspeccao.km || 'Não informado'}
*Data:* ${inspeccao.data.split('-').reverse().join('/')} às ${inspeccao.hora}
*Responsável:* ${inspeccao.responsavel}

Faça login no sistema para ver os detalhes completos.`;

    if (navigator.share) {
      navigator.share({
        title: `Checklist ${inspeccao.placa}`,
        text: text
      }).catch(console.error);
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  const openVisualizacao = (inspeccao: any) => {
    setSelectedInspection(inspeccao);
    setViewMode('visualizar');

    // Fill states para o modo de visualização 
    // É apenas para exibir... Mas podemos só usar o rendered do Checklist normal "desativado"
    setHeaderData(inspeccao.data);
    setHeaderHora(inspeccao.hora);
    setHeaderKM(inspeccao.km || '');
    setMecanica(inspeccao.mecanica || {});
    setEletrica(inspeccao.eletrica || {});
    setExterna(inspeccao.externa || {});
    setLubrificacao(inspeccao.lubrificacao || {});
    setCalibragem(inspeccao.calibragem || {});
  }

  const cancelVisualizacao = () => {
    setSelectedInspection(null);
    setViewMode('historico');
    // Clear states 
    setHeaderHora(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    setHeaderKM('');
    setMecanica({}); setEletrica({}); setExterna({}); setLubrificacao({}); setCalibragem({});
  }

  if (viewMode === 'historico') {
    return (
      <div className="max-w-[850px] mx-auto pb-24">
        <header className="mb-6 pt-2 flex items-center justify-between">
          <h1 className="text-[28px] font-extrabold tracking-tight text-slate-800">Histórico de Inspeções</h1>
          <button
            onClick={() => setViewMode('nova')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors"
          >
            + Nova Inspeção
          </button>
        </header>

        <div className="space-y-4">
          {history.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
              <ClipboardCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">Nenhuma inspeção registrada ainda.</p>
            </div>
          ) : (
            history.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">
                      {item.placa} <span className="text-slate-400 font-medium text-sm uppercase">({frotasLocal.find(f => f.placa === item.placa)?.modelo || 'S/ modelo'})</span>
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-slate-500 font-medium">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {item.data.split('-').reverse().join('/')}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {item.hora}</span>
                      {item.km && <span className="flex items-center gap-1"><Gauge className="w-3.5 h-3.5" /> {item.km} KM</span>}
                      <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {item.responsavel}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                  <button
                    onClick={() => openVisualizacao(item)}
                    className="flex-1 sm:flex-none justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
                  >
                    Ver / Imprimir
                  </button>
                  <button
                    onClick={() => handleShare(item)}
                    className="flex-1 sm:flex-none justify-center bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
                  >
                    Compartilhar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // Disable pointer events on the entire form if we are in view mode
  const pointerEventsClass = viewMode === 'visualizar' ? 'pointer-events-none' : '';

  return (
    <div className={`max-w-[850px] mx-auto pb-24 ${pointerEventsClass}`}>
      <header className="mb-6 pt-2 flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-slate-800">
            {viewMode === 'visualizar' ? 'Visualizar Inspeção' : 'Inspeção de Veículos'}
          </h1>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-slate-500 font-medium">
              {viewMode === 'visualizar' ? 'Modo de leitura apenas.' : 'Realize o preenchimento das abas antes de salvar.'}
            </p>
            <span className="bg-blue-50 text-blue-600 text-[11px] font-black px-3 py-1 rounded-full border border-blue-100">
              {totalCompleted} / {totalItemsCount} ITENS
            </span>
          </div>
        </div>
        {viewMode === 'nova' && (
          <button
            onClick={() => setViewMode('historico')}
            className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg font-bold text-sm transition-colors"
          >
            Ver Histórico
          </button>
        )}
        {viewMode === 'visualizar' && (
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={() => window.print()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors"
            >
              Imprimir
            </button>
            <button
              onClick={cancelVisualizacao}
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg font-bold text-sm transition-colors"
            >
              Voltar
            </button>
          </div>
        )}
      </header>

      {/* Print header visible only on print */}
      <div className="hidden print:block mb-8 border-b-2 border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-slate-800">
          RELATÓRIO DE INSPEÇÃO: {headerPlaca}
          <span className="text-slate-500 font-medium ml-2">({frotasLocal.find(f => f.placa === headerPlaca)?.modelo || ''})</span>
        </h1>
        <div className="mt-2 text-sm text-slate-600 flex gap-4">
          <span><strong>Data:</strong> {headerData.split('-').reverse().join('/')}</span>
          <span><strong>Hora:</strong> {headerHora}</span>
          <span><strong>Responsável:</strong> {headerResponsavel}</span>
        </div>
      </div>

      <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
        {/* Identificação */}
        <div className="bg-white rounded-xl shadow-[0_2px_12px_rgb(0,0,0,0.03)] border border-slate-200 mb-8 p-6 sm:p-8">
          <h2 className="text-sm font-extrabold text-slate-400 tracking-wider mb-6">IDENTIFICAÇÃO</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-7">
            <div className="col-span-1 md:col-span-2">
              <label className="flex items-center gap-1.5 text-xs font-extrabold text-[#7b8193] uppercase tracking-wide mb-2.5">
                <Truck className="w-[14px] h-[14px] text-slate-400" />
                Placa / Equipamento <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={headerPlaca}
                  onChange={(e) => setHeaderPlaca(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-slate-800 text-[15px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium appearance-none hover:border-slate-300 transition-colors shadow-sm"
                >
                  <option value="">Selecione o veículo...</option>
                  {frotasLocal.map((f: any) => (
                    <option key={f.placa} value={f.placa}>{f.placa} ({f.modelo})</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-extrabold text-[#7b8193] uppercase tracking-wide mb-2.5">
                <Calendar className="w-[14px] h-[14px] text-slate-400" />
                Data <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={headerData}
                onChange={(e) => setHeaderData(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/30 text-slate-800 text-[15px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium hover:border-slate-300 transition-colors shadow-sm"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-extrabold text-[#7b8193] uppercase tracking-wide mb-2.5">
                <Clock className="w-[14px] h-[14px] text-slate-400" />
                Hora <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={headerHora}
                onChange={(e) => setHeaderHora(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/30 text-slate-800 text-[15px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium hover:border-slate-300 transition-colors shadow-sm"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-extrabold text-[#7b8193] uppercase tracking-wide mb-2.5">
                <Gauge className="w-[14px] h-[14px] text-slate-400" />
                Quilometragem (KM) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={headerKM}
                onChange={(e) => setHeaderKM(e.target.value)}
                placeholder="0"
                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/30 text-slate-800 text-[15px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium hover:border-slate-300 transition-colors shadow-sm"
              />
            </div>

            <div className="col-span-1 md:col-span-1">
              <label className="flex items-center gap-1.5 text-xs font-extrabold text-[#7b8193] uppercase tracking-wide mb-2.5">
                <User className="w-[14px] h-[14px] text-slate-400" />
                Nome do Responsável <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={headerResponsavel}
                  onChange={(e) => setHeaderResponsavel(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/30 text-slate-800 text-[15px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium appearance-none hover:border-slate-300 transition-colors shadow-sm"
                >
                  <option value="">Selecione o responsável...</option>
                  {acessosLocal.map((u: any, idx: number) => (
                    <option key={`a-${idx}`} value={u.nome || u.email}>{u.nome || u.email} (Usuário)</option>
                  ))}
                  {funcionariosLocal.map((u: any, idx: number) => (
                    <option key={`f-${idx}`} value={u.nome}>{u.nome} (Funcionário)</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Internas da Inspeção */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-slate-200 print:hidden pointer-events-auto">
          <button
            onClick={() => setInspectionTab('checklist')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${inspectionTab === 'checklist'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-500 hover:bg-slate-50'
              }`}
          >
            <ClipboardCheck className="w-[18px] h-[18px]" />
            Checklist
          </button>
          <button
            onClick={() => setInspectionTab('lubrificacao')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${inspectionTab === 'lubrificacao'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-500 hover:bg-slate-50'
              }`}
          >
            <Droplet className="w-[18px] h-[18px]" />
            Lubrificação
          </button>
          <button
            onClick={() => setInspectionTab('calibragem')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${inspectionTab === 'calibragem'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-500 hover:bg-slate-50'
              }`}
          >
            <Gauge className="w-[18px] h-[18px]" />
            Calibragem
          </button>
        </div>

        {/* Listas */}

        {inspectionTab === 'checklist' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Section
              title="ITENS DE VERIFICAÇÃO MECÂNICA"
              items={mechanicallyItems}
              state={mecanica}
              colorClass="bg-green-600"
              onUpdateStatus={handleUpdateStatus(setMecanica)}
              onAddPhotos={handleAddPhotos(setMecanica)}
              onRemovePhoto={handleRemovePhoto(setMecanica)}
              onUpdateNote={handleUpdateNote(setMecanica)}
            />
            <Section
              title="ITENS ELÉTRICOS"
              items={electricalItems}
              state={eletrica}
              colorClass="bg-red-500"
              onUpdateStatus={handleUpdateStatus(setEletrica)}
              onAddPhotos={handleAddPhotos(setEletrica)}
              onRemovePhoto={handleRemovePhoto(setEletrica)}
              onUpdateNote={handleUpdateNote(setEletrica)}
            />
            <Section
              title="PARTE EXTERNA / SEGURANÇA"
              items={externalItems}
              state={externa}
              colorClass="bg-blue-500"
              onUpdateStatus={handleUpdateStatus(setExterna)}
              onAddPhotos={handleAddPhotos(setExterna)}
              onRemovePhoto={handleRemovePhoto(setExterna)}
              onUpdateNote={handleUpdateNote(setExterna)}
            />
          </div>
        )}

        {inspectionTab === 'lubrificacao' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Section
              title="ITENS DE LUBRIFICAÇÃO"
              items={lubricationItems}
              state={lubrificacao}
              colorClass="bg-amber-500"
              onUpdateStatus={handleUpdateStatus(setLubrificacao)}
              onAddPhotos={handleAddPhotos(setLubrificacao)}
              onRemovePhoto={handleRemovePhoto(setLubrificacao)}
              onUpdateNote={handleUpdateNote(setLubrificacao)}
            />
          </div>
        )}

        {inspectionTab === 'calibragem' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Section
              title="ITENS DE CALIBRAGEM"
              items={calibrationItems}
              state={calibragem}
              colorClass="bg-cyan-500"
              onUpdateStatus={handleUpdateStatus(setCalibragem)}
              onAddPhotos={handleAddPhotos(setCalibragem)}
              onRemovePhoto={handleRemovePhoto(setCalibragem)}
              onUpdateNote={handleUpdateNote(setCalibragem)}
              onUpdatePressure={handleUpdatePressure(setCalibragem)}
              isCalibration={true}
            />
          </div>
        )}

        <div className="bg-white rounded-xl shadow-[0_2px_12px_rgb(0,0,0,0.03)] border border-slate-200 p-8 mt-10">
          <h2 className="text-sm font-extrabold text-slate-400 tracking-wider mb-10">ASSINATURAS</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-12">
            <SignatureField label="Mecânico" />
            <SignatureField label="Eletricista" />
            <SignatureField label="Encarregado" />
            <SignatureField label="Elaborado por" />
          </div>
        </div>

        {viewMode === 'nova' && (
          <div className="pt-8 flex justify-end print:hidden pointer-events-auto">
            <button
              type="button"
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-8 py-3.5 rounded-xl shadow-md active:scale-[0.98] transition-all text-[15px] uppercase tracking-wide w-full sm:w-auto"
            >
              Salvar Checklist
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

function DatabaseView() {
  const [activeForm, setActiveForm] = useState<'frotas' | 'funcionarios' | 'logins' | 'empresas'>('frotas');

  const [frotas, setFrotas] = useState<any[]>([]);
  const [funcionarios, setFuncionarios] = useState<any[]>([]);
  const [acessos, setAcessos] = useState<any[]>([]);
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [loadingDados, setLoadingDados] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoadingDados(true);

      const { data: df } = await supabase.from('frotas').select('*').order('created_at', { ascending: false });
      if (df) setFrotas(df);

      const { data: dfunc } = await supabase.from('funcionarios').select('*').order('created_at', { ascending: false });
      if (dfunc) setFuncionarios(dfunc);

      const { data: dac } = await supabase.from('acessos').select('*').order('created_at', { ascending: false });
      if (dac) setAcessos(dac);

      const { data: demp } = await supabase.from('empresas').select('*').order('nome', { ascending: true });
      if (demp) setEmpresas(demp);

      setLoadingDados(false);
    }
    loadData();
  }, []);

  const [frotaPlaca, setFrotaPlaca] = useState('');
  const [frotaModelo, setFrotaModelo] = useState('');
  const [frotaTipo, setFrotaTipo] = useState('');
  const [frotaKM, setFrotaKM] = useState('');
  const [frotaEmpresa, setFrotaEmpresa] = useState('');

  const [empresaNome, setEmpresaNome] = useState('');

  const [funcNome, setFuncNome] = useState('');
  const [funcEmail, setFuncEmail] = useState('');
  const [funcCargo, setFuncCargo] = useState('');

  const [acessoNome, setAcessoNome] = useState('');
  const [acessoEmail, setAcessoEmail] = useState('');
  const [acessoSenha, setAcessoSenha] = useState('');
  const [acessoNivel, setAcessoNivel] = useState('');

  const [editingId, setEditingId] = useState<number | null>(null);

  const clearForm = () => {
    setFrotaPlaca(''); setFrotaModelo(''); setFrotaTipo(''); setFrotaEmpresa(''); setFrotaKM('');
    setFuncNome(''); setFuncEmail(''); setFuncCargo('');
    setAcessoNome(''); setAcessoEmail(''); setAcessoSenha(''); setAcessoNivel('');
    setEmpresaNome('');
    setEditingId(null);
  };

  const handleSaveFrota = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!frotaPlaca || !frotaModelo || !frotaTipo || !frotaEmpresa) return alert('Preencha todos os campos!');

    try {
      if (editingId) {
        const { data, error } = await supabase.from('frotas').update({ placa: frotaPlaca, modelo: frotaModelo, tipo: frotaTipo, empresa: frotaEmpresa, km: frotaKM }).eq('id', editingId).select();
        if (error) throw error;
        setFrotas(frotas.map(f => f.id === editingId ? data[0] : f));
        alert('Veículo atualizado com sucesso!');
      } else {
        const { data, error } = await supabase.from('frotas').insert([{ placa: frotaPlaca, modelo: frotaModelo, tipo: frotaTipo, empresa: frotaEmpresa, km: frotaKM }]).select();
        if (error) throw error;
        if (data) setFrotas([data[0], ...frotas]);
        alert('Veículo cadastrado com sucesso!');
      }
      clearForm();
    } catch (e: any) {
      alert('Erro: ' + e.message);
    }
  };

  const handleSaveFuncionario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!funcNome || !funcCargo) return alert('Preencha os campos obrigatórios!');

    try {
      if (editingId) {
        const { data, error } = await supabase.from('funcionarios').update({ nome: funcNome, email: funcEmail, cargo: funcCargo }).eq('id', editingId).select();
        if (error) throw error;
        setFuncionarios(funcionarios.map(f => f.id === editingId ? data[0] : f));
        alert('Funcionário atualizado com sucesso!');
      } else {
        const { data, error } = await supabase.from('funcionarios').insert([{ nome: funcNome, email: funcEmail, cargo: funcCargo }]).select();
        if (error) throw error;
        if (data) setFuncionarios([data[0], ...funcionarios]);
        alert('Funcionário cadastrado com sucesso!');
      }
      clearForm();
    } catch (e: any) {
      alert('Erro: ' + e.message);
    }
  };

  const handleSaveAcesso = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acessoEmail || !acessoSenha || !acessoNivel) return alert('Preencha os campos obrigatórios!');

    try {
      if (editingId) {
        const { data, error } = await supabase.from('acessos').update({ nome: acessoNome, email: acessoEmail, senha: acessoSenha, nivel: acessoNivel }).eq('id', editingId).select();
        if (error) throw error;
        setAcessos(acessos.map(f => f.id === editingId ? data[0] : f));
        alert('Acesso atualizado com sucesso!');
      } else {
        const { data, error } = await supabase.from('acessos').insert([{ nome: acessoNome, email: acessoEmail, senha: acessoSenha, nivel: acessoNivel }]).select();
        if (error) throw error;
        if (data) setAcessos([data[0], ...acessos]);
        alert('Acesso cadastrado com sucesso!');
      }
      clearForm();
    } catch (e: any) {
      alert('Erro: ' + e.message);
    }
  };

  const handleSaveEmpresa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresaNome) return alert('Preencha o nome da empresa!');

    try {
      if (editingId) {
        const { data, error } = await supabase.from('empresas').update({ nome: empresaNome }).eq('id', editingId).select();
        if (error) throw error;
        setEmpresas(empresas.map(emp => emp.id === editingId ? data[0] : emp));
        alert('Empresa atualizada com sucesso!');
      } else {
        const { data, error } = await supabase.from('empresas').insert([{ nome: empresaNome }]).select();
        if (error) throw error;
        if (data) setEmpresas([...empresas, data[0]].sort((a, b) => a.nome.localeCompare(b.nome)));
        alert('Empresa cadastrada com sucesso!');
      }
      clearForm();
    } catch (e: any) {
      alert('Erro: ' + e.message);
    }
  };

  const startEditFrota = (f: any) => {
    console.log("Iniciando edição de frota:", f);
    setEditingId(f.id);
    setFrotaPlaca(f.placa);
    setFrotaModelo(f.modelo);
    setFrotaTipo(f.tipo);
    setFrotaKM(f.km || '');
    setFrotaEmpresa(f.empresa || '');
    window.scrollTo({ top: 0, behavior: 'auto' });
    window.scrollTo(0, 0);
  };

  const startEditFuncionario = (f: any) => {
    setEditingId(f.id);
    setFuncNome(f.nome);
    setFuncEmail(f.email || '');
    setFuncCargo(f.cargo);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startEditAcesso = (f: any) => {
    setEditingId(f.id);
    setAcessoNome(f.nome || '');
    setAcessoEmail(f.email);
    setAcessoSenha(f.senha);
    setAcessoNivel(f.nivel);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startEditEmpresa = (f: any) => {
    setEditingId(f.id);
    setEmpresaNome(f.nome);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteItem = async (type: 'frotas' | 'funcionarios' | 'acessos' | 'empresas', id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir?')) return;

    try {
      const { error } = await supabase.from(type).delete().eq('id', id);
      if (error) throw error;

      if (type === 'frotas') {
        setFrotas(frotas.filter(f => f.id !== id));
      } else if (type === 'funcionarios') {
        setFuncionarios(funcionarios.filter(f => f.id !== id));
      } else if (type === 'acessos') {
        setAcessos(acessos.filter(f => f.id !== id));
      } else if (type === 'empresas') {
        setEmpresas(empresas.filter(f => f.id !== id));
      }

      if (editingId === id) setEditingId(null);
    } catch (e: any) {
      alert("Erro ao excluir: " + e.message);
    }
  };

  return (
    <div className="max-w-[850px] mx-auto pb-24">
      <header className="mb-8 pt-2">
        <h1 className="text-[28px] font-extrabold tracking-tight text-slate-800">Gestão de Cadastros</h1>
        <p className="text-slate-500 mt-2 font-medium">Cadastre frotas, funcionários e acessos ao sistema.</p>
        {loadingDados && <p className="text-blue-500 font-bold mt-2 animate-pulse">Carregando dados...</p>}
      </header>

      {/* Tabs para os formulários */}
      <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
        <button
          onClick={() => { setActiveForm('frotas'); clearForm(); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${activeForm === 'frotas'
            ? 'bg-blue-600 text-white shadow-md'
            : 'text-slate-500 hover:bg-slate-50'
            }`}
        >
          <Truck className="w-[18px] h-[18px]" />
          Frotas
        </button>
        <button
          onClick={() => { setActiveForm('empresas'); clearForm(); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${activeForm === 'empresas'
            ? 'bg-blue-600 text-white shadow-md'
            : 'text-slate-500 hover:bg-slate-50'
            }`}
        >
          <Building2 className="w-[18px] h-[18px]" />
          Empresas
        </button>
        <button
          onClick={() => { setActiveForm('funcionarios'); clearForm(); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${activeForm === 'funcionarios'
            ? 'bg-blue-600 text-white shadow-md'
            : 'text-slate-500 hover:bg-slate-50'
            }`}
        >
          <Users className="w-[18px] h-[18px]" />
          Funcionários
        </button>
        <button
          onClick={() => { setActiveForm('logins'); clearForm(); }}
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
      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgb(0,0,0,0.03)] border border-slate-200 p-6 sm:p-8 mb-8">

        {/* Formulário de Frotas */}
        {activeForm === 'frotas' && (
          <form className="space-y-6" onSubmit={handleSaveFrota}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                <Truck className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-extrabold text-slate-800 tracking-wide uppercase">
                {editingId ? 'Editar Veículo / Equipamento' : 'Cadastro de Veículo / Equipamento'}
              </h2>
            </div>

            {editingId && (
              <div className="mb-6 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-2 text-blue-700 text-xs font-bold uppercase tracking-wider">
                <Pencil className="w-3.5 h-3.5" />
                Modo de Edição Ativo
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-7">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-extrabold text-[#7b8193] uppercase tracking-wide mb-2.5">
                  Placa / Identificação <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={frotaPlaca} onChange={e => setFrotaPlaca(e.target.value)}
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
                  value={frotaModelo} onChange={e => setFrotaModelo(e.target.value)}
                  placeholder="Ex: Volvo FH 460"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/30 text-slate-800 text-[15px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium placeholder:text-slate-400 hover:border-slate-300 transition-colors shadow-sm"
                />
              </div>
              <div className="col-span-1 md:col-span-1">
                <label className="flex items-center gap-1.5 text-xs font-extrabold text-[#7b8193] uppercase tracking-wide mb-2.5">
                  Tipo de Equipamento <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select value={frotaTipo} onChange={e => setFrotaTipo(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-slate-800 text-[15px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium appearance-none hover:border-slate-300 transition-colors shadow-sm">
                    <option value="">Selecione...</option>
                    <option value="caminhao">Caminhão Baú</option>
                    <option value="caminhao_sky">Caminhão Sky</option>
                    <option value="caminhao_munck">Caminhão Munck</option>
                    <option value="carreta">Carreta</option>
                    <option value="empilhadeira">Empilhadeira</option>
                    <option value="van">Van / Utilitário</option>
                    <option value="carro_leve">Veículo Leve / Passeio</option>
                    <option value="patu">PATU / Triturador</option>
                    <option value="gerador">Gerador</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="col-span-1 md:col-span-1">
                <label className="flex items-center gap-1.5 text-xs font-extrabold text-[#7b8193] uppercase tracking-wide mb-2.5">
                  Empresa <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select value={frotaEmpresa} onChange={e => setFrotaEmpresa(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-slate-800 text-[15px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium appearance-none hover:border-slate-300 transition-colors shadow-sm">
                    <option value="">Selecione a empresa...</option>
                    {empresas.map(emp => (
                      <option key={emp.id} value={emp.nome}>{emp.nome}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="flex items-center gap-1.5 text-xs font-extrabold text-[#7b8193] uppercase tracking-wide mb-2.5">
                  KM Atual
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={frotaKM} onChange={e => setFrotaKM(e.target.value)}
                    placeholder="Ex: 150000"
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/30 text-slate-800 text-[15px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium placeholder:text-slate-400 hover:border-slate-300 transition-colors shadow-sm"
                  />
                </div>
              </div>
            </div>


            <div className="pt-6 flex justify-end gap-3">
              {editingId && (
                <button
                  type="button"
                  onClick={clearForm}
                  className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-6 py-3.5 rounded-xl transition-all text-[14px] uppercase tracking-wide"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-6 py-3.5 rounded-xl shadow-md active:scale-[0.98] transition-all text-[14px] uppercase tracking-wide w-full sm:w-auto"
              >
                <Save className="w-[18px] h-[18px]" />
                {editingId ? 'Salvar Alterações' : 'Salvar Veículo'}
              </button>
            </div>
          </form>
        )
        }

        {/* Formulário de Empresas */}
        {
          activeForm === 'empresas' && (
            <form className="space-y-6" onSubmit={handleSaveEmpresa}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-extrabold text-slate-800 tracking-wide uppercase">
                  {editingId ? 'Editar Empresa' : 'Cadastro de Empresa'}
                </h2>
              </div>

              {editingId && (
                <div className="mb-6 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-2 text-blue-700 text-xs font-bold uppercase tracking-wider">
                  <Pencil className="w-3.5 h-3.5" />
                  Modo de Edição Ativo
                </div>
              )}

              <div className="grid grid-cols-1 gap-x-6 gap-y-7">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-extrabold text-[#7b8193] uppercase tracking-wide mb-2.5">
                    Nome da Empresa <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={empresaNome} onChange={e => setEmpresaNome(e.target.value)}
                    placeholder="Ex: Frota Transportes"
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/30 text-slate-800 text-[15px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium placeholder:text-slate-400 hover:border-slate-300 transition-colors shadow-sm"
                  />
                </div>
              </div>

              <div className="pt-6 flex justify-end gap-3">
                {editingId && (
                  <button
                    type="button"
                    onClick={clearForm}
                    className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-6 py-3.5 rounded-xl transition-all text-[14px] uppercase tracking-wide"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-6 py-3.5 rounded-xl shadow-md active:scale-[0.98] transition-all text-[14px] uppercase tracking-wide w-full sm:w-auto"
                >
                  <Save className="w-[18px] h-[18px]" />
                  {editingId ? 'Salvar Alterações' : 'Salvar Empresa'}
                </button>
              </div>
            </form>
          )
        }

        {/* Formulário de Funcionários */}
        {
          activeForm === 'funcionarios' && (
            <form className="space-y-6" onSubmit={handleSaveFuncionario}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-lg font-extrabold text-slate-800 tracking-wide uppercase">
                  {editingId ? 'Editar Funcionário' : 'Cadastro de Funcionário'}
                </h2>
              </div>

              {editingId && (
                <div className="mb-6 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-2 text-blue-700 text-xs font-bold uppercase tracking-wider">
                  <Pencil className="w-3.5 h-3.5" />
                  Modo de Edição Ativo
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-7">
                <div className="col-span-1 md:col-span-2">
                  <label className="flex items-center gap-1.5 text-xs font-extrabold text-[#7b8193] uppercase tracking-wide mb-2.5">
                    Nome Completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={funcNome} onChange={e => setFuncNome(e.target.value)}
                    placeholder="Ex: João da Silva"
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/30 text-slate-800 text-[15px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium placeholder:text-slate-400 hover:border-slate-300 transition-colors shadow-sm"
                  />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="flex items-center gap-1.5 text-xs font-extrabold text-[#7b8193] uppercase tracking-wide mb-2.5">
                    E-mail do Funcionário
                  </label>
                  <input
                    type="email"
                    value={funcEmail} onChange={e => setFuncEmail(e.target.value)}
                    placeholder="Ex: joao@empresa.com"
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/30 text-slate-800 text-[15px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium placeholder:text-slate-400 hover:border-slate-300 transition-colors shadow-sm"
                  />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="flex items-center gap-1.5 text-xs font-extrabold text-[#7b8193] uppercase tracking-wide mb-2.5">
                    Cargo / Função <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select value={funcCargo} onChange={e => setFuncCargo(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-slate-800 text-[15px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium appearance-none hover:border-slate-300 transition-colors shadow-sm">
                      <option value="">Selecione...</option>
                      <option value="motorista">Motorista</option>
                      <option value="mecanico">Mecânico</option>
                      <option value="eletricista">Eletricista</option>
                      <option value="encarregado">Encarregado</option>
                      <option value="assistente_administrativo">Assistente Administrativo</option>
                      <option value="analista_pcm">Analista de PCM</option>
                      <option value="auxiliar_manutencao">Auxiliar de Manutenção</option>
                      <option value="coordenador_operacional">Coordenador Operacional</option>
                      <option value="gerente">Gerente</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 flex justify-end gap-3">
                {editingId && (
                  <button
                    type="button"
                    onClick={clearForm}
                    className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-6 py-3.5 rounded-xl transition-all text-[14px] uppercase tracking-wide"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-extrabold px-6 py-3.5 rounded-xl shadow-md active:scale-[0.98] transition-all text-[14px] uppercase tracking-wide w-full sm:w-auto"
                >
                  <Save className="w-[18px] h-[18px]" />
                  {editingId ? 'Salvar Alterações' : 'Salvar Funcionário'}
                </button>
              </div>
            </form>
          )
        }

        {/* Formulário de Acessos */}
        {
          activeForm === 'logins' && (
            <form className="space-y-6" onSubmit={handleSaveAcesso}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                  <Key className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-lg font-extrabold text-slate-800 tracking-wide uppercase">
                  {editingId ? 'Editar Acesso' : 'Cadastro de Acesso'}
                </h2>
              </div>

              {editingId && (
                <div className="mb-6 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-2 text-blue-700 text-xs font-bold uppercase tracking-wider">
                  <Pencil className="w-3.5 h-3.5" />
                  Modo de Edição Ativo
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-7">
                <div className="col-span-1 md:col-span-2">
                  <label className="flex items-center gap-1.5 text-xs font-extrabold text-[#7b8193] uppercase tracking-wide mb-2.5">
                    Nome do Usuário <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={acessoNome} onChange={e => setAcessoNome(e.target.value)}
                    placeholder="Ex: Administrativo"
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/30 text-slate-800 text-[15px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium placeholder:text-slate-400 hover:border-slate-300 transition-colors shadow-sm"
                  />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="flex items-center gap-1.5 text-xs font-extrabold text-[#7b8193] uppercase tracking-wide mb-2.5">
                    E-mail de Acesso <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={acessoEmail} onChange={e => setAcessoEmail(e.target.value)}
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
                    value={acessoSenha} onChange={e => setAcessoSenha(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/30 text-slate-800 text-[15px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium placeholder:text-slate-400 hover:border-slate-300 transition-colors shadow-sm"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-extrabold text-[#7b8193] uppercase tracking-wide mb-2.5">
                    Nível de Acesso <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select value={acessoNivel} onChange={e => setAcessoNivel(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-slate-800 text-[15px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium appearance-none hover:border-slate-300 transition-colors shadow-sm">
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

              <div className="pt-6 flex justify-end gap-3">
                {editingId && (
                  <button
                    type="button"
                    onClick={clearForm}
                    className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-6 py-3.5 rounded-xl transition-all text-[14px] uppercase tracking-wide"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold px-6 py-3.5 rounded-xl shadow-md active:scale-[0.98] transition-all text-[14px] uppercase tracking-wide w-full sm:w-auto"
                >
                  <Save className="w-[18px] h-[18px]" />
                  {editingId ? 'Salvar Alterações' : 'Salvar Acesso'}
                </button>
              </div>
            </form>
          )
        }
      </div >

      {/* Listagem de Cadastrados */}
      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgb(0,0,0,0.03)] border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50/50">
          <h2 className="text-lg font-extrabold text-slate-800 tracking-wide uppercase">Cadastros Realizados</h2>
        </div>

        {
          activeForm === 'frotas' && (
            <div className="divide-y divide-slate-100">
              {frotas.length === 0 && <div className="p-6 text-center text-slate-500 font-medium tracking-wide text-sm">Nenhum veículo cadastrado.</div>}
              {frotas.map(f => (
                <div key={f.id} className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="font-bold text-slate-800">{f.placa} <span className="text-slate-400 font-medium">({f.modelo})</span></div>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-600 rounded uppercase">{f.tipo}</span>
                      {f.empresa && <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded uppercase">{f.empresa}</span>}
                      {f.km && <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded uppercase flex items-center gap-1"><Gauge className="w-3 h-3" /> {f.km} KM</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => startEditFrota(f)} className="text-slate-400 hover:text-blue-500 p-2 transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteItem('frotas', f.id)} className="text-slate-400 hover:text-red-500 p-2 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        }

        {
          activeForm === 'empresas' && (
            <div className="divide-y divide-slate-100">
              {empresas.length === 0 && <div className="p-6 text-center text-slate-500 font-medium tracking-wide text-sm">Nenhuma empresa cadastrada.</div>}
              {empresas.map(f => (
                <div key={f.id} className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="font-bold text-slate-800 uppercase">{f.nome}</div>
                    <div className="text-[10px] text-slate-400 font-medium">Cadastrada em {new Date(f.created_at).toLocaleDateString()}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => startEditEmpresa(f)} className="text-slate-400 hover:text-blue-500 p-2 transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteItem('empresas', f.id)} className="text-slate-400 hover:text-red-500 p-2 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        }

        {
          activeForm === 'funcionarios' && (
            <div className="divide-y divide-slate-100">
              {funcionarios.length === 0 && <div className="p-6 text-center text-slate-500 font-medium tracking-wide text-sm">Nenhum funcionário cadastrado.</div>}
              {funcionarios.map(f => (
                <div key={f.id} className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="font-bold text-slate-800">{f.nome}</div>
                    <div className="text-xs font-bold text-green-500 uppercase mt-1">{f.cargo}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => startEditFuncionario(f)} className="text-slate-400 hover:text-blue-500 p-2 transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteItem('funcionarios', f.id)} className="text-slate-400 hover:text-red-500 p-2 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        }

        {
          activeForm === 'logins' && (
            <div className="divide-y divide-slate-100">
              {acessos.length === 0 && <div className="p-6 text-center text-slate-500 font-medium tracking-wide text-sm">Nenhum acesso cadastrado.</div>}
              {acessos.map(f => (
                <div key={f.id} className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="font-bold text-slate-800">{f.nome || f.email}</div>
                    <div className="text-xs font-medium text-slate-400">{f.email}</div>
                    <div className="text-[10px] font-bold text-purple-500 uppercase mt-1">{f.nivel}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => startEditAcesso(f)} className="text-slate-400 hover:text-blue-500 p-2 transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteItem('acessos', f.id)} className="text-slate-400 hover:text-red-500 p-2 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        }
      </div>
    </div>
  );
}

function DashboardView({ isPublic = false }: { isPublic?: boolean }) {
  const [preventivaStats, setPreventivaStats] = useState({ onTime: 0, attention: 0, critical: 0, truckAttention: 0, implementAttention: 0 });
  const [preventivasData, setPreventivasData] = useState<any[]>([]);
  const [activeCard, setActiveCard] = useState<string | null>(null);

  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterPlaca, setFilterPlaca] = useState('');
  const [filterEmpresa, setFilterEmpresa] = useState('');

  const [frotasList, setFrotasList] = useState<any[]>([]);
  const [empresasList, setEmpresasList] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadOptions() {
      const { data: frotas } = await supabase.from('frotas').select('placa, modelo, empresa');
      if (frotas) {
        setFrotasList(frotas);
        const empresasUnicas = Array.from(new Set(frotas.map((f: any) => f.empresa).filter(Boolean))) as string[];
        setEmpresasList(empresasUnicas);
      }
    }
    loadOptions();
  }, []);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      // Frotas
      let frotasQuery = supabase.from('frotas').select('*');
      if (filterPlaca) frotasQuery = frotasQuery.eq('placa', filterPlaca);
      if (filterEmpresa) frotasQuery = frotasQuery.eq('empresa', filterEmpresa);

      const { data: frotasData } = await frotasQuery;



      // Preventivas
      let prevQuery = supabase.from('preventivas').select('*');
      if (filterPlaca) prevQuery = prevQuery.eq('veiculo', filterPlaca);
      if (filterStartDate) prevQuery = prevQuery.gte('data', filterStartDate);
      if (filterEndDate) prevQuery = prevQuery.lte('data', filterEndDate);

      if (!filterPlaca && filterEmpresa && frotasData) {
        const placasDaEmpresa = frotasData.map((f: any) => f.placa);
        if (placasDaEmpresa.length > 0) {
          prevQuery = prevQuery.in('veiculo', placasDaEmpresa);
        } else {
          prevQuery = prevQuery.in('veiculo', ['NENHUMA_PLACA_VALIDA']);
        }
      }

      const { data: prevData } = await prevQuery;
      let onTime = 0, attention = 0, critical = 0;
      let truckAttention = 0, implementAttention = 0;

      if (prevData) {
        prevData.forEach((p: any) => {
          // Status Caminhão
          const acumulado = (parseInt(p.atual) || 0) - (parseInt(p.ultima) || 0);
          const diff = (parseInt(p.intervalo) || 500) - acumulado;
          if (diff < 20) {
            critical++;
            truckAttention++;
          } else if (diff <= 60) {
            attention++;
            truckAttention++;
          } else {
            onTime++;
          }

          // Status Implemento
          if (p.intervalo_implemento && parseInt(p.intervalo_implemento) > 0) {
            const acumuladoImp = (parseInt(p.atual_implemento) || 0) - (parseInt(p.ultima_implemento) || 0);
            const diffImp = (parseInt(p.intervalo_implemento) || 500) - acumuladoImp;
            if (diffImp < 20) {
              critical++;
              implementAttention++;
            } else if (diffImp <= 60) {
              attention++;
              implementAttention++;
            } else {
              onTime++;
            }
          }
        });
        setPreventivasData(prevData);
      }

      setPreventivaStats({ onTime, attention, critical, truckAttention, implementAttention });
      setLoading(false);
    }

    fetchData();
  }, [filterStartDate, filterEndDate, filterPlaca, filterEmpresa]);

  return (
    <div className="max-w-[1000px] mx-auto pb-24">
      <header className="mb-6 pt-2">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-[28px] font-extrabold tracking-tight text-slate-800">Dashboard</h1>
            <p className="text-slate-500 mt-2 font-medium">Visão geral do desempenho e status das frotas.</p>
          </div>
          <div className="flex items-center gap-3">
            {!isPublic && (
              <button
                onClick={() => {
                  const url = new URL(window.location.href);
                  url.searchParams.set('view', 'dashboard');
                  url.searchParams.set('share', 'true');
                  navigator.clipboard.writeText(url.toString());
                  alert('Link do Dashboard copiado para a área de transferência!');
                }}
                className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold px-4 py-2 rounded-xl transition-all shadow-sm mb-1"
              >
                <Share2 className="w-4 h-4" />
                Compartilhar
              </button>
            )}
            {loading && (
              <div className="text-blue-500 flex items-center gap-2 mb-2 text-sm font-bold">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Atualizando...
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-[0_2px_12px_rgb(0,0,0,0.03)] border border-slate-200 p-6 mb-8 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2">Data Inicial</label>
          <input
            type="date"
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm font-medium"
          />
        </div>
        <div className="flex-1 w-full">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2">Data Final</label>
          <input
            type="date"
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm font-medium"
          />
        </div>
        <div className="flex-1 w-full">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2">Empresa</label>
          <select
            value={filterEmpresa}
            onChange={(e) => { setFilterEmpresa(e.target.value); setFilterPlaca(''); }}
            className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm font-medium"
          >
            <option value="">Todas</option>
            {empresasList.map((emp) => (
              <option key={emp} value={emp}>{emp}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 w-full">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2">Placa</label>
          <select
            value={filterPlaca}
            onChange={(e) => setFilterPlaca(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm font-medium"
          >
            <option value="">Todas</option>
            {frotasList
              .filter(f => !filterEmpresa || f.empresa === filterEmpresa)
              .map((f) => (
                <option key={f.placa} value={f.placa}>{f.placa}</option>
              ))}
          </select>
        </div>
        <div className="w-full md:w-auto">
          <button
            onClick={() => { setFilterStartDate(''); setFilterEndDate(''); setFilterPlaca(''); setFilterEmpresa(''); }}
            className="h-11 px-6 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold uppercase text-xs rounded-xl transition-all w-full active:scale-95"
          >
            Limpar
          </button>
        </div>
      </div>



      <div className="bg-white rounded-xl shadow-[0_2px_12px_rgb(0,0,0,0.03)] border border-slate-200 p-6 sm:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-lg font-extrabold text-slate-800 tracking-wide uppercase flex items-center gap-2">
              Status das Preventivas
            </h2>
            <p className="text-sm font-medium text-slate-500 mt-1">Visão atual do cumprimento de manutenções</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
            <Wrench className="w-6 h-6 text-blue-600" />
          </div>
        </div>

        <div className="space-y-8">
          {/* KPI's */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
            <div
              onClick={() => setActiveCard(activeCard === 'onTime' ? null : 'onTime')}
              className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all ${activeCard === 'onTime' ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20' : 'bg-slate-50 border-slate-100 hover:border-emerald-300'}`}>
              <div className="w-3 h-3 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div>
              <div>
                <div className="text-3xl font-black text-slate-800">{preventivaStats.onTime}</div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">No Prazo</div>
              </div>
            </div>

            <div
              onClick={() => setActiveCard(activeCard === 'attention' ? null : 'attention')}
              className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all ${activeCard === 'attention' ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400/20' : 'bg-slate-50 border-slate-100 hover:border-amber-300'}`}>
              <div className="w-3 h-3 rounded-full bg-amber-400 mt-1.5 shrink-0"></div>
              <div>
                <div className="text-3xl font-black text-slate-800">{preventivaStats.attention}</div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">A Vencer</div>
              </div>
            </div>

            <div
              onClick={() => setActiveCard(activeCard === 'critical' ? null : 'critical')}
              className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all ${activeCard === 'critical' ? 'bg-red-50 border-red-500 ring-2 ring-red-500/20' : 'bg-slate-50 border-slate-100 hover:border-red-300'}`}>
              <div className="w-3 h-3 rounded-full bg-red-500 mt-1.5 shrink-0"></div>
              <div>
                <div className="text-3xl font-black text-slate-800">{preventivaStats.critical}</div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Atrasadas</div>
              </div>
            </div>

            <div
              onClick={() => setActiveCard(activeCard === 'truckAttention' ? null : 'truckAttention')}
              className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all ${activeCard === 'truckAttention' ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20' : 'bg-slate-50 border-slate-100 hover:border-blue-300'}`}>
              <div className="w-3 h-3 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>
              <div>
                <div className="text-3xl font-black text-slate-800">{preventivaStats.truckAttention}</div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Cam. Vencidos/Vencer</div>
              </div>
            </div>

            <div
              onClick={() => setActiveCard(activeCard === 'implementAttention' ? null : 'implementAttention')}
              className={`flex items-start gap-4 p-4 rounded-xl col-span-2 lg:col-span-1 cursor-pointer transition-all ${activeCard === 'implementAttention' ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20' : 'bg-slate-50 border-slate-100 hover:border-indigo-300'}`}>
              <div className="w-3 h-3 rounded-full bg-indigo-500 mt-1.5 shrink-0"></div>
              <div>
                <div className="text-3xl font-black text-slate-800">{preventivaStats.implementAttention}</div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Imp. Vencidos/Vencer</div>
              </div>
            </div>
          </div>

          {/* Details / Lista */}
          <div className="pt-6 border-t border-slate-100">
            {(() => {
              let title = "Atenção Necessária";
              let emptyMessage = "Nenhum veículo necessitando de atenção";
              let emptySubMessage = "Sua frota está em dia com as preventivas.";

              if (activeCard === 'onTime') {
                title = "Veículos No Prazo";
                emptyMessage = "Nenhum veículo no prazo";
                emptySubMessage = "";
              } else if (activeCard === 'attention') {
                title = "Veículos A Vencer";
                emptyMessage = "Nenhum veículo a vencer";
                emptySubMessage = "";
              } else if (activeCard === 'critical') {
                title = "Veículos Atrasadas";
                emptyMessage = "Nenhum veículo atrasado";
                emptySubMessage = "";
              } else if (activeCard === 'truckAttention') {
                title = "Caminhões Vencidos/A Vencer";
                emptyMessage = "Nenhum caminhão necessitando de atenção";
                emptySubMessage = "";
              } else if (activeCard === 'implementAttention') {
                title = "Implementos Vencidos/A Vencer";
                emptyMessage = "Nenhum implemento necessitando de atenção";
                emptySubMessage = "";
              }

              return (
                <>
                  <h3 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider">{title}</h3>
                  <div className="space-y-3">
                    {(() => {
                      const needed: any[] = [];
                      preventivasData.forEach((p: any) => {
                        const acumulado = (parseInt(p.atual) || 0) - (parseInt(p.ultima) || 0);
                        const restante = (parseInt(p.intervalo) || 500) - acumulado;

                        let addTruck = false;
                        if (!activeCard) addTruck = restante <= 60;
                        else if (activeCard === 'onTime') addTruck = restante > 60;
                        else if (activeCard === 'attention') addTruck = restante >= 20 && restante <= 60;
                        else if (activeCard === 'critical') addTruck = restante < 20;
                        else if (activeCard === 'truckAttention') addTruck = restante <= 60;

                        if (addTruck) {
                          needed.push({ ...p, restante, tipoLabel: 'CAMINHÃO' });
                        }

                        if (p.intervalo_implemento && parseInt(p.intervalo_implemento) > 0) {
                          const acumuladoImp = (parseInt(p.atual_implemento) || 0) - (parseInt(p.ultima_implemento) || 0);
                          const restanteImp = (parseInt(p.intervalo_implemento) || 500) - acumuladoImp;

                          let addImp = false;
                          if (!activeCard) addImp = restanteImp <= 60;
                          else if (activeCard === 'onTime') addImp = restanteImp > 60;
                          else if (activeCard === 'attention') addImp = restanteImp >= 20 && restanteImp <= 60;
                          else if (activeCard === 'critical') addImp = restanteImp < 20;
                          else if (activeCard === 'implementAttention') addImp = restanteImp <= 60;

                          if (addImp) {
                            needed.push({ ...p, restante: restanteImp, tipoLabel: 'IMPLEMENTO' });
                          }
                        }
                      });

                      if (needed.length === 0) {
                        return (
                          <div className="flex flex-col items-center justify-center p-8 rounded-xl bg-slate-50 border border-slate-100 border-dashed text-center">
                            <Truck className="w-8 h-8 text-slate-300 mb-3" />
                            <div className="font-extrabold text-slate-500">{emptyMessage}</div>
                            <div className="text-xs font-medium text-slate-400 mt-1">{emptySubMessage}</div>
                          </div>
                        );
                      }

                      return needed.map((item: any, idx: number) => {
                        const isCritical = item.restante < 20;
                        const isOk = item.restante > 60;
                        return (
                          <div key={`${item.id}-${idx}`} className="flex items-center justify-between p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-4">
                              <div className={`w-2 h-2 rounded-full ${isCritical ? 'bg-red-500 animate-pulse' : isOk ? 'bg-emerald-500' : 'bg-amber-400'}`}></div>
                              <div>
                                <div className="font-bold text-slate-800 text-sm leading-tight">
                                  {item.veiculo} <span className="text-[10px] font-bold text-slate-400">({item.tipoLabel})</span>
                                  <div className="text-[10px] font-bold text-slate-400 uppercase">
                                    {frotasList.find(f => f.placa === item.veiculo)?.modelo || ''}
                                  </div>
                                </div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{item.plano}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`font-black text-sm ${isCritical ? 'text-red-600' : isOk ? 'text-emerald-500' : 'text-amber-500'}`}>{item.restante}h</div>
                              <div className="text-[9px] font-bold text-slate-400 uppercase">Restante</div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Bar Chart Section */}
      <div className="bg-white rounded-xl shadow-[0_2px_12px_rgb(0,0,0,0.03)] border border-slate-200 p-6 sm:p-8 mt-8 overflow-hidden pl-2 pb-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-12 gap-4 pl-4 sm:pl-6 pt-2">
          <div>
            <h2 className="text-[22px] font-black text-slate-800 tracking-tight">Preventivas por Placa</h2>
            <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">Acompanhamento das manutenções programadas</p>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 tracking-widest uppercase">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> No Prazo</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div> Atenção</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500"></div> Crítico</div>
          </div>
        </div>

        <div className="relative h-[500px] w-full overflow-x-auto pb-24 hide-scrollbar">
          <div className="min-w-[800px] h-full relative pl-[60px] pr-4">

            {/* Y Axis Lines & Labels */}
            <div className="absolute left-0 top-0 bottom-32 w-full pointer-events-none flex flex-col justify-between text-[11px] font-bold text-slate-400">

              <div className="flex items-center w-full relative">
                <span className="w-10 text-right pr-2">50%</span>
                <div className="flex-1 border-t border-slate-100 border-dashed"></div>
              </div>

            </div>

            {/* Bars container Overhaul */}
            <div className="absolute left-[60px] right-4 top-16 bottom-32 flex items-end px-4 gap-16 overflow-visible">
              {preventivaStats.onTime + preventivaStats.attention + preventivaStats.critical > 0 ? (
                (() => {
                  try {
                    const filteredBars = preventivasData.filter((p: any) => {
                      if (!activeCard) return true;

                      const acumulado = (parseInt(p.atual) || 0) - (parseInt(p.ultima) || 0);
                      const restante = (parseInt(p.intervalo) || 500) - acumulado;
                      let keepTruck = false;
                      if (activeCard === 'onTime') keepTruck = restante > 60;
                      else if (activeCard === 'attention') keepTruck = restante >= 20 && restante <= 60;
                      else if (activeCard === 'critical') keepTruck = restante < 20;
                      else if (activeCard === 'truckAttention') keepTruck = restante <= 60;

                      let keepImp = false;
                      if (p.intervalo_implemento && parseInt(p.intervalo_implemento) > 0) {
                        const acumuladoImp = (parseInt(p.atual_implemento) || 0) - (parseInt(p.ultima_implemento) || 0);
                        const restanteImp = (parseInt(p.intervalo_implemento) || 500) - acumuladoImp;
                        if (activeCard === 'onTime') keepImp = restanteImp > 60;
                        else if (activeCard === 'attention') keepImp = restanteImp >= 20 && restanteImp <= 60;
                        else if (activeCard === 'critical') keepImp = restanteImp < 20;
                        else if (activeCard === 'implementAttention') keepImp = restanteImp <= 60;
                      }

                      return keepTruck || keepImp;
                    });

                    return filteredBars.map((p: any) => {
                      // Status Caminhão
                      const acumulado = (parseInt(p.atual) || 0) - (parseInt(p.ultima) || 0);
                      const restante = (parseInt(p.intervalo) || 500) - acumulado;
                      const percentRemaining = Math.max(2, Math.min(100, Math.round((restante / (parseInt(p.intervalo) || 500)) * 100)));
                      const colorHex = restante < 20 ? '#ef4444' : restante <= 60 ? '#f59e0b' : '#3b82f6';
                      const colorShadow = restante < 20 ? 'rgba(239, 68, 68, 0.3)' : restante <= 60 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(59, 130, 246, 0.3)';

                      // Status Implemento
                      const hasImplemento = p.intervalo_implemento && parseInt(p.intervalo_implemento) > 0;
                      const acumuladoImp = (parseInt(p.atual_implemento) || 0) - (parseInt(p.ultima_implemento) || 0);
                      const restanteImp = (parseInt(p.intervalo_implemento) || 500) - acumuladoImp;
                      const percentRemainingImp = Math.max(2, Math.min(100, Math.round((restanteImp / (parseInt(p.intervalo_implemento) || 500)) * 100)));
                      const colorHexImp = restanteImp < 20 ? '#ef4444' : restanteImp <= 60 ? '#f59e0b' : '#3b82f6';
                      const colorShadowImp = restanteImp < 20 ? 'rgba(239, 68, 68, 0.3)' : restanteImp <= 60 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(59, 130, 246, 0.3)';

                      return (
                        <div key={p.id} className="flex flex-col items-center relative group h-full shrink-0 px-2">

                          <div className="flex gap-2.5 h-full relative" style={{ width: hasImplemento ? '112px' : '50px' }}>
                            {/* BARRA CAMINHÃO */}
                            <div className="flex flex-col items-center w-full h-full relative group/bar">
                              <div className="absolute -top-14 flex flex-col items-center gap-1">
                                {hasImplemento && <span className="text-[9px] font-black text-slate-400">CAM.</span>}
                                <span className="text-[12px] font-black px-3 py-1 rounded-full text-white bg-slate-900 shadow-sm z-20">
                                  {restante}h
                                </span>
                              </div>

                              <div className="flex-1 w-12 bg-slate-100/80 rounded-t-2xl flex flex-col justify-end overflow-hidden border border-slate-200/50 shadow-inner z-10">
                                <div
                                  style={{
                                    height: `${percentRemaining}%`,
                                    backgroundColor: colorHex,
                                    boxShadow: `0 0 20px ${colorShadow}`
                                  }}
                                  className="w-full transition-all duration-1000 ease-out cursor-pointer relative hover:brightness-110 flex flex-col items-center justify-start pt-6"
                                >
                                  <div className="w-px h-1/2 bg-white/20 absolute left-1/2 -translate-x-1/2 top-0"></div>
                                  {percentRemaining > 35 && (
                                    <div className="text-white/60 text-[11px] font-black uppercase tracking-widest rotate-90 origin-center whitespace-nowrap">
                                      {hasImplemento ? "CAM." : p.plano}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Tooltip Caminhão */}
                              <div className="opacity-0 group-hover/bar:opacity-100 absolute -top-24 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl text-[10px] font-bold whitespace-nowrap z-50 shadow-2xl pointer-events-none transition-all border border-white/10 scale-90 group-hover/bar:scale-100">
                                <div className="text-blue-400 mb-1 uppercase tracking-widest text-[8px] font-black">
                                  {p.veiculo} - {frotasList.find(f => f.placa === p.veiculo)?.modelo || 'CAMINHÃO'}
                                </div>
                                <div className="flex items-center gap-2">
                                  {p.plano}: <span className="text-white font-black text-xs">{restante}h</span>
                                </div>
                                <div className="text-slate-500 font-medium mt-0.5">Acumulado: {acumulado}h</div>
                                <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900/95 rotate-45 border-r border-b border-white/10"></div>
                              </div>
                            </div>

                            {/* BARRA IMPLEMENTO (OPCIONAL) */}
                            {hasImplemento && (
                              <div className="flex flex-col items-center w-full h-full relative group/barimp">
                                <div className="absolute -top-14 flex flex-col items-center gap-1">
                                  <span className="text-[9px] font-black text-slate-400">IMP.</span>
                                  <span className="text-[12px] font-black px-3 py-1 rounded-full text-white bg-slate-700 shadow-sm z-20">
                                    {restanteImp}h
                                  </span>
                                </div>

                                <div className="flex-1 w-12 bg-slate-100/80 rounded-t-2xl flex flex-col justify-end overflow-hidden border border-slate-200/50 shadow-inner z-10">
                                  <div
                                    style={{
                                      height: `${percentRemainingImp}%`,
                                      backgroundColor: colorHexImp,
                                      boxShadow: `0 0 20px ${colorShadowImp}`
                                    }}
                                    className="w-full transition-all duration-1000 ease-out cursor-pointer relative hover:brightness-110 flex flex-col items-center justify-start pt-6 opacity-90"
                                  >
                                    <div className="w-px h-1/2 bg-white/20 absolute left-1/2 -translate-x-1/2 top-0"></div>
                                    {percentRemainingImp > 35 && (
                                      <div className="text-white/60 text-[11px] font-black uppercase tracking-widest rotate-90 origin-center whitespace-nowrap">
                                        IMP.
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Tooltip Implemento */}
                                <div className="opacity-0 group-hover/barimp:opacity-100 absolute -top-24 left-1/2 -translate-x-1/2 bg-slate-800/95 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl text-[10px] font-bold whitespace-nowrap z-50 shadow-2xl pointer-events-none transition-all border border-white/10 scale-90 group-hover/barimp:scale-100">
                                  <div className="text-emerald-400 mb-1 uppercase tracking-widest text-[8px] font-black">{p.veiculo} - IMPLEM.</div>
                                  <div className="flex items-center gap-2">
                                    Status: <span className="text-white font-black text-xs">{restanteImp}h</span>
                                  </div>
                                  <div className="text-slate-400 font-medium mt-0.5">Acumulado: {acumuladoImp}h</div>
                                  <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-800/95 rotate-45 border-r border-b border-white/10"></div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Diagonal Label Placa */}
                          <div className="absolute bottom-[-30px] left-1/2 transform -translate-x-1/2 w-[140px] flex justify-center mt-4 z-40">
                            <div className="flex flex-col items-center -rotate-45 origin-center mt-6">
                              <span className="text-[12px] font-black text-slate-800 tracking-tighter bg-white shadow-md border border-slate-200 px-3 py-1.5 rounded-lg whitespace-nowrap">
                                {p.veiculo}
                              </span>
                            </div>
                          </div>

                        </div>
                      );
                    });
                  } catch (err) {
                    console.error("Erro ao renderizar gráfico:", err);
                    return null;
                  }
                })()
              ) : (
                <div className="w-full flex flex-col items-center justify-center">
                  <BarChart3 className="w-10 h-10 text-slate-200 mb-3" />
                  <span className="text-sm font-bold text-slate-400">Sem dados de manutenção para exibir</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hide scrollbar classes via style block inside component */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          height: 6px;
        }
        .hide-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        .hide-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .hide-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}

function LoginView({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(false);
  const [showForceChange, setShowForceChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const savedEmail = localStorage.getItem('tellus_email');
    const savedPassword = localStorage.getItem('tellus_password');
    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    setLoading(true);

    if (normalizedEmail === 'ricardo.luz@eunaman.com.br' && password === '15975321') {
      finalizeLogin({ nome: 'Ricardo Luz', email: normalizedEmail });
      setLoading(false);
      return;
    }

    let userRecord = null;
    try {
      const { data, error } = await supabase
        .from('acessos')
        .select('*')
        .ilike('email', normalizedEmail)
        .eq('senha', password);

      if (error) {
        console.error("Supabase login error:", error);
      }

      if (data && data.length > 0) {
        userRecord = data[0];
      }
    } catch (e) {
      console.error("Supabase exception:", e);
    }

    setLoading(false);

    if (userRecord) {
      if (password === 'cadastrar') {
        setShowForceChange(true);
      } else {
        finalizeLogin(userRecord);
      }
    } else {
      setError(true);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('As senhas não coincidem!');
      return;
    }
    if (newPassword.length < 4) {
      alert('A senha deve ter pelo menos 4 caracteres!');
      return;
    }

    setLoading(true);
    const normalizedEmail = email.trim().toLowerCase();

    let userRecord = null;
    try {
      const { data, error } = await supabase
        .from('acessos')
        .update({ senha: newPassword })
        .ilike('email', normalizedEmail)
        .select();

      if (!error && data && data.length > 0) {
        userRecord = data[0];
      }
    } catch (e) {
      console.error("Update password error", e);
    }

    setLoading(false);
    setPassword(newPassword);
    if (userRecord) finalizeLogin(userRecord);
    else onLogin();
  };

  const finalizeLogin = (user: any) => {
    setError(false);
    if (rememberMe) {
      localStorage.setItem('tellus_email', email);
      localStorage.setItem('tellus_password', password);
    } else {
      localStorage.removeItem('tellus_email');
      localStorage.removeItem('tellus_password');
    }
    localStorage.setItem('tellus_user_name', user.nome || user.email);
    onLogin();
  };

  if (showForceChange) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
        <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-xl w-full max-w-md border border-slate-200">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6">
              <Key className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-[#0f172a] text-center">Defina sua nova senha</h1>
            <p className="text-slate-500 mt-2 text-center text-sm font-medium">Por segurança, você precisa alterar sua senha inicial.</p>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nova Senha</label>
              <input
                type="password"
                required
                autoFocus
                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Confirmar Nova Senha</label>
              <input
                type="password"
                required
                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 uppercase tracking-wide text-sm mt-4"
            >
              {loading ? 'Salvando...' : 'Salvar e Acessar'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-xl w-full max-w-md border border-slate-200">
        <div className="flex flex-col items-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Truck className="w-8 h-8 text-blue-600" />
            <h1 className="text-[32px] font-black tracking-wide text-[#0f172a]">CHECKLIST<span className="text-blue-600">.</span></h1>
          </div>
          <h2 className="text-base font-bold text-slate-600 text-center">Acesso ao Sistema</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">E-mail</label>
            <input
              type="email"
              className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              placeholder="admin@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Senha</label>
            <input
              type="password"
              className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 cursor-pointer"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm font-medium text-slate-600 cursor-pointer">
              Lembrar minhas informações
            </label>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm font-bold rounded-lg border border-red-100 flex items-center justify-center gap-2">
              <XCircle className="w-4 h-4" />
              E-mail ou senha incorretos.
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 uppercase tracking-wide text-sm mt-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Carregando...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Entrar
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

function PreventivaView() {
  const currentDate = new Date().toISOString().split('T')[0];

  const [veiculo, setVeiculo] = useState('');
  const [plano, setPlano] = useState('');

  // Caminhão
  const [ultima, setUltima] = useState('');
  const [atual, setAtual] = useState('');
  const [intervalo, setIntervalo] = useState('500');

  // Implemento
  const [ultimaImplemento, setUltimaImplemento] = useState('');
  const [atualImplemento, setAtualImplemento] = useState('');
  const [intervaloImplemento, setIntervaloImplemento] = useState('500');

  // KM
  const [ultimaKM, setUltimaKM] = useState('');
  const [atualKM, setAtualKM] = useState('');
  const [intervaloKM, setIntervaloKM] = useState('10000');

  const [dataInicio, setDataInicio] = useState(currentDate);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [preventivas, setPreventivas] = useState<any[]>([]);
  const [frotasDisponiveis, setFrotasDisponiveis] = useState<any[]>([]);

  useEffect(() => {
    async function loadFrotasAndPreventivas() {
      const { data: df } = await supabase.from('frotas').select('*').order('placa', { ascending: true });
      if (df) setFrotasDisponiveis(df);

      const { data: dp } = await supabase.from('preventivas').select('*').order('created_at', { ascending: false });
      if (dp) setPreventivas(dp);
    }
    loadFrotasAndPreventivas();
  }, []);

  const clearForm = () => {
    setVeiculo('');
    setPlano('');
    setUltima('');
    setAtual('');
    setIntervalo('500');
    setUltimaImplemento('');
    setAtualImplemento('');
    setIntervaloImplemento('500');
    setUltimaKM('');
    setAtualKM('');
    setIntervaloKM('10000');
    setDataInicio(currentDate);
    setEditingId(null);
  };

  const handleSavePreventiva = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!veiculo || !plano || !atual || !intervalo) {
      alert('Preencha os campos obrigatórios! (Caminhão/Veículo é obrigatório)');
      return;
    }

    try {
      const pData = {
        veiculo,
        plano,
        ultima: ultima || '0',
        atual: atual || '0',
        intervalo: intervalo || '0',
        ultima_implemento: ultimaImplemento || '0',
        atual_implemento: atualImplemento || '0',
        intervalo_implemento: intervaloImplemento || '0',
        ultima_km: ultimaKM || '0',
        km: atualKM || '0',
        intervalo_km: intervaloKM || '0',
        data: dataInicio
      };

      if (editingId) {
        // Update mode
        const { data, error } = await supabase.from('preventivas').update(pData).eq('id', editingId).select();
        if (error) throw error;
        if (data) setPreventivas(preventivas.map(p => p.id === editingId ? data[0] : p));
        alert('Plano atualizado com sucesso!');
      } else {
        // Create mode
        const { data, error } = await supabase.from('preventivas').insert([pData]).select();
        if (error) throw error;
        if (data) setPreventivas([data[0], ...preventivas]);
        alert('Plano de preventiva ativado com sucesso!');
      }

      clearForm();
    } catch (e: any) {
      alert('Erro ao salvar no banco de dados. ' + e.message);
    }
  };

  const startEdit = (p: any) => {
    console.log("Iniciando edição de preventiva:", p);
    setEditingId(p.id);
    setVeiculo(p.veiculo);
    setPlano(p.plano);
    setUltima(p.ultima);
    setAtual(p.atual);
    setIntervalo(p.intervalo);
    setUltimaImplemento(p.ultima_implemento || '');
    setAtualImplemento(p.atual_implemento || '');
    setIntervaloImplemento(p.intervalo_implemento || '');
    setUltimaKM(p.ultima_km || '');
    setAtualKM(p.km || '');
    setIntervaloKM(p.intervalo_km || '');
    setDataInicio(p.data || currentDate);
    window.scrollTo({ top: 0, behavior: 'auto' });
    window.scrollTo(0, 0);
  };

  const deletePreventiva = async (id: number) => {
    if (!window.confirm('Excluir este plano de preventiva?')) return;
    try {
      const { error } = await supabase.from('preventivas').delete().eq('id', id);
      if (error) throw error;
      setPreventivas(preventivas.filter(p => p.id !== id));
    } catch (e: any) {
      alert('Erro ao deletar: ' + e.message);
    }
  };

  return (
    <div className="max-w-[850px] mx-auto pb-24">
      <header className="mb-6 pt-2">
        <h1 className="text-[28px] font-extrabold tracking-tight text-slate-800">Controle de Preventiva</h1>
        <p className="text-slate-500 mt-2 font-medium">Programe e acompanhe as manutenções preventivas dos equipamentos.</p>
      </header>

      <form className="bg-white rounded-2xl shadow-[0_2px_12px_rgb(0,0,0,0.03)] border border-slate-200 p-6 sm:p-8 mb-8" onSubmit={handleSavePreventiva}>
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
            <Pencil className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-lg font-extrabold text-slate-800 tracking-wide uppercase">
            {editingId ? 'Editar Plano de Preventiva' : 'Nova Programação de Manutenção'}
          </h2>
        </div>

        {editingId && (
          <div className="mb-8 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
                <Pencil className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-blue-900 text-[14px] font-black uppercase tracking-tight">Modo de Edição Ativo</div>
                <div className="text-blue-600/70 text-[11px] font-bold uppercase tracking-wider">Alterando plano selecionado</div>
              </div>
            </div>
            <button
              type="button"
              onClick={clearForm}
              className="px-4 py-2 bg-white border border-blue-200 text-blue-600 text-[11px] font-black uppercase rounded-xl hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm active:scale-95"
            >
              Cancelar Edição
            </button>
          </div>
        )}

        <div className="space-y-8">
          {/* Veículo */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-extrabold text-[#7b8193] uppercase tracking-wide mb-2.5">
              Veículo / Equipamento <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={veiculo}
                onChange={(e) => setVeiculo(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-[15px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-bold appearance-none hover:border-slate-300 transition-colors shadow-sm"
              >
                <option value="">Selecione o veículo...</option>
                {frotasDisponiveis.map((f: any) => (
                  <option key={f.placa} value={f.placa}>{f.placa} ({f.modelo})</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* Tipo de Plano */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-extrabold text-[#7b8193] uppercase tracking-wide mb-2.5">
                Tipo de Plano <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Wrench className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={plano}
                  onChange={(e) => setPlano(e.target.value)}
                  placeholder="Ex: Preventiva de Motor"
                  className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-[15px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-bold placeholder:text-slate-400 placeholder:font-medium hover:border-slate-300 transition-colors shadow-sm"
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100 my-2"></div>

          <div>
            <h3 className="text-[13px] font-black text-slate-800 uppercase tracking-widest mb-4">Dados do Caminhão/Cavalo</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Última Revisão */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-extrabold text-[#7b8193] uppercase tracking-wide mb-2.5">
                  Última Revisão (H)
                </label>
                <input
                  type="number"
                  value={ultima}
                  onChange={(e) => setUltima(e.target.value)}
                  placeholder="0"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-[16px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-bold hover:border-slate-300 transition-colors shadow-sm"
                />
                <p className="text-[11px] text-slate-400 mt-2 font-medium">Horímetro da última parada.</p>
              </div>

              {/* Atual */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-extrabold text-[#7b8193] uppercase tracking-wide mb-2.5">
                  Atual (H) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={atual}
                  onChange={(e) => setAtual(e.target.value)}
                  placeholder="0"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-[16px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-bold hover:border-slate-300 transition-colors shadow-sm"
                />
                <p className="text-[11px] text-slate-400 mt-2 font-medium">Horímetro lido hoje.</p>
              </div>

              {/* Intervalo */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-extrabold text-[#7b8193] uppercase tracking-wide mb-2.5">
                  Intervalo (H) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={intervalo}
                  onChange={(e) => setIntervalo(e.target.value)}
                  placeholder="500"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-[16px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-bold hover:border-slate-300 transition-colors shadow-sm"
                />
                <p className="text-[11px] text-slate-400 mt-2 font-medium">A cada quantas horas?</p>
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100 my-2"></div>

          <div>
            <h3 className="text-[13px] font-black text-slate-800 uppercase tracking-widest mb-4">Dados de Quilometragem (KM)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Última KM */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-extrabold text-[#7b8193] uppercase tracking-wide mb-2.5">
                  Última Revisão (KM)
                </label>
                <input
                  type="number"
                  value={ultimaKM}
                  onChange={(e) => setUltimaKM(e.target.value)}
                  placeholder="0"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-[16px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-bold hover:border-slate-300 transition-colors shadow-sm"
                />
              </div>

              {/* Atual KM */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-extrabold text-[#7b8193] uppercase tracking-wide mb-2.5">
                  Atual (KM)
                </label>
                <input
                  type="number"
                  value={atualKM}
                  onChange={(e) => setAtualKM(e.target.value)}
                  placeholder="0"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-[16px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-bold hover:border-slate-300 transition-colors shadow-sm"
                />
              </div>

              {/* Intervalo KM */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-extrabold text-[#7b8193] uppercase tracking-wide mb-2.5">
                  Intervalo (KM)
                </label>
                <input
                  type="number"
                  value={intervaloKM}
                  onChange={(e) => setIntervaloKM(e.target.value)}
                  placeholder="10000"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-[16px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-bold hover:border-slate-300 transition-colors shadow-sm"
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100 my-2"></div>

          <div>
            <h3 className="text-[13px] font-black text-slate-800 uppercase tracking-widest mb-4">Dados do Implemento</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Última Revisão Implemento */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-extrabold text-[#7b8193] uppercase tracking-wide mb-2.5">
                  Última Revisão (H)
                </label>
                <input
                  type="number"
                  value={ultimaImplemento}
                  onChange={(e) => setUltimaImplemento(e.target.value)}
                  placeholder="0"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-[16px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-bold hover:border-slate-300 transition-colors shadow-sm"
                />
                <p className="text-[11px] text-slate-400 mt-2 font-medium">Horímetro da última parada.</p>
              </div>

              {/* Atual Implemento */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-extrabold text-[#7b8193] uppercase tracking-wide mb-2.5">
                  Atual (H)
                </label>
                <input
                  type="number"
                  value={atualImplemento}
                  onChange={(e) => setAtualImplemento(e.target.value)}
                  placeholder="0"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-[16px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-bold hover:border-slate-300 transition-colors shadow-sm"
                />
                <p className="text-[11px] text-slate-400 mt-2 font-medium">Horímetro lido hoje.</p>
              </div>

              {/* Intervalo Implemento */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-extrabold text-[#7b8193] uppercase tracking-wide mb-2.5">
                  Intervalo (H)
                </label>
                <input
                  type="number"
                  value={intervaloImplemento}
                  onChange={(e) => setIntervaloImplemento(e.target.value)}
                  placeholder="500"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-[16px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-bold hover:border-slate-300 transition-colors shadow-sm"
                />
                <p className="text-[11px] text-slate-400 mt-2 font-medium">A cada quantas horas?</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Início da Contagem */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-extrabold text-[#7b8193] uppercase tracking-wide mb-2.5">
                Início da Contagem
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-[15px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-bold hover:border-slate-300 transition-colors shadow-sm"
                  style={{ colorScheme: 'light' }}
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100 mt-8 mb-4"></div>

          {/* Botões */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={clearForm}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl border-2 border-slate-200 text-slate-500 font-bold text-sm uppercase tracking-wide hover:bg-slate-50 hover:text-slate-700 transition-colors"
            >
              {editingId ? 'Cancelar Edição' : 'Limpar'}
            </button>
            <button
              type="submit"
              className={`w-full sm:w-auto px-8 py-3.5 rounded-xl border-2 text-white font-extrabold text-sm uppercase tracking-wide shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${editingId ? 'bg-blue-600 border-blue-600 hover:bg-blue-700' : 'bg-green-600 border-green-600 hover:bg-green-700'
                }`}
            >
              <Save className="w-[18px] h-[18px]" />
              {editingId ? 'Atualizar Plano' : 'Ativar Plano'}
            </button>
          </div>
        </div>
      </form>

      {/* Listagem de Planos */}
      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgb(0,0,0,0.03)] border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50/50">
          <h2 className="text-lg font-extrabold text-slate-800 tracking-wide uppercase">Planos de Preventiva Ativos</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {preventivas.length === 0 && (
            <div className="p-10 text-center text-slate-500 font-medium tracking-wide text-sm">Nenhum plano cadastrado.</div>
          )}
          {preventivas.map(p => {
            const restante = parseInt(p.intervalo) - (parseInt(p.atual) - parseInt(p.ultima));
            const colorClass = restante <= 0 ? 'text-red-600' : restante <= 50 ? 'text-amber-500' : 'text-emerald-600';
            const bgClass = restante <= 0 ? 'bg-red-50' : restante <= 50 ? 'bg-amber-50' : 'bg-emerald-50';

            return (
              <div key={p.id} className="p-5 sm:px-8 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <span className="font-extrabold text-slate-800">{p.veiculo}</span>
                      <span className="text-[11px] font-bold text-slate-400 -mt-1 uppercase">
                        {frotasDisponiveis.find(f => f.placa === p.veiculo)?.modelo || 'S/ modelo'}
                      </span>
                    </div>
                    <span className="text-[10px] font-black uppercase bg-slate-100 text-slate-500 px-2 py-0.5 rounded">{p.plano}</span>
                  </div>
                  <div className="flex gap-4 mt-2">
                    <div className="text-[11px] font-bold text-slate-400 uppercase">Acúmulo: <span className="text-slate-600">{parseInt(p.atual) - parseInt(p.ultima)}h</span></div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase">Intervalo: <span className="text-slate-600">{p.intervalo}h</span></div>
                    {p.km && (
                      <div className="text-[11px] font-bold text-slate-400 uppercase">Acúmulo KM: <span className="text-slate-600">{parseInt(p.km) - parseInt(p.ultima_km)} KM</span></div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className={`px-4 py-2 rounded-xl text-center min-w-[80px] sm:min-w-[100px] ${bgClass}`}>
                    <div className={`text-sm sm:text-base font-black ${colorClass}`}>{restante}h</div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Restante</div>
                  </div>
                  <div className="flex items-center border-l border-slate-100 ml-2 pl-2">
                    <button onClick={() => startEdit(p)} className="text-slate-400 hover:text-blue-600 p-2.5 transition-all hover:scale-110" title="Editar">
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button onClick={() => deletePreventiva(p.id)} className="text-slate-400 hover:text-red-600 p-2.5 transition-all hover:scale-110" title="Excluir">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function OSView() {
  const currentDate = new Date().toISOString().split('T')[0];
  const [tipoOS, setTipoOS] = useState('Corretiva');
  const [dataAbertura, setDataAbertura] = useState(currentDate);
  const [horaAbertura, setHoraAbertura] = useState(() => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
  const [dataFechamento, setDataFechamento] = useState('');
  const [horaFechamento, setHoraFechamento] = useState('');
  const [prioridade, setPrioridade] = useState('Média');
  const [mecanico, setMecanico] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [status, setStatus] = useState('Aberta');
  const [empresaOS, setEmpresaOS] = useState('');
  const [placa, setPlaca] = useState('');
  const [km, setKm] = useState('');
  const [horimetro, setHorimetro] = useState('');
  const [descricao, setDescricao] = useState('');

  // Fotos
  const [fotosProblema, setFotosProblema] = useState<string[]>([]);
  const [fotosResolvido, setFotosResolvido] = useState<string[]>([]);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [osList, setOsList] = useState<any[]>([]);
  const [frotasDisponiveis, setFrotasDisponiveis] = useState<any[]>([]);
  const [empresasList, setEmpresasList] = useState<string[]>([]);
  const [funcionariosList, setFuncionariosList] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const { data: df } = await supabase.from('frotas').select('*').order('placa', { ascending: true });
      if (df) {
        setFrotasDisponiveis(df);
        const empresasUnicas = Array.from(new Set(df.map((f: any) => f.empresa).filter(Boolean))) as string[];
        setEmpresasList(empresasUnicas);
      }

      const { data: dos } = await supabase.from('ordens_servico').select('*').order('created_at', { ascending: false });
      if (dos) setOsList(dos);

      const { data: dfun } = await supabase.from('funcionarios').select('id, nome, cargo').order('nome', { ascending: true });
      if (dfun) setFuncionariosList(dfun);
    }
    loadData();
  }, []);

  const clearForm = () => {
    setTipoOS('Corretiva');
    setDataAbertura(currentDate);
    setHoraAbertura(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    setDataFechamento('');
    setHoraFechamento('');
    setPrioridade('Média');
    setMecanico('');
    setObservacoes('');
    setStatus('Aberta');
    setEmpresaOS('');
    setPlaca('');
    setKm('');
    setHorimetro('');
    setDescricao('');
    setFotosProblema([]);
    setFotosResolvido([]);
    setEditingId(null);
  };

  const handleSaveOS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!placa || !descricao) {
      alert('Preencha os campos obrigatórios (Placa e Descrição do Problema)!');
      return;
    }

    try {
      const osData = {
        empresa: empresaOS || null,
        placa,
        km: km || null,
        horimetro: horimetro || null,
        tipo_os: tipoOS,
        status,
        data_abertura: dataAbertura,
        hora_abertura: horaAbertura,
        data_fechamento: dataFechamento || null,
        hora_fechamento: horaFechamento || null,
        prioridade,
        descricao,
        mecanico: mecanico || null,
        observacoes: observacoes || null,
        fotos_problema: fotosProblema.length > 0 ? JSON.stringify(fotosProblema) : null,
        fotos_resolvido: fotosResolvido.length > 0 ? JSON.stringify(fotosResolvido) : null,
      };

      if (editingId) {
        const { data, error } = await supabase.from('ordens_servico').update(osData).eq('id', editingId).select();
        if (error) throw error;
        // Parsing the JSON back logic for the UI if needed
        if (data) {
          const updated = data[0];
          if (typeof updated.fotos_problema === 'string') updated.fotos_problema = JSON.parse(updated.fotos_problema);
          if (typeof updated.fotos_resolvido === 'string') updated.fotos_resolvido = JSON.parse(updated.fotos_resolvido);
          setOsList(osList.map(o => o.id === editingId ? updated : o));
        }
        alert('OS atualizada com sucesso!');
      } else {
        const { data, error } = await supabase.from('ordens_servico').insert([osData]).select();
        if (error) throw error;
        if (data) {
          const created = data[0];
          if (typeof created.fotos_problema === 'string') created.fotos_problema = JSON.parse(created.fotos_problema);
          if (typeof created.fotos_resolvido === 'string') created.fotos_resolvido = JSON.parse(created.fotos_resolvido);
          setOsList([created, ...osList]);
        }
        alert('OS criada com sucesso!');
      }
      clearForm();
    } catch (e: any) {
      alert('Erro ao salvar no banco de dados. ' + e.message);
    }
  };

  const startEdit = (o: any) => {
    setEditingId(o.id);
    setEmpresaOS(o.empresa || '');
    setPlaca(o.placa || '');
    setKm(o.km || '');
    setHorimetro(o.horimetro || '');
    setTipoOS(o.tipo_os || 'Corretiva');
    setStatus(o.status || 'Aberta');
    setDataAbertura(o.data_abertura || currentDate);
    setHoraAbertura(o.hora_abertura || '');
    setDataFechamento(o.data_fechamento || '');
    setHoraFechamento(o.hora_fechamento || '');
    setPrioridade(o.prioridade || 'Média');
    setDescricao(o.descricao || '');
    setMecanico(o.mecanico || '');
    setObservacoes(o.observacoes || '');

    setFotosProblema(Array.isArray(o.fotos_problema) ? o.fotos_problema : typeof o.fotos_problema === 'string' ? JSON.parse(o.fotos_problema) : []);
    setFotosResolvido(Array.isArray(o.fotos_resolvido) ? o.fotos_resolvido : typeof o.fotos_resolvido === 'string' ? JSON.parse(o.fotos_resolvido) : []);

    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const handleAddProblemPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    Array.from(e.target.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFotosProblema(prev => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddResolvedPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    Array.from(e.target.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFotosResolvido(prev => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const deleteOS = async (id: number) => {
    if (!window.confirm('Excluir esta OS?')) return;
    try {
      const { error } = await supabase.from('ordens_servico').delete().eq('id', id);
      if (error) throw error;
      setOsList(osList.filter(o => o.id !== id));
    } catch (e: any) {
      alert('Erro ao deletar: ' + e.message);
    }
  };

  return (
    <div className="max-w-[850px] mx-auto pb-24">
      <header className="mb-6 pt-2">
        <h1 className="text-[28px] font-extrabold tracking-tight text-slate-800">Controle de OS</h1>
        <p className="text-slate-500 mt-2 font-medium">Gestão de Ordens de Serviço (Abertura, Acompanhamento e Fechamento).</p>
      </header>

      <form className="bg-white rounded-2xl shadow-[0_2px_12px_rgb(0,0,0,0.03)] border border-slate-200 p-6 sm:p-8 mb-8" onSubmit={handleSaveOS}>
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-lg font-extrabold text-slate-800 tracking-wide uppercase">
            {editingId ? `Editar OS #${editingId}` : 'Nova Ordem de Serviço'}
          </h2>
        </div>

        {editingId && (
          <div className="mb-8 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
                <Pencil className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-blue-900 text-[14px] font-black uppercase tracking-tight">Modo de Edição Ativo</div>
                <div className="text-blue-600/70 text-[11px] font-bold uppercase tracking-wider">Alterando OS selecionada</div>
              </div>
            </div>
            <button
              type="button"
              onClick={clearForm}
              className="px-4 py-2 bg-white border border-blue-200 text-blue-600 text-[11px] font-black uppercase rounded-xl hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm"
            >
              Cancelar Edição
            </button>
          </div>
        )}

        <div className="space-y-6">

          {/* Empresa and Placa */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-extrabold text-[#7b8193] uppercase tracking-wide mb-2.5">
                Empresa
              </label>
              <div className="relative">
                <select
                  value={empresaOS}
                  onChange={(e) => {
                    setEmpresaOS(e.target.value);
                    setPlaca('');
                    setKm('');
                    setHorimetro('');
                  }}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-slate-800 text-[15px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-bold appearance-none shadow-sm"
                >
                  <option value="">Todas as empresas</option>
                  {empresasList.map((emp) => (
                    <option key={emp} value={emp}>{emp}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-extrabold text-[#7b8193] uppercase tracking-wide mb-2.5">
                Placa <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={placa}
                  onChange={async (e) => {
                    const selPlaca = e.target.value;
                    setPlaca(selPlaca);
                    const frota = frotasDisponiveis.find(f => f.placa === selPlaca);
                    if (frota) {
                      if (!empresaOS && frota.empresa) {
                        setEmpresaOS(frota.empresa);
                      }
                      // Busca último KM e Horímetro registrado nas OS para essa placa
                      const { data: ultimaOS } = await supabase
                        .from('ordens_servico')
                        .select('km, horimetro')
                        .eq('placa', selPlaca)
                        .not('km', 'is', null)
                        .order('created_at', { ascending: false })
                        .limit(1);
                      if (ultimaOS && ultimaOS.length > 0) {
                        setKm(ultimaOS[0].km || '');
                        setHorimetro(ultimaOS[0].horimetro || '');
                      } else {
                        // Fallback: usa o km da tabela frotas se não houver OS anterior
                        setKm(frota.km || '');
                        setHorimetro('');
                      }
                    } else {
                      setKm('');
                      setHorimetro('');
                    }
                  }}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-slate-800 text-[15px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-bold appearance-none shadow-sm"
                >
                  <option value="">Selecione a placa</option>
                  {frotasDisponiveis
                    .filter(f => !empresaOS || f.empresa === empresaOS)
                    .map((f: any) => (
                      <option key={f.placa} value={f.placa}>{f.placa} ({f.modelo})</option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-extrabold text-[#7b8193] uppercase tracking-wide mb-2.5">
                KM Atual
              </label>
              <input
                type="number"
                value={km}
                onChange={(e) => setKm(e.target.value)}
                placeholder="Ex: 150000"
                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-slate-800 text-[15px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-bold shadow-sm"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-extrabold text-[#7b8193] uppercase tracking-wide mb-2.5">
                Horímetro Atual
              </label>
              <input
                type="number"
                value={horimetro}
                onChange={(e) => setHorimetro(e.target.value)}
                placeholder="Ex: 5000"
                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-slate-800 text-[15px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-bold shadow-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tipo da OS */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-extrabold text-[#7b8193] uppercase tracking-wide mb-2.5">
                Tipo da OS
              </label>
              <div className="relative">
                <select
                  value={tipoOS}
                  onChange={(e) => setTipoOS(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-slate-800 text-[15px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-bold appearance-none shadow-sm"
                >
                  <option value="Corretiva">Corretiva</option>
                  <option value="Preventiva">Preventiva</option>
                  <option value="Melhoria">Melhoria</option>
                  <option value="Preditiva">Preditiva</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-extrabold text-[#7b8193] uppercase tracking-wide mb-2.5">
                Status <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-slate-800 text-[15px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-bold appearance-none shadow-sm"
                >
                  <option value="Aberta">Aberta</option>
                  <option value="Em Andamento">Em Andamento</option>
                  <option value="Aguardando Peças">Aguardando Peças</option>
                  <option value="Fechada">Fechada</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Data e Hora Abertura */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="flex items-center gap-1.5 text-xs font-extrabold text-[#7b8193] uppercase tracking-wide mb-2.5">
                  Data Abertura <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="date"
                    required
                    value={dataAbertura}
                    onChange={(e) => setDataAbertura(e.target.value)}
                    className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-slate-800 text-[15px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-bold shadow-sm"
                    style={{ colorScheme: 'light' }}
                  />
                </div>
              </div>
              <div className="flex-1">
                <label className="flex items-center gap-1.5 text-xs font-extrabold text-[#7b8193] uppercase tracking-wide mb-2.5">
                  Hora Abertura
                </label>
                <div className="relative flex items-center">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="time"
                    value={horaAbertura}
                    onChange={(e) => setHoraAbertura(e.target.value)}
                    className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-slate-800 text-[15px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-bold shadow-sm"
                    style={{ colorScheme: 'light' }}
                  />
                </div>
              </div>
            </div>

            {/* Data e Hora Fechamento */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="flex items-center gap-1.5 text-xs font-extrabold text-[#7b8193] uppercase tracking-wide mb-2.5">
                  Data Fechamento
                </label>
                <div className="relative flex items-center">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="date"
                    value={dataFechamento}
                    onChange={(e) => setDataFechamento(e.target.value)}
                    className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-slate-800 text-[15px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-bold shadow-sm"
                    style={{ colorScheme: 'light' }}
                  />
                </div>
              </div>
              <div className="flex-1">
                <label className="flex items-center gap-1.5 text-xs font-extrabold text-[#7b8193] uppercase tracking-wide mb-2.5">
                  Hora Fechamento
                </label>
                <div className="relative flex items-center">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="time"
                    value={horaFechamento}
                    onChange={(e) => setHoraFechamento(e.target.value)}
                    className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-slate-800 text-[15px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-bold shadow-sm"
                    style={{ colorScheme: 'light' }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Prioridade */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-extrabold text-[#7b8193] uppercase tracking-wide mb-2.5">
                Prioridade
              </label>
              <div className="relative">
                <select
                  value={prioridade}
                  onChange={(e) => setPrioridade(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-slate-800 text-[15px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-bold appearance-none shadow-sm"
                >
                  <option value="Baixa">Baixa</option>
                  <option value="Média">Média</option>
                  <option value="Alta">Alta</option>
                  <option value="Urgente">Urgente</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Descrição do Problema */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-extrabold text-[#7b8193] uppercase tracking-wide mb-2.5">
              Descrição do Problema <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva o problema..."
              className="w-full p-4 rounded-xl border border-slate-200 bg-white text-slate-800 text-[15px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm resize-none"
            />
          </div>

          {/* Mecânico */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-extrabold text-[#7b8193] uppercase tracking-wide mb-2.5">
              Mecânico
            </label>
            <div className="relative">
              <select
                value={mecanico}
                onChange={(e) => setMecanico(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-slate-800 text-[15px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-bold appearance-none shadow-sm"
              >
                <option value="">Selecione o mecânico...</option>
                {funcionariosList
                  .filter(f => f.cargo === 'mecanico' || f.cargo === 'Mecânico')
                  .map((f: any) => (
                    <option key={f.id} value={f.nome}>{f.nome}</option>
                  ))}
                {/* Fallback pattern in case there are no specific mechanics or to allow others */}
                <optgroup label="Outros Funcionários">
                  {funcionariosList
                    .filter(f => f.cargo !== 'mecanico' && f.cargo !== 'Mecânico')
                    .map((f: any) => (
                      <option key={f.id} value={f.nome}>{f.nome} ({f.cargo})</option>
                    ))}
                </optgroup>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-extrabold text-[#7b8193] uppercase tracking-wide mb-2.5">
              Observações
            </label>
            <textarea
              rows={3}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Observações..."
              className="w-full p-4 rounded-xl border border-slate-200 bg-white text-slate-800 text-[15px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm resize-none"
            />
          </div>

          {/* Fotos do Problema */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-extrabold text-[#7b8193] uppercase tracking-wide mb-3">
              Fotos do Problema
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <label className="aspect-video rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 cursor-pointer flex flex-col items-center justify-center gap-2 transition-all">
                <Camera className="w-6 h-6 text-slate-400" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Câmera</span>
                <input type="file" accept="image/*" capture="environment" className="hidden" multiple onChange={handleAddProblemPhotos} />
              </label>
              <label className="aspect-video rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 cursor-pointer flex flex-col items-center justify-center gap-2 transition-all">
                <ImagePlus className="w-6 h-6 text-slate-400" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Galeria</span>
                <input type="file" accept="image/*" className="hidden" multiple onChange={handleAddProblemPhotos} />
              </label>
            </div>

            {fotosProblema.length > 0 && (
              <div className="flex gap-3 overflow-x-auto mt-4 pb-2">
                {fotosProblema.map((photo, i) => (
                  <div key={i} className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden group">
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setFotosProblema(prev => prev.filter((_, index) => index !== i))}
                      className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Fotos do Problema Resolvido */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-extrabold text-[#7b8193] uppercase tracking-wide mb-3">
              Fotos do Problema Resolvido
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <label className="aspect-video rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 cursor-pointer flex flex-col items-center justify-center gap-2 transition-all">
                <Camera className="w-6 h-6 text-slate-400" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Câmera</span>
                <input type="file" accept="image/*" capture="environment" className="hidden" multiple onChange={handleAddResolvedPhotos} />
              </label>
              <label className="aspect-video rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 cursor-pointer flex flex-col items-center justify-center gap-2 transition-all">
                <ImagePlus className="w-6 h-6 text-slate-400" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Galeria</span>
                <input type="file" accept="image/*" className="hidden" multiple onChange={handleAddResolvedPhotos} />
              </label>
            </div>

            {fotosResolvido.length > 0 && (
              <div className="flex gap-3 overflow-x-auto mt-4 pb-2">
                {fotosResolvido.map((photo, i) => (
                  <div key={i} className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden group">
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setFotosResolvido(prev => prev.filter((_, index) => index !== i))}
                      className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="h-px bg-slate-100 my-4"></div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={clearForm}
              className="px-6 py-3.5 rounded-xl border-2 border-slate-200 text-slate-500 font-bold text-sm uppercase tracking-wide hover:bg-slate-50 transition-colors"
            >
              {editingId ? 'Cancelar Edição' : 'Limpar'}
            </button>
            <button
              type="submit"
              className={`px-8 py-3.5 rounded-xl border-2 text-white font-extrabold text-sm uppercase tracking-wide shadow-md flex items-center gap-2 ${editingId ? 'bg-blue-600 border-blue-600 hover:bg-blue-700' : 'bg-green-600 border-green-600 hover:bg-green-700'}`}
            >
              <Save className="w-[18px] h-[18px]" />
              {editingId ? 'Atualizar OS' : 'Salvar OS'}
            </button>
          </div>
        </div>
      </form>

      {/* Listagem de OS */}
      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgb(0,0,0,0.03)] border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50/50">
          <h2 className="text-lg font-extrabold text-slate-800 tracking-wide uppercase">Ordens de Serviço (OS)</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {osList.length === 0 && (
            <div className="p-10 text-center text-slate-500 font-medium tracking-wide text-sm">Nenhuma OS cadastrada.</div>
          )}
          {osList.map(o => {
            let statusColor = 'text-slate-500 bg-slate-100 border-slate-200';
            if (o.status === 'Aberta') statusColor = 'text-blue-600 bg-blue-50 border-blue-200';
            if (o.status === 'Em Andamento') statusColor = 'text-amber-600 bg-amber-50 border-amber-200';
            if (o.status === 'Aguardando Peças') statusColor = 'text-orange-600 bg-orange-50 border-orange-200';
            if (o.status === 'Fechada') statusColor = 'text-emerald-600 bg-emerald-50 border-emerald-200';

            return (
              <div key={o.id} className="p-5 sm:px-8 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-slate-800 text-lg">OS#{o.id}</span>
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md border ${statusColor}`}>
                      {o.status}
                    </span>
                    {o.tipo_os && (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                        {o.tipo_os}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="text-[13px] font-bold text-slate-700 uppercase">{o.placa}</div>
                    {o.prioridade && (
                      <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
                        &bull; Prioridade <span className={o.prioridade === 'Alta' || o.prioridade === 'Urgente' ? 'text-red-500' : 'text-slate-500'}>{o.prioridade}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-[13px] text-slate-600 mt-2 line-clamp-2">{o.descricao}</div>

                  <div className="flex flex-wrap gap-4 mt-3">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      Abertura: <span className="text-slate-600">{new Date(o.data_abertura + 'T00:00:00').toLocaleDateString('pt-BR')} {o.hora_abertura}</span>
                    </div>
                    {o.data_fechamento && (
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                        <Calendar className="w-3.5 h-3.5" />
                        Fechamento: <span className="text-slate-600">{new Date(o.data_fechamento + 'T00:00:00').toLocaleDateString('pt-BR')} {o.hora_fechamento}</span>
                      </div>
                    )}
                    {o.mecanico && (
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                        <Wrench className="w-3.5 h-3.5" />
                        Mecânico: <span className="text-slate-600 uppercase">{o.mecanico}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center border-l border-slate-100 ml-4 pl-4">
                  <button onClick={() => startEdit(o)} className="text-slate-400 hover:text-blue-600 p-2.5 transition-all hover:scale-110" title="Editar">
                    <Pencil className="w-5 h-5" />
                  </button>
                  <button onClick={() => deleteOS(o.id)} className="text-slate-400 hover:text-red-600 p-2.5 transition-all hover:scale-110" title="Excluir">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

type Tab = 'dashboard' | 'checklist' | 'preventiva' | 'database' | 'os';

export default function App() {
  const [isPublicView] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('view') === 'dashboard' && params.get('share') === 'true';
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (isPublicView) return true;
    return localStorage.getItem('tellus_auth') === 'true';
  });
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('tellus_theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    if (isPublicView) {
      setActiveTab('dashboard');
    }
  }, [isPublicView]);

  useEffect(() => {
    localStorage.setItem('tellus_auth', isAuthenticated.toString());
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('tellus_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  if (isPublicView) {
    return (
      <div className="min-h-screen font-sans bg-[#f4f7f9] p-4 sm:p-8">
        <div className="max-w-[1000px] mx-auto">
          <div className="flex items-center gap-2 mb-8 opacity-50">
            <Truck className="w-6 h-6 text-blue-500" />
            <h1 className="text-xl font-black tracking-wide text-slate-900 uppercase">CHECKLIST<span className="text-blue-500">.</span></h1>
          </div>
          <DashboardView isPublic={true} />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginView onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen font-sans flex flex-col md:flex-row bg-[#f4f7f9]">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 text-white shadow-md z-20 print:hidden">
        <div className="font-extrabold tracking-wide text-lg flex items-center gap-2">
          <Truck className="w-5 h-5 text-blue-500" />
          CHECKLIST<span className="text-blue-500">.</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-0 left-0 h-screen md:h-screen w-64 bg-[#0f172a] border-r border-[#1e293b] 
        flex flex-col z-10 transition-transform duration-300 ease-in-out shrink-0 print:hidden
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>
        <div className="p-8 hidden md:flex flex-col items-center justify-center gap-2">
          <div className="flex items-center gap-2">
            <Truck className="w-6 h-6 text-blue-500" />
            <h1 className="text-2xl font-black tracking-wide text-white">CHECKLIST<span className="text-blue-500">.</span></h1>
          </div>
        </div>

        <nav className="flex-1 px-4 mt-6 md:mt-0 space-y-2">
          <button
            onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'dashboard'
              ? 'bg-blue-600/10 text-blue-500'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
          >
            <BarChart3 className="w-[18px] h-[18px]" />
            DASHBOARD
          </button>

          <button
            onClick={() => { setActiveTab('checklist'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'checklist'
              ? 'bg-blue-600/10 text-blue-500'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
          >
            <ListChecks className="w-[18px] h-[18px]" />
            INSPEÇÃO
          </button>

          <button
            onClick={() => { setActiveTab('preventiva'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'preventiva'
              ? 'bg-blue-600/10 text-blue-500'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
          >
            <Wrench className="w-[18px] h-[18px]" />
            OP. PREVENTIVA
          </button>

          <button
            onClick={() => { setActiveTab('database'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'database'
              ? 'bg-blue-600/10 text-blue-500'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
          >
            <Database className="w-[18px] h-[18px]" />
            BANCO DE DADOS
          </button>

          <button
            onClick={() => { setActiveTab('os'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'os'
              ? 'bg-blue-600/10 text-blue-500'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
          >
            <ClipboardList className="w-[18px] h-[18px]" />
            CONTROLE DE OS
          </button>

        </nav>

        <div className="p-4 border-t border-[#1e293b] mt-auto">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all mb-2"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-[18px] h-[18px]" />
                MODO CLARO
              </>
            ) : (
              <>
                <Moon className="w-[18px] h-[18px]" />
                MODO ESCURO
              </>
            )}
          </button>

          <button
            onClick={() => {
              localStorage.removeItem('tellus_auth');
              setIsAuthenticated(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
          >
            <XCircle className="w-[18px] h-[18px]" />
            SAIR DO SISTEMA
          </button>
        </div>
      </aside>

      {/* Main Content Overlay for Mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-0 md:hidden print:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Form Area */}
      <main className="flex-1 p-4 sm:p-8 min-w-0 transition-opacity">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'checklist' && <ChecklistView />}
        {activeTab === 'preventiva' && <PreventivaView />}
        {activeTab === 'database' && <DatabaseView />}
        {activeTab === 'os' && <OSView />}
      </main>
    </div>
  );
}
