import React, { useState, useRef } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { 
  ZoomIn, ZoomOut, RotateCcw, 
  PenTool, Eraser, MousePointer2, 
  Layers, Eye, EyeOff, Maximize 
} from 'lucide-react';

const SmartViewer = ({ originalSrc, maskSrc, layers = [], onLayerToggle }) => {
  // State: Công cụ đang chọn ('move', 'draw', 'erase')
  const [toolMode, setToolMode] = useState('move');
  
  // State: Độ mờ của lớp Mask (0 - 100)
  const [opacity, setOpacity] = useState(60);

  // Tham chiếu đến API của thư viện Zoom để gọi reset/zoom từ bên ngoài
  const transformComponentRef = useRef(null);

  return (
    <div className="flex flex-col h-full w-full bg-black rounded-xl overflow-hidden border border-medical-border shadow-2xl relative group">
      
      {/* 1. TOOLBAR (Thanh công cụ phía trên) */}
      <div className="h-14 bg-medical-card border-b border-medical-border flex items-center justify-between px-4 z-20 shrink-0">
        
        {/* Nhóm 1: Điều hướng (Pan) */}
        <div className="flex items-center gap-2 border-r border-gray-700 pr-4">
           <span className="text-[10px] text-medical-subtext font-bold uppercase tracking-wider mr-1 hidden sm:inline">Nav</span>
           <button 
             onClick={() => setToolMode('move')} 
             className={`p-2 rounded-lg transition-all ${toolMode === 'move' ? 'bg-medical-accent text-white shadow-lg shadow-blue-500/20' : 'text-medical-subtext hover:bg-medical-hover hover:text-white'}`}
             title="Chế độ Di chuyển (Pan)"
           >
             <MousePointer2 size={18} />
           </button>
        </div>

        {/* Nhóm 2: Chỉnh sửa Mask (Human-in-the-loop) */}
        <div className="flex items-center gap-2 border-r border-gray-700 pr-4">
           <span className="text-[10px] text-medical-subtext font-bold uppercase tracking-wider mr-1 hidden sm:inline">Edit</span>
           <button 
             onClick={() => setToolMode('draw')}
             className={`p-2 rounded-lg transition-all ${toolMode === 'draw' ? 'bg-green-600 text-white shadow-lg shadow-green-500/20' : 'text-medical-subtext hover:bg-medical-hover hover:text-white'}`}
             title="Bút vẽ (Thêm vùng tổn thương)"
           >
             <PenTool size={18} />
           </button>
           <button 
             onClick={() => setToolMode('erase')}
             className={`p-2 rounded-lg transition-all ${toolMode === 'erase' ? 'bg-red-600 text-white shadow-lg shadow-red-500/20' : 'text-medical-subtext hover:bg-medical-hover hover:text-white'}`}
             title="Cục tẩy (Xóa vùng sai)"
           >
             <Eraser size={18} />
           </button>
        </div>

        {/* Nhóm 3: Opacity Slider */}
        <div className="flex items-center gap-3">
           <Layers size={18} className="text-medical-accent" />
           <div className="flex flex-col w-24 sm:w-32">
             <input 
               type="range" min="0" max="100" 
               value={opacity} 
               onChange={(e) => setOpacity(e.target.value)}
               className="h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-medical-accent"
             />
           </div>
           <span className="text-xs font-mono text-medical-subtext w-8 text-right">{opacity}%</span>
        </div>
      </div>

      {/* 2. MAIN CANVAS (Khu vực hiển thị ảnh) */}
      <div className={`flex-1 relative bg-gray-900 overflow-hidden ${toolMode === 'move' ? 'cursor-grab active:cursor-grabbing' : 'cursor-crosshair'}`}>
        
        {/* Component Zoom/Pan */}
        <TransformWrapper
          ref={transformComponentRef}
          initialScale={1}
          minScale={0.5}
          maxScale={8}
          centerOnInit={true}
          disabled={toolMode !== 'move'} // Tắt chức năng Pan khi đang ở chế độ Vẽ
          wheel={{ step: 0.1 }} // Zoom mượt bằng chuột giữa
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              {/* Floating Controls (Nút nổi bên phải) */}
              <div className="absolute top-4 right-4 flex flex-col gap-2 z-30 bg-black/60 backdrop-blur p-1.5 rounded-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button onClick={() => zoomIn()} className="p-2 hover:bg-white/20 rounded-lg text-white transition-colors" title="Phóng to">
                  <ZoomIn size={20}/>
                </button>
                <button onClick={() => zoomOut()} className="p-2 hover:bg-white/20 rounded-lg text-white transition-colors" title="Thu nhỏ">
                  <ZoomOut size={20}/>
                </button>
                <div className="h-px w-full bg-white/20 my-1"></div>
                <button onClick={() => resetTransform()} className="p-2 hover:bg-white/20 rounded-lg text-white transition-colors" title="Đặt lại (Reset)">
                  <RotateCcw size={20}/>
                </button>
              </div>

              {/* Nội dung ảnh được Zoom */}
              <TransformComponent 
                wrapperClass="!w-full !h-full" 
                contentClass="!w-full !h-full flex items-center justify-center"
              >
                <div className="relative shadow-2xl" style={{ width: 'fit-content' }}>
                   
                   {/* LAYER 1: ẢNH GỐC */}
                   <img 
                     src={originalSrc} 
                     alt="Original OCT" 
                     className="max-h-[75vh] w-auto object-contain select-none pointer-events-none" 
                   />

                   {/* LAYER 2: AI MASK (Overlay) */}
                   {maskSrc && (
                     <div 
                       className="absolute inset-0 pointer-events-none transition-opacity duration-200" 
                       style={{ opacity: opacity / 100 }}
                     >
                        <img 
                          src={maskSrc} 
                          alt="AI Mask" 
                          className="w-full h-full object-contain mix-blend-screen filter hue-rotate-180" 
                        />
                     </div>
                   )}

                   {/* LAYER 3: VISUAL FEEDBACK KHI VẼ (Demo) */}
                   {toolMode !== 'move' && (
                     <div className="absolute inset-0 border-2 border-dashed border-white/30 pointer-events-none flex items-center justify-center">
                        {/* Đây chỉ là visual hint để người dùng biết đang ở chế độ vẽ */}
                     </div>
                   )}
                </div>
              </TransformComponent>
            </>
          )}
        </TransformWrapper>

        {/* Thông báo chế độ (Overlay nhỏ) */}
        {toolMode !== 'move' && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur text-white px-4 py-2 rounded-full text-xs font-bold border border-white/10 z-30 pointer-events-none animate-fade-in-up">
            {toolMode === 'draw' ? '✏️ Đang dùng Bút vẽ' : '🧹 Đang dùng Cục tẩy'}
          </div>
        )}
      </div>

      {/* 3. FOOTER (Layer Toggles) - Chỉ hiện nếu có props layers truyền vào */}
      {layers.length > 0 && (
        <div className="bg-medical-card p-3 border-t border-medical-border flex flex-wrap gap-3 items-center shrink-0 z-20">
          <span className="text-[10px] font-bold text-medical-subtext uppercase tracking-wider mr-2">Layers:</span>
          {layers.map((layer) => (
            <button 
              key={layer.id}
              onClick={() => onLayerToggle && onLayerToggle(layer.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                layer.active 
                  ? 'bg-medical-accent/10 border-medical-accent text-medical-accent' 
                  : 'bg-transparent border-medical-border text-medical-subtext hover:bg-medical-hover hover:text-medical-text'
              }`}
            >
              {layer.active ? <Eye size={14} /> : <EyeOff size={14} />}
              {layer.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SmartViewer;