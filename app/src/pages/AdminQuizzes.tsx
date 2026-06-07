import { useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  HelpCircle,
  Plus,
  Trash2,
  ChevronLeft,
  Clock,
  Target,
  Loader2,
  Pencil,
  Eye,
} from "lucide-react";

export default function AdminQuizzes() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const utils = trpc.useUtils();

  const [selectedCourseId, setSelectedCourseId] = useState<number>(0);
  const [open, setOpen] = useState(false);
  const [openQuestion, setOpenQuestion] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState<number>(0);
  const [editingQuizId, setEditingQuizId] = useState<number | null>(null);
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);

  const { data: courses } = trpc.course.adminList.useQuery(undefined, {
    enabled: isAdmin,
  });

  const { data: quizzes } = trpc.quiz.list.useQuery(
    { courseId: selectedCourseId },
    { enabled: selectedCourseId > 0 },
  );

  const { data: selectedQuiz } = trpc.quiz.getById.useQuery(
    { id: selectedQuizId },
    { enabled: selectedQuizId > 0 },
  );

  const [quizForm, setQuizForm] = useState({
    title: "",
    description: "",
    timeLimit: 30,
    passingScore: 60,
    totalMarks: 100,
  });

  const [questionForm, setQuestionForm] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    marks: 1,
  });

  const resetQuizForm = () => {
    setQuizForm({
      title: "",
      description: "",
      timeLimit: 30,
      passingScore: 60,
      totalMarks: 100,
    });
    setEditingQuizId(null);
  };

  const resetQuestionForm = () => {
    setQuestionForm({
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      marks: 1,
    });
    setEditingQuestionId(null);
  };

  const createMutation = trpc.quiz.create.useMutation({
    onSuccess: () => {
      utils.quiz.list.invalidate();
      setOpen(false);
      resetQuizForm();
    },
  });

  const updateMutation = trpc.quiz.update.useMutation({
    onSuccess: () => {
      utils.quiz.list.invalidate();
      setOpen(false);
      resetQuizForm();
    },
  });

  const deleteMutation = trpc.quiz.delete.useMutation({
    onSuccess: () => {
      utils.quiz.list.invalidate();
    },
  });

  const addQuestionMutation = trpc.quiz.addQuestion.useMutation({
    onSuccess: () => {
      utils.quiz.getById.invalidate();
      setOpenQuestion(false);
      resetQuestionForm();
    },
  });

  const updateQuestionMutation = trpc.quiz.updateQuestion.useMutation({
    onSuccess: () => {
      utils.quiz.getById.invalidate();
      setOpenQuestion(false);
      resetQuestionForm();
    },
  });

  const deleteQuestionMutation = trpc.quiz.deleteQuestion.useMutation({
    onSuccess: () => {
      utils.quiz.getById.invalidate();
    },
  });

  const handleSubmitQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) return;

    if (editingQuizId) {
      updateMutation.mutate({
        id: editingQuizId,
        ...quizForm,
      });
    } else {
      createMutation.mutate({
        ...quizForm,
        courseId: selectedCourseId,
      });
    }
  };

  const handleSubmitQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuizId) return;

    const payload = {
      ...questionForm,
      options: questionForm.options.filter((o) => o.trim() !== ""),
    };

    if (editingQuestionId) {
      updateQuestionMutation.mutate({
        id: editingQuestionId,
        ...payload,
      });
    } else {
      addQuestionMutation.mutate({
        ...payload,
        quizId: selectedQuizId,
      });
    }
  };

  const handleEditQuiz = (quiz: any) => {
    setEditingQuizId(quiz.id);
    setQuizForm({
      title: quiz.title || "",
      description: quiz.description || "",
      timeLimit: quiz.timeLimit || 30,
      passingScore: quiz.passingScore || 60,
      totalMarks: quiz.totalMarks || 100,
    });
    setOpen(true);
  };

  const handleEditQuestion = (q: any) => {
    setEditingQuestionId(q.id);
    setQuestionForm({
      question: q.question || "",
      options:
        q.options && q.options.length > 0
          ? [...q.options, "", "", "", ""].slice(0, 4)
          : ["", "", "", ""],
      correctAnswer: q.correctAnswer || 0,
      marks: q.marks || 1,
    });
    setOpenQuestion(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="text-slate-500 hover:text-slate-700">
                <ChevronLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-xl font-bold text-slate-900">إدارة الاختبارات</h1>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={!selectedCourseId}
                  onClick={resetQuizForm}
                >
                  <Plus className="h-4 w-4 ml-2" />
                  اختبار جديد
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>
                    {editingQuizId ? "تعديل الاختبار" : "إضافة اختبار جديد"}
                  </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmitQuiz} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>عنوان الاختبار *</Label>
                    <Input
                      value={quizForm.title}
                      onChange={(e) =>
                        setQuizForm({ ...quizForm, title: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>الوصف</Label>
                    <Input
                      value={quizForm.description}
                      onChange={(e) =>
                        setQuizForm({ ...quizForm, description: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>الوقت (د)</Label>
                      <Input
                        type="number"
                        value={quizForm.timeLimit}
                        onChange={(e) =>
                          setQuizForm({
                            ...quizForm,
                            timeLimit: Number(e.target.value),
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>درجة النجاح</Label>
                      <Input
                        type="number"
                        value={quizForm.passingScore}
                        onChange={(e) =>
                          setQuizForm({
                            ...quizForm,
                            passingScore: Number(e.target.value),
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>الدرجة الكلية</Label>
                      <Input
                        type="number"
                        value={quizForm.totalMarks}
                        onChange={(e) =>
                          setQuizForm({
                            ...quizForm,
                            totalMarks: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {createMutation.isPending || updateMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin ml-2" />
                    ) : editingQuizId ? (
                      <Pencil className="h-4 w-4 ml-2" />
                    ) : (
                      <Plus className="h-4 w-4 ml-2" />
                    )}
                    {editingQuizId ? "حفظ التعديلات" : "إضافة الاختبار"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="border-0 shadow-md mb-6">
          <CardContent className="p-4">
            <Label className="mb-2 block">اختر البرنامج</Label>
            <Select
              value={String(selectedCourseId)}
              onValueChange={(v) => {
                setSelectedCourseId(Number(v));
                setSelectedQuizId(0);
              }}
            >
              <SelectTrigger className="w-full md:w-96">
                <SelectValue placeholder="اختر برنامجًا" />
              </SelectTrigger>
              <SelectContent>
                {courses?.map((course) => (
                  <SelectItem key={course.id} value={String(course.id)}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedCourseId > 0 && (
          <div className="space-y-4">
            {quizzes?.map((quiz) => (
              <Card key={quiz.id} className="border-0 shadow-md">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <HelpCircle className="h-6 w-6 text-blue-600" />
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900">{quiz.title}</h3>
                        <p className="text-sm text-slate-500">
                          {quiz.description || "لا يوجد وصف"}
                        </p>

                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {quiz.timeLimit} دقيقة
                          </span>
                          <span className="flex items-center gap-1">
                            <Target className="h-4 w-4" />
                            درجة النجاح: {quiz.passingScore}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditQuiz(quiz)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedQuizId(quiz.id);
                          resetQuestionForm();
                          setOpenQuestion(true);
                        }}
                      >
                        <Plus className="h-4 w-4 ml-1" />
                        سؤال
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setSelectedQuizId(
                            selectedQuizId === quiz.id ? 0 : quiz.id,
                          )
                        }
                      >
                        <Eye className="h-4 w-4 ml-1" />
                        {selectedQuizId === quiz.id ? "إخفاء الأسئلة" : "عرض الأسئلة"}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => {
                          if (confirm("هل أنت متأكد؟")) {
                            deleteMutation.mutate({ id: quiz.id });
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {selectedQuizId === quiz.id && (
                    <div className="mt-5 pt-5 border-t border-slate-100 space-y-3">
                      {!selectedQuiz?.questions ||
                      selectedQuiz.questions.length === 0 ? (
                        <div className="text-sm text-slate-400 text-center py-4">
                          لا توجد أسئلة مضافة لهذا الاختبار
                        </div>
                      ) : (
                        selectedQuiz.questions.map((q: any, idx: number) => (
                          <div
                            key={q.id}
                            className="bg-slate-50 border border-slate-100 rounded-lg p-4"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h4 className="font-semibold text-slate-900">
                                  {idx + 1}. {q.question}
                                </h4>

                                <div className="mt-3 space-y-1 text-sm">
                                  {q.options?.map((opt: string, i: number) => (
                                    <div
                                      key={i}
                                      className={
                                        i === Number(q.correctAnswer)
                                          ? "text-green-600 font-medium"
                                          : "text-slate-600"
                                      }
                                    >
                                      {String.fromCharCode(65 + i)} - {opt}
                                      {i === Number(q.correctAnswer)
                                        ? " ✓"
                                        : ""}
                                    </div>
                                  ))}
                                </div>

                                <div className="text-xs text-slate-400 mt-2">
                                  الدرجة: {q.marks}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditQuestion(q)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                  onClick={() => {
                                    if (confirm("هل أنت متأكد من حذف السؤال؟")) {
                                      deleteQuestionMutation.mutate({ id: q.id });
                                    }
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {(!quizzes || quizzes.length === 0) && (
              <Card className="border-0 shadow-md">
                <CardContent className="p-8 text-center text-slate-400">
                  <HelpCircle className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                  لا توجد اختبارات في هذا البرنامج
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      <Dialog
        open={openQuestion}
        onOpenChange={(isOpen) => {
          setOpenQuestion(isOpen);
          if (!isOpen) resetQuestionForm();
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingQuestionId ? "تعديل السؤال" : "إضافة سؤال"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmitQuestion} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>نص السؤال *</Label>
              <Input
                value={questionForm.question}
                onChange={(e) =>
                  setQuestionForm({
                    ...questionForm,
                    question: e.target.value,
                  })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label>الخيارات</Label>
              {questionForm.options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-sm text-slate-500 w-8">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <Input
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...questionForm.options];
                      newOpts[idx] = e.target.value;
                      setQuestionForm({
                        ...questionForm,
                        options: newOpts,
                      });
                    }}
                    placeholder={`الخيار ${String.fromCharCode(65 + idx)}`}
                  />
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label>الإجابة الصحيحة</Label>
              <Select
                value={String(questionForm.correctAnswer)}
                onValueChange={(v) =>
                  setQuestionForm({
                    ...questionForm,
                    correctAnswer: Number(v),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {questionForm.options.map((_, idx) => (
                    <SelectItem key={idx} value={String(idx)}>
                      {String.fromCharCode(65 + idx)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>درجة السؤال</Label>
              <Input
                type="number"
                value={questionForm.marks}
                onChange={(e) =>
                  setQuestionForm({
                    ...questionForm,
                    marks: Number(e.target.value),
                  })
                }
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={
                addQuestionMutation.isPending ||
                updateQuestionMutation.isPending
              }
            >
              {addQuestionMutation.isPending ||
              updateQuestionMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin ml-2" />
              ) : editingQuestionId ? (
                <Pencil className="h-4 w-4 ml-2" />
              ) : (
                <Plus className="h-4 w-4 ml-2" />
              )}

              {editingQuestionId ? "حفظ التعديلات" : "إضافة السؤال"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}