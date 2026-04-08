import { useState, useEffect } from 'react';
import Modal from '@/Components/Modal';
import axios from 'axios';

export default function OneDriveFolderPicker({ show, onClose, onSelect, currentPath }) {
    const [items, setItems] = useState([]);
    const [history, setHistory] = useState([{ id: 'root', name: 'OneDrive Root' }]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [newFolderName, setNewFolderName] = useState('');
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        if (show) {
            fetchFolders(history[history.length - 1].id);
        }
    }, [show]);

    const fetchFolders = async (itemId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(route('admin.settings.onedrive.list', itemId));
            setItems(response.data.items || []);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load folders.');
        } finally {
            setLoading(false);
        }
    };

    const navigateTo = (folder) => {
        const newHistory = [...history, folder];
        setHistory(newHistory);
        fetchFolders(folder.id);
    };

    const navigateBack = (index) => {
        if (index === history.length - 1) return;
        const newHistory = history.slice(0, index + 1);
        setHistory(newHistory);
        fetchFolders(newHistory[newHistory.length - 1].id);
    };

    const handleCreateFolder = async (e) => {
        e.preventDefault();
        if (!newFolderName.trim()) return;

        setCreating(true);
        try {
            const response = await axios.post(route('admin.settings.onedrive.create-folder'), {
                name: newFolderName,
                parent_id: history[history.length - 1].id
            });
            
            setNewFolderName('');
            // Refresh current list
            fetchFolders(history[history.length - 1].id);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to create folder.');
        } finally {
            setCreating(false);
        }
    };

    const handleSelect = async () => {
        const currentItem = history[history.length - 1];
        if (currentItem.id === 'root') {
            onSelect('');
            onClose();
            return;
        }

        setLoading(true);
        try {
            const response = await axios.get(route('admin.settings.onedrive.resolve-path', currentItem.id));
            onSelect(response.data.path);
            onClose();
        } catch (err) {
            setError('Failed to resolve folder path.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="2xl">
            <div className="flex flex-col h-[600px] bg-white rounded-[32px] overflow-hidden">
                {/* Header */}
                <div className="p-8 border-b border-gray-50 flex items-center justify-between shrink-0">
                    <div>
                        <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Select Root Folder</h2>
                        <p className="text-gray-400 text-sm font-medium mt-1">Browse and choose your OneDrive destination.</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                {/* Breadcrumbs */}
                <div className="px-8 py-3 bg-muted/30 border-b border-gray-50 flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide shrink-0">
                    {history.map((folder, i) => (
                        <div key={folder.id} className="flex items-center gap-2">
                            {i > 0 && <span className="text-gray-300">/</span>}
                            <button 
                                onClick={() => navigateBack(i)}
                                className={`text-[10px] font-black uppercase tracking-widest transition-colors ${i === history.length - 1 ? 'text-primary' : 'text-gray-400 hover:text-foreground'}`}
                            >
                                {folder.name}
                            </button>
                        </div>
                    ))}
                </div>

                {/* Folder List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-1">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-50">
                            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Syncing with OneDrive...</p>
                        </div>
                    ) : error ? (
                        <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
                            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center text-2xl">⚠️</div>
                            <p className="text-sm font-bold text-gray-500">{error}</p>
                            <button onClick={() => fetchFolders(history[history.length - 1].id)} className="text-xs font-black uppercase tracking-widest text-primary hover:underline">Try Again</button>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center p-8 text-center opacity-40 grayscale">
                            <div className="text-6xl mb-4">📂</div>
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">No folders found here</p>
                        </div>
                    ) : (
                        items.map(folder => (
                            <button 
                                key={folder.id}
                                onClick={() => navigateTo(folder)}
                                className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-muted transition-all group text-left border border-transparent hover:border-gray-100"
                            >
                                <div className="w-10 h-10 bg-[#0078D4]/5 rounded-xl flex items-center justify-center text-[#0078D4] group-hover:bg-[#0078D4] group-hover:text-white transition-all">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-foreground truncate">{folder.name}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{folder.updated_at ? new Date(folder.updated_at).toLocaleDateString() : 'N/A'}</p>
                                </div>
                                <svg className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                            </button>
                        ))
                    )}
                </div>

                {/* Footer Controls */}
                <div className="p-8 border-t border-gray-50 bg-muted/10 flex flex-col sm:flex-row items-center gap-4 shrink-0">
                    <form onSubmit={handleCreateFolder} className="flex-1 w-full flex items-center gap-2">
                        <input 
                            type="text" 
                            placeholder="New folder name..."
                            value={newFolderName}
                            onChange={e => setNewFolderName(e.target.value)}
                            className="flex-1 bg-white border-none rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                        />
                        <button 
                            type="submit"
                            disabled={creating || !newFolderName.trim()}
                            className="px-4 py-2.5 bg-gray-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                            {creating ? 'Creating...' : '+ New Folder'}
                        </button>
                    </form>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button 
                            onClick={handleSelect}
                            disabled={loading || creating}
                            className="flex-1 sm:flex-none px-8 py-3 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary-hover hover:-translate-y-1 transition-all"
                        >
                            Select Current Folder
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
