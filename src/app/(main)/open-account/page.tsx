"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  User,
  Phone,
  Shield,
  Briefcase,
  Users,
  Building2,
  MapPin,
  Upload,
  X,
  AlertCircle,
  FileText,
  Loader2,
} from "lucide-react";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const ACCOUNT_GROUPS = [
  {
    label: "Individual Savings",
    accounts: [
      { value: "normal-savings", label: "Normal Savings Account" },
      { value: "jasiri", label: "Jasiri Account (Youth 18–35)" },
      { value: "msomi", label: "Msomi Account (Students)" },
      { value: "mafao", label: "Mafao Account (Retirement)" },
      { value: "kilimo-tija", label: "Kilimo Tija Account (Farmers)" },
      { value: "salary", label: "Salary Account" },
      { value: "mama-africa", label: "Mama Africa Account" },
      { value: "baba-fedha", label: "Baba Fedha Account" },
      { value: "juhudi", label: "Juhudi Account" },
      { value: "mtoto", label: "Mtoto Account (Children's Savings)" },
    ],
  },
  {
    label: "Fixed Deposit",
    accounts: [{ value: "fixed-deposit", label: "Fixed Deposit Account" }],
  },
  {
    label: "Current Accounts",
    accounts: [
      { value: "individual-current", label: "Individual Current Account" },
      { value: "jasiri-current", label: "Jasiri Current Account" },
      { value: "enterprise-current", label: "Enterprise Current Account" },
      { value: "corporate-current", label: "Corporate Current Account" },
    ],
  },
  {
    label: "Group & Cooperative",
    accounts: [
      { value: "group-savings", label: "Group Savings Account" },
      { value: "cooperative-savings", label: "Cooperative Savings Account" },
      { value: "group-current", label: "Group Current Account" },
    ],
  },
];

const TZ_REGIONS = [
  "Arusha","Dar es Salaam","Dodoma","Geita","Iringa","Kagera","Katavi","Kigoma",
  "Kilimanjaro","Lindi","Manyara","Mara","Mbeya","Morogoro","Mtwara","Mwanza",
  "Njombe","Pemba North","Pemba South","Pwani","Rukwa","Ruvuma","Shinyanga",
  "Simiyu","Singida","Songwe","Tabora","Tanga","Unguja North","Unguja South",
  "Zanzibar West",
];

const STEPS = [
  { id: 1, label: "Account Type", icon: Building2 },
  { id: 2, label: "Personal Info", icon: User },
  { id: 3, label: "Contact", icon: MapPin },
  { id: 4, label: "Identity", icon: Shield },
  { id: 5, label: "Employment", icon: Briefcase },
  { id: 6, label: "Next of Kin", icon: Users },
  { id: 7, label: "Review", icon: CheckCircle },
];

const INITIAL_FORM = {
  accountType: "",
  fullName: "",
  dateOfBirth: "",
  gender: "",
  nationality: "Tanzanian",
  maritalStatus: "",
  phone: "",
  email: "",
  region: "",
  district: "",
  ward: "",
  street: "",
  idType: "",
  idNumber: "",
  idExpiry: "",
  employmentStatus: "",
  employerName: "",
  monthlyIncome: "",
  kinName: "",
  kinPhone: "",
  kinRelationship: "",
  agreeTerms: false,
};

type FormState = typeof INITIAL_FORM;

/* ------------------------------------------------------------------ */
/*  Validation helpers                                                 */
/* ------------------------------------------------------------------ */

function validateTZPhone(v: string) {
  return /^(\+?255)?0[67]\d{8}$/.test(v.replace(/\s/g, ""));
}

function validateEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function validateAge18(dob: string) {
  if (!dob) return false;
  const d = new Date(dob);
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - 18);
  return d <= cutoff;
}

function validateIdNumber(idType: string, idNumber: string) {
  const n = idNumber.replace(/[-\s]/g, "");
  if (!n) return false;
  if (idType === "national-id") return /^\d{20}$/.test(n);
  if (idType === "passport") return /^[A-Z0-9]{6,9}$/i.test(n);
  return n.length >= 4;
}

function getAccountLabel(value: string) {
  for (const g of ACCOUNT_GROUPS) {
    const a = g.accounts.find((x) => x.value === value);
    if (a) return a.label;
  }
  return value;
}

