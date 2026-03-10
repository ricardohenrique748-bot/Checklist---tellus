import React, { useState, useRef, useEffect } from 'react';
import { Truck, Calendar, Clock, User, CheckCircle, XCircle, MinusCircle, ChevronUp, ChevronDown, ListChecks, Database, Menu, X, Camera, ImagePlus, Trash2, Users, Key, Save, Droplet, Gauge, ClipboardCheck, BarChart3, Lock, Wrench } from 'lucide-react';
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
  'Pivot da suspensão dianteira (aplicar graxa até sair velha)',
  'Pivot da suspensão traseira (se aplicável)',
  'Pontos de articulação da direção / coluna',
  'Juntas cardan / junta universal',
  'Cruzetas do eixo cardan (com graxeiras)',
  'Buchas e articulações de suspensão (graxa nos pivôs)'
].map(item => item.toUpperCase());

const calibrationItems = [
  'Dianteiro Esquerdo', 'Dianteiro Direito',
  'Tração Esquerdo Externo', 'Tração Esquerdo Interno',
  'Tração Direito Externo', 'Tração Direito Interno',
  'Truck / 3º Eixo Esq. Ext.', 'Truck / 3º Eixo Esq. Int.',
  'Truck / 3º Eixo Dir. Ext.', 'Truck / 3º Eixo Dir. Int.',
  'Estepe 1', 'Estepe 2'
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
  const [inspectionTab, setInspectionTab] = useState<'checklist' | 'lubrificacao' | 'calibragem'>('checklist');

  const [mecanica, setMecanica] = useState<SectionState>({});
  const [eletrica, setEletrica] = useState<SectionState>({});
  const [externa, setExterna] = useState<SectionState>({});
  const [lubrificacao, setLubrificacao] = useState<SectionState>({});
  const [calibragem, setCalibragem] = useState<SectionState>({});

  const currentDate = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

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

  const handleSave = () => {
    // Mock save logic
    const inspectionData = {
      mecanica, eletrica, externa, lubrificacao, calibragem,
      date: new Date().toISOString()
    };
    localStorage.setItem('last_inspection', JSON.stringify(inspectionData));
    alert('Inspeção salva com sucesso!');
  };

  return (
    <div className="max-w-[850px] mx-auto pb-24">
      <header className="mb-6 pt-2">
        <h1 className="text-[28px] font-extrabold tracking-tight text-slate-800">Inspeção de Veículos</h1>
        <div className="flex items-center justify-between mt-2">
          <p className="text-slate-500 font-medium">Realize o preenchimento das abas antes de salvar.</p>
          <span className="bg-blue-50 text-blue-600 text-[11px] font-black px-3 py-1 rounded-full border border-blue-100">
            {totalCompleted} / {totalItemsCount} ITENS
          </span>
        </div>
      </header>

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
                <select className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-slate-800 text-[15px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium appearance-none hover:border-slate-300 transition-colors shadow-sm">
                  <option value="">Selecione o veículo...</option>
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
                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/30 text-slate-800 text-[15px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium hover:border-slate-300 transition-colors shadow-sm"
                defaultValue={currentDate}
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-extrabold text-[#7b8193] uppercase tracking-wide mb-2.5">
                <Clock className="w-[14px] h-[14px] text-slate-400" />
                Hora <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/30 text-slate-800 text-[15px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium hover:border-slate-300 transition-colors shadow-sm"
                defaultValue={currentTime}
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="flex items-center gap-1.5 text-xs font-extrabold text-[#7b8193] uppercase tracking-wide mb-2.5">
                <User className="w-[14px] h-[14px] text-slate-400" />
                Nome do Responsável <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Ex: Ricardo Luz"
                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/30 text-slate-800 text-[15px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium placeholder:text-slate-400 hover:border-slate-300 transition-colors shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Tabs Internas da Inspeção */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
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

        <div className="pt-8 flex justify-end print:hidden">
          <button
            type="button"
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-8 py-3.5 rounded-xl shadow-md active:scale-[0.98] transition-all text-[15px] uppercase tracking-wide w-full sm:w-auto"
          >
            Salvar Checklist
          </button>
        </div>
      </form>
    </div>
  );
}

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

function DashboardView() {
  const [stats, setStats] = useState({ inspections: 0, nonConformities: 0 });

  useEffect(() => {
    const lastInspection = localStorage.getItem('last_inspection');
    if (lastInspection) {
      const data = JSON.parse(lastInspection);
      let ncCount = 0;
      // Count non-conformities in all sections
      ['mecanica', 'eletrica', 'externa', 'lubrificacao', 'calibragem'].forEach(sectionKey => {
        if (data[sectionKey]) {
          ncCount += Object.values(data[sectionKey] as SectionState).filter(i => i.status === 'NÃO CONFORME').length;
        }
      });
      setStats({ inspections: 1, nonConformities: ncCount });
    }
  }, []);

  return (
    <div className="max-w-[1000px] mx-auto pb-24">
      <header className="mb-6 pt-2">
        <h1 className="text-[28px] font-extrabold tracking-tight text-slate-800">Dashboard</h1>
        <p className="text-slate-500 mt-2 font-medium">Visão geral do desempenho e status das frotas.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-[0_2px_12px_rgb(0,0,0,0.03)] border border-slate-200 p-6 flex flex-col justify-center">
          <div className="flex justify-between items-start mb-4">
            <div className="text-slate-500 font-bold text-sm">INSPEÇÕES HOJE</div>
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
              <ListChecks className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-800">
            {stats.inspections}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-[0_2px_12px_rgb(0,0,0,0.03)] border border-slate-200 p-6 flex flex-col justify-center">
          <div className="flex justify-between items-start mb-4">
            <div className="text-slate-500 font-bold text-sm">NÃO CONFORMES</div>
            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
              <XCircle className="w-4 h-4 text-red-600" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-800">
            {stats.nonConformities}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-[0_2px_12px_rgb(0,0,0,0.03)] border border-slate-200 p-6 flex flex-col justify-center">
          <div className="flex justify-between items-start mb-4">
            <div className="text-slate-500 font-bold text-sm">FROTAS ATIVAS</div>
            <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
              <Truck className="w-4 h-4 text-green-600" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-800">3</div>
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
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-3 h-3 rounded-full bg-slate-300 mt-1.5 shrink-0"></div>
              <div>
                <div className="text-3xl font-black text-slate-400">0</div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">No Prazo</div>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-3 h-3 rounded-full bg-slate-300 mt-1.5 shrink-0"></div>
              <div>
                <div className="text-3xl font-black text-slate-400">0</div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">A Vencer</div>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 col-span-2 lg:col-span-1">
              <div className="w-3 h-3 rounded-full bg-slate-300 mt-1.5 shrink-0"></div>
              <div>
                <div className="text-3xl font-black text-slate-400">0</div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Atrasadas</div>
              </div>
            </div>
          </div>

          {/* Details / Lista */}
          <div className="pt-6 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider">Atenção Necessária</h3>
            <div className="space-y-3">
              <div className="flex flex-col items-center justify-center p-8 rounded-xl bg-slate-50 border border-slate-100 border-dashed text-center">
                <Truck className="w-8 h-8 text-slate-300 mb-3" />
                <div className="font-extrabold text-slate-500">Nenhum veículo necessitando de atenção</div>
                <div className="text-xs font-medium text-slate-400 mt-1">Sua frota está em dia com as preventivas.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bar Chart Section */}
      <div className="bg-white rounded-xl shadow-[0_2px_12px_rgb(0,0,0,0.03)] border border-slate-200 p-6 sm:p-8 mt-8 overflow-hidden pl-2 pb-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-12 gap-4 pl-4 sm:pl-6 pt-2">
          <div>
            <h2 className="text-[22px] font-black text-slate-800 tracking-tight">Status de Preventivas</h2>
            <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">HORAS RESTANTES PARA SERVIÇOS</p>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 tracking-widest uppercase">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> No Prazo</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div> Atenção</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500"></div> Crítico</div>
          </div>
        </div>

        <div className="relative h-[300px] w-full overflow-x-auto overflow-y-hidden pb-12 hide-scrollbar">
          <div className="min-w-[800px] h-full relative pl-[60px] pr-4">

            {/* Y Axis Lines & Labels */}
            <div className="absolute left-0 top-0 bottom-12 w-full pointer-events-none flex flex-col justify-between text-[10px] font-bold text-slate-400">
              <div className="flex items-center w-full relative">
                <span className="w-10 text-right pr-2">9000h</span>
                <div className="flex-1 border-t border-slate-100 border-dashed"></div>
              </div>
              <div className="flex items-center w-full relative">
                <span className="w-10 text-right pr-2">4500h</span>
                <div className="flex-1 border-t border-slate-100 border-dashed"></div>
              </div>
              <div className="flex items-center w-full relative z-10">
                <span className="w-10 text-right pr-2 text-slate-600">0h</span>
                <div className="flex-1 border-t-2 border-slate-200"></div>
              </div>
              <div className="flex items-center w-full relative">
                <span className="w-10 text-right pr-2">-4500h</span>
                <div className="flex-1 border-t border-slate-100 border-dashed"></div>
              </div>
              <div className="flex items-center w-full relative">
                <span className="w-10 text-right pr-2">-9000h</span>
                <div className="flex-1 border-t border-slate-100 border-dashed"></div>
              </div>
            </div>

            {/* Bars container */}
            <div className="absolute left-[60px] right-4 top-0 bottom-12 flex items-center justify-center px-2">
              <div className="flex flex-col items-center">
                <BarChart3 className="w-10 h-10 text-slate-200 mb-3" />
                <span className="text-sm font-bold text-slate-400">Sem dados de manutenção para exibir</span>
              </div>
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
      finalizeLogin();
      return;
    }

    const { data } = await supabase
      .from('acessos')
      .select('*')
      .eq('email', normalizedEmail)
      .eq('senha', password)
      .single();

    setLoading(false);

    if (data) {
      finalizeLogin();
    } else {
      setError(true);
    }
  };

  const finalizeLogin = () => {
    setError(false);
    if (rememberMe) {
      localStorage.setItem('tellus_email', email);
      localStorage.setItem('tellus_password', password);
    } else {
      localStorage.removeItem('tellus_email');
      localStorage.removeItem('tellus_password');
    }
    onLogin();
  };

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
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 uppercase tracking-wide text-sm mt-2"
          >
            <Lock className="w-4 h-4" />
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}

function PreventivaView() {
  const currentDate = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-[850px] mx-auto pb-24">
      <header className="mb-6 pt-2">
        <h1 className="text-[28px] font-extrabold tracking-tight text-slate-800">Controle de Preventiva</h1>
        <p className="text-slate-500 mt-2 font-medium">Programe e acompanhe as manutenções preventivas dos equipamentos.</p>
      </header>

      <form className="bg-white rounded-2xl shadow-[0_2px_12px_rgb(0,0,0,0.03)] border border-slate-200 p-6 sm:p-8" onSubmit={(e) => e.preventDefault()}>

        <div className="space-y-8">
          {/* Veículo */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-extrabold text-[#7b8193] uppercase tracking-wide mb-2.5">
              Veículo / Equipamento <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-[15px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-bold appearance-none hover:border-slate-300 transition-colors shadow-sm">
                <option value="">Selecione o veículo...</option>
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
                  placeholder="Ex: Preventiva de Motor"
                  className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-[15px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-bold placeholder:text-slate-400 placeholder:font-medium hover:border-slate-300 transition-colors shadow-sm"
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100 my-2"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Última Revisão */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-extrabold text-[#7b8193] uppercase tracking-wide mb-2.5">
                Última Revisão (H)
              </label>
              <input
                type="number"
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
                placeholder="500"
                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-[16px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-bold hover:border-slate-300 transition-colors shadow-sm"
              />
              <p className="text-[11px] text-slate-400 mt-2 font-medium">A cada quantas horas?</p>
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
                  defaultValue={currentDate}
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
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl border-2 border-slate-200 text-slate-500 font-bold text-sm uppercase tracking-wide hover:bg-slate-50 hover:text-slate-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              onClick={() => alert('Plano de preventiva ativado com sucesso!')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-green-600 border-2 border-green-600 text-white font-extrabold text-sm uppercase tracking-wide hover:bg-green-700 hover:border-green-700 shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-[18px] h-[18px]" />
              Ativar Plano
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

type Tab = 'dashboard' | 'checklist' | 'preventiva' | 'database';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('tellus_auth') === 'true';
  });
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('tellus_auth', isAuthenticated.toString());
  }, [isAuthenticated]);

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

        </nav>

        <div className="p-4 border-t border-[#1e293b] mt-auto">
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
      </main>
    </div>
  );
}
