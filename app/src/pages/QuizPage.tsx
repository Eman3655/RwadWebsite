import { useParams, Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import { celebrateGoalAchieved } from "@/utils/celebrations";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Trophy,
  ArrowLeft,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

function normalizeOptions(options: unknown): string[] {
  if (Array.isArray(options)) return options.map(String);

  if (typeof options === "string") {
    try {
      const parsed = JSON.parse(options);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  }

  return [];
}

function normalizeAnswers(answers: unknown): Record<string, number> {
  if (!answers) return {};

  if (typeof answers === "string") {
    try {
      const parsed = JSON.parse(answers);
      return typeof parsed === "object" && parsed !== null
        ? (parsed as Record<string, number>)
        : {};
    } catch {
      return {};
    }
  }

  if (typeof answers === "object") {
    return answers as Record<string, number>;
  }

  return {};
}

export default function QuizPage() {
  const { id } = useParams<{ id: string }>();
  const quizId = Number(id);

  const { data: quiz, isLoading } = trpc.quiz.getById.useQuery({ id: quizId });

  const { data: previousAttempts } = trpc.quiz.myAttempts.useQuery(
    { quizId },
    { enabled: !!quizId },
  );

  const previousAttempt = previousAttempts?.[0] ?? null;

  const questions = useMemo(() => {
    return (quiz?.questions ?? []).map((q) => ({
      ...q,
      options: normalizeOptions(q.options),
    }));
  }, [quiz]);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [result, setResult] = useState<{
    score: number;
    totalMarks: number;
    percentage: number;
    isPassed: boolean;
  } | null>(null);

  const submitMutation = trpc.quiz.submit.useMutation({
    onSuccess: (data) => {
      setResult(data);
      setQuizSubmitted(true);

      if (data.isPassed) {
        setTimeout(() => {
          celebrateGoalAchieved();
        }, 300);
      }
    },
    onError: (err) => {
      setError(err.message || "حدث خطأ أثناء تسليم الاختبار");
    },
  });

  const totalTime = (quiz?.timeLimit || 30) * 60;

  useEffect(() => {
    if (previousAttempt && !quizSubmitted) {
      setResult({
        score: previousAttempt.score,
        totalMarks: previousAttempt.totalMarks,
        percentage: Number(previousAttempt.percentage),
        isPassed: previousAttempt.isPassed,
      });

      setAnswers(normalizeAnswers(previousAttempt.answers));
      setQuizSubmitted(true);
    }
  }, [previousAttempt, quizSubmitted]);

  useEffect(() => {
    if (!quiz || quizSubmitted) return;
    setTimeLeft(totalTime);
  }, [quiz?.id, totalTime, quizSubmitted]);

  useEffect(() => {
    if (!quiz || quizSubmitted || timeLeft === null) return;

    if (timeLeft <= 0) {
      if (!submitMutation.isPending) {
        submitMutation.mutate({ quizId, answers });
      }
      return;
    }

    const timer = window.setTimeout(() => {
      setTimeLeft((prev) => (prev === null ? null : prev - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [quiz, quizSubmitted, timeLeft, submitMutation, quizId, answers]);

  const handleAnswer = (questionId: string, answerIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answerIndex,
    }));
  };

  const handleSubmit = () => {
    if (!quiz || submitMutation.isPending || quizSubmitted) return;

    setError("");

    submitMutation.mutate({
      quizId,
      answers,
    });
  };

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return "--:--";

    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
          <h2 className="text-2xl font-bold">الاختبار غير موجود</h2>
          <Link to="/courses">
            <Button className="mt-4">العودة للبرامج</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
          <h2 className="text-2xl font-bold">لا توجد أسئلة في هذا الاختبار</h2>
          <Link to={`/courses/${quiz.courseId}`}>
            <Button className="mt-4">العودة للبرنامج</Button>
          </Link>
        </div>
      </div>
    );
  }

  const progressPercent =
    timeLeft === null ? 0 : ((totalTime - timeLeft) / totalTime) * 100;

  if (quizSubmitted && result) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />

        <div className="pt-24 pb-10">
          <div className="max-w-3xl mx-auto px-4">
            <Card className="border-0 shadow-xl">
              <CardContent className="p-8 text-center">
                {result.isPassed ? (
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Trophy className="h-10 w-10 text-green-600" />
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <XCircle className="h-10 w-10 text-red-600" />
                  </div>
                )}

                <h2 className="text-3xl font-bold text-slate-900 mb-2">
                  {result.isPassed ? "تهانينا!" : "تم تسليم الاختبار"}
                </h2>

                {previousAttempt && (
                  <p className="text-sm text-slate-500 mt-2">
                    لقد قمت بتقديم هذا الاختبار من قبل، ولا يمكن تقديمه مرة أخرى.
                  </p>
                )}

                <div className="grid grid-cols-3 gap-4 mb-8 mt-8">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-2xl font-bold">{result.score}</div>
                    <div className="text-sm text-slate-500">الدرجة</div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-2xl font-bold">{result.totalMarks}</div>
                    <div className="text-sm text-slate-500">الإجمالي</div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4">
                    <div
                      className={`text-2xl font-bold ${
                        result.isPassed ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {result.percentage.toFixed(0)}%
                    </div>
                    <div className="text-sm text-slate-500">النسبة</div>
                  </div>
                </div>

                <Badge
                  className={`text-lg px-6 py-2 ${
                    result.isPassed
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {result.isPassed ? "ناجح" : "حاول مجدداً"}
                </Badge>

                <div className="mt-8">
                  <Link to={`/courses/${quiz.courseId}`}>
                    <Button variant="outline">
                      <ArrowLeft className="h-4 w-4 ml-2" />
                      العودة للبرنامج
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg mt-6">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4 text-slate-900">
                  مراجعة الإجابات
                </h3>

                <div className="space-y-4 text-right">
                  {questions.map((q, index) => {
                    const questionKey = String(q.id);
                    const userAnswer = answers[questionKey];
                    const correctAnswer = Number(q.correctAnswer);

                    return (
                      <div key={q.id} className="border rounded-xl p-4 bg-slate-50">
                        <div className="font-bold mb-3 text-slate-900">
                          {index + 1}. {q.question}
                        </div>

                        {q.options.map((option, idx) => (
                          <div
                            key={idx}
                            className={`p-2 rounded-lg mb-1 ${
                              idx === correctAnswer
                                ? "bg-green-100 text-green-700 font-medium"
                                : idx === userAnswer && idx !== correctAnswer
                                  ? "bg-red-100 text-red-700"
                                  : "bg-white text-slate-600"
                            }`}
                          >
                            {String.fromCharCode(65 + idx)} - {option}
                            {idx === correctAnswer ? " ✓ الإجابة الصحيحة" : ""}
                            {idx === userAnswer ? " — إجابتك" : ""}
                          </div>
                        ))}

                        {userAnswer === undefined && (
                          <div className="text-sm text-slate-400 mt-2">
                            لم يتم اختيار إجابة لهذا السؤال.
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="pt-20 pb-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
              <Link to={`/courses/${quiz.courseId}`} className="hover:text-blue-600">
                البرنامج
              </Link>
              <ChevronLeft className="h-4 w-4" />
              <span>{quiz.title}</span>
            </div>

            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-slate-900">{quiz.title}</h1>

              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm">
                <Clock className="h-5 w-5 text-blue-600" />
                <span className="font-mono text-lg font-bold text-slate-900">
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
          </div>

          <Progress value={progressPercent} className="h-2 mb-6" />

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {questions.map((question, idx) => {
              const questionKey = String(question.id);
              const isAnswered = answers[questionKey] !== undefined;

              return (
                <button
                  key={question.id}
                  onClick={() => setCurrentQuestion(idx)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-sm font-medium transition-colors ${
                    idx === currentQuestion
                      ? "bg-blue-600 text-white"
                      : isAnswered
                        ? "bg-green-100 text-green-700"
                        : "bg-white text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <Card className="border-0 shadow-lg mb-6">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <Badge className="bg-blue-100 text-blue-700">
                  سؤال {currentQuestion + 1} من {questions.length}
                </Badge>
                <span className="text-sm text-slate-500">({q.marks} نقطة)</span>
              </div>

              <h2 className="text-xl font-bold text-slate-900 mb-8">
                {q.question}
              </h2>

              {q.options.length > 0 ? (
                <div className="space-y-3">
                  {q.options.map((option, idx) => {
                    const questionKey = String(q.id);
                    const selected = answers[questionKey] === idx;

                    return (
                      <button
                        key={idx}
                        onClick={() => handleAnswer(questionKey, idx)}
                        className={`w-full text-right p-4 rounded-xl border-2 transition-all ${
                          selected
                            ? "border-blue-600 bg-blue-50"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm font-medium ${
                              selected
                                ? "bg-blue-600 text-white"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {String.fromCharCode(65 + idx)}
                          </div>

                          <span className="text-slate-700">{option}</span>

                          {selected && (
                            <CheckCircle className="h-5 w-5 text-blue-600 mr-auto" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-slate-500 border rounded-xl p-6">
                  لا توجد خيارات لهذا السؤال.
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button
              variant="outline"
              disabled={currentQuestion === 0}
              onClick={() => setCurrentQuestion((prev) => prev - 1)}
            >
              <ChevronRight className="h-4 w-4 ml-1" />
              السابق
            </Button>

            {currentQuestion < questions.length - 1 ? (
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => setCurrentQuestion((prev) => prev + 1)}
              >
                التالي
                <ChevronLeft className="h-4 w-4 mr-1" />
              </Button>
            ) : (
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={handleSubmit}
                disabled={submitMutation.isPending}
              >
                {submitMutation.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin ml-2" />
                ) : (
                  <CheckCircle className="h-5 w-5 ml-2" />
                )}
                تسليم الإجابات
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}