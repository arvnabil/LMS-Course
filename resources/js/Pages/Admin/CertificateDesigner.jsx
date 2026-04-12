import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';

// Draggable Text Element Component
function DraggableElement({ id, data, isSelected, onSelect, onChange, containerRef }) {
    const handlePointerDown = (e) => {
        e.preventDefault();
        onSelect(id);
        const containerRect = containerRef.current.getBoundingClientRect();
        
        const startX = e.clientX;
        const startY = e.clientY;
        const startDataX = data.x;
        const startDataY = data.y;

        const onPointerMove = (moveEvent) => {
            const dx = moveEvent.clientX - startX;
            const dy = moveEvent.clientY - startY;

            // Convert dx, dy to percentages based on container size
            const percentX = (dx / containerRect.width) * 100;
            const percentY = (dy / containerRect.height) * 100;

            let newX = startDataX + percentX;
            let newY = startDataY + percentY;

            // clamp to 0-100
            newX = Math.max(0, Math.min(100, newX));
            newY = Math.max(0, Math.min(100, newY));

            onChange(id, { ...data, x: newX, y: newY });
        };

        const onPointerUp = () => {
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
        };

        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
    };

    const getTransform = () => {
        if (data.align === 'center') return 'translate(-50%, -50%)';
        if (data.align === 'left') return 'translate(0%, -50%)';
        if (data.align === 'right') return 'translate(-100%, -50%)';
        return 'translate(-50%, -50%)';
    };

    return (
        <div 
            className={`absolute cursor-move ${isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-black/10' : 'hover:ring-1 hover:ring-gray-300'}`}
            style={{ 
                left: `${data.x}%`, 
                top: `${data.y}%`, 
                transform: getTransform(),
                fontSize: `${data.fontSize}px`, 
                color: data.color, 
                textAlign: data.align,
                fontFamily: data.fontFamily || 'sans-serif',
                fontWeight: data.fontWeight || 'normal',
                whiteSpace: 'nowrap',
                userSelect: 'none',
                zIndex: isSelected ? 10 : 1,
                lineHeight: 1,
                padding: '4px',
                borderRadius: '4px'
            }}
            onPointerDown={handlePointerDown}
        >
            [{id.replace('_', ' ').toUpperCase()}]
            {isSelected && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-0.5 rounded shadow whitespace-nowrap z-20">
                    {Math.round(data.x)}%, {Math.round(data.y)}%
                </div>
            )}
        </div>
    );
}

// Draggable Signature Image Element Component
function DraggableSignatureElement({ data, isSelected, onSelect, onChange, containerRef, signaturePreview }) {
    const handlePointerDown = (e) => {
        e.preventDefault();
        onSelect('signature');
        const containerRect = containerRef.current.getBoundingClientRect();
        
        const startX = e.clientX;
        const startY = e.clientY;
        const startDataX = data.x;
        const startDataY = data.y;

        const onPointerMove = (moveEvent) => {
            const dx = moveEvent.clientX - startX;
            const dy = moveEvent.clientY - startY;

            const percentX = (dx / containerRect.width) * 100;
            const percentY = (dy / containerRect.height) * 100;

            let newX = startDataX + percentX;
            let newY = startDataY + percentY;

            newX = Math.max(0, Math.min(100, newX));
            newY = Math.max(0, Math.min(100, newY));

            onChange('signature', { ...data, x: newX, y: newY });
        };

        const onPointerUp = () => {
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
        };

        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
    };

    return (
        <div 
            className={`absolute cursor-move ${isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-black/10' : 'hover:ring-1 hover:ring-gray-300'}`}
            style={{ 
                left: `${data.x}%`, 
                top: `${data.y}%`, 
                transform: 'translate(-50%, -50%)',
                width: `${data.width || 15}%`,
                userSelect: 'none',
                zIndex: isSelected ? 10 : 2,
                borderRadius: '4px',
                padding: '2px',
            }}
            onPointerDown={handlePointerDown}
        >
            <img 
                src={signaturePreview} 
                alt="Signature" 
                className="w-full h-auto pointer-events-none" 
                style={{ objectFit: 'contain' }}
                draggable={false}
            />
            {isSelected && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-0.5 rounded shadow whitespace-nowrap z-20">
                    {Math.round(data.x)}%, {Math.round(data.y)}%
                </div>
            )}
        </div>
    );
}

