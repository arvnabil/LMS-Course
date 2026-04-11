import { useForm, router } from '@inertiajs/react';
import { useState } from 'react';

export default function QuizPlayerInline({ quiz, onCancel }) {
    const isSubmission = quiz.type === 'submission';
    
    // Multiple Choice State
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [selectedOptions, setSelectedOptions] = useState({});
    const [isFinished, setIsFinished] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [quizResult, setQuizResult] = useState(null);

    // Submission Form
    const { data, setData, post, processing, errors } = useForm({
        submission_text: '',
        file: null,
    });

    const questions = quiz.questions || [];
    const currentQuestion = questions[currentQuestionIdx];

    const handleSelectOption = (questionId, optionId, isMultiple = false) => {
        if (isMultiple) {
            const currentSelected = selectedOptions[questionId] || [];
            if (currentSelected.includes(optionId)) {
                setSelectedOptions({
                    ...selectedOptions,
                    [questionId]: currentSelected.filter(id => id !== optionId)
                });
            } else {
                setSelectedOptions({
                    ...selectedOptions,
                    [questionId]: [...currentSelected, optionId]
                });
            }
        } else {
            setSelectedOptions({
                ...selectedOptions,
                [questionId]: optionId
            });
        }
    };

    const nextQuestion = () => {
        if (currentQuestionIdx < questions.length - 1) {
            setCurrentQuestionIdx(currentQuestionIdx + 1);
        } else {
            setIsFinished(true);
        }
    };

    const submitQuiz = () => {
        setSubmitting(true);
        router.post(route('student.quizzes.submit', quiz.id), {
            answers: selectedOptions
        }, {
            onSuccess: (page) => {
                const result = page.props.flash?.quiz_result;
                if (result) {
                    setQuizResult(result);
                } else {
                    onCancel();
                }
            },
            onFinish: () => {
                setSubmitting(false);
            }
        });
    };

    const handleSubmissionSubmit = (e) => {
        e.preventDefault();
        post(route('student.quizzes.submit', quiz.id), {
            onSuccess: () => onCancel()
        });
    };

    return (
        <div className="w-full h-full flex flex-col bg-muted/30 relative">
            <div className="w-full h-full bg-surface border-b border-border flex flex-col animate-in fade-in duration-500 relative">
                {/* Header */}
                <div className="px-10 py-8 border-b border-border flex items-center justify-between bg-surface sticky top-0 z-10">
                    <div className="space-y-1">
                        <h2 className="text-xl font-extrabold text-foreground tracking-tight">{quiz.title}</h2>
                        <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
                            {quizResult ? 'Result' : (isSubmission ? 'Assignment Submission' : `Question ${isFinished ? questions.length : currentQuestionIdx + 1} of ${questions.length}`)}
                        </p>
                    </div>
                    <button onClick={onCancel} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-gray-400 hover:text-red-500 transition-all font-bold">
                        ✕
                    </button>
                </div>

                <div className="flex-1 p-6 sm:p-10 lg:p-16 overflow-y-auto scrollbar-hide">
                    {quizResult ? (
                        <div className="max-w-md mx-auto text-center space-y-10 py-10 animate-in fade-in slide-in-from-bottom duration-700">
                            {(() => {
                                const isPassed = Number(quizResult.score) >= Number(quizResult.passing_score || 85);
                                return (
                                    <>
                                        <div className={`w-32 h-32 rounded-full mx-auto flex items-center justify-center text-5xl shadow-2xl transition-all duration-700 ${isPassed ? 'bg-emerald-500 shadow-emerald-500/30' : 'bg-red-500 shadow-red-500/30'}`}>
                                            {isPassed ? '🏆' : '💪'}
                                        </div>
                                        
                                        <div className="space-y-4">
                                            <h3 className={`text-4xl font-black tracking-tight ${isPassed ? 'text-emerald-500' : 'text-red-500'}`}>
                                                {isPassed ? 'Passed!' : 'Try Again'}
                                            </h3>
                                            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                                                Your Score: {quizResult.score}%
                                            </p>
                                        </div>
                                    </>
                                );
                            })()}

                            <div className="bg-muted/50 rounded-[40px] p-10 border border-border flex flex-col gap-6">
                                <div className="flex justify-between items-center px-2">
                                    <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">Correct Answers</span>
                                    <span className="text-foreground font-black text-xl">{quizResult.correct_answers} / {quizResult.total_questions}</span>
                                </div>
                                <div className="h-2 w-full bg-border rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-1000 ${quizResult.is_passed ? 'bg-emerald-500' : 'bg-red-500'}`}
                                        style={{ width: `${quizResult.score}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between items-center px-2">
                                    <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">Passing Grade</span>
                                    <span className="text-foreground font-bold text-sm tracking-widest">{quizResult.passing_score}%</span>
                                </div>
                            </div>

                            <button
                                onClick={onCancel}
                                className="bg-foreground text-surface w-full py-6 rounded-full font-black uppercase tracking-widest shadow-2xl hover:scale-[1.02] transition-all cursor-pointer"
                            >
                                Continue Watching
                            </button>
                        </div>
                    ) : (
                        isSubmission ? (
                        <div className="max-w-3xl mx-auto space-y-10">
                            <div className="space-y-6">
                                <h3 className="text-2xl font-extrabold text-foreground leading-tight tracking-tight">Instructions</h3>
                                <div className="bg-primary/5 border border-primary/10 rounded-[32px] p-8">
                                    <div className="text-foreground/80 font-medium leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: quiz.description || "No instructions provided. Please submit your work as requested." }} />
                                </div>
                            </div>

                            <form onSubmit={handleSubmissionSubmit} className="space-y-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest px-1">Your Response</label>
                                    <textarea
                                        value={data.submission_text}
                                        onChange={e => setData('submission_text', e.target.value)}
                                        className="w-full bg-muted border-none rounded-[32px] px-8 py-6 text-sm font-bold min-h-[200px] focus:ring-4 focus:ring-primary/10 transition-all text-foreground"
                                        placeholder="Type your answer or any additional notes here..."
                                    />
                                    {errors.submission_text && <p className="text-red-500 text-xs font-bold px-4">{errors.submission_text}</p>}
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest px-1">Upload File (Optional)</label>
                                    <div className="relative group">
                                        <input
                                            type="file"
                                            onChange={e => setData('file', e.target.files[0])}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <div className={`border-2 border-dashed rounded-[32px] p-10 flex flex-col items-center justify-center gap-4 transition-all ${data.file ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-muted/30 text-gray-400 group-hover:border-primary/30 group-hover:bg-primary/5 text-foreground'}`}>
                                            <div className="text-4xl">{data.file ? '📄' : '📤'}</div>
                                            <div className="text-center">
                                                <p className="text-sm font-extrabold text-foreground">{data.file ? data.file.name : 'Click or Drag file to upload'}</p>
                                                <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest mt-1">PDF, ZIP, DOCX up to 10MB</p>
                                            </div>
                                        </div>
                                    </div>
                                    {errors.file && <p className="text-red-500 text-xs font-bold px-4">{errors.file}</p>}
                                </div>

                                <div className="pt-6">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-primary text-white w-full py-5 rounded-full font-extrabold shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all translate-y-0 hover:-translate-y-1 disabled:opacity-50 cursor-pointer"
                                    >
                                        {processing ? 'Uploading Submission...' : 'Send Submission'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        !isFinished ? (
                            <div className="max-w-3xl mx-auto space-y-12">
                                <div className="space-y-8">
                                    <h3 className="text-2xl font-extrabold text-foreground leading-tight tracking-tight">
                                        {currentQuestion?.question}
                                    </h3>
                                    
                                    {currentQuestion?.options?.filter(o => o.is_correct).length > 1 ? (
                                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full animate-pulse">
                                            <span className="text-[10px] font-black uppercase text-primary tracking-widest">Jawaban Ganda / Multiple Answers</span>
                                        </div>
                                    ) : (
                                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                            <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Jawaban Tunggal / Single Correct</span>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    {currentQuestion?.options?.map((option) => {
                                        const isMultiple = currentQuestion.options.filter(o => o.is_correct).length > 1;
                                        const isSelected = isMultiple 
                                            ? (selectedOptions[currentQuestion.id] || []).includes(option.id)
                                            : selectedOptions[currentQuestion.id] === option.id;

                                        return (
                                            <button
                                                key={option.id}
                                                onClick={() => handleSelectOption(currentQuestion.id, option.id, isMultiple)}
                                                className={`p-6 rounded-[32px] border-2 text-left transition-all flex items-center gap-4 group cursor-pointer ${
                                                    isSelected
                                                        ? 'border-primary bg-primary/5 text-primary'
                                                        : 'border-border bg-muted/50 text-foreground hover:border-primary/20 hover:bg-primary/5'
                                                }`}
                                            >
                                                <span className={`w-8 h-8 ${isMultiple ? 'rounded-lg' : 'rounded-full'} border-2 flex items-center justify-center font-bold text-[10px] transition-colors ${
                                                    isSelected
                                                        ? 'border-primary bg-primary text-white'
                                                        : 'border-border bg-surface text-gray-300 group-hover:border-primary/50'
                                                }`}>
                                                    {isSelected ? '✓' : ''}
                                                </span>
                                                <span className="font-bold text-sm">{option.option_text}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center space-y-8 py-10 max-w-sm mx-auto">
                                <div className="text-7xl animate-bounce">🎉</div>
                                <div className="space-y-2">
                                    <h3 className="text-3xl font-extrabold text-foreground tracking-tight">Quiz Finished!</h3>
                                    <p className="text-gray-400 font-medium">You've answered all questions. Ready to submit?</p>
                                </div>
                                <div className="flex flex-col gap-4 pt-6">
                                    <button
                                        onClick={submitQuiz}
                                        disabled={submitting}
                                        className="bg-primary text-white w-full py-5 rounded-full font-extrabold shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all translate-y-0 hover:-translate-y-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {submitting ? 'Submitting...' : 'Submit Assessment'}
                                    </button>
                                    <button 
                                        onClick={() => setIsFinished(false)}
                                        className="text-[10px] font-extrabold text-gray-400 hover:text-foreground transition-colors uppercase tracking-widest text-center"
                                    >
                                        Review Answers
                                    </button>
                                </div>
                            </div>
                        )
                    )
                )}
                </div>

                {!isSubmission && !isFinished && !quizResult && (
                    <div className="px-10 py-8 bg-muted/30 border-t border-border flex justify-end">
                        <button
                            onClick={nextQuestion}
                            disabled={!selectedOptions[currentQuestion?.id] || (Array.isArray(selectedOptions[currentQuestion?.id]) && selectedOptions[currentQuestion?.id].length === 0)}
                            className="bg-primary text-white px-10 py-4 rounded-full font-extrabold text-sm shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all disabled:opacity-50 disabled:translate-y-0 cursor-pointer"
                        >
                            {currentQuestionIdx < questions.length - 1 ? 'Next Question →' : 'Finish Quiz'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
