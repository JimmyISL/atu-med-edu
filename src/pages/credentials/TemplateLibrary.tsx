import { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, FileText, X, ArrowLeft, Trash2, Save, Upload, GripVertical } from 'lucide-react';
import { api } from '../../api';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Template {
  id: number;
  name: string;
  category: string;
  status: string;
  image_url?: string;
  field_placements?: FieldPlacement[];
}

interface FieldPlacement {
  id: string;
  label: string;
  type: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  fontSize: number;
}

type ViewMode = 'grid' | 'editor';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const INITIAL_FORM = {
  name: '',
  category: 'Category 1',
  description: '',
};

const FIELD_PRESETS: { type: string; label: string }[] = [
  { type: 'recipient_name', label: 'Recipient Name' },
  { type: 'course_name', label: 'Course Name' },
  { type: 'signature', label: 'Signature' },
  { type: 'date', label: 'Date' },
  { type: 'credential_number', label: 'Credential Number' },
  { type: 'custom', label: 'Custom' },
];

const FIELD_COLORS: Record<string, string> = {
  recipient_name: '#FACC15',
  course_name: '#38BDF8',
  signature: '#A78BFA',
  date: '#34D399',
  credential_number: '#FB923C',
  custom: '#F472B6',
};

function generateId() {
  return `field_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/* ================================================================== */
/*  Component                                                          */
/* ================================================================== */

export default function TemplateLibrary() {
  /* ---- shared state ---- */
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  /* ---- upload modal ---- */
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ---- editor state ---- */
  const [activeTemplate, setActiveTemplate] = useState<Template | null>(null);
  const [fields, setFields] = useState<FieldPlacement[]>([]);
  const [draggingFieldId, setDraggingFieldId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showPresetMenu, setShowPresetMenu] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  /* ---------------------------------------------------------------- */
  /*  Fetching                                                         */
  /* ---------------------------------------------------------------- */

  const fetchTemplates = useCallback(() => {
    setLoading(true);
    api.credentials
      .templates()
      .then((data: Template[]) => setTemplates(data))
      .catch(() => setTemplates([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  /* ---------------------------------------------------------------- */
  /*  File selection preview                                           */
  /* ---------------------------------------------------------------- */

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => setFilePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  /* ---------------------------------------------------------------- */
  /*  Upload + create template                                         */
  /* ---------------------------------------------------------------- */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    setSubmitting(true);
    try {
      const upload = await api.credentials.uploadFile(selectedFile, 'credentials');
      const created = await api.credentials.createTemplate({
        ...form,
        image_url: upload.url,
      });
      setShowModal(false);
      setForm(INITIAL_FORM);
      setSelectedFile(null);
      setFilePreview(null);
      fetchTemplates();
      // Open the editor for the new template
      openEditor({ ...created, field_placements: created.field_placements || [] });
    } catch {
      // keep modal open on error
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------------------------------------------------------- */
  /*  Editor helpers                                                    */
  /* ---------------------------------------------------------------- */

  const openEditor = (template: Template) => {
    setActiveTemplate(template);
    setFields(template.field_placements ?? []);
    setViewMode('editor');
  };

  const closeEditor = () => {
    setViewMode('grid');
    setActiveTemplate(null);
    setFields([]);
    setDraggingFieldId(null);
    fetchTemplates();
  };

  /* ---- click on image to add field ---- */
  const handleImageClick = (e: React.MouseEvent) => {
    if (draggingFieldId) return; // was dragging, ignore
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    // add a custom field at this position
    const newField: FieldPlacement = {
      id: generateId(),
      label: 'Custom',
      type: 'custom',
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
      fontSize: 16,
    };
    setFields((prev) => [...prev, newField]);
  };

  /* ---- dragging ---- */
  const handleMouseDown = (fieldId: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingFieldId(fieldId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingFieldId || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setFields((prev) => prev.map((f) => (f.id === draggingFieldId ? { ...f, x, y } : f)));
  };

  const handleMouseUp = () => {
    setDraggingFieldId(null);
  };

  /* ---- add preset field ---- */
  const addPresetField = (preset: { type: string; label: string }) => {
    const newField: FieldPlacement = {
      id: generateId(),
      label: preset.label,
      type: preset.type,
      x: 50,
      y: 50,
      fontSize: 16,
    };
    setFields((prev) => [...prev, newField]);
    setShowPresetMenu(false);
  };

  /* ---- update field property ---- */
  const updateField = (id: string, key: keyof FieldPlacement, value: string | number) => {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, [key]: value } : f)));
  };

  /* ---- delete field ---- */
  const deleteField = (id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
  };

  /* ---- save ---- */
  const handleSave = async () => {
    if (!activeTemplate) return;
    setSaving(true);
    try {
      await api.credentials.updateTemplate(activeTemplate.id, { field_placements: fields });
    } catch {
      // silent for now
    } finally {
      setSaving(false);
    }
  };

  /* ================================================================ */
  /*  RENDER: Editor View                                              */
  /* ================================================================ */

  if (viewMode === 'editor' && activeTemplate) {
    return (
      <div className="flex flex-col h-full">
        {/* Top bar */}
        <div className="border-b border-[var(--color-border)] bg-[var(--color-background)] px-[32px] py-[16px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-[16px]">
              <button
                onClick={closeEditor}
                className="flex items-center gap-[6px] rounded-[8px] border border-[var(--color-border)] bg-[var(--color-card)] px-[12px] py-[8px] text-[13px] font-mono text-[var(--color-foreground)] transition-colors hover:bg-[var(--color-secondary)]"
              >
                <ArrowLeft className="h-[14px] w-[14px]" />
                BACK
              </button>
              <div>
                <h1 className="font-headline text-[20px] font-bold tracking-tight text-[var(--color-foreground)]">
                  {activeTemplate.name}
                </h1>
                <p className="text-[12px] font-mono text-[var(--color-muted-foreground)]">
                  Click on the image to place fields. Drag markers to reposition.
                </p>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-[8px] rounded-[8px] bg-[var(--color-primary)] px-[16px] py-[10px] text-[14px] font-mono font-medium text-[var(--color-primary-foreground)] transition-colors hover:opacity-90 disabled:opacity-50"
            >
              <Save className="h-[16px] w-[16px]" />
              {saving ? 'SAVING...' : 'SAVE TEMPLATE'}
            </button>
          </div>
        </div>

        {/* Editor body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: image + field markers (2/3) */}
          <div className="w-2/3 overflow-auto bg-[var(--color-secondary)] p-[24px] flex items-start justify-center">
            <div
              ref={containerRef}
              className="relative inline-block select-none"
              style={{ maxWidth: '100%' }}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onClick={handleImageClick}
            >
              {activeTemplate.image_url ? (
                <img
                  src={activeTemplate.image_url}
                  alt={activeTemplate.name}
                  className="block w-full rounded-[4px] shadow-lg"
                  draggable={false}
                />
              ) : (
                <div className="flex h-[500px] w-[700px] items-center justify-center rounded-[4px] border-2 border-dashed border-[var(--color-border)] bg-[var(--color-card)]">
                  <div className="text-center">
                    <FileText className="mx-auto h-[48px] w-[48px] text-[var(--color-muted-foreground)]" />
                    <p className="mt-[8px] text-[14px] font-mono text-[var(--color-muted-foreground)]">
                      No image uploaded
                    </p>
                  </div>
                </div>
              )}

              {/* Field markers */}
              {fields.map((field) => (
                <div
                  key={field.id}
                  onMouseDown={handleMouseDown(field.id)}
                  className="absolute flex items-center gap-[4px] cursor-grab active:cursor-grabbing select-none"
                  style={{
                    left: `${field.x}%`,
                    top: `${field.y}%`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: draggingFieldId === field.id ? 50 : 10,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    className="flex items-center gap-[4px] rounded-full px-[10px] py-[4px] text-[11px] font-mono font-semibold whitespace-nowrap shadow-md border border-black/10"
                    style={{
                      backgroundColor: FIELD_COLORS[field.type] || '#FACC15',
                      color: '#09090B',
                    }}
                  >
                    <GripVertical className="h-[10px] w-[10px] opacity-60" />
                    {field.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: field config panel (1/3) */}
          <div className="w-1/3 border-l border-[var(--color-border)] bg-[var(--color-background)] flex flex-col">
            {/* Panel header */}
            <div className="border-b border-[var(--color-border)] px-[20px] py-[16px] flex items-center justify-between">
              <h2 className="font-headline text-[16px] font-bold text-[var(--color-foreground)]">
                FIELD PLACEMENTS
              </h2>
              <div className="relative">
                <button
                  onClick={() => setShowPresetMenu(!showPresetMenu)}
                  className="flex items-center gap-[4px] rounded-[6px] bg-[var(--color-primary)] px-[10px] py-[6px] text-[12px] font-mono font-medium text-[var(--color-primary-foreground)] transition-colors hover:opacity-90"
                >
                  <Plus className="h-[12px] w-[12px]" />
                  ADD FIELD
                </button>
                {showPresetMenu && (
                  <div className="absolute right-0 top-full mt-[4px] z-50 w-[200px] rounded-[8px] border border-[var(--color-border)] bg-[var(--color-card)] py-[4px] shadow-xl">
                    {FIELD_PRESETS.map((preset) => (
                      <button
                        key={preset.type}
                        onClick={() => addPresetField(preset)}
                        className="flex w-full items-center gap-[8px] px-[12px] py-[8px] text-left text-[13px] font-mono text-[var(--color-foreground)] transition-colors hover:bg-[var(--color-secondary)]"
                      >
                        <span
                          className="inline-block h-[8px] w-[8px] rounded-full"
                          style={{ backgroundColor: FIELD_COLORS[preset.type] || '#FACC15' }}
                        />
                        {preset.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Field list */}
            <div className="flex-1 overflow-auto px-[20px] py-[16px] space-y-[12px]">
              {fields.length === 0 && (
                <p className="text-center text-[13px] font-mono text-[var(--color-muted-foreground)] py-[32px]">
                  No fields placed yet. Click on the image or use &quot;ADD FIELD&quot; to get started.
                </p>
              )}

              {fields.map((field) => (
                <div
                  key={field.id}
                  className="rounded-[8px] border border-[var(--color-border)] bg-[var(--color-card)] p-[12px]"
                >
                  {/* color bar + label */}
                  <div className="flex items-center gap-[8px] mb-[10px]">
                    <span
                      className="inline-block h-[10px] w-[10px] rounded-full flex-shrink-0"
                      style={{ backgroundColor: FIELD_COLORS[field.type] || '#FACC15' }}
                    />
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => updateField(field.id, 'label', e.target.value)}
                      className="flex-1 rounded-[4px] border border-[var(--color-border)] bg-[var(--color-background)] px-[8px] py-[4px] text-[13px] font-mono text-[var(--color-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-accent)]"
                    />
                    <button
                      onClick={() => deleteField(field.id)}
                      className="flex h-[24px] w-[24px] items-center justify-center rounded-[4px] text-red-500 transition-colors hover:bg-red-50"
                    >
                      <Trash2 className="h-[12px] w-[12px]" />
                    </button>
                  </div>

                  {/* position + fontSize */}
                  <div className="grid grid-cols-3 gap-[8px]">
                    <div>
                      <label className="mb-[2px] block text-[10px] font-mono uppercase text-[var(--color-muted-foreground)]">
                        X %
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={0.1}
                        value={Math.round(field.x * 10) / 10}
                        onChange={(e) => updateField(field.id, 'x', Number(e.target.value))}
                        className="w-full rounded-[4px] border border-[var(--color-border)] bg-[var(--color-background)] px-[6px] py-[4px] text-[12px] font-mono text-[var(--color-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-accent)]"
                      />
                    </div>
                    <div>
                      <label className="mb-[2px] block text-[10px] font-mono uppercase text-[var(--color-muted-foreground)]">
                        Y %
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={0.1}
                        value={Math.round(field.y * 10) / 10}
                        onChange={(e) => updateField(field.id, 'y', Number(e.target.value))}
                        className="w-full rounded-[4px] border border-[var(--color-border)] bg-[var(--color-background)] px-[6px] py-[4px] text-[12px] font-mono text-[var(--color-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-accent)]"
                      />
                    </div>
                    <div>
                      <label className="mb-[2px] block text-[10px] font-mono uppercase text-[var(--color-muted-foreground)]">
                        SIZE
                      </label>
                      <input
                        type="number"
                        min={8}
                        max={72}
                        value={field.fontSize}
                        onChange={(e) => updateField(field.id, 'fontSize', Number(e.target.value))}
                        className="w-full rounded-[4px] border border-[var(--color-border)] bg-[var(--color-background)] px-[6px] py-[4px] text-[12px] font-mono text-[var(--color-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-accent)]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ================================================================ */
  /*  RENDER: Template Grid (default view)                             */
  /* ================================================================ */

  return (
    <div className="flex flex-col h-full">
      {/* TopBar */}
      <div className="border-b border-[var(--color-border)] bg-[var(--color-background)] px-[32px] py-[24px]">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-headline text-[24px] font-bold tracking-tight text-[var(--color-foreground)]">
              CREDENTIAL TEMPLATES
            </h1>
            <p className="mt-[4px] text-[14px] font-mono text-[var(--color-muted-foreground)]">
              Manage certificate templates and field placements.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-[8px] rounded-[8px] bg-[var(--color-primary)] px-[16px] py-[10px] text-[14px] font-mono font-medium text-[var(--color-primary-foreground)] transition-colors hover:opacity-90"
          >
            <Upload className="h-[16px] w-[16px]" />
            UPLOAD TEMPLATE
          </button>
        </div>
      </div>

      {/* Template Grid */}
      <div className="flex-1 overflow-auto bg-[var(--color-background)] px-[32px] py-[24px]">
        {loading ? (
          <div className="flex items-center justify-center py-[48px]">
            <p className="text-[14px] font-mono text-[var(--color-muted-foreground)]">Loading templates...</p>
          </div>
        ) : templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-[64px]">
            <FileText className="h-[48px] w-[48px] text-[var(--color-muted-foreground)] mb-[16px]" />
            <p className="text-[16px] font-mono text-[var(--color-muted-foreground)]">No templates yet</p>
            <p className="text-[13px] font-mono text-[var(--color-muted-foreground)] mt-[4px]">
              Upload a credential image to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-[24px]">
            {templates.map((template) => (
              <div
                key={template.id}
                onClick={() => openEditor(template)}
                className="group cursor-pointer rounded-[8px] border border-[var(--color-border)] bg-[var(--color-card)] transition-all hover:border-[var(--color-brand-accent)] hover:shadow-lg"
              >
                {/* Preview Area */}
                <div className="relative h-[180px] overflow-hidden rounded-t-[8px] border-b border-[var(--color-border)] bg-[var(--color-secondary)]">
                  {template.image_url ? (
                    <img
                      src={template.image_url}
                      alt={template.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <div className="flex h-[80px] w-[80px] items-center justify-center rounded-[12px] bg-[var(--color-card)] border border-[var(--color-border)] transition-all group-hover:border-[var(--color-brand-accent)]">
                        <FileText className="h-[40px] w-[40px] text-[var(--color-brand-accent)]" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Template Info */}
                <div className="p-[20px]">
                  <h3 className="text-[16px] font-headline font-semibold text-[var(--color-foreground)] mb-[8px]">
                    {template.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex rounded-[6px] bg-[#FACC15] px-[8px] py-[4px] text-[12px] font-mono font-semibold uppercase text-[#09090B]">
                      {template.category}
                    </span>
                    <span className="inline-flex rounded-[6px] bg-green-50 px-[8px] py-[4px] text-[12px] font-mono font-semibold uppercase text-green-600">
                      {template.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Template Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-[520px] rounded-[12px] border border-[var(--color-border)] bg-[var(--color-card)] shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-[24px] py-[16px]">
              <h2 className="font-headline text-[18px] font-bold text-[var(--color-foreground)]">
                Upload Template
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setForm(INITIAL_FORM);
                  setSelectedFile(null);
                  setFilePreview(null);
                }}
                className="flex h-[32px] w-[32px] items-center justify-center rounded-[6px] text-[var(--color-muted-foreground)] transition-colors hover:bg-[var(--color-secondary)]"
              >
                <X className="h-[18px] w-[18px]" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="space-y-[16px] px-[24px] py-[20px]">
              {/* Name */}
              <div>
                <label className="mb-[6px] block text-[12px] font-mono font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  Template Name
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-[8px] border border-[var(--color-border)] bg-[var(--color-background)] px-[12px] py-[10px] text-[14px] font-mono text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-accent)]"
                  placeholder="e.g. CME Certificate of Completion"
                />
              </div>

              {/* Category */}
              <div>
                <label className="mb-[6px] block text-[12px] font-mono font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full rounded-[8px] border border-[var(--color-border)] bg-[var(--color-background)] px-[12px] py-[10px] text-[14px] font-mono text-[var(--color-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-accent)]"
                >
                  <option value="Category 1">Category 1</option>
                  <option value="Category 2">Category 2</option>
                </select>
              </div>

              {/* Image Upload */}
              <div>
                <label className="mb-[6px] block text-[12px] font-mono font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  Credential Image
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {filePreview ? (
                  <div className="relative">
                    <img
                      src={filePreview}
                      alt="Preview"
                      className="w-full rounded-[8px] border border-[var(--color-border)] object-contain max-h-[200px]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setFilePreview(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="absolute top-[8px] right-[8px] flex h-[24px] w-[24px] items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
                    >
                      <X className="h-[12px] w-[12px]" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex w-full items-center justify-center gap-[8px] rounded-[8px] border-2 border-dashed border-[var(--color-border)] bg-[var(--color-background)] px-[16px] py-[32px] text-[14px] font-mono text-[var(--color-muted-foreground)] transition-colors hover:border-[var(--color-brand-accent)] hover:text-[var(--color-foreground)]"
                  >
                    <Upload className="h-[20px] w-[20px]" />
                    Click to select an image (JPG / PNG)
                  </button>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="mb-[6px] block text-[12px] font-mono font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-[8px] border border-[var(--color-border)] bg-[var(--color-background)] px-[12px] py-[10px] text-[14px] font-mono text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-accent)]"
                  placeholder="Optional description..."
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-[12px] pt-[8px]">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setForm(INITIAL_FORM);
                    setSelectedFile(null);
                    setFilePreview(null);
                  }}
                  className="rounded-[8px] border border-[var(--color-border)] bg-[var(--color-card)] px-[16px] py-[10px] text-[14px] font-mono font-medium text-[var(--color-foreground)] transition-colors hover:bg-[var(--color-secondary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !selectedFile}
                  className="rounded-[8px] bg-[var(--color-primary)] px-[16px] py-[10px] text-[14px] font-mono font-medium text-[var(--color-primary-foreground)] transition-colors hover:opacity-90 disabled:opacity-50"
                >
                  {submitting ? 'Uploading...' : 'Upload & Continue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