function validateStep(step: number, form: FormState, idFront: File | null): Record<string, string> {
  const errs: Record<string, string> = {};
  if (step === 1) {
    if (!form.accountType) errs.accountType = "Please select an account type.";
  }
  if (step === 2) {
    if (!form.fullName.trim()) errs.fullName = "Full name is required.";
    else if (form.fullName.trim().split(" ").length < 2) errs.fullName = "Please enter your full name (first and last).";
    if (!form.dateOfBirth) errs.dateOfBirth = "Date of birth is required.";
    else if (!validateAge18(form.dateOfBirth)) errs.dateOfBirth = "You must be at least 18 years old to open an account.";
    if (!form.gender) errs.gender = "Please select your gender.";
    if (!form.maritalStatus) errs.maritalStatus = "Please select your marital status.";
    if (!form.nationality.trim()) errs.nationality = "Nationality is required.";
  }
  if (step === 3) {
    if (!form.phone) errs.phone = "Phone number is required.";
    else if (!validateTZPhone(form.phone)) errs.phone = "Enter a valid Tanzanian phone number (e.g. 0712345678).";
    if (!form.email) errs.email = "Email address is required.";
    else if (!validateEmail(form.email)) errs.email = "Enter a valid email address.";
    if (!form.region) errs.region = "Please select your region.";
    if (!form.district.trim()) errs.district = "District is required.";
  }
  if (step === 4) {
    if (!form.idType) errs.idType = "Please select an ID type.";
    if (!form.idNumber) errs.idNumber = "ID number is required.";
    else if (!validateIdNumber(form.idType, form.idNumber)) {
      if (form.idType === "national-id") errs.idNumber = "NIDA number must be exactly 20 digits.";
      else if (form.idType === "passport") errs.idNumber = "Passport number must be 6–9 alphanumeric characters.";
      else errs.idNumber = "Please enter a valid ID number.";
    }
    if (!form.idExpiry) errs.idExpiry = "ID expiry date is required.";
    else if (new Date(form.idExpiry) < new Date()) errs.idExpiry = "ID document appears to be expired.";
    if (!idFront) errs.idFront = "Please upload the front side of your ID.";
  }
  if (step === 5) {
    if (!form.employmentStatus) errs.employmentStatus = "Please select your employment status.";
    if (["employed", "self-employed"].includes(form.employmentStatus) && !form.employerName.trim())
      errs.employerName = "Employer / business name is required.";
    if (!form.monthlyIncome) errs.monthlyIncome = "Please select an income range.";
  }
  if (step === 6) {
    if (!form.kinName.trim()) errs.kinName = "Next of kin name is required.";
    if (!form.kinPhone) errs.kinPhone = "Next of kin phone is required.";
    else if (!validateTZPhone(form.kinPhone)) errs.kinPhone = "Enter a valid Tanzanian phone number.";
    if (!form.kinRelationship) errs.kinRelationship = "Please select the relationship.";
  }
  if (step === 7) {
    if (!form.agreeTerms) errs.agreeTerms = "You must agree to the terms and conditions.";
  }
  return errs;
}

/* ------------------------------------------------------------------ */
/*  Shared form field components                                       */
/* ------------------------------------------------------------------ */

function FieldInput({
  label, name, type = "text", value, onChange, error, placeholder, required, hint, min, max,
}: {
  label: string; name: string; type?: string; value: string;
  onChange: (v: string) => void; error?: string; placeholder?: string;
  required?: boolean; hint?: string; min?: string; max?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[#1A1A2E] mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
        className={`w-full rounded-lg border px-4 py-2.5 text-sm text-[#1A1A2E] outline-none transition focus:ring-2 focus:ring-[#1A56A0]/30 ${
          error ? "border-red-400 bg-red-50" : "border-gray-300 bg-white focus:border-[#1A56A0]"
        }`}
      />
      {hint && !error && <p className="mt-1 text-xs text-[#718096]">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} />{error}</p>}
    </div>
  );
}