// Draggable QR Code Element Component
function DraggableQrElement({ data, isSelected, onSelect, onChange, containerRef }) {
    if (!data.visible) return null;

    const handlePointerDown = (e) => {
        e.preventDefault();
        onSelect('qr_code');
        const containerRect = containerRef.current.getBoundingClientRect();
        
        const startX = e.clientX;
        const startY = e.clientY;
        const startDataX = data.x;
        const startDataY = data.y;

        const onPointerMove = (moveEvent) => {
            const dx = moveEvent.clientX - startX;
            const dy = moveEvent.clientY - startY;

            const percentX = (dx / containerRect.width) * 100;
            const percentY = (dy / containerRect.height) * 100;

            let newX = startDataX + percentX;
            let newY = startDataY + percentY;

            newX = Math.max(0, Math.min(100, newX));
            newY = Math.max(0, Math.min(100, newY));

            onChange('qr_code', { ...data, x: newX, y: newY });
        };

        const onPointerUp = () => {
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
        };

        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
    };

    return (
        <div 
            className={`absolute cursor-move ${isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-black/10' : 'hover:ring-1 hover:ring-gray-300'}`}
            style={{ 
                left: `${data.x}%`, 
                top: `${data.y}%`, 
                transform: 'translate(-50%, -50%)',
                width: `${data.width || 10}%`,
                userSelect: 'none',
                zIndex: isSelected ? 10 : 2,
                borderRadius: '4px',
                padding: '2px',
                backgroundColor: 'white',
                aspectRatio: '1/1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
            onPointerDown={handlePointerDown}
        >
            <div className="w-full h-full border-2 border-dashed border-gray-400 flex flex-col items-center justify-center p-1 font-mono text-[8px] sm:text-[10px] text-gray-500 text-center leading-tight">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-0.5 opacity-50"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><path d="M7 7h.01"></path><path d="M17 7h.01"></path><path d="M7 17h.01"></path><path d="M17 17h.01"></path></svg>
                QR CODE
            </div>
            {isSelected && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-0.5 rounded shadow whitespace-nowrap z-20">
                    {Math.round(data.x)}%, {Math.round(data.y)}%
                </div>
            )}
        </div>
    );
}




export default function CertificateDesigner({ template, course, other_templates = [] }) {
    const defaultLayout = {
        'student_name': {x: 50, y: 50, fontSize: 36, color: '#000000', align: 'center', fontFamily: 'sans-serif', fontWeight: 'bold'},
        'course_title': {x: 50, y: 60, fontSize: 24, color: '#4b5563', align: 'center', fontFamily: 'sans-serif', fontWeight: 'normal'},
        'date': {x: 50, y: 70, fontSize: 16, color: '#6b7280', align: 'center', fontFamily: 'sans-serif', fontWeight: 'normal'},
        'certificate_code': {x: 50, y: 80, fontSize: 12, color: '#9ca3af', align: 'center', fontFamily: 'monospace', fontWeight: 'normal'},
    };

    const defaultSignatureLayout = { x: 75, y: 85, width: 15 };
    const defaultQrLayout = { x: 15, y: 85, width: 12, visible: false };

    const initialLayout = template.layout_data || defaultLayout;
    // ensure layout has all expected keys (excluding signature which is stored separately in layout)
    const _l = { ...defaultLayout, ...initialLayout };

    // Extract signature & qr layout from layout_data if exists, otherwise use default
    const initialSignatureLayout = initialLayout.signature || defaultSignatureLayout;
    const initialQrLayout = initialLayout.qr_code || defaultQrLayout;

    const [layout, setLayout] = useState(_l);
    const [signatureLayout, setSignatureLayout] = useState(initialSignatureLayout);
    const [qrLayout, setQrLayout] = useState(initialQrLayout);
    const [selectedId, setSelectedId] = useState(null);
    const canvasRef = useRef(null);
    const [previewImage, setPreviewImage] = useState(template.background_image);
    const [signaturePreview, setSignaturePreview] = useState(template.signature_image);

    const [importSourceId, setImportSourceId] = useState(null);

    const { data, setData, post, processing, errors } = useForm({
        background_image: null,
        signature_image: null,
        layout_data: JSON.stringify({ ..._l, signature: initialSignatureLayout, qr_code: initialQrLayout }),
        import_source_id: null,
    });

    // Sync layout changes to form string
    useEffect(() => {
        const merged = { ...layout, signature: signatureLayout, qr_code: qrLayout };
        setData('layout_data', JSON.stringify(merged));
    }, [layout, signatureLayout, qrLayout]);

    // Handle Image changes
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('background_image', file);
            setPreviewImage(URL.createObjectURL(file));
            setImportSourceId(null); // Clear import source if manual change
            setData('import_source_id', null);
        }
    };

    const handleSignatureChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('signature_image', file);
            setSignaturePreview(URL.createObjectURL(file));
            setImportSourceId(null);
            setData('import_source_id', null);
        }
    };

    const removeSignature = () => {
        setData('signature_image', null);
        setSignaturePreview(null);
        if (selectedId === 'signature') setSelectedId(null);
        setImportSourceId(null);
        setData('import_source_id', null);
    };

    const updateElement = (id, newProps) => {
        if (id === 'signature') {
            setSignatureLayout(newProps);
        } else if (id === 'qr_code') {
            setQrLayout(newProps);
        } else {
            setLayout(prev => ({
                ...prev,
                [id]: newProps
            }));
        }
    };

    // --- Import Logic ---
    const handleImportDesign = (sourceCourseId) => {
        if (!sourceCourseId) return;
        const source = other_templates.find(t => t.id === parseInt(sourceCourseId));
        if (!source || !source.template) return;

        const sourceTemplate = source.template;
        const sourceLayout = sourceTemplate.layout_data || defaultLayout;

        // Apply Layouts
        setLayout({ ...defaultLayout, ...sourceLayout });
        setSignatureLayout(sourceLayout.signature || defaultSignatureLayout);
        setQrLayout(sourceLayout.qr_code || defaultQrLayout);

        // Apply Previews
        setPreviewImage(sourceTemplate.background_image);
        setSignaturePreview(sourceTemplate.signature_image);

        // Prep form for submission
        setImportSourceId(sourceCourseId);
        setData(d => ({
            ...d,
            import_source_id: sourceCourseId,
            background_image: null, // We are importing, not uploading
            signature_image: null,
        }));
        
        setSelectedId(null);
        // Toast feedback could be added here
    };

    const handleSave = (e) => {
        e.preventDefault();
        post(route('mentor.courses.certificate-template.update', course.id), { preserveScroll: true, forceFormData: true });
    };

    // Props editor helpers
    const isSignatureSelected = selectedId === 'signature';
    const isQrSelected = selectedId === 'qr_code';
    const currentEl = selectedId && !isSignatureSelected && !isQrSelected ? layout[selectedId] : null;

    const handlePropChange = (field, value) => {
        if (!selectedId) return;
        if (isSignatureSelected) {
            setSignatureLayout(prev => ({ ...prev, [field]: value }));
        } else if (isQrSelected) {
            setQrLayout(prev => ({ ...prev, [field]: value }));
        } else if (currentEl) {
            updateElement(selectedId, { ...currentEl, [field]: value });
        }
    };

    // Get text element keys (exclude signature and qr_code)
    const textElementKeys = Object.keys(layout).filter(k => k !== 'signature' && k !== 'qr_code');

    const handlePreview = () => {
        // First we should probably save if there's any pending change, or just preview current DB state.
        // It's safer to save first if possible, but let's just open the preview route in new tab.
        window.open(route('mentor.courses.certificate-template.preview', course.id), '_blank');
    };

    return (
        <DashboardLayout header={<h1 className="text-xl font-bold text-foreground">Edit Certificate Template : {course.title}</h1>}>
            <Head title="Certificate Designer" />
            
            <form onSubmit={handleSave} className="flex flex-col md:flex-row gap-6 h-[calc(100vh-140px)] min-h-[600px]">
                
                {/* Left: Canvas Area */}
                <div className="flex-1 bg-muted border border-border rounded-2xl overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-border bg-surface flex justify-between items-center z-10">
                        <div className="flex gap-4 items-center w-2/3">
                            <span className="text-sm font-bold text-gray-500">Design the certificate issued upon completion.</span>
                        </div>
                        <div className="flex gap-3">
                            <button type="button" onClick={() => router.get(route('mentor.courses.edit', course.id))} className="text-xs font-semibold text-gray-500 px-3 py-1.5 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                            <button type="button" onClick={handlePreview} className="text-xs font-bold text-primary bg-primary/10 px-4 py-2 hover:bg-primary/20 rounded-xl transition-colors">
                                Preview Result <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block ml-1 mb-0.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                            </button>
                            <button type="submit" disabled={processing} className="px-5 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow hover:bg-primary/90 disabled:opacity-50 transition-colors">
                                {processing ? 'Saving...' : 'Save Template'}
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto p-4 md:p-8 flex items-center justify-center bg-[#E5E5F7] relative" onClick={() => setSelectedId(null)}
                        style={{backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)', backgroundSize: '16px 16px'}}
                    >
                        {/* Canvas Container */}
                        <div 
                            className="bg-white shadow-2xl relative aspect-[1.414/1] w-full max-w-4xl overflow-hidden ring-1 ring-gray-900/10 group rounded-sm"
                            ref={canvasRef}
                            onClick={e => e.stopPropagation()}
                        >
                            {previewImage ? (
                                <img src={previewImage} alt="Certificate Background" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-300 m-8 rounded-2xl bg-gray-50">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-gray-300"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                                    <p className="text-sm font-bold text-gray-500">Upload Background Image</p>
                                    <p className="text-xs mt-1 text-gray-400">A4 Landscape format recommended</p>
                                </div>
                            )}

                            {/* Center Guidelines */}
                            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-30 transition-opacity">
                                <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-cyan-400" />
                                <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-cyan-400" />
                            </div>

                            {/* Render Text Draggables */}
                            {previewImage && textElementKeys.map(key => (
                                <DraggableElement 
                                    key={key} 
                                    id={key} 
                                    data={layout[key]} 
                                    isSelected={selectedId === key}
                                    onSelect={setSelectedId}
                                    onChange={updateElement}
                                    containerRef={canvasRef}
                                />
                            ))}

                            {/* Render Signature Image Draggable */}
                            {previewImage && signaturePreview && (
                                <DraggableSignatureElement
                                    data={signatureLayout}
                                    isSelected={isSignatureSelected}
                                    onSelect={setSelectedId}
                                    onChange={updateElement}
                                    containerRef={canvasRef}
                                    signaturePreview={signaturePreview}
                                />
                            )}

                            {/* Render QR Code Draggable */}
                            {previewImage && (
                                <DraggableQrElement
                                    data={qrLayout}
                                    isSelected={isQrSelected}
                                    onSelect={setSelectedId}
                                    onChange={updateElement}
                                    containerRef={canvasRef}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Inspector sidebar */}
                <div className="w-full md:w-80 bg-surface border border-border rounded-2xl flex flex-col overflow-hidden shadow-sm shrink-0">
                    <div className="p-4 border-b border-border bg-muted/50 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                        <h2 className="text-sm font-bold text-foreground">Template Settings</h2>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-5 space-y-6">
                        {/* Import from another course */}
                        <div className="space-y-3 p-3 bg-muted/50 border border-dashed border-border rounded-xl">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 11V7a5 5 0 0 1 10 0v4"></path><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M12 18v-3"></path></svg>
                                Import Design
                            </h3>
                            <div className="space-y-2">
                                {other_templates.length > 0 ? (
                                    <>
                                        <select 
                                            className="w-full px-3 py-1.5 text-xs bg-surface border border-border rounded-lg focus:outline-none focus:border-primary shadow-sm"
                                            onChange={(e) => handleImportDesign(e.target.value)}
                                            value={importSourceId || ""}
                                        >
                                            <option value="">Select a course to copy...</option>
                                            {other_templates.map(item => (
                                                <option key={item.id} value={item.id}>{item.title}</option>
                                            ))}
                                        </select>
                                        <p className="text-[9px] text-gray-400 leading-tight">Pick a course to copy its background, signature, and layout.</p>
                                    </>
                                ) : (
                                    <p className="text-[10px] text-gray-500 italic py-1">No other course templates found to import from.</p>
                                )}
                            </div>
                        </div>

                        {/* Background Upload */}
                        <div className="space-y-3">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Background Layer</h3>
                            <div>
                                <input 
                                    type="file" 
                                    id="bg-upload" 
                                    className="hidden" 
                                    accept="image/png, image/jpeg, image/webp"
                                    onChange={handleImageChange}
                                />
                                <label htmlFor="bg-upload" className="flex items-center justify-center w-full px-4 py-2 text-xs font-bold text-primary bg-primary/10 border border-primary/20 rounded-xl cursor-pointer hover:bg-primary/20 transition-colors shadow-sm uppercase tracking-tight">
                                    {previewImage ? 'Replace Image' : 'Upload Image'}
                                </label>
                                {errors.background_image && <p className="text-red-500 text-[10px] font-medium mt-1">{errors.background_image}</p>}
                            </div>
                        </div>

                        <hr className="border-gray-100" />

                        {/* Signature Image Upload */}
                        <div className="space-y-3">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 19.5v.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8.5L18 5.5"></path><path d="M16 2v4a2 2 0 0 0 2 2h4"></path><path d="M12 18v-6"></path><path d="m9 15 3 3 3-3"></path></svg>
                                Signature Image
                            </h3>
                            
                            {signaturePreview ? (
                                <div className="space-y-2">
                                    <div className="relative bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-center justify-center">
                                        <img 
                                            src={signaturePreview} 
                                            alt="Signature Preview" 
                                            className="max-h-16 object-contain"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <input 
                                                type="file" 
                                                id="sig-upload" 
                                                className="hidden" 
                                                accept="image/png, image/jpeg, image/webp"
                                                onChange={handleSignatureChange}
                                            />
                                            <label htmlFor="sig-upload" className="flex items-center justify-center w-full px-3 py-1.5 text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 rounded-lg cursor-pointer hover:bg-primary/20 transition-colors">
                                                Replace
                                            </label>
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={removeSignature}
                                            className="px-3 py-1.5 text-[10px] font-bold text-red-500 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-colors"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <input 
                                        type="file" 
                                        id="sig-upload" 
                                        className="hidden" 
                                        accept="image/png, image/jpeg, image/webp"
                                        onChange={handleSignatureChange}
                                    />
                                    <label htmlFor="sig-upload" className="flex items-center justify-center w-full px-4 py-2.5 text-xs font-bold text-gray-500 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 hover:border-gray-300 transition-colors group">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-gray-400 group-hover:text-gray-500 transition-colors"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                        Upload Signature
                                    </label>
                                </div>
                            )}
                            {errors.signature_image && <p className="text-red-500 text-[10px] font-medium mt-1">{errors.signature_image}</p>}
                            <p className="text-[9px] text-gray-400 leading-tight">Upload a signature image (PNG with transparent background recommended). Drag to position on the canvas.</p>
                        </div>

                        <hr className="border-gray-100" />

                        {/* Validation QR Code Settings */}
                        <div className="space-y-3">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><path d="M7 7h.01"></path><path d="M17 7h.01"></path><path d="M7 17h.01"></path><path d="M17 17h.01"></path></svg>
                                    Validation QR Code
                                </span>
                                <label className="inline-flex relative items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer" 
                                        checked={qrLayout.visible || false}
                                        onChange={(e) => {
                                            const isVisible = e.target.checked;
                                            setQrLayout(prev => ({ ...prev, visible: isVisible }));
                                            if (isVisible) setSelectedId('qr_code');
                                            else if (selectedId === 'qr_code') setSelectedId(null);
                                        }}
                                    />
                                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </h3>
                            <p className="text-[9px] text-gray-400 leading-tight">Enable a QR code that students and employers can scan to verify the certificate's authenticity.</p>
                        </div>

                        <hr className="border-gray-100" />

                        {/* Course Dependent Info */}
                        <div>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div>
                                    <span className="block text-sm font-bold text-foreground">Course Dependent</span>
                                    <span className="block text-[10px] text-gray-500 mt-0.5 leading-tight">This template is specific to {course.title}.</span>
                                </div>
                            </label>
                        </div>

                        <hr className="border-gray-100" />

                        {/* Selected Element Properties */}
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                {currentEl ? 'Editing Target' : isSignatureSelected ? 'Editing Signature' : 'Element Inspector'}
                            </h3>
                            
                            {!currentEl && !isSignatureSelected && (
                                <div className="text-xs text-gray-500 text-center py-6 bg-gray-50 rounded-xl border border-gray-100">
                                    Click an element on the canvas to edit its properties.
                                </div>
                            )}

                            {/* Signature Element Inspector */}
                            {isSignatureSelected && signaturePreview && (
                                <>
                                    <div className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs font-bold text-amber-700 mb-2 flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 19.5v.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8.5L18 5.5"></path><path d="M16 2v4a2 2 0 0 0 2 2h4"></path></svg>
                                        <span>Signature Image</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-3 gap-y-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-foreground/50 mb-1">X Position (%)</label>
                                            <input type="number" step="0.1" value={Math.round(signatureLayout.x * 10) / 10} onChange={e => handlePropChange('x', parseFloat(e.target.value) || 0)} className="w-full px-2.5 py-1.5 text-xs bg-muted border border-border rounded-lg focus:outline-none focus:border-primary focus:bg-surface font-mono shadow-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-foreground/50 mb-1">Y Position (%)</label>
                                            <input type="number" step="0.1" value={Math.round(signatureLayout.y * 10) / 10} onChange={e => handlePropChange('y', parseFloat(e.target.value) || 0)} className="w-full px-2.5 py-1.5 text-xs bg-muted border border-border rounded-lg focus:outline-none focus:border-primary focus:bg-surface font-mono shadow-sm" />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-[10px] font-bold text-foreground/50 mb-1">Width (%)</label>
                                            <input 
                                                type="range" 
                                                min="5" 
                                                max="40" 
                                                step="1" 
                                                value={signatureLayout.width || 15} 
                                                onChange={e => handlePropChange('width', parseInt(e.target.value))} 
                                                className="w-full accent-primary"
                                            />
                                            <div className="flex justify-between text-[9px] text-gray-400 mt-1">
                                                <span>Small</span>
                                                <span className="font-mono font-bold text-foreground/70">{signatureLayout.width || 15}%</span>
                                                <span>Large</span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* QR Code Element Inspector */}
                            {isQrSelected && (
                                <>
                                    <div className="px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-lg text-xs font-bold text-indigo-700 mb-2 flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><path d="M7 7h.01"></path><path d="M17 7h.01"></path><path d="M7 17h.01"></path><path d="M17 17h.01"></path></svg>
                                        <span>QR Code Validation</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-3 gap-y-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-foreground/50 mb-1">X Position (%)</label>
                                            <input type="number" step="0.1" value={Math.round(qrLayout.x * 10) / 10} onChange={e => handlePropChange('x', parseFloat(e.target.value) || 0)} className="w-full px-2.5 py-1.5 text-xs bg-muted border border-border rounded-lg focus:outline-none focus:border-primary focus:bg-surface font-mono shadow-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-foreground/50 mb-1">Y Position (%)</label>
                                            <input type="number" step="0.1" value={Math.round(qrLayout.y * 10) / 10} onChange={e => handlePropChange('y', parseFloat(e.target.value) || 0)} className="w-full px-2.5 py-1.5 text-xs bg-muted border border-border rounded-lg focus:outline-none focus:border-primary focus:bg-surface font-mono shadow-sm" />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-[10px] font-bold text-foreground/50 mb-1">Size (%)</label>
                                            <input 
                                                type="range" 
                                                min="5" 
                                                max="30" 
                                                step="1" 
                                                value={qrLayout.width || 10} 
                                                onChange={e => handlePropChange('width', parseInt(e.target.value))} 
                                                className="w-full accent-primary"
                                            />
                                            <div className="flex justify-between text-[9px] text-gray-400 mt-1">
                                                <span>Small</span>
                                                <span className="font-mono font-bold text-foreground/70">{qrLayout.width || 10}%</span>
                                                <span>Large</span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Text Element Inspector */}
                            {currentEl && (
                                <>
                                    <div className="px-3 py-2 bg-primary/5 border border-primary/20 rounded-lg text-xs font-bold text-primary mb-2 flex items-center justify-between">
                                        <span>[{selectedId.replace('_', ' ').toUpperCase()}]</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-3 gap-y-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-foreground/50 mb-1">X Position (%)</label>
                                            <input type="number" step="0.1" value={Math.round(currentEl.x * 10) / 10} onChange={e => handlePropChange('x', parseFloat(e.target.value) || 0)} className="w-full px-2.5 py-1.5 text-xs bg-muted border border-border rounded-lg focus:outline-none focus:border-primary focus:bg-surface font-mono shadow-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-foreground/50 mb-1">Y Position (%)</label>
                                            <input type="number" step="0.1" value={Math.round(currentEl.y * 10) / 10} onChange={e => handlePropChange('y', parseFloat(e.target.value) || 0)} className="w-full px-2.5 py-1.5 text-xs bg-muted border border-border rounded-lg focus:outline-none focus:border-primary focus:bg-surface font-mono shadow-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-foreground/50 mb-1">Font Size (px)</label>
                                            <input type="number" value={currentEl.fontSize} onChange={e => handlePropChange('fontSize', parseInt(e.target.value) || 10)} className="w-full px-2.5 py-1.5 text-xs bg-muted border border-border rounded-lg focus:outline-none focus:border-primary focus:bg-surface shadow-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-foreground/50 mb-1">Text Color</label>
                                            <div className="flex items-center gap-1.5 bg-muted border border-border rounded-lg pr-2 overflow-hidden shadow-sm focus-within:border-primary focus-within:bg-surface transition-colors">
                                                <input type="color" value={currentEl.color} onChange={e => handlePropChange('color', e.target.value)} className="w-8 h-8 cursor-pointer border-0 bg-transparent" />
                                                <input type="text" value={currentEl.color} onChange={e => handlePropChange('color', e.target.value)} className="w-full bg-transparent text-xs outline-none uppercase font-mono" />
                                            </div>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-[10px] font-bold text-gray-500 mb-1">Font Family</label>
                                            <select value={currentEl.fontFamily || 'sans-serif'} onChange={e => handlePropChange('fontFamily', e.target.value)} className="w-full px-2.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:bg-white shadow-sm">
                                                <option value="sans-serif">Sans Serif (Inter/Roboto)</option>
                                                <option value="serif">Serif (Times/Georgia)</option>
                                                <option value="monospace">Monospace</option>
                                                <option value="'Courier New', Courier, monospace">Courier New</option>
                                                <option value="'Times New Roman', Times, serif">Times New Roman</option>
                                                <option value="Arial, sans-serif">Arial</option>
                                            </select>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-[10px] font-bold text-gray-500 mb-1">Font Weight</label>
                                            <select value={currentEl.fontWeight || 'normal'} onChange={e => handlePropChange('fontWeight', e.target.value)} className="w-full px-2.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:bg-white shadow-sm">
                                                <option value="normal">Normal (400)</option>
                                                <option value="bold">Bold (700)</option>
                                                <option value="100">Thin (100)</option>
                                                <option value="300">Light (300)</option>
                                                <option value="500">Medium (500)</option>
                                                <option value="900">Black (900)</option>
                                            </select>
                                        </div>
                                        <div className="col-span-2 pt-2 border-t border-gray-100">
                                            <label className="block text-[10px] font-bold text-gray-500 mb-2">Text Alignment Anchor</label>
                                            <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
                                                {['left', 'center', 'right'].map(align => (
                                                    <button 
                                                        key={align} type="button" 
                                                        onClick={() => handlePropChange('align', align)}
                                                        className={`flex-1 py-1.5 px-2 text-[10px] font-bold rounded uppercase transition-colors shadow-sm ${currentEl.align === align ? 'bg-white text-primary ring-1 ring-gray-900/5' : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'}`}
                                                    >
                                                        {align}
                                                    </button>
                                                ))}
                                            </div>
                                            <p className="text-[9px] text-gray-400 mt-2 leading-tight">Controls which edge aligns to the X coordinate.</p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </form>
        </DashboardLayout>
    );
}
