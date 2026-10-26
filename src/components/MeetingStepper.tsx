"use client";

import { Check, Clock, AlertTriangle, Send, FileCheck, Award, FileSpreadsheet, ChevronRight } from "lucide-react";

interface MeetingStepperProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
  status: string;
}

export default function MeetingStepper({ currentStep, onStepClick, status }: MeetingStepperProps) {
  const steps = [
    {
      step: 1,
      title: "Gündem ve Çağrı",
      subtitle: "Çağrı & Gündem Taslağı",
      icon: Clock,
      desc: "Toplantı çağrısı ve gündem maddelerini üyelere bildirme"
    },
    {
      step: 2,
      title: "Hazirun & Nisap",
      subtitle: "Salt Çoğunluk Kontrolü",
      icon: Award,
      desc: "Üye tamsayısının salt çoğunluğu aranır; yetersizse ertelenir"
    },
    {
      step: 3,
      title: "Gündem Oylaması",
      subtitle: "Kabul & Çıkarma",
      icon: FileSpreadsheet,
      desc: "Gündem maddelerinin kabulünü oylama ve eleme"
    },
    {
      step: 4,
      title: "Müzakere & Karar",
      subtitle: "Şablonlar & Oylama",
      icon: FileCheck,
      desc: "5 parametrik şablon ile maddeleri karara bağlama"
    },
    {
      step: 5,
      title: "Tutanak Derleme",
      subtitle: "Resmi Karar Tutanağı",
      icon: FileCheck,
      desc: "Karar no, mevzuat dayanakları ve imza blokları"
    },
    {
      step: 6,
      title: "EBYS & Sevk",
      subtitle: "Dekanlık Sevk & PDF",
      icon: Send,
      desc: "EBYS barkodu, doğrulama kodu ve üst yazı ile sevk"
    }
  ];

  const isPostponed = status === "ERTELENDI";

  return (
    <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-300 mb-6 no-print">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-selcuk-turquoise animate-pulse" />
          <span className="text-xs font-extrabold uppercase tracking-wider text-selcuk-blue">
            Selçuk Üniversitesi Bölüm Kurulu Süreci (6 Standart Adım)
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold border border-slate-200">
            Mevzuat Uyumlu
          </span>
        </div>

        {isPostponed ? (
          <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 text-xs font-bold px-3 py-1 rounded-full border border-red-200 shadow-xs">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600 animate-bounce" />
            Salt Çoğunluk Sağlanamadı - Toplantı Ertelendi
          </span>
        ) : (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">İlerleme:</span>
            <span className="font-extrabold text-selcuk-blue bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
              Adım {currentStep} / 6 ({Math.round((currentStep / 6) * 100)}%)
            </span>
          </div>
        )}
      </div>

      {/* Steps Track */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {steps.map((item) => {
          const isCompleted = item.step < currentStep && !isPostponed;
          const isCurrent = item.step === currentStep && !isPostponed;
          const isFuture = item.step > currentStep;
          const Icon = item.icon;

          return (
            <button
              key={item.step}
              type="button"
              disabled={isFuture}
              onClick={() => onStepClick && onStepClick(item.step)}
              className={`relative text-left p-3 rounded-xl border transition-all duration-200 flex flex-col justify-between group overflow-hidden ${
                isCurrent
                  ? "bg-gradient-to-br from-selcuk-blue to-selcuk-dark text-white border-selcuk-blue shadow-lg shadow-selcuk-blue/25 ring-2 ring-amber-400/70 scale-[1.02]"
                  : isCompleted
                  ? "bg-emerald-50/70 text-slate-800 border-emerald-200 hover:bg-emerald-100/80 hover:border-emerald-300 cursor-pointer shadow-xs"
                  : isPostponed && item.step === 2
                  ? "bg-red-50 text-red-900 border-red-300 ring-2 ring-red-400 shadow-xs"
                  : "bg-slate-50/60 text-slate-400 border-slate-200/80 opacity-60 cursor-not-allowed"
              }`}
            >
              {/* Active glow corner */}
              {isCurrent && (
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-amber-400/20 to-transparent rounded-bl-full pointer-events-none" />
              )}

              <div className="flex items-center justify-between w-full mb-2">
                <span
                  className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs transition-transform group-hover:scale-105 shadow-xs ${
                    isCurrent
                      ? "bg-amber-400 text-selcuk-dark"
                      : isCompleted
                      ? "bg-emerald-600 text-white"
                      : isPostponed && item.step === 2
                      ? "bg-red-600 text-white"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : item.step}
                </span>

                <div className={`p-1.5 rounded-lg ${
                  isCurrent ? "bg-white/10 text-amber-300" : isCompleted ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"
                }`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>

              <div>
                <p className={`font-bold text-xs tracking-tight ${isCurrent ? "text-white" : "text-slate-800"}`}>
                  {item.title}
                </p>
                <p
                  className={`text-[10px] mt-0.5 truncate font-medium ${
                    isCurrent ? "text-slate-200" : isCompleted ? "text-slate-600" : "text-slate-400"
                  }`}
                >
                  {item.subtitle}
                </p>
              </div>

              {/* Bottom progress bar line */}
              <div className="mt-2.5 w-full bg-black/10 rounded-full h-1 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    isCurrent
                      ? "bg-amber-400 w-full"
                      : isCompleted
                      ? "bg-emerald-500 w-full"
                      : "bg-transparent w-0"
                  }`}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