function FieldSelect({
  label, name, value, onChange, error, options, required, placeholder,
}: {
  label: string; name: string; value: string; onChange: (v: string) => void;
  error?: string; options: { value: string; label: string }[];
  required?: boolean; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[#1A1A2E] mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-lg border px-4 py-2.5 text-sm text-[#1A1A2E] outline-none transition bg-white focus:ring-2 focus:ring-[#1A56A0]/30 ${
          error ? "border-red-400 bg-red-50" : "border-gray-300 focus:border-[#1A56A0]"
        }`}
      >
        <option value="">{placeholder ?? "Select..."}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} />{error}</p>}
    </div>
  );
}

function FileDropzone({
  label, fileKey, file, onFile, onRemove, error, accept = "image/*,application/pdf", hint,
}: {
  label: string; fileKey: string; file: File | null;
  onFile: (f: File) => void; onRemove: () => void;
  error?: string; accept?: string; hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) validateAndSet(f);
  }, []);

  function validateAndSet(f: File) {
    if (f.size > 5 * 1024 * 1024) {
      alert("File must be under 5MB.");
      return;
    }
    if (!f.type.match(/image\/(jpeg|png|jpg|webp)|application\/pdf/)) {
      alert("Only JPG, PNG, or PDF files are accepted.");
      return;
    }
    onFile(f);
  }

  return (
    <div>
      <label className="block text-sm font-semibold text-[#1A1A2E] mb-1.5">{label}</label>
      {file ? (
        <div className="flex items-center gap-3 rounded-lg border border-[#1A8A3A]/40 bg-[#1A8A3A]/5 px-4 py-3">
          <FileText size={18} className="text-[#1A8A3A] flex-shrink-0" />
          <span className="text-sm text-[#2D3748] truncate flex-1">{file.name}</span>
          <span className="text-xs text-[#718096]">{(file.size / 1024).toFixed(0)} KB</span>
          <button onClick={onRemove} className="text-[#718096] hover:text-red-500 transition-colors ml-1">
            <X size={16} />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`cursor-pointer rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors ${
            dragging
              ? "border-[#1A56A0] bg-[#1A56A0]/5"
              : error
              ? "border-red-400 bg-red-50"
              : "border-gray-300 bg-gray-50 hover:border-[#1A56A0]/60 hover:bg-[#1A56A0]/5"
          }`}
        >
          <Upload size={20} className="mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-[#4A5568]">
            <span className="font-semibold text-[#1A56A0]">Click to upload</span> or drag &amp; drop
          </p>
          <p className="text-xs text-[#718096] mt-1">JPG, PNG, PDF — max 5MB</p>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) validateAndSet(f); }}
      />
      {hint && !error && <p className="mt-1 text-xs text-[#718096]">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} />{error}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Review row helper                                                  */
/* ------------------------------------------------------------------ */

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 py-2 border-b border-gray-100 last:border-0">
      <span className="text-xs font-semibold text-[#718096] w-40 flex-shrink-0">{label}</span>
      <span className="text-sm text-[#1A1A2E]">{value || "—"}</span>
    </div>
  );
}

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#1A56A0] mb-2">{title}</h4>
      <div className="rounded-xl border border-gray-200 bg-[#f9fafb] px-5 py-1">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Progress indicator                                                 */
/* ------------------------------------------------------------------ */

function StepProgress({ current }: { current: number }) {
  return (
    <div className="mb-8">
      {/* Mobile: simple text progress */}
      <div className="flex sm:hidden items-center justify-between mb-3">
        <span className="text-xs font-semibold text-[#1A56A0]">
          Step {current} of {STEPS.length}
        </span>
        <span className="text-xs font-semibold text-[#1A1A2E]">{STEPS[current - 1].label}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5 sm:hidden">
        <div
          className="bg-[#1A56A0] h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${((current - 1) / (STEPS.length - 1)) * 100}%` }}
        />
      </div>

      {/* Desktop: dot steps */}
      <div className="hidden sm:flex items-center">
        {STEPS.map((step, i) => {
          const done = current > step.id;
          const active = current === step.id;
          const Icon = step.icon;
          return (
            <div key={step.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    done
                      ? "bg-[#1A8A3A] border-[#1A8A3A] text-white"
                      : active
                      ? "bg-[#1A56A0] border-[#1A56A0] text-white shadow-md shadow-[#1A56A0]/30"
                      : "bg-white border-gray-300 text-gray-400"
                  }`}
                >
                  {done ? <CheckCircle size={16} /> : <Icon size={15} />}
                </div>
                <span className={`mt-1.5 text-[10px] font-semibold whitespace-nowrap ${
                  active ? "text-[#1A56A0]" : done ? "text-[#1A8A3A]" : "text-gray-400"
                }`}>
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 mb-5 transition-colors duration-300 ${
                  done ? "bg-[#1A8A3A]" : "bg-gray-200"
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PAGE                                                               */
/* ------------------------------------------------------------------ */

export default function OpenAccountPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [idFront, setIdFront] = useState<File | null>(null);
  const [idBack, setIdBack] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const set = (key: keyof FormState, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  function next() {
    const errs = validateStep(step, form, idFront);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setStep((s) => Math.min(s + 1, STEPS.length));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function back() {
    setErrors({});
    setStep((s) => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit() {
    const errs = validateStep(7, form, idFront);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSubmitting(true);
    setSubmitError("");
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      if (idFront) fd.append("idFront", idFront);
      if (idBack) fd.append("idBack", idBack);

      const res = await fetch("/api/open-account", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");
      setSubmitted(true);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  /* ---------- SUCCESS ---------- */
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#f4f6f9] flex items-center justify-center px-6 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-lg p-10 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-[#1A8A3A]/10 flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={32} className="text-[#1A8A3A]" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#1A1A2E] mb-3">Application Submitted</h2>
          <p className="text-[#4A5568] leading-relaxed mb-6">
            Thank you, <strong>{form.fullName.split(" ")[0]}</strong>. Your account opening application for a{" "}
            <strong>{getAccountLabel(form.accountType)}</strong> has been received. Our team will contact you within 2 business days.
          </p>
          <p className="text-sm text-[#718096] mb-8">
            A confirmation will be sent to <strong>{form.email}</strong>.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#1A56A0] text-white text-sm font-semibold hover:bg-[#1A56A0]/90 transition-colors"
          >
            Back to Homepage
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-14">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "url('/images/pattern-bg.jpg')", backgroundSize: "1200px", backgroundRepeat: "repeat" }}
        />
        <div className="absolute inset-0 bg-[#1A56A0]/[0.97] pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-8 text-center">
          <motion.nav
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 text-sm text-white/50 mb-6"
          >
            <Link href="/" className="hover:text-white transition-colors font-medium">Home</Link>
            <ChevronRight size={14} className="text-white/30" />
            <span className="text-white font-semibold">Open an Account</span>
          </motion.nav>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl font-extrabold text-white mb-3"
          >
            Open Your Account
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-white/60 max-w-xl mx-auto leading-relaxed"
          >
            Complete this form to apply for an account. Your application will be reviewed and you will be contacted within 2 business days.
          </motion.p>
        </div>
      </section>

      {/* Form card */}
      <section className="bg-[#f4f6f9] py-12 px-6 pb-28 sm:pb-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10">
            <StepProgress current={step} />

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                {/* ---- STEP 1: Account Type ---- */}
                {step === 1 && (
                  <div>
                    <h3 className="text-xl font-extrabold text-[#1A1A2E] mb-1">Choose Account Type</h3>
                    <p className="text-sm text-[#4A5568] mb-6">Select the type of account you would like to open.</p>
                    <div className="space-y-4">
                      {ACCOUNT_GROUPS.map((group) => (
                        <div key={group.label}>
                          <p className="text-[11px] font-bold uppercase tracking-widest text-[#1A56A0] mb-2">{group.label}</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {group.accounts.map((acc) => (
                              <button
                                key={acc.value}
                                onClick={() => set("accountType", acc.value)}
                                className={`text-left rounded-lg border px-4 py-3 text-sm font-medium transition-all ${
                                  form.accountType === acc.value
                                    ? "border-[#1A56A0] bg-[#1A56A0]/8 text-[#1A56A0]"
                                    : "border-gray-200 text-[#4A5568] hover:border-[#1A56A0]/40 hover:bg-gray-50"
                                }`}
                              >
                                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                                  form.accountType === acc.value ? "bg-[#1A56A0]" : "bg-gray-300"
                                }`} />
                                {acc.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    {errors.accountType && (
                      <p className="mt-3 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} />{errors.accountType}</p>
                    )}
                  </div>
                )}

                {/* ---- STEP 2: Personal Info ---- */}
                {step === 2 && (
                  <div>
                    <h3 className="text-xl font-extrabold text-[#1A1A2E] mb-1">Personal Information</h3>
                    <p className="text-sm text-[#4A5568] mb-6">Enter your personal details as they appear on your ID document.</p>
                    <div className="space-y-4">
                      <FieldInput label="Full Name" name="fullName" value={form.fullName} onChange={(v) => set("fullName", v)}
                        error={errors.fullName} placeholder="e.g. John Mwamba Doe" required
                        hint="Enter your name exactly as it appears on your ID" />
                      <FieldInput label="Date of Birth" name="dateOfBirth" type="date" value={form.dateOfBirth}
                        onChange={(v) => set("dateOfBirth", v)} error={errors.dateOfBirth} required
                        max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split("T")[0]} />
                      <div className="grid grid-cols-2 gap-4">
                        <FieldSelect label="Gender" name="gender" value={form.gender} onChange={(v) => set("gender", v)}
                          error={errors.gender} required options={[
                            { value: "Male", label: "Male" },
                            { value: "Female", label: "Female" },
                          ]} />
                        <FieldSelect label="Marital Status" name="maritalStatus" value={form.maritalStatus}
                          onChange={(v) => set("maritalStatus", v)} error={errors.maritalStatus} required
                          options={[
                            { value: "Single", label: "Single" },
                            { value: "Married", label: "Married" },
                            { value: "Divorced", label: "Divorced" },
                            { value: "Widowed", label: "Widowed" },
                          ]} />
                      </div>
                      <FieldInput label="Nationality" name="nationality" value={form.nationality}
                        onChange={(v) => set("nationality", v)} error={errors.nationality} required placeholder="e.g. Tanzanian" />
                    </div>
                  </div>
                )}

                {/* ---- STEP 3: Contact & Address ---- */}
                {step === 3 && (
                  <div>
                    <h3 className="text-xl font-extrabold text-[#1A1A2E] mb-1">Contact &amp; Address</h3>
                    <p className="text-sm text-[#4A5568] mb-6">We will use these details to reach you regarding your application.</p>
                    <div className="space-y-4">
                      <FieldInput label="Phone Number" name="phone" type="tel" value={form.phone}
                        onChange={(v) => set("phone", v)} error={errors.phone} placeholder="e.g. 0712 345 678" required
                        hint="Tanzanian number starting with 06 or 07" />
                      <FieldInput label="Email Address" name="email" type="email" value={form.email}
                        onChange={(v) => set("email", v)} error={errors.email} placeholder="you@example.com" required />
                      <div className="grid grid-cols-2 gap-4">
                        <FieldSelect label="Region" name="region" value={form.region} onChange={(v) => set("region", v)}
                          error={errors.region} required
                          options={TZ_REGIONS.map((r) => ({ value: r, label: r }))} />
                        <FieldInput label="District" name="district" value={form.district}
                          onChange={(v) => set("district", v)} error={errors.district} placeholder="e.g. Ilala" required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <FieldInput label="Ward" name="ward" value={form.ward}
                          onChange={(v) => set("ward", v)} placeholder="e.g. Kariakoo" />
                        <FieldInput label="Street / Mtaa" name="street" value={form.street}
                          onChange={(v) => set("street", v)} placeholder="e.g. Msimbazi Street" />
                      </div>
                    </div>
                  </div>
                )}

                {/* ---- STEP 4: Identity ---- */}
                {step === 4 && (
                  <div>
                    <h3 className="text-xl font-extrabold text-[#1A1A2E] mb-1">Identity Document</h3>
                    <p className="text-sm text-[#4A5568] mb-6">Upload a clear photo or scan of your ID. Files must be under 5MB.</p>
                    <div className="space-y-4">
                      <FieldSelect label="ID Type" name="idType" value={form.idType} onChange={(v) => set("idType", v)}
                        error={errors.idType} required options={[
                          { value: "national-id", label: "National ID (NIDA)" },
                          { value: "passport", label: "Passport" },
                          { value: "driving-license", label: "Driving Licence" },
                          { value: "voter-id", label: "Voter ID" },
                        ]} />
                      <FieldInput label="ID Number" name="idNumber" value={form.idNumber}
                        onChange={(v) => set("idNumber", v.toUpperCase())} error={errors.idNumber} required
                        placeholder={form.idType === "national-id" ? "20-digit NIDA number" : form.idType === "passport" ? "e.g. AB123456" : "ID number"}
                        hint={form.idType === "national-id" ? "Your 20-digit NIDA national identification number" : undefined} />
                      <FieldInput label="ID Expiry Date" name="idExpiry" type="date" value={form.idExpiry}
                        onChange={(v) => set("idExpiry", v)} error={errors.idExpiry} required
                        min={new Date().toISOString().split("T")[0]} />
                      <FileDropzone label="ID Front Side *" fileKey="idFront" file={idFront}
                        onFile={setIdFront} onRemove={() => setIdFront(null)} error={errors.idFront}
                        hint="Clear photo or scan of the front of your ID document" />
                      <FileDropzone label="ID Back Side (if applicable)" fileKey="idBack" file={idBack}
                        onFile={setIdBack} onRemove={() => setIdBack(null)}
                        hint="Required for National ID and Driving Licence" />
                    </div>
                  </div>
                )}

                {/* ---- STEP 5: Employment ---- */}
                {step === 5 && (
                  <div>
                    <h3 className="text-xl font-extrabold text-[#1A1A2E] mb-1">Employment &amp; Financial</h3>
                    <p className="text-sm text-[#4A5568] mb-6">This information helps us understand your financial needs.</p>
                    <div className="space-y-4">
                      <FieldSelect label="Employment Status" name="employmentStatus" value={form.employmentStatus}
                        onChange={(v) => set("employmentStatus", v)} error={errors.employmentStatus} required
                        options={[
                          { value: "employed", label: "Employed (Salaried)" },
                          { value: "self-employed", label: "Self-Employed / Business Owner" },
                          { value: "student", label: "Student" },
                          { value: "farmer", label: "Farmer" },
                          { value: "retired", label: "Retired" },
                          { value: "unemployed", label: "Unemployed / Seeking Work" },
                          { value: "other", label: "Other" },
                        ]} />
                      {["employed", "self-employed"].includes(form.employmentStatus) && (
                        <FieldInput
                          label={form.employmentStatus === "self-employed" ? "Business Name" : "Employer Name"}
                          name="employerName" value={form.employerName}
                          onChange={(v) => set("employerName", v)} error={errors.employerName} required
                          placeholder={form.employmentStatus === "self-employed" ? "e.g. Mwamba Traders Ltd" : "e.g. Tanzania Revenue Authority"} />
                      )}
                      <FieldSelect label="Monthly Income Range (TZS)" name="monthlyIncome" value={form.monthlyIncome}
                        onChange={(v) => set("monthlyIncome", v)} error={errors.monthlyIncome} required
                        options={[
                          { value: "Below 500,000", label: "Below 500,000" },
                          { value: "500,000 – 1,000,000", label: "500,000 – 1,000,000" },
                          { value: "1,000,001 – 3,000,000", label: "1,000,001 – 3,000,000" },
                          { value: "3,000,001 – 5,000,000", label: "3,000,001 – 5,000,000" },
                          { value: "5,000,001 – 10,000,000", label: "5,000,001 – 10,000,000" },
                          { value: "Above 10,000,000", label: "Above 10,000,000" },
                        ]} />
                    </div>
                  </div>
                )}

                {/* ---- STEP 6: Next of Kin ---- */}
                {step === 6 && (
                  <div>
                    <h3 className="text-xl font-extrabold text-[#1A1A2E] mb-1">Next of Kin</h3>
                    <p className="text-sm text-[#4A5568] mb-6">Please provide a trusted contact person in case we are unable to reach you.</p>
                    <div className="space-y-4">
                      <FieldInput label="Full Name" name="kinName" value={form.kinName}
                        onChange={(v) => set("kinName", v)} error={errors.kinName} required
                        placeholder="e.g. Grace Mwamba" />
                      <FieldInput label="Phone Number" name="kinPhone" type="tel" value={form.kinPhone}
                        onChange={(v) => set("kinPhone", v)} error={errors.kinPhone} required
                        placeholder="e.g. 0755 123 456" hint="Tanzanian number starting with 06 or 07" />
                      <FieldSelect label="Relationship" name="kinRelationship" value={form.kinRelationship}
                        onChange={(v) => set("kinRelationship", v)} error={errors.kinRelationship} required
                        options={[
                          { value: "Spouse", label: "Spouse" },
                          { value: "Parent", label: "Parent" },
                          { value: "Child", label: "Child" },
                          { value: "Sibling", label: "Sibling" },
                          { value: "Guardian", label: "Guardian" },
                          { value: "Friend", label: "Friend" },
                          { value: "Other", label: "Other" },
                        ]} />
                    </div>
                  </div>
                )}

                {/* ---- STEP 7: Review & Submit ---- */}
                {step === 7 && (
                  <div>
                    <h3 className="text-xl font-extrabold text-[#1A1A2E] mb-1">Review &amp; Submit</h3>
                    <p className="text-sm text-[#4A5568] mb-6">Please review your application before submitting. Use the Back button to make corrections.</p>

                    <ReviewSection title="Account Details">
                      <ReviewRow label="Account Type" value={getAccountLabel(form.accountType)} />
                    </ReviewSection>
                    <ReviewSection title="Personal Information">
                      <ReviewRow label="Full Name" value={form.fullName} />
                      <ReviewRow label="Date of Birth" value={form.dateOfBirth} />
                      <ReviewRow label="Gender" value={form.gender} />
                      <ReviewRow label="Nationality" value={form.nationality} />
                      <ReviewRow label="Marital Status" value={form.maritalStatus} />
                    </ReviewSection>
                    <ReviewSection title="Contact & Address">
                      <ReviewRow label="Phone" value={form.phone} />
                      <ReviewRow label="Email" value={form.email} />
                      <ReviewRow label="Region" value={form.region} />
                      <ReviewRow label="District" value={form.district} />
                      {form.ward && <ReviewRow label="Ward" value={form.ward} />}
                      {form.street && <ReviewRow label="Street" value={form.street} />}
                    </ReviewSection>
                    <ReviewSection title="Identity Document">
                      <ReviewRow label="ID Type" value={form.idType.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} />
                      <ReviewRow label="ID Number" value={form.idNumber} />
                      <ReviewRow label="Expiry Date" value={form.idExpiry} />
                      <ReviewRow label="Front Uploaded" value={idFront ? idFront.name : "No"} />
                      <ReviewRow label="Back Uploaded" value={idBack ? idBack.name : "No"} />
                    </ReviewSection>
                    <ReviewSection title="Employment">
                      <ReviewRow label="Status" value={form.employmentStatus} />
                      {form.employerName && <ReviewRow label="Employer / Business" value={form.employerName} />}
                      <ReviewRow label="Monthly Income" value={`TZS ${form.monthlyIncome}`} />
                    </ReviewSection>
                    <ReviewSection title="Next of Kin">
                      <ReviewRow label="Name" value={form.kinName} />
                      <ReviewRow label="Phone" value={form.kinPhone} />
                      <ReviewRow label="Relationship" value={form.kinRelationship} />
                    </ReviewSection>

                    {/* Terms */}
                    <label className="flex items-start gap-3 cursor-pointer mt-2">
                      <input
                        type="checkbox"
                        checked={form.agreeTerms}
                        onChange={(e) => set("agreeTerms", e.target.checked)}
                        className="mt-0.5 w-4 h-4 accent-[#1A56A0]"
                      />
                      <span className="text-sm text-[#4A5568] leading-relaxed">
                        I confirm that the information provided is accurate and complete. I agree to Cooperative Bank Tanzania&apos;s{" "}
                        <Link href="/terms" className="text-[#1A56A0] underline">Terms and Conditions</Link> and{" "}
                        <Link href="/privacy" className="text-[#1A56A0] underline">Privacy Policy</Link>.
                      </span>
                    </label>
                    {errors.agreeTerms && (
                      <p className="mt-2 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} />{errors.agreeTerms}</p>
                    )}

                    {submitError && (
                      <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 flex items-start gap-2">
                        <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-600">{submitError}</p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
              <button
                onClick={back}
                disabled={step === 1}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-300 text-sm font-semibold text-[#4A5568] hover:border-[#1A56A0] hover:text-[#1A56A0] transition-colors disabled:opacity-40 disabled:pointer-events-none"
              >
                <ChevronLeft size={16} />
                Back
              </button>

              {step < 7 ? (
                <button
                  onClick={next}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#1A56A0] text-white text-sm font-semibold hover:bg-[#1A56A0]/90 transition-colors shadow-sm shadow-[#1A56A0]/20"
                >
                  Continue
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  onClick={submit}
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#1A8A3A] text-white text-sm font-semibold hover:bg-[#1A8A3A]/90 transition-colors shadow-sm shadow-[#1A8A3A]/20 disabled:opacity-60"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                  {submitting ? "Submitting..." : "Submit Application"}
                </button>
              )}
            </div>
          </div>

          {/* Help note */}
          <p className="text-center text-xs text-[#718096] mt-5">
            Need help? Call us on{" "}
            <a href="tel:+255272754470" className="text-[#1A56A0] font-semibold">+255 27 275 4470</a>{" "}
            or email{" "}
            <a href="mailto:info@cbtbank.co.tz" className="text-[#1A56A0] font-semibold">info@cbtbank.co.tz</a>
          </p>
        </div>
      </section>
    </>
  );
}
