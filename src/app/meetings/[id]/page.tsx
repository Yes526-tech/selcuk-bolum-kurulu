"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  FileText,
  Calendar,
  Clock,
  MapPin,
  Download,
  FileType,
  Building,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import MeetingStepper from "@/components/MeetingStepper";
import Step1CallAndAgenda from "@/components/steps/Step1CallAndAgenda";
import Step2AttendanceAndQuorum from "@/components/steps/Step2AttendanceAndQuorum";
import Step3AgendaVoting from "@/components/steps/Step3AgendaVoting";
import Step4DecisionDeliberation from "@/components/steps/Step4DecisionDeliberation";
import Step5MinuteCompilation from "@/components/steps/Step5MinuteCompilation";
import Step6EBYSExport from "@/components/steps/Step6EBYSExport";
import TemplateWizardModal from "@/components/TemplateWizardModal";

export default function MeetingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const meetingId = params.id as string;

  const [meeting, setMeeting] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(1);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);

  const loadMeeting = () => {
    fetch(`/api/meetings/${meetingId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMeeting(data.meeting);
          setActiveStep(data.meeting.currentStep || 1);
        }
      })
      .catch((err) => console.error("Meeting fetch error:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (meetingId) {
      loadMeeting();
    }
  }, [meetingId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[55vh] space-y-4">
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-selcuk-blue/10 flex items-center justify-center animate-pulse">
            <Loader2 className="w-8 h-8 text-selcuk-blue animate-spin" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-slate-800">Toplantı Süreci Yükleniyor</p>
          <p className="text-xs text-slate-500 mt-0.5">Selçuk Üniversitesi Bölüm Kurulu Karar Sistemi</p>
        </div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-10 text-center max-w-md mx-auto shadow-lg">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-200">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Toplantı Bulunamadı</h3>
        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
          İlgili toplantı kaydı veritabanında mevcut değil veya sistem yöneticisi tarafından kaldırılmış olabilir.
        </p>
        <Link
          href="/"
          className="mt-5 inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 bg-selcuk-blue hover:bg-selcuk-dark text-white rounded-xl shadow-md transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Toplantı Panosuna Dön
        </Link>
      </div>
    );
  }

  const meetingNoFormatted = `${meeting.academicYear}/${meeting.meetingNumber < 10 ? "0" + meeting.meetingNumber : meeting.meetingNumber}`;
  const isMultiAbd = meeting.department?.departmentType === "COK_ANABILIM_DALI";

  return (
    <div className="space-y-6">
      {/* Executive Breadcrumb & Institutional Header */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-5 no-print">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mb-3">
          <Link href="/" className="hover:text-selcuk-blue transition-colors">
            Toplantı Panosu
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-600 font-semibold">{meeting.department.name}</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-selcuk-blue font-bold">Toplantı #{meetingNoFormatted}</span>
        </div>

        {/* Main Header Content */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <Link
              href="/"
              className="p-2.5 bg-slate-50 hover:bg-selcuk-blue hover:text-white rounded-xl border border-slate-200 text-slate-600 transition-all shadow-xs group"
              title="Panoya Dön"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            </Link>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="font-mono font-black text-xs bg-selcuk-blue text-amber-300 px-2.5 py-0.5 rounded-md shadow-xs">
                  Toplantı No: {meetingNoFormatted}
                </span>

                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                  isMultiAbd
                    ? "bg-purple-50 text-purple-700 border-purple-200"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}>
                  {isMultiAbd ? "Çok Anabilim Dalı (Md. 15/2)" : "Tek Anabilim Dalı (Md. 15/1)"}
                </span>

                <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  {meeting.department.faculty?.name || "Mühendislik ve Doğa Bilimleri Fakültesi"}
                </span>
              </div>

              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                {meeting.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2 font-medium">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-selcuk-blue" />
                  {new Intl.DateTimeFormat("tr-TR", { dateStyle: "long" }).format(new Date(meeting.scheduledDate))}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-selcuk-turquoise" />
                  {new Intl.DateTimeFormat("tr-TR", { hour: "2-digit", minute: "2-digit" }).format(new Date(meeting.scheduledDate))}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  {meeting.location || "Bölüm Başkanlığı Toplantı Salonu"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Document Download Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={`/api/meetings/${meeting.id}/export-docx?type=minute`}
              download
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-all shadow-xs"
              title="Word formatında resmi tutanak indir"
            >
              <FileType className="w-4 h-4 text-blue-600" />
              <span>Word (DOCX)</span>
            </a>

            <a
              href={`/api/meetings/${meeting.id}/export-pdf`}
              download
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition-all shadow-xs"
              title="Resmi PDF Karar Tutanağı İndir"
            >
              <Download className="w-4 h-4 text-amber-600" />
              <span>PDF Karar</span>
            </a>
          </div>
        </div>
      </div>

      {/* 6 Aşamalı İnteraktif Stepper */}
      <MeetingStepper
        currentStep={activeStep}
        onStepClick={(step) => setActiveStep(step)}
        status={meeting.status}
      />

      {/* Aşamalar */}
      {activeStep === 1 && (
        <Step1CallAndAgenda
          meeting={meeting}
          onRefresh={loadMeeting}
          onNextStep={() => setActiveStep(2)}
          onOpenTemplateModal={() => setTemplateModalOpen(true)}
        />
      )}

      {activeStep === 2 && (
        <Step2AttendanceAndQuorum
          meeting={meeting}
          onRefresh={loadMeeting}
          onNextStep={() => setActiveStep(3)}
          onPrevStep={() => setActiveStep(1)}
        />
      )}

      {activeStep === 3 && (
        <Step3AgendaVoting
          meeting={meeting}
          onRefresh={loadMeeting}
          onNextStep={() => setActiveStep(4)}
          onPrevStep={() => setActiveStep(2)}
        />
      )}

      {activeStep === 4 && (
        <Step4DecisionDeliberation
          meeting={meeting}
          onRefresh={loadMeeting}
          onNextStep={() => setActiveStep(5)}
          onPrevStep={() => setActiveStep(3)}
        />
      )}

      {activeStep === 5 && (
        <Step5MinuteCompilation
          meeting={meeting}
          onRefresh={loadMeeting}
          onNextStep={() => setActiveStep(6)}
          onPrevStep={() => setActiveStep(4)}
        />
      )}

      {activeStep === 6 && (
        <Step6EBYSExport
          meeting={meeting}
          onRefresh={loadMeeting}
          onPrevStep={() => setActiveStep(5)}
        />
      )}

      {/* Parametrik Karar Şablon Sihirbazı Modalı */}
      <TemplateWizardModal
        isOpen={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        onItemCreated={loadMeeting}
        meetingId={meeting.id}
        departmentName={meeting.department.name}
      />
    </div>
  );
}
