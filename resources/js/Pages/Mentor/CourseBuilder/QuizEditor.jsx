import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';

export default function QuizEditor({ auth, quiz }) {
    const [isAddingQuestion, setIsAddingQuestion] = useState(false);
    const [newQuestionText, setNewQuestionText] = useState('');
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [description, setDescription] = useState(quiz.description || '');

    const [editingQuestion, setEditingQuestion] = useState(null); // { id, question }
    const [editingOption, setEditingOption] = useState(null); // { id, text, isCorrect }
    const [addingOptionTo, setAddingOptionTo] = useState(null); // questionId
    const [newOptionState, setNewOptionState] = useState({ text: '', isCorrect: false });
    const [passingScore, setPassingScore] = useState(quiz.passing_score || 0);

    const [deleteModalState, setDeleteModalState] = useState({ isOpen: false, targetId: null, type: 'question' });

    const updateDescription = (e) => {
        e.preventDefault();
        router.put(route('mentor.quizzes.update', quiz.id), {
            title: quiz.title,
            description: description,
            type: quiz.type
        }, {
            onSuccess: () => setIsEditingDescription(false)
        });
    };

    const addQuestion = (e) => {
        e.preventDefault();
        router.post(route('mentor.quizzes.questions.store', quiz.id), {
            question: newQuestionText
        }, {
            onSuccess: () => {
                setNewQuestionText('');
                setIsAddingQuestion(false);
            }
        });
    };

    const updateQuestion = (e) => {
        e.preventDefault();
        router.put(route('mentor.quizzes.questions.update', editingQuestion.id), {
            question: editingQuestion.question
        }, {
            onSuccess: () => setEditingQuestion(null)
        });
    };

    const addOption = (e) => {
        e.preventDefault();
        router.post(route('mentor.quizzes.questions.options.store', addingOptionTo), {
            option_text: newOptionState.text,
            is_correct: newOptionState.isCorrect
        }, {
            onSuccess: () => {
                setNewOptionState({ text: '', isCorrect: false });
                setAddingOptionTo(null);
            }
        });
    };

    const updateOption = (e) => {
        e.preventDefault();
        router.put(route('mentor.quizzes.options.update', editingOption.id), {
            option_text: editingOption.text,
            is_correct: editingOption.isCorrect
        }, {
            onSuccess: () => setEditingOption(null)
        });
    };

    const toggleOptionCorrect = (option) => {
        router.put(route('mentor.quizzes.options.update', option.id), {
            option_text: option.option_text,
            is_correct: !option.is_correct
        });
    };

    const deleteOption = (optionId) => {
        router.delete(route('mentor.quizzes.options.destroy', optionId));
    };

    const openDeleteModal = (id, type = 'question') => {
        setDeleteModalState({ isOpen: true, targetId: id, type });
    };

    const closeDeleteModal = () => {
        setDeleteModalState({ isOpen: false, targetId: null, type: 'question' });
    };

    const confirmDelete = () => {
        if (deleteModalState.targetId) {
            if (deleteModalState.type === 'question') {
                router.delete(route('mentor.quizzes.questions.destroy', deleteModalState.targetId), {
                    onSuccess: closeDeleteModal
                });
            } else {
                router.delete(route('mentor.quizzes.options.destroy', deleteModalState.targetId), {
                    onSuccess: closeDeleteModal
                });
            }
        }
    };

    return (
        <DashboardLayout user={auth.user}>
            <Head title={`Edit Quiz: ${quiz.title}`} />

            <div className="max-w-5xl mx-auto space-y-10 pb-20">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Link href={route('mentor.courses.edit', quiz.course_id)} className="text-gray-400 hover:text-primary transition-colors text-sm font-bold">Curriculum</Link>
                            <span className="text-gray-300">/</span>
                            <span className="text-gray-500 text-sm font-bold">Edit Quiz</span>
                        </div>
                        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">{quiz.title}</h1>
                        <p className="text-gray-500 font-medium tracking-tight font-jakarta">Manage questions or assignment instructions here.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 text-jakarta">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-8">
                        {quiz.type === 'submission' ? (
                            <div className="bg-white rounded-[40px] border border-gray-100 p-10 shadow-xl shadow-gray-200/10 space-y-8">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h2 className="text-xl font-extrabold text-foreground">Assignment Instructions</h2>
                                        <p className="text-xs font-bold text-gray-400">Define what students need to submit for this task.</p>
                                    </div>
                                    {!isEditingDescription && (
                                        <button 
                                            onClick={() => setIsEditingDescription(true)}
                                            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all shadow-sm"
                                        >
                                            ✏️
                                        </button>
                                    )}
                                </div>

                                {isEditingDescription ? (
                                    <form onSubmit={updateDescription} className="space-y-6">
                                        <textarea
                                            autoFocus
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="w-full bg-muted border-none rounded-[32px] px-8 py-6 text-sm font-bold min-h-[200px] focus:ring-4 focus:ring-primary/10 transition-all"
                                            placeholder="Write the instructions or assignment prompt here..."
                                        />
                                        <div className="flex justify-end gap-3">
                                            <button 
                                                type="button" 
                                                onClick={() => setIsEditingDescription(false)} 
                                                className="px-6 py-4 text-sm font-extrabold text-gray-400"
                                            >
                                                Cancel
                                            </button>
                                            <button 
                                                type="submit" 
                                                className="bg-primary text-white px-8 py-4 rounded-full text-sm font-extrabold shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all"
                                            >
                                                Save Instructions
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="bg-muted/30 rounded-[32px] p-8 min-h-[150px] flex flex-col">
                                        {quiz.description ? (
                                            <p className="text-gray-600 font-medium leading-relaxed whitespace-pre-wrap">{quiz.description}</p>
                                        ) : (
                                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-10 opacity-50">
                                                <div className="text-4xl">📝</div>
                                                <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">No instructions defined yet</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-extrabold text-foreground">Questions</h2>
                                    {!isAddingQuestion && (
                                        <button
                                            onClick={() => setIsAddingQuestion(true)}
                                            className="text-sm font-extrabold text-primary hover:underline transition-all"
                                        >
                                            + Add Question
                                        </button>
                                    )}
                                </div>

                                {isAddingQuestion && (
                                    <form onSubmit={addQuestion} className="bg-white p-8 rounded-[40px] border-2 border-dashed border-primary/20 space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-extrabold text-foreground uppercase tracking-widest px-1">Question Text</label>
                                            <textarea
                                                autoFocus
                                                value={newQuestionText}
                                                onChange={(e) => setNewQuestionText(e.target.value)}
                                                className="w-full bg-muted border-none rounded-3xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-primary/10 transition-all"
                                                placeholder="Enter your question here..."
                                                rows="3"
                                            />
                                        </div>
                                        <div className="flex justify-end gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setIsAddingQuestion(false)}
                                                className="px-6 py-4 text-sm font-extrabold text-gray-400"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="bg-primary text-white px-8 py-4 rounded-full text-sm font-extrabold shadow-lg shadow-primary/20 hover:bg-primary-hover"
                                            >
                                                Save Question
                                            </button>
                                        </div>
                                    </form>
                                )}

                                {quiz.questions?.length > 0 ? (
                                    <div className="space-y-8">
                                        {quiz.questions.map((q, idx) => (
                                            <div key={q.id} className="bg-white rounded-[40px] border border-gray-100 p-8 shadow-xl shadow-gray-200/10 space-y-6 group animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                <div className="flex justify-between items-start gap-4">
                                                    {editingQuestion?.id === q.id ? (
                                                        <form onSubmit={updateQuestion} className="flex-1 space-y-4">
                                                            <textarea
                                                                autoFocus
                                                                value={editingQuestion.question}
                                                                onChange={(e) => setEditingQuestion({...editingQuestion, question: e.target.value})}
                                                                className="w-full bg-muted border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-primary/10 transition-all"
                                                            />
                                                            <div className="flex justify-end gap-2">
                                                                <button type="button" onClick={() => setEditingQuestion(null)} className="text-xs font-bold text-gray-400">Cancel</button>
                                                                <button type="submit" className="text-xs font-bold text-primary">Save Changes</button>
                                                            </div>
                                                        </form>
                                                    ) : (
                                                        <>
                                                            <h3 className="font-extrabold text-foreground leading-relaxed">
                                                                <span className="text-gray-300 mr-2">{idx + 1}.</span> {q.question}
                                                            </h3>
                                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button onClick={() => setEditingQuestion({id: q.id, question: q.question})} className="text-gray-300 hover:text-primary transition-colors">✏️</button>
                                                                <button onClick={() => openDeleteModal(q.id, 'question')} className="text-gray-300 hover:text-red-500 transition-colors cursor-pointer">🗑️</button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                                
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {q.options?.map((opt) => (
                                                        editingOption?.id === opt.id ? (
                                                            <form key={opt.id} onSubmit={updateOption} className="col-span-full bg-muted/50 rounded-3xl p-6 border-2 border-dashed border-gray-200 space-y-4">
                                                                <input
                                                                    autoFocus
                                                                    type="text"
                                                                    value={editingOption.text}
                                                                    onChange={(e) => setEditingOption({...editingOption, text: e.target.value})}
                                                                    className="w-full bg-white border-none rounded-2xl px-5 py-3 text-sm font-bold focus:ring-4 focus:ring-primary/10 transition-all"
                                                                />
                                                                <div className="flex items-center justify-between">
                                                                    <label className="flex items-center gap-2 cursor-pointer group">
                                                                        <input 
                                                                            type="checkbox" 
                                                                            checked={editingOption.isCorrect} 
                                                                            onChange={(e) => setEditingOption({...editingOption, isCorrect: e.target.checked})}
                                                                            className="rounded-lg text-primary focus:ring-primary w-5 h-5 transition-all cursor-pointer"
                                                                        />
                                                                        <span className="text-[10px] font-black uppercase text-gray-500 group-hover:text-primary transition-colors">Mark as Correct</span>
                                                                    </label>
                                                                    <div className="flex gap-3">
                                                                        <button type="button" onClick={() => setEditingOption(null)} className="text-[10px] font-black uppercase text-gray-400 hover:text-gray-600">Cancel</button>
                                                                        <button type="submit" disabled={!editingOption.text.trim()} className="text-[10px] font-black uppercase text-primary">Save Changes</button>
                                                                    </div>
                                                                </div>
                                                            </form>
                                                        ) : (
                                                            <div 
                                                                key={opt.id} 
                                                                onClick={() => setEditingOption({id: opt.id, text: opt.option_text, isCorrect: !!opt.is_correct})}
                                                                className={`group/opt p-5 rounded-3xl border transition-all cursor-pointer ${opt.is_correct ? 'bg-accent-teal/10 border-accent-teal/30 text-foreground' : 'bg-muted border-gray-100 text-gray-400'} text-sm font-bold flex items-center justify-between`}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <button 
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            toggleOptionCorrect(opt);
                                                                        }}
                                                                        className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all ${opt.is_correct ? 'bg-accent-teal border-accent-teal text-white' : 'border-gray-200'}`}
                                                                    >
                                                                        {opt.is_correct && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>}
                                                                    </button>
                                                                    <span>{opt.option_text}</span>
                                                                </div>
                                                                <button 
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        openDeleteModal(opt.id, 'option');
                                                                    }}
                                                                    className="opacity-0 group-hover/opt:opacity-100 text-gray-300 hover:text-red-500 transition-all"
                                                                >
                                                                    ✕
                                                                </button>
                                                            </div>
                                                        )
                                                    ))}

                                                    {addingOptionTo === q.id ? (
                                                        <form onSubmit={addOption} className="col-span-full bg-muted/50 rounded-3xl p-6 border-2 border-dashed border-gray-200 space-y-4">
                                                            <input
                                                                autoFocus
                                                                type="text"
                                                                value={newOptionState.text}
                                                                onChange={(e) => setNewOptionState({...newOptionState, text: e.target.value})}
                                                                placeholder="Masukkan teks jawaban..."
                                                                className="w-full bg-white border-none rounded-2xl px-5 py-3 text-sm font-bold focus:ring-4 focus:ring-primary/10 transition-all"
                                                            />
                                                            <div className="flex items-center justify-between">
                                                                <label className="flex items-center gap-2 cursor-pointer group">
                                                                    <div className="relative">
                                                                        <input 
                                                                            type="checkbox" 
                                                                            checked={newOptionState.isCorrect} 
                                                                            onChange={(e) => setNewOptionState({...newOptionState, isCorrect: e.target.checked})}
                                                                            className="rounded-lg text-primary focus:ring-primary w-5 h-5 transition-all cursor-pointer"
                                                                        />
                                                                    </div>
                                                                    <span className="text-[10px] font-black uppercase text-gray-500 group-hover:text-primary transition-colors">Mark as Correct</span>
                                                                </label>
                                                                <div className="flex gap-3">
                                                                    <button type="button" onClick={() => setAddingOptionTo(null)} className="text-[10px] font-black uppercase text-gray-400 hover:text-gray-600 transition-colors">Cancel</button>
                                                                    <button type="submit" disabled={!newOptionState.text.trim()} className="text-[10px] font-black uppercase text-primary disabled:opacity-50">Add Option</button>
                                                                </div>
                                                            </div>
                                                        </form>
                                                    ) : (
                                                        <button 
                                                            onClick={() => {
                                                                setNewOptionState({ text: '', isCorrect: false });
                                                                setAddingOptionTo(q.id);
                                                            }}
                                                            className="p-5 rounded-3xl border border-dashed border-gray-200 text-gray-400 text-[10px] font-black uppercase hover:border-primary/30 hover:text-primary transition-all tracking-widest flex items-center justify-center gap-2"
                                                        >
                                                            <span>+</span> Add Option
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    !isAddingQuestion && (
                                        <div className="bg-muted/30 rounded-[40px] p-20 text-center space-y-4 border-2 border-dashed border-gray-100">
                                            <div className="text-6xl items-center justify-center flex">🧩</div>
                                            <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">No questions added yet</p>
                                        </div>
                                    )
                                )}
                            </>
                        )}
                    </div>

                    {/* Quiz Settings Side */}
                    <aside className="lg:col-span-1 space-y-8">
                        <div className="bg-white rounded-[40px] p-10 border border-gray-100 shadow-xl shadow-gray-200/10 space-y-6">
                            <h3 className="font-extrabold text-foreground tracking-tight">Quiz Info</h3>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Type</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">{quiz.type === 'submission' ? '📥' : '🧩'}</span>
                                        <p className="text-sm font-bold text-foreground capitalize">{quiz.type.replace('_', ' ')}</p>
                                    </div>
                                </div>
                                {quiz.type === 'multiple_choice' && (
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Questions Count</p>
                                        <p className="text-sm font-bold text-foreground">{quiz.questions?.length || 0}</p>
                                    </div>
                                )}
                                <div className="space-y-2 pt-2">
                                    <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Min Passing Score</p>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="number" 
                                            min="0" 
                                            max="100"
                                            value={passingScore}
                                            onChange={(e) => setPassingScore(e.target.value)}
                                            onBlur={(e) => {
                                                if (e.target.value !== quiz.passing_score) {
                                                    router.put(route('mentor.quizzes.update', quiz.id), {
                                                        ...quiz,
                                                        passing_score: e.target.value
                                                    });
                                                }
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.target.blur();
                                                }
                                            }}
                                            className="w-20 bg-muted border-none rounded-xl px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                                        />
                                        <span className="text-xs font-bold text-gray-400">/ 100</span>
                                    </div>
                                    <p className="text-[10px] font-medium text-gray-400 leading-tight">Minimum score to pass this {quiz.type === 'submission' ? 'assignment' : 'quiz'}.</p>
                                </div>
                            </div>
                            <div className="pt-6 border-t border-gray-100">
                                <Link 
                                    href={route('mentor.courses.edit', quiz.course_id)}
                                    className="w-full flex items-center justify-center py-4 rounded-full bg-muted text-gray-500 font-extrabold text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-colors"
                                >
                                    Back to Curriculum
                                </Link>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            <Modal show={deleteModalState.isOpen} onClose={closeDeleteModal} maxWidth="sm">
                <div className="p-10 flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-[32px] bg-red-50 flex items-center justify-center text-4xl mb-6 shadow-inner animate-bounce">
                        🗑️
                    </div>
                    <h2 className="text-2xl font-extrabold text-foreground mb-4 tracking-tight text-balance">Confirm Deletion</h2>
                    <p className="text-sm font-medium text-gray-500 mb-10 leading-relaxed px-4">
                        Are you sure you want to delete this {deleteModalState.type}? This action <span className="text-red-500 font-bold underline">cannot be undone</span>.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 w-full">
                        <button 
                            type="button" 
                            onClick={closeDeleteModal} 
                            className="flex-1 px-8 py-4 rounded-full text-xs font-extrabold text-gray-400 uppercase tracking-widest hover:text-foreground hover:bg-muted transition-all"
                        >
                            No, Keep it
                        </button>
                        <button 
                            type="button" 
                            onClick={confirmDelete} 
                            className="flex-1 bg-red-500 text-white px-8 py-4 rounded-full text-xs font-extrabold uppercase tracking-widest shadow-xl shadow-red-500/30 hover:bg-red-600 hover:scale-[1.05] active:scale-95 transition-all text-balance"
                        >
                            Yes, Delete
                        </button>
                    </div>
                </div>
            </Modal>
        </DashboardLayout>
    );
}
