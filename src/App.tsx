import React, { useState, useRef, useEffect } from 'react';
import { Truck, Calendar, Clock, User, CheckCircle, XCircle, MinusCircle, ChevronUp, ChevronDown, ListChecks, Database, Menu, X, Camera, ImagePlus, Trash2, Users, Key, Save, Droplet, Gauge, ClipboardCheck, BarChart3, Lock, Wrench, Pencil } from 'lucide-react';
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
  const [history, setHistory] = useState<any[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('inspecoes_history') || '[]');
    } catch {
      return [];
    }
  });
  const [, setSelectedInspection] = useState<any>(null);

  const [inspectionTab, setInspectionTab] = useState<'checklist' | 'lubrificacao' | 'calibragem'>('checklist');

  const [headerPlaca, setHeaderPlaca] = useState('');
  const [headerResponsavel, setHeaderResponsavel] = useState(() => localStorage.getItem('tellus_user_name') || '');
  const [headerData, setHeaderData] = useState(() => new Date().toISOString().split('T')[0]);
  const [headerHora, setHeaderHora] = useState(() => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));

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

  const handleSave = () => {
    if (!headerPlaca || !headerResponsavel) {
      alert('Por favor, identifique o veículo e o responsável!');
      return;
    }

    const inspectionData = {
      id: Date.now(),
      placa: headerPlaca,
      responsavel: headerResponsavel,
      data: headerData,
      hora: headerHora,
      mecanica, eletrica, externa, lubrificacao, calibragem,
      timestamp: new Date().toISOString()
    };

    const newHistory = [inspectionData, ...history];
    setHistory(newHistory);
    localStorage.setItem('inspecoes_history', JSON.stringify(newHistory));

    // Clear forms 
    setMecanica({}); setEletrica({}); setExterna({}); setLubrificacao({}); setCalibragem({});
    setHeaderPlaca('');

    alert('Inspeção salva com sucesso!');
    setViewMode('historico');
  };

  const handleShare = (inspeccao: any) => {
    const text = `*Checklist - Equipamento ${inspeccao.placa}*
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
    setHeaderPlaca(inspeccao.placa);
    setHeaderResponsavel(inspeccao.responsavel);
    setHeaderData(inspeccao.data);
    setHeaderHora(inspeccao.hora);
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
    setMecanica({}); setEletrica({}); setExterna({}); setLubrificacao({}); setCalibragem({});
    setHeaderPlaca('');
    setHeaderData(new Date().toISOString().split('T')[0]);
    setHeaderHora(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
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
                    <h3 className="font-bold text-slate-800 text-lg">{item.placa}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-slate-500 font-medium">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {item.data.split('-').reverse().join('/')}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {item.hora}</span>
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
        <h1 className="text-2xl font-bold text-slate-800">RELATÓRIO DE INSPEÇÃO: {headerPlaca}</h1>
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
                  {(() => {
                    try {
                      const frotas = JSON.parse(localStorage.getItem('frotas') || '[]');
                      return frotas.map((f: any) => (
                        <option key={f.id} value={f.placa}>{f.placa} ({f.modelo})</option>
                      ));
                    } catch { return null; }
                  })()}
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

            <div className="col-span-1 md:col-span-2">
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
                  {(() => {
                    try {
                      // List system users (Acessos) - prioritizing names
                      const acessos = JSON.parse(localStorage.getItem('acessos') || '[]');
                      const systemUsers = acessos.map((u: any) => (
                        <option key={`a-${u.id}`} value={u.nome || u.email}>{u.nome || u.email} (Usuário)</option>
                      ));

                      // List employees
                      const funcionarios = JSON.parse(localStorage.getItem('funcionarios') || '[]');
                      const employees = funcionarios.map((f: any) => (
                        <option key={`f-${f.id}`} value={f.nome}>{f.nome} ({f.cargo})</option>
                      ));

                      return [...systemUsers, ...employees];
                    } catch { return null; }
                  })()}
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
  const [activeForm, setActiveForm] = useState<'frotas' | 'funcionarios' | 'logins'>('frotas');

  const [frotas, setFrotas] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem('frotas') || '[]'); } catch { return []; }
  });
  const [funcionarios, setFuncionarios] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem('funcionarios') || '[]'); } catch { return []; }
  });
  const [acessos, setAcessos] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem('acessos') || '[]'); } catch { return []; }
  });

  const saveToStorage = (key: string, data: any[]) => localStorage.setItem(key, JSON.stringify(data));

  const [frotaPlaca, setFrotaPlaca] = useState('');
  const [frotaModelo, setFrotaModelo] = useState('');
  const [frotaTipo, setFrotaTipo] = useState('');

  const [funcNome, setFuncNome] = useState('');
  const [funcEmail, setFuncEmail] = useState('');
  const [funcCargo, setFuncCargo] = useState('');

  const [acessoNome, setAcessoNome] = useState('');
  const [acessoEmail, setAcessoEmail] = useState('');
  const [acessoSenha, setAcessoSenha] = useState('');
  const [acessoNivel, setAcessoNivel] = useState('');

  const [editingId, setEditingId] = useState<number | null>(null);

  const clearForm = () => {
    setFrotaPlaca(''); setFrotaModelo(''); setFrotaTipo('');
    setFuncNome(''); setFuncEmail(''); setFuncCargo('');
    setAcessoNome(''); setAcessoEmail(''); setAcessoSenha(''); setAcessoNivel('');
    setEditingId(null);
  };

  const handleSaveFrota = (e: React.FormEvent) => {
    e.preventDefault();
    if (!frotaPlaca || !frotaModelo || !frotaTipo) return alert('Preencha todos os campos!');

    let newData;
    if (editingId) {
      newData = frotas.map(f => f.id === editingId ? { ...f, placa: frotaPlaca, modelo: frotaModelo, tipo: frotaTipo } : f);
      alert('Veículo atualizado com sucesso!');
    } else {
      newData = [...frotas, { id: Date.now(), placa: frotaPlaca, modelo: frotaModelo, tipo: frotaTipo }];
      alert('Veículo cadastrado com sucesso!');
    }

    setFrotas(newData); saveToStorage('frotas', newData);
    clearForm();
  };

  const handleSaveFuncionario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!funcNome || !funcCargo) return alert('Preencha todos os campos!');

    let newData;
    if (editingId) {
      newData = funcionarios.map(f => f.id === editingId ? { ...f, nome: funcNome, email: funcEmail, cargo: funcCargo } : f);
      alert('Funcionário atualizado com sucesso!');
    } else {
      newData = [...funcionarios, { id: Date.now(), nome: funcNome, email: funcEmail, cargo: funcCargo }];
      alert('Funcionário cadastrado com sucesso!');
    }

    setFuncionarios(newData); saveToStorage('funcionarios', newData);
    clearForm();
  };

  const handleSaveAcesso = (e: React.FormEvent) => {
    e.preventDefault();
    if (!acessoEmail || !acessoSenha || !acessoNivel) return alert('Preencha todos os campos!');

    let newData;
    if (editingId) {
      newData = acessos.map(f => f.id === editingId ? { ...f, nome: acessoNome, email: acessoEmail, senha: acessoSenha, nivel: acessoNivel } : f);
      alert('Acesso atualizado com sucesso!');
    } else {
      newData = [...acessos, { id: Date.now(), nome: acessoNome, email: acessoEmail, senha: acessoSenha, nivel: acessoNivel }];
      alert('Acesso cadastrado com sucesso!');
    }

    setAcessos(newData); saveToStorage('acessos', newData);
    clearForm();
  };

  const startEditFrota = (f: any) => {
    console.log("Iniciando edição de frota:", f);
    setEditingId(f.id);
    setFrotaPlaca(f.placa);
    setFrotaModelo(f.modelo);
    setFrotaTipo(f.tipo);
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

  const deleteItem = (type: 'frotas' | 'funcionarios' | 'acessos', id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir?')) return;
    if (type === 'frotas') {
      const filtered = frotas.filter(f => f.id !== id);
      setFrotas(filtered); saveToStorage('frotas', filtered);
    } else if (type === 'funcionarios') {
      const filtered = funcionarios.filter(f => f.id !== id);
      setFuncionarios(filtered); saveToStorage('funcionarios', filtered);
    } else if (type === 'acessos') {
      const filtered = acessos.filter(f => f.id !== id);
      setAcessos(filtered); saveToStorage('acessos', filtered);
    }
    if (editingId === id) setEditingId(null);
  };

  return (
    <div className="max-w-[850px] mx-auto pb-24">
      <header className="mb-8 pt-2">
        <h1 className="text-[28px] font-extrabold tracking-tight text-slate-800">Gestão de Cadastros</h1>
        <p className="text-slate-500 mt-2 font-medium">Cadastre frotas, funcionários e acessos ao sistema.</p>
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
              <div className="col-span-1 md:col-span-2">
                <label className="flex items-center gap-1.5 text-xs font-extrabold text-[#7b8193] uppercase tracking-wide mb-2.5">
                  Tipo de Equipamento <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select value={frotaTipo} onChange={e => setFrotaTipo(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-slate-800 text-[15px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium appearance-none hover:border-slate-300 transition-colors shadow-sm">
                    <option value="">Selecione...</option>
                    <option value="caminhao">Caminhão Baú</option>
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
        )}

        {/* Formulário de Funcionários */}
        {activeForm === 'funcionarios' && (
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
        )}

        {/* Formulário de Acessos */}
        {activeForm === 'logins' && (
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
                  placeholder="Ex: Administrativo Dellus"
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
        )}
      </div>

      {/* Listagem de Cadastrados */}
      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgb(0,0,0,0.03)] border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50/50">
          <h2 className="text-lg font-extrabold text-slate-800 tracking-wide uppercase">Cadastros Realizados</h2>
        </div>

        {activeForm === 'frotas' && (
          <div className="divide-y divide-slate-100">
            {frotas.length === 0 && <div className="p-6 text-center text-slate-500 font-medium tracking-wide text-sm">Nenhum veículo cadastrado.</div>}
            {frotas.map(f => (
              <div key={f.id} className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div>
                  <div className="font-bold text-slate-800">{f.placa} <span className="text-slate-400 font-medium">({f.modelo})</span></div>
                  <div className="text-xs font-bold text-blue-500 uppercase mt-1">{f.tipo}</div>
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
        )}

        {activeForm === 'funcionarios' && (
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
        )}

        {activeForm === 'logins' && (
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
        )}
      </div>

    </div>
  );
}

function DashboardView() {
  const [stats, setStats] = useState({ inspections: 0, nonConformities: 0, activeFrotas: 0 });
  const [preventivaStats, setPreventivaStats] = useState({ onTime: 0, attention: 0, critical: 0 });

  useEffect(() => {
    // Inspections
    const lastInspection = localStorage.getItem('last_inspection');
    let inspectionsCount = 0;
    let ncCount = 0;
    if (lastInspection) {
      const data = JSON.parse(lastInspection);
      inspectionsCount = 1;
      ['mecanica', 'eletrica', 'externa', 'lubrificacao', 'calibragem'].forEach(sectionKey => {
        if (data[sectionKey]) {
          ncCount += Object.values(data[sectionKey] as SectionState).filter(i => i.status === 'NÃO CONFORME').length;
        }
      });
    }

    // Frotas
    const frotas = JSON.parse(localStorage.getItem('frotas') || '[]');
    const activeFrotas = frotas.length;

    setStats({ inspections: inspectionsCount, nonConformities: ncCount, activeFrotas });

    // Preventivas
    const preventivas = JSON.parse(localStorage.getItem('preventivas') || '[]');
    let onTime = 0, attention = 0, critical = 0;

    preventivas.forEach((p: any) => {
      const diff = parseInt(p.intervalo) - (parseInt(p.atual) - parseInt(p.ultima));
      if (diff < 20) critical++;
      else if (diff <= 60) attention++;
      else onTime++;
    });

    setPreventivaStats({ onTime, attention, critical });
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
          <div className="text-3xl font-extrabold text-slate-800">{stats.activeFrotas}</div>
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
              <div className="w-3 h-3 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div>
              <div>
                <div className="text-3xl font-black text-slate-800">{preventivaStats.onTime}</div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">No Prazo</div>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-3 h-3 rounded-full bg-amber-400 mt-1.5 shrink-0"></div>
              <div>
                <div className="text-3xl font-black text-slate-800">{preventivaStats.attention}</div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">A Vencer</div>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 col-span-2 lg:col-span-1">
              <div className="w-3 h-3 rounded-full bg-red-500 mt-1.5 shrink-0"></div>
              <div>
                <div className="text-3xl font-black text-slate-800">{preventivaStats.critical}</div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Atrasadas</div>
              </div>
            </div>
          </div>

          {/* Details / Lista */}
          <div className="pt-6 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider">Atenção Necessária</h3>
            <div className="space-y-3">
              {(() => {
                const preventivas = JSON.parse(localStorage.getItem('preventivas') || '[]');
                const needed = preventivas.filter((p: any) => (parseInt(p.intervalo) - (parseInt(p.atual) - parseInt(p.ultima))) <= 60);

                if (needed.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center p-8 rounded-xl bg-slate-50 border border-slate-100 border-dashed text-center">
                      <Truck className="w-8 h-8 text-slate-300 mb-3" />
                      <div className="font-extrabold text-slate-500">Nenhum veículo necessitando de atenção</div>
                      <div className="text-xs font-medium text-slate-400 mt-1">Sua frota está em dia com as preventivas.</div>
                    </div>
                  );
                }

                return needed.map((p: any) => {
                  const restante = parseInt(p.intervalo) - (parseInt(p.atual) - parseInt(p.ultima));
                  const isCritical = restante < 20;
                  return (
                    <div key={p.id} className="flex items-center justify-between p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-2 rounded-full ${isCritical ? 'bg-red-500 animate-pulse' : 'bg-amber-400'}`}></div>
                        <div>
                          <div className="font-bold text-slate-800 text-sm">{p.veiculo}</div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{p.plano}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-black text-sm ${isCritical ? 'text-red-600' : 'text-amber-500'}`}>{restante}h</div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase">Restante</div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
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

        <div className="relative h-[340px] w-full overflow-x-auto pb-16 hide-scrollbar">
          <div className="min-w-[800px] h-full relative pl-[60px] pr-4">

            {/* Y Axis Lines & Labels */}
            <div className="absolute left-0 top-0 bottom-24 w-full pointer-events-none flex flex-col justify-between text-[10px] font-bold text-slate-400">

              <div className="flex items-center w-full relative">
                <span className="w-10 text-right pr-2">50%</span>
                <div className="flex-1 border-t border-slate-100 border-dashed"></div>
              </div>

            </div>

            {/* Bars container Overhaul */}
            <div className="absolute left-[60px] right-4 top-16 bottom-24 flex items-end px-4 gap-12 overflow-x-visible">
              {preventivaStats.onTime + preventivaStats.attention + preventivaStats.critical > 0 ? (
                (() => {
                  try {
                    const preventivas = JSON.parse(localStorage.getItem('preventivas') || '[]');
                    return preventivas.map((p: any) => {
                      const acumulado = parseInt(p.atual) - parseInt(p.ultima);
                      const restante = parseInt(p.intervalo) - acumulado;
                      const percentRemaining = Math.max(2, Math.min(100, Math.round((restante / parseInt(p.intervalo)) * 100)));

                      const colorHex = restante < 20 ? '#ef4444' : restante <= 60 ? '#f59e0b' : '#3b82f6';
                      const colorShadow = restante < 20 ? 'rgba(239, 68, 68, 0.3)' : restante <= 60 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(59, 130, 246, 0.3)';

                      return (
                        <div key={p.id} className="flex flex-col items-center relative group w-20 h-full shrink-0">
                          {/* Top Area: Stats */}
                          <div className="absolute -top-12 flex flex-col items-center gap-0.5">

                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full text-white bg-slate-900 shadow-sm`}>
                              {restante}h
                            </span>
                          </div>

                          {/* Bar Track (Background) */}
                          <div className="flex-1 w-8 bg-slate-100/80 rounded-t-2xl flex flex-col justify-end overflow-hidden border border-slate-200/50 shadow-inner">
                            {/* Actual Bar - Animated height */}
                            <div
                              style={{
                                height: `${percentRemaining}%`,
                                backgroundColor: colorHex,
                                boxShadow: `0 0 20px ${colorShadow}`
                              }}
                              className="w-full transition-all duration-1000 ease-out cursor-pointer relative group-hover:brightness-110 flex flex-col items-center justify-start pt-4"
                            >
                              {/* Glass Effect Line */}
                              <div className="w-px h-1/2 bg-white/20 absolute left-1/2 -translate-x-1/2 top-0"></div>

                              {/* Vertical Type Label inside bar */}
                              {percentRemaining > 35 && (
                                <div className="text-white/40 text-[9px] font-black uppercase tracking-widest rotate-90 origin-center whitespace-nowrap">
                                  {p.plano}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Tooltip */}
                          <div className="opacity-0 group-hover:opacity-100 absolute -top-20 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl text-[10px] font-bold whitespace-nowrap z-50 shadow-2xl pointer-events-none transition-all border border-white/10 scale-90 group-hover:scale-100">
                            <div className="text-blue-400 mb-1 uppercase tracking-widest text-[8px] font-black">{p.veiculo}</div>
                            <div className="flex items-center gap-2">
                              {p.plano}: <span className="text-white font-black text-xs">{restante}h</span>
                            </div>
                            <div className="text-slate-500 font-medium mt-0.5">Acumulado: {acumulado}h</div>
                            <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900/95 rotate-45 border-r border-b border-white/10"></div>
                          </div>

                          {/* Diagonal Label - Improved alignment */}
                          <div className="absolute bottom-[-15px] left-1/2 transform -translate-x-1/2">
                            <div className="flex flex-col items-center -rotate-45 origin-center mt-6">
                              <span className="text-[10px] font-black text-slate-800 tracking-tighter bg-white shadow-sm border border-slate-100 px-2 py-1 rounded-lg">
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
      return;
    }

    // Check locally first
    let userRecord = null;
    try {
      const localAcessos = JSON.parse(localStorage.getItem('acessos') || '[]');
      userRecord = localAcessos.find((a: any) => {
        const aEmail = a?.email || '';
        return aEmail.trim().toLowerCase() === normalizedEmail && a.senha === password;
      });
    } catch (e) { }

    // Check Supabase if local fails
    if (!userRecord) {
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

    // Update locally
    let userRecord = null;
    try {
      const localAcessos = JSON.parse(localStorage.getItem('acessos') || '[]');
      const index = localAcessos.findIndex((a: any) => a.email.toLowerCase() === normalizedEmail);
      if (index !== -1) {
        localAcessos[index].senha = newPassword;
        userRecord = localAcessos[index];
        localStorage.setItem('acessos', JSON.stringify(localAcessos));
      }
    } catch (e) { }

    // Update Supabase
    try {
      await supabase
        .from('acessos')
        .update({ senha: newPassword })
        .ilike('email', normalizedEmail);
    } catch (e) { }

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
  const [ultima, setUltima] = useState('');
  const [atual, setAtual] = useState('');
  const [intervalo, setIntervalo] = useState('500');
  const [dataInicio, setDataInicio] = useState(currentDate);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [preventivas, setPreventivas] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem('preventivas') || '[]'); } catch { return []; }
  });

  const clearForm = () => {
    setVeiculo('');
    setPlano('');
    setUltima('');
    setAtual('');
    setIntervalo('500');
    setDataInicio(currentDate);
    setEditingId(null);
  };

  const handleSavePreventiva = (e: React.FormEvent) => {
    e.preventDefault();
    if (!veiculo || !plano || !atual || !intervalo) {
      alert('Preencha os campos obrigatórios!');
      return;
    }

    try {
      const existing = JSON.parse(localStorage.getItem('preventivas') || '[]');
      let updated;

      if (editingId) {
        // Update mode
        updated = existing.map((p: any) => p.id === editingId ? {
          ...p,
          veiculo,
          plano,
          ultima: ultima || '0',
          atual,
          intervalo,
          data: dataInicio
        } : p);
        alert('Plano atualizado com sucesso!');
      } else {
        // Create mode
        const newPreventiva = {
          id: Date.now(),
          veiculo,
          plano,
          ultima: ultima || '0',
          atual,
          intervalo,
          data: dataInicio
        };
        updated = [...existing, newPreventiva];
        alert('Plano de preventiva ativado com sucesso!');
      }

      localStorage.setItem('preventivas', JSON.stringify(updated));
      setPreventivas(updated);
      clearForm();
    } catch (e) {
      alert('Erro ao salvar no banco de dados.');
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
    setDataInicio(p.data || currentDate);
    window.scrollTo({ top: 0, behavior: 'auto' });
    window.scrollTo(0, 0);
  };

  const deletePreventiva = (id: number) => {
    if (!window.confirm('Excluir este plano de preventiva?')) return;
    const updated = preventivas.filter(p => p.id !== id);
    localStorage.setItem('preventivas', JSON.stringify(updated));
    setPreventivas(updated);
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
                {(() => {
                  try {
                    const frotas = JSON.parse(localStorage.getItem('frotas') || '[]');
                    return frotas.map((f: any) => (
                      <option key={f.id} value={f.placa}>{f.placa} ({f.modelo})</option>
                    ));
                  } catch { return null; }
                })()}
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
                    <span className="font-extrabold text-slate-800">{p.veiculo}</span>
                    <span className="text-[10px] font-black uppercase bg-slate-100 text-slate-500 px-2 py-0.5 rounded">{p.plano}</span>
                  </div>
                  <div className="flex gap-4 mt-2">
                    <div className="text-[11px] font-bold text-slate-400 uppercase">Acúmulo: <span className="text-slate-600">{parseInt(p.atual) - parseInt(p.ultima)}h</span></div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase">Intervalo: <span className="text-slate-600">{p.intervalo}h</span></div>
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
