"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle, ExternalLink, BookOpen, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

type Module = {
  id: string;
  title: string;
  description: string;
  type: string;
  contentUrl: string | null;
  isRequired: boolean;
  sortOrder: number;
};

type Progress = {
  id: string;
  completed: boolean;
  completedAt: string | null;
  score: number | null;
};

// Simple quiz question type used when quiz data is embedded in contentUrl hash
type QuizQuestion = {
  question: string;
  options: string[];
  answer: number;
};

export default function AcademyModulePage() {
  const params = useParams();
  const moduleId = params?.moduleId as string;

  const [mod, setMod] = useState<Module | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Simple inline quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // Demo quiz — in production this would come from the module's contentUrl as JSON
  const demoQuiz: QuizQuestion[] = [
    {
      question: "What is the primary contact method used for customer galleries?",
      options: ["Email", "WhatsApp", "SMS", "Phone call"],
      answer: 1,
    },
    {
      question: "What does FOMO timer enforce?",
      options: [
        "Upload speed limits",
        "Gallery expiration to drive urgency",
        "Staff shift end times",
        "Stripe payment timeout",
      ],
      answer: 1,
    },
  ];

  useEffect(() => {
    // Get current user from session
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((s) => setUserId(s?.user?.id || null))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!moduleId) return;
    setLoading(true);

    Promise.all([
      fetch("/api/academy/modules").then((r) => r.json()),
      userId
        ? fetch(`/api/academy/progress?userId=${userId}`).then((r) => r.json())
        : Promise.resolve({ entries: [] }),
    ])
      .then(([modsData, progressData]) => {
        const found = (modsData.modules || []).find((m: Module) => m.id === moduleId);
        setMod(found || null);
        const myProgress = (progressData.entries || []).find(
          (e: any) => e.moduleId === moduleId && e.userId === userId
        );
        setProgress(myProgress || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [moduleId, userId]);

  async function markComplete(score?: number) {
    if (!userId || !moduleId) return;
    setMarking(true);
    try {
      const res = await fetch("/api/academy/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          moduleId,
          completed: true,
          score: score ?? null,
        }),
      }).then((r) => r.json());
      if (res.ok) setProgress(res.entry);
    } catch {
      // silently fail
    } finally {
      setMarking(false);
    }
  }

  function submitQuiz() {
    let correct = 0;
    demoQuiz.forEach((q, i) => {
      if (quizAnswers[i] === q.answer) correct++;
    });
    const score = Math.round((correct / demoQuiz.length) * 100);
    setQuizScore(score);
    setQuizSubmitted(true);
    markComplete(score);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-6 w-6 animate-spin text-navy-400" />
      </div>
    );
  }

  if (!mod) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <h1 className="heading text-2xl mb-2">Module not found</h1>
        <p className="text-navy-400 text-sm mb-6">This module may have been removed or the link is invalid.</p>
        <Link href="/admin/academy" className="btn-primary">Back to Academy</Link>
      </div>
    );
  }

  const isComplete = progress?.completed ?? false;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      {/* Back nav */}
      <Link
        href="/admin/academy"
        className="inline-flex items-center gap-2 text-sm text-navy-500 hover:text-navy-800 transition"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Back to Academy
      </Link>

      {/* Header */}
      <div className="card p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="label-xs mb-1">{mod.type.replace(/_/g, " ")}</div>
            <h1 className="heading text-3xl">{mod.title}</h1>
            <p className="text-navy-500 mt-2 text-sm leading-relaxed">{mod.description}</p>
          </div>
          {isComplete && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-sm font-medium shrink-0">
              <CheckCircle className="h-4 w-4" strokeWidth={2} />
              Completed
            </div>
          )}
        </div>

        {mod.isRequired && (
          <div className="mt-4 text-xs inline-block bg-coral-50 text-coral-700 border border-coral-200 px-2.5 py-1 rounded-full font-medium">
            Required module
          </div>
        )}
      </div>

      {/* Content */}
      <div className="card p-6 space-y-4">
        <h2 className="heading text-lg flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-navy-400" strokeWidth={1.5} />
          Module Content
        </h2>

        {mod.contentUrl ? (
          <div className="space-y-3">
            <p className="text-sm text-navy-600">
              This module's content is hosted externally. Click the button below to open it.
            </p>
            <a
              href={mod.contentUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 btn-primary"
            >
              <ExternalLink className="h-4 w-4" strokeWidth={1.5} />
              Open Content
            </a>
          </div>
        ) : (
          <div className="rounded-xl bg-cream-100 p-6 text-sm text-navy-500 text-center">
            No content URL set for this module. Contact your manager to get access to the materials.
          </div>
        )}
      </div>

      {/* Quiz section */}
      <div className="card p-6 space-y-5">
        <h2 className="heading text-lg">Knowledge Check</h2>

        {quizSubmitted ? (
          <div className="text-center py-6">
            <div className={`text-4xl font-bold mb-2 ${quizScore! >= 50 ? "text-green-600" : "text-coral-600"}`}>
              {quizScore}%
            </div>
            <div className="text-navy-600 text-sm">
              {quizScore! >= 50 ? "Well done! Module marked as complete." : "Keep studying and try again."}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {demoQuiz.map((q, qi) => (
              <div key={qi} className="space-y-2">
                <p className="text-sm font-medium text-navy-900">
                  {qi + 1}. {q.question}
                </p>
                <div className="space-y-1.5">
                  {q.options.map((opt, oi) => (
                    <label
                      key={oi}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border cursor-pointer text-sm transition ${
                        quizAnswers[qi] === oi
                          ? "border-brand-400 bg-brand-50 text-brand-800"
                          : "border-cream-300 bg-white text-navy-700 hover:bg-cream-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q${qi}`}
                        value={oi}
                        checked={quizAnswers[qi] === oi}
                        onChange={() => setQuizAnswers({ ...quizAnswers, [qi]: oi })}
                        className="sr-only"
                      />
                      <span className="h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center border-current">
                        {quizAnswers[qi] === oi && (
                          <span className="h-2 w-2 rounded-full bg-brand-500" />
                        )}
                      </span>
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <button
              onClick={submitQuiz}
              disabled={Object.keys(quizAnswers).length < demoQuiz.length}
              className="btn-primary w-full"
            >
              Submit Quiz
            </button>
          </div>
        )}
      </div>

      {/* Mark complete (without quiz) */}
      {!isComplete && !quizSubmitted && (
        <div className="card p-6 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="font-medium text-navy-900 text-sm">Skip quiz and mark complete?</div>
            <div className="text-xs text-navy-400 mt-0.5">Only do this if your manager has confirmed completion.</div>
          </div>
          <button
            onClick={() => markComplete()}
            disabled={marking}
            className="btn-secondary shrink-0"
          >
            {marking ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" strokeWidth={1.5} />}
            Mark Complete
          </button>
        </div>
      )}

      {isComplete && (
        <div className="card p-5 flex items-center gap-3 bg-green-50 border-green-200">
          <CheckCircle className="h-5 w-5 text-green-600 shrink-0" strokeWidth={2} />
          <div className="text-sm">
            <span className="font-medium text-green-800">Module complete!</span>
            {progress?.completedAt && (
              <span className="text-green-600 ml-1">
                Finished on {new Date(progress.completedAt).toLocaleDateString()}.
              </span>
            )}
            {progress?.score != null && (
              <span className="text-green-600 ml-1">Score: {progress.score}%</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
