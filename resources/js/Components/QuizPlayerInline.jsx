import { useForm, router } from '@inertiajs/react';
import { useState } from 'react';

export default function QuizPlayerInline({ quiz, onCancel }) {
    const isSubmission = quiz.type === 'submission';
    
    // Multiple Choice State
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [selectedOptions, setSelectedOptions] = useState({});
    const [isFinished, setIsFinished] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Submission Form
    const { data, setData, post, processing, errors } = useForm({
        submission_text: '',
        file: null,
    });

    const questions = quiz.questions || [];
    const currentQuestion = questions[currentQuestionIdx];

    const handleSelectOption = (questionId, optionId) => {
        setSelectedOptions({
            ...selectedOptions,
            [questionId]: optionId
        });
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
            onSuccess: () => {
                onCancel();
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
        <div className="flex-1 overflow-y-auto flex flex-col p-6 sm:p-12 items-center justify-center bg-muted/30">
            <div className="max-w-4xl w-full bg-surface rounded-[40px] shadow-2xl shadow-gray-200/20 dark:shadow-black/20 border border-border overflow-hidden flex flex-col my-10 animate-in fade-in zoom-in duration-500">
                {/* Header */}
                <div className="px-10 py-8 border-b border-border flex items-center justify-between bg-surface sticky top-0 z-10">
                    <div className="space-y-1">
                        <h2 className="text-xl font-extrabold text-foreground tracking-tight">{quiz.title}</h2>
                        <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
                            {isSubmission ? 'Assignment Submission' : `Question ${isFinished ? questions.length : currentQuestionIdx + 1} of ${questions.length}`}
                        </p>
                    </div>
                    <button onClick={onCancel} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-gray-400 hover:text-red-500 transition-all font-bold">
                        ✕
                    </button>
                </div>

                <div className="flex-1 p-10 sm:p-16 space-y-10">
                    {isSubmission ? (
                        <div className="max-w-3xl mx-auto space-y-10">
                            <div className="space-y-6">
                                <h3 className="text-2xl font-extrabold text-foreground leading-tight tracking-tight">Instructions</h3>
                                <div className="bg-primary/5 border border-primary/10 rounded-[32px] p-8">
                                    <p className="text-foreground/80 font-medium leading-relaxed whitespace-pre-wrap">
                                        {quiz.description || "No instructions provided. Please submit your work as requested."}
                                    </p>
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
                                        className="w-full bg-primary text-white py-6 rounded-full font-extrabold shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all translate-y-0 hover:-translate-y-1 disabled:opacity-50 cursor-pointer"
                                    >
                                        {processing ? 'Submitting...' : 'Submit Assignment'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        !isFinished ? (
                            <div className="max-w-3xl mx-auto space-y-10">
                                <div className="space-y-6">
                                    <h3 className="text-2xl font-extrabold text-foreground leading-tight tracking-tight">
                                        {currentQuestion?.question_text || currentQuestion?.question}
                                    </h3>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    {currentQuestion?.options?.map((option) => (
                                        <button
                                            key={option.id}
                                            onClick={() => handleSelectOption(currentQuestion.id, option.id)}
                                            className={`p-6 rounded-[32px] border-2 text-left transition-all flex items-center gap-4 group cursor-pointer ${
                                                selectedOptions[currentQuestion.id] === option.id
                                                    ? 'border-primary bg-primary/5 text-primary'
                                                    : 'border-border bg-muted/50 text-foreground hover:border-primary/20 hover:bg-primary/5'
                                            }`}
                                        >
                                            <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-[10px] transition-colors ${
                                                selectedOptions[currentQuestion.id] === option.id
                                                    ? 'border-primary bg-primary text-white'
                                                    : 'border-border bg-surface text-gray-300 group-hover:border-primary/50'
                                            }`}>
                                                {selectedOptions[currentQuestion.id] === option.id ? '✓' : ''}
                                            </span>
                                            <span className="font-bold text-sm">{option.option_text}</span>
                                        </button>
                                    ))}
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
                    )}
                </div>

                {!isSubmission && !isFinished && (
                    <div className="px-10 py-8 bg-muted/30 border-t border-border flex justify-end">
                        <button
                            onClick={nextQuestion}
                            disabled={!selectedOptions[currentQuestion?.id]}
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
