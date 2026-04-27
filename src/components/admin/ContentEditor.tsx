"use client";

import { useState, useRef, useEffect } from "react";
import type { JobListing, Tender, BlogPost } from "@/lib/sheets";

// ── Types ─────────────────────────────────────────────────────────────────────

type ContentType = "job" | "tender" | "blog";

type EditorData = Partial<JobListing & Tender & BlogPost & { _originalKey?: string }>;

interface Props {
  type: ContentType;
  initial?: EditorData | null;
  onClose: () => void;
  onSaved: () => void;
}

// ── Small shared UI ───────────────────────────────────────────────────────────

function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-1.5">
      <span className="text-xs font-bold text-[#1A1A2E] uppercase tracking-wider">{children}</span>
      {hint && <p className="text-[11px] text-gray-400 mt-0.5 italic">{hint}</p>}
    </div>
  );
}

function Field({ children }: { children: React.ReactNode }) {
  return <div className="mb-5">{children}</div>;
}

function TextInput({ value, onChange, placeholder }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#1A56A0]/30 focus:border-[#1A56A0] bg-white placeholder-gray-300 transition"
    />
  );
}

function SelectInput({ value, onChange, options }: {
  value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#1A56A0]/30 focus:border-[#1A56A0] bg-white transition appearance-none"
    >
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function RichArea({ value, onChange, placeholder, rows = 6 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Sync external value → DOM (only on mount or external change, not while typing)
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function execCmd(cmd: string, val?: string) {
    document.execCommand(cmd, false, val);
    ref.current?.focus();
    onChange(ref.current?.innerHTML ?? "");
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#1A56A0]/30 focus-within:border-[#1A56A0] transition">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 bg-[#F8F9FB] border-b border-gray-100 flex-wrap">
        {[
          { label: "B",  title: "Bold",          cmd: "bold",          cls: "font-black" },
          { label: "I",  title: "Italic",         cmd: "italic",        cls: "italic" },
          { label: "U",  title: "Underline",      cmd: "underline",     cls: "underline" },
        ].map(({ label, title, cmd, cls }) => (
          <button key={cmd} title={title} onMouseDown={e => { e.preventDefault(); execCmd(cmd); }}
            className={`w-7 h-7 text-xs text-gray-600 hover:bg-white hover:text-[#1A56A0] rounded transition flex items-center justify-center ${cls}`}>
            {label}
          </button>
        ))}
        <div className="w-px h-4 bg-gray-200 mx-1" />
        {[
          { icon: "≡", title: "Align left",  cmd: "justifyLeft" },
          { icon: "≡", title: "Align center",cmd: "justifyCenter" },
        ].map(({ icon, title, cmd }) => (
          <button key={cmd} title={title} onMouseDown={e => { e.preventDefault(); execCmd(cmd); }}
            className="w-7 h-7 text-xs text-gray-600 hover:bg-white hover:text-[#1A56A0] rounded transition flex items-center justify-center">
            {icon}
          </button>
        ))}
        <div className="w-px h-4 bg-gray-200 mx-1" />
        {[
          { icon: "•", title: "Bullet list",   cmd: "insertUnorderedList" },
          { icon: "1.", title: "Numbered list", cmd: "insertOrderedList" },
        ].map(({ icon, title, cmd }) => (
          <button key={cmd} title={title} onMouseDown={e => { e.preventDefault(); execCmd(cmd); }}
            className="w-7 h-7 text-xs text-gray-600 hover:bg-white hover:text-[#1A56A0] rounded transition flex items-center justify-center">
            {icon}
          </button>
        ))}
        <div className="w-px h-4 bg-gray-200 mx-1" />
        <button title="Insert link" onMouseDown={e => {
          e.preventDefault();
          const url = prompt("URL:");
          if (url) execCmd("createLink", url);
        }} className="w-7 h-7 text-xs text-gray-600 hover:bg-white hover:text-[#1A56A0] rounded transition flex items-center justify-center">
          🔗
        </button>
      </div>
      {/* Editable area */}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={() => onChange(ref.current?.innerHTML ?? "")}
        data-placeholder={placeholder}
        style={{ minHeight: `${rows * 1.6}rem` }}
        className="px-3.5 py-3 text-sm text-[#1A1A2E] leading-relaxed focus:outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-300 empty:before:pointer-events-none"
      />
    </div>
  );
}

// ── Status pill + workflow ────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  draft:     { label: "Draft",     color: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",   dot: "bg-amber-400" },
  open:      { label: "Open",      color: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200", dot: "bg-emerald-500" },
  published: { label: "Published", color: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200", dot: "bg-emerald-500" },
  closed:    { label: "Closed",    color: "bg-red-50 text-red-700 ring-1 ring-red-200",         dot: "bg-red-400" },
};

function StatusPill({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: "bg-gray-100 text-gray-500 ring-1 ring-gray-200", dot: "bg-gray-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ── Editor forms ──────────────────────────────────────────────────────────────

function JobForm({ data, onChange }: { data: EditorData; onChange: (d: EditorData) => void }) {
  const f = <K extends keyof EditorData>(k: K) => (v: string) => onChange({ ...data, [k]: v });
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <Field>
          <Label hint="Full job title as it will appear publicly">Job Title</Label>
          <TextInput value={data.job_title ?? ""} onChange={f("job_title")} placeholder="e.g. Senior Credit Officer" />
        </Field>
        <Field>
          <Label hint="Internal department or division">Department</Label>
          <TextInput value={data.department ?? ""} onChange={f("department")} placeholder="e.g. Retail Banking" />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field>
          <Label hint="City / branch location">Location</Label>
          <TextInput value={data.location ?? ""} onChange={f("location")} placeholder="e.g. Dar es Salaam" />
        </Field>
        <Field>
          <Label>Employment Type</Label>
          <SelectInput value={data.job_type ?? "full-time"} onChange={f("job_type")}
            options={["full-time","part-time","contract","internship"]} />
        </Field>
      </div>
      <Field>
        <Label hint="Last date candidates can apply (YYYY-MM-DD)">Application Deadline</Label>
        <TextInput value={data.apply_by_date ?? ""} onChange={f("apply_by_date")} placeholder="2026-05-31" />
      </Field>
      <Field>
        <Label hint="Role overview — what the candidate will do day-to-day">Job Description</Label>
        <RichArea value={data.description ?? ""} onChange={f("description")}
          placeholder="Describe the role, responsibilities, and reporting structure..." rows={7} />
      </Field>
      <Field>
        <Label hint="Qualifications, experience, and skills required">Requirements</Label>
        <RichArea value={data.requirements ?? ""} onChange={f("requirements")}
          placeholder="List degree requirements, years of experience, certifications..." rows={5} />
      </Field>
    </>
  );
}

function TenderForm({ data, onChange }: { data: EditorData; onChange: (d: EditorData) => void }) {
  const f = <K extends keyof EditorData>(k: K) => (v: string) => onChange({ ...data, [k]: v });
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <Field>
          <Label hint="Unique reference code for this tender">Tender Reference</Label>
          <TextInput value={data.tender_ref ?? ""} onChange={f("tender_ref")} placeholder="e.g. CBT/2026/001" />
        </Field>
        <Field>
          <Label>Category</Label>
          <SelectInput value={data.category ?? "Goods"} onChange={f("category")}
            options={["Goods","Services","Works","Consultancy"]} />
        </Field>
      </div>
      <Field>
        <Label hint="Full descriptive title as it will appear on the website">Tender Title</Label>
        <TextInput value={data.tender_title ?? ""} onChange={f("tender_title")}
          placeholder="e.g. Supply and Installation of ATM Machines" />
      </Field>
      <Field>
        <Label>Contract Type</Label>
        <SelectInput value={data.contract_type ?? "Fixed Price"} onChange={f("contract_type")}
          options={["Fixed Price","Framework","BOQ","Time & Material"]} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field>
          <Label hint="Date the tender was / will be published (YYYY-MM-DD)">Published Date</Label>
          <TextInput value={data.published_date ?? ""} onChange={f("published_date")} placeholder="2026-04-27" />
        </Field>
        <Field>
          <Label hint="Deadline for submissions (YYYY-MM-DD)">Closing Date</Label>
          <TextInput value={data.closing_date ?? ""} onChange={f("closing_date")} placeholder="2026-05-27" />
        </Field>
      </div>
      <Field>
        <Label hint="Full scope description for prospective bidders">Description</Label>
        <RichArea value={data.description ?? ""} onChange={f("description")}
          placeholder="Describe the scope of work, eligibility criteria, and key deliverables..." rows={6} />
      </Field>
      <Field>
        <Label hint="Public link to the tender document (PDF or Google Drive)">Document URL</Label>
        <TextInput value={data.document_url ?? ""} onChange={f("document_url")} placeholder="https://..." />
      </Field>
    </>
  );
}

function BlogForm({ data, onChange }: { data: EditorData; onChange: (d: EditorData) => void }) {
  const f = <K extends keyof EditorData>(k: K) => (v: string) => onChange({ ...data, [k]: v });
  return (
    <>
      <Field>
        <Label hint="URL-safe identifier — lowercase letters, numbers, and hyphens only">Slug</Label>
        <TextInput value={data.slug ?? ""} onChange={f("slug")} placeholder="e.g. coopbank-launches-mobile-banking" />
      </Field>
      <Field>
        <Label hint="Headline as it will appear in listings and the browser tab">Title</Label>
        <TextInput value={data.title ?? ""} onChange={f("title")} placeholder="Enter post title..." />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field>
          <Label>Category</Label>
          <SelectInput value={data.category ?? "News"} onChange={f("category")}
            options={["News","Updates","Products","Careers","Community","Financial Literacy"]} />
        </Field>
        <Field>
          <Label>Author</Label>
          <TextInput value={data.author ?? ""} onChange={f("author")} placeholder="e.g. Communications Team" />
        </Field>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Field>
          <Label hint="Date to make the post visible (YYYY-MM-DD)">Publish Date</Label>
          <TextInput value={data.publish_date ?? ""} onChange={f("publish_date")} placeholder="2026-04-27" />
        </Field>
        <Field>
          <Label hint="Estimated reading time in minutes">Read Time (min)</Label>
          <TextInput value={data.read_time_mins ?? ""} onChange={f("read_time_mins")} placeholder="3" />
        </Field>
        <Field>
          <Label>Featured?</Label>
          <SelectInput value={data.featured ?? "FALSE"} onChange={f("featured")} options={["FALSE","TRUE"]} />
        </Field>
      </div>
      <Field>
        <Label hint="Cover image — use a Google Cloud Storage or CDN URL">Cover Image URL</Label>
        <TextInput value={data.cover_image_url ?? ""} onChange={f("cover_image_url")} placeholder="https://..." />
      </Field>
      <Field>
        <Label hint="Short summary shown in article cards and social previews (max 200 chars)">Excerpt</Label>
        <textarea
          value={data.excerpt ?? ""}
          onChange={e => onChange({ ...data, excerpt: e.target.value })}
          rows={2}
          placeholder="Write a compelling one-paragraph summary..."
          className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#1A56A0]/30 focus:border-[#1A56A0] resize-y placeholder-gray-300"
        />
      </Field>
      <Field>
        <Label hint="Full article body — supports HTML formatting">Body Content</Label>
        <RichArea value={data.body_html ?? ""} onChange={f("body_html")}
          placeholder="Write the full article here..." rows={12} />
      </Field>
      <Field>
        <Label hint="Comma-separated tags for search and filtering">Tags</Label>
        <TextInput value={data.tags ?? ""} onChange={f("tags")} placeholder="e.g. mobile banking, digital, news" />
      </Field>
    </>
  );
}

// ── Left section nav icons ────────────────────────────────────────────────────

const SECTIONS: Record<ContentType, { icon: string; label: string }[]> = {
  job: [
    { icon: "Ⓣ", label: "Title" },
    { icon: "◉", label: "Details" },
    { icon: "≡", label: "Description" },
    { icon: "✓", label: "Requirements" },
  ],
  tender: [
    { icon: "Ⓣ", label: "Reference" },
    { icon: "◉", label: "Details" },
    { icon: "📅", label: "Dates" },
    { icon: "≡", label: "Scope" },
  ],
  blog: [
    { icon: "Ⓣ", label: "Title & Slug" },
    { icon: "◉", label: "Meta" },
    { icon: "🖼", label: "Cover" },
    { icon: "≡", label: "Body" },
  ],
};

const STATUS_OPTIONS: Record<ContentType, string[]> = {
  job: ["draft","open","closed"],
  tender: ["draft","open","closed"],
  blog: ["draft","published"],
};

const API_ROUTES: Record<ContentType, string> = {
  job: "/api/admin/jobs",
  tender: "/api/admin/tenders",
  blog: "/api/admin/blog",
};

// ── Main editor ───────────────────────────────────────────────────────────────

export default function ContentEditor({ type, initial, onClose, onSaved }: Props) {
  const isNew = !initial;
  const [data, setData] = useState<EditorData>(initial ?? { status: "draft" });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const typeLabel = type === "job" ? "Job Listing" : type === "tender" ? "Tender" : "Blog Post";

  async function save() {
    setSaving(true); setError(null);
    try {
      const method = isNew ? "POST" : "PUT";
      const body = isNew ? data : {
        ...data,
        ...(type === "job"    ? { _originalTitle: initial?.job_title ?? data.job_title }   : {}),
        ...(type === "tender" ? { _originalRef:   initial?.tender_ref ?? data.tender_ref } : {}),
        ...(type === "blog"   ? { _originalSlug:  initial?.slug ?? data.slug }              : {}),
      };
      const res = await fetch(API_ROUTES[type], {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Save failed");
      onSaved();
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  }

  async function doDelete() {
    setDeleting(true); setError(null);
    try {
      const key =
        type === "job"    ? { title: initial?.job_title }   :
        type === "tender" ? { ref:   initial?.tender_ref }   :
                            { slug:  initial?.slug };
      const res = await fetch(API_ROUTES[type], {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(key),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Delete failed");
      onSaved();
    } catch (e) {
      setError(String(e));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative ml-auto flex h-full w-full max-w-5xl bg-[#F0F2F5] shadow-2xl flex-col">

        {/* ── Top bar ── */}
        <div className="flex items-center justify-between px-5 py-3 bg-[#1A1A2E] text-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="hover:text-gray-300 transition">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="h-4 w-px bg-white/20" />
            <span className="text-sm font-semibold">{isNew ? `New ${typeLabel}` : typeLabel}</span>
            {!isNew && <span className="text-xs text-white/50">· Editing</span>}
          </div>
          <div className="flex items-center gap-2">
            {!isNew && (
              <button onClick={() => setConfirmDelete(true)}
                className="text-xs font-semibold text-red-400 hover:text-red-300 transition px-3 py-1.5 rounded-lg hover:bg-white/10">
                Delete
              </button>
            )}
            <button onClick={save} disabled={saving}
              className="bg-[#1A56A0] hover:bg-[#1547a0] text-white text-xs font-bold px-5 py-2 rounded-lg transition disabled:opacity-60 flex items-center gap-2">
              {saving && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {saving ? "Saving…" : "Save to Sheet"}
            </button>
          </div>
        </div>

        {/* ── Status bar ── */}
        <div className="flex items-center gap-4 px-5 py-2.5 bg-white border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-medium">Status:</span>
            <select
              value={data.status ?? "draft"}
              onChange={e => setData({ ...data, status: e.target.value })}
              className="text-xs font-bold border border-gray-200 rounded-lg px-2.5 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-[#1A56A0]/30 appearance-none pr-6"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%236B7280'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center", backgroundSize: "12px" }}
            >
              {STATUS_OPTIONS[type].map(s => (
                <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
          <StatusPill status={data.status ?? "draft"} />
          {error && (
            <div className="ml-auto flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg">
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error.includes("GOOGLE_SERVICE_ACCOUNT_JSON")
                ? "Set GOOGLE_SERVICE_ACCOUNT_JSON env var to enable saves"
                : error}
            </div>
          )}
        </div>

        {/* ── Body ── */}
        <div className="flex flex-1 overflow-hidden">

          {/* Left sidebar — section icons */}
          <div className="w-14 bg-white border-r border-gray-100 flex flex-col items-center gap-1 pt-4 flex-shrink-0">
            {SECTIONS[type].map(({ icon, label }) => (
              <button key={label} title={label}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-[#1A56A0] transition text-sm">
                {icon}
              </button>
            ))}
          </div>

          {/* Form area */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <div className="max-w-2xl mx-auto">
              {type === "job"    && <JobForm    data={data} onChange={setData} />}
              {type === "tender" && <TenderForm data={data} onChange={setData} />}
              {type === "blog"   && <BlogForm   data={data} onChange={setData} />}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="w-64 bg-white border-l border-gray-100 flex-shrink-0 overflow-y-auto">
            <div className="p-4 space-y-4">

              {/* Workflow status */}
              <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <h4 className="text-xs font-bold text-[#1A1A2E] mb-3">Workflow Status</h4>
                {/* Progress bar */}
                <div className="flex gap-0.5 rounded-full overflow-hidden h-1.5 mb-3">
                  {STATUS_OPTIONS[type].map((s, i) => {
                    const current = STATUS_OPTIONS[type].indexOf(data.status ?? "draft");
                    return (
                      <div key={s} className={`flex-1 ${i <= current ? "bg-[#1A56A0]" : "bg-gray-100"}`} />
                    );
                  })}
                </div>
                <div className="space-y-1.5">
                  {STATUS_OPTIONS[type].map(s => {
                    const current = data.status ?? "draft";
                    const cfg = STATUS_CONFIG[s] ?? { dot: "bg-gray-400", label: s };
                    return (
                      <button key={s} onClick={() => setData({ ...data, status: s })}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs font-medium transition
                          ${current === s ? "bg-[#EEF3FB] text-[#1A56A0]" : "text-gray-500 hover:bg-gray-50"}`}>
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                        <span className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</span>
                        {current === s && <span className="ml-auto text-[10px] text-[#1A56A0] font-bold">●</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Metadata */}
              <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <h4 className="text-xs font-bold text-[#1A1A2E] mb-3">Metadata</h4>
                <div className="space-y-2 text-[11px]">
                  <div className="flex justify-between text-gray-500">
                    <span>Data source</span>
                    <span className="text-gray-700 font-medium">Google Sheets</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Content type</span>
                    <span className="text-gray-700 font-medium">{typeLabel}</span>
                  </div>
                  {!isNew && type === "tender" && (
                    <div className="flex justify-between text-gray-500">
                      <span>Ref</span>
                      <span className="font-mono text-gray-700">{initial?.tender_ref}</span>
                    </div>
                  )}
                  {!isNew && type === "blog" && (
                    <div className="flex justify-between text-gray-500">
                      <span>Slug</span>
                      <span className="font-mono text-gray-700 truncate max-w-[100px]">{initial?.slug}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Sheets API notice */}
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  <strong>Note:</strong> Saves require <code className="text-[10px] bg-amber-100 px-1 rounded">GOOGLE_SERVICE_ACCOUNT_JSON</code> env var. See developer guide.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirm dialog */}
      {confirmDelete && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 max-w-sm w-full mx-4">
            <h3 className="font-bold text-[#1A1A2E] mb-2">Delete {typeLabel}?</h3>
            <p className="text-sm text-gray-500 mb-5">This will permanently remove the row from Google Sheets. This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(false)}
                className="flex-1 border border-gray-200 text-sm font-semibold text-gray-600 rounded-lg py-2 hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={doDelete} disabled={deleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg py-2 transition disabled:opacity-60 flex items-center justify-center gap-2">
                {deleting && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
