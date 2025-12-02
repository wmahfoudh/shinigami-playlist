import React, { useState, useRef, useMemo, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { 
  Trash2, 
  Upload, 
  Link as LinkIcon, 
  Download, 
  CheckSquare, 
  Square, 
  RefreshCw, 
  Search,
  Copy,
  Edit,
  Layers,
  XCircle,
  Moon,
  Sun,
  HelpCircle,
  FileDown,
  ChevronDown,
  X,
  Regex,
  ChevronUp,
  RotateCcw,
  GripVertical,
  ArrowUp,
  ArrowDown,
  ArrowUpDown
} from 'lucide-react';

// --- Types ---

interface Channel {
  id: string;
  name: string;
  group: string;
  tag: string;
  logo: string;
  url: string;
  source: string;
  status: 'unknown' | 'online' | 'offline';
  selected: boolean;
}

interface FilterState {
  search: string;
  group: string;
  tag: string;
  source: string;
  showDuplicatesOnly: boolean;
}

// --- Utils ---

const generateId = () => Math.random().toString(36).substring(2, 9);

const parseM3U = (content: string, sourceName: string, tag: string): Channel[] => {
  const lines = content.split('\n');
  const channels: Channel[] = [];
  let currentChannel: Partial<Channel> = {};

  lines.forEach(line => {
    line = line.trim();
    if (line.startsWith('#EXTINF:')) {
      const info = line.substring(8);
      // Extract attributes like group-title, tvg-logo
      const groupMatch = info.match(/group-title="([^"]*)"/);
      const logoMatch = info.match(/tvg-logo="([^"]*)"/);
      const nameParts = info.split(',');
      const name = nameParts[nameParts.length - 1].trim();

      currentChannel = {
        id: generateId(),
        name: name,
        group: groupMatch ? groupMatch[1] : 'Uncategorized',
        tag: tag,
        logo: logoMatch ? logoMatch[1] : '',
        source: sourceName,
        status: 'unknown',
        selected: false,
      };
    } else if (line.length > 0 && !line.startsWith('#')) {
      if (currentChannel.name) {
        currentChannel.url = line;
        channels.push(currentChannel as Channel);
        currentChannel = {};
      }
    }
  });

  return channels;
};

// --- Custom Components ---

const ShinigamiLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 19 L19 5" />
    <path d="M19 5 C 19 5, 14 2, 10 3 C 4 4.5, 2 10, 5 14" />
  </svg>
);

const LogoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-white">
      <path d="M12 19 L19 5" />
      <path d="M19 5 C 19 5, 14 2, 10 3 C 4 4.5, 2 10, 5 14" />
    </svg>
);

interface ComboboxProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  width?: string;
}

const Combobox = ({ value, onChange, options, placeholder, width = "w-32" }: ComboboxProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(value.toLowerCase())
  );

  return (
    <div ref={containerRef} className={`relative ${width}`}>
      <div className="relative flex items-center">
        <input 
          type="text" 
          placeholder={placeholder} 
          className="w-full border border-gray-200 dark:border-dark-border rounded-lg pl-3 pr-8 py-2 bg-gray-50 dark:bg-dark-bg text-gray-700 dark:text-gray-200 focus:outline-none focus:border-brand-500 transition-colors"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        <button 
          type="button"
          className="absolute right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          onClick={(e) => {
            e.preventDefault();
            setIsOpen(!isOpen);
          }}
        >
          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>
      
      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-1 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg shadow-lg max-h-60 overflow-y-auto custom-scrollbar z-50 animate-in fade-in zoom-in-95 duration-100">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, idx) => (
              <div 
                key={idx}
                className="px-3 py-2 text-xs text-gray-700 dark:text-gray-200 hover:bg-brand-50 dark:hover:bg-brand-900/20 cursor-pointer truncate"
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
              >
                {option}
              </div>
            ))
          ) : (
             <div className="px-3 py-2 text-xs text-gray-400 italic">No matches found</div>
          )}
        </div>
      )}
    </div>
  );
};

// --- Modals & UI Components ---

const HelpModal = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
    <div className="bg-white dark:bg-dark-surface rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar border border-gray-200 dark:border-dark-border flex flex-col">
      <div className="p-6 border-b border-gray-100 dark:border-dark-border flex justify-between items-center sticky top-0 bg-white dark:bg-dark-surface z-10">
        <div className="flex items-center gap-3">
           <ShinigamiLogo className="text-brand-500 w-6 h-6" />
           <h2 className="text-xl font-bold text-gray-900 dark:text-white">Shinigami Guide</h2>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          <X size={24} />
        </button>
      </div>
      <div className="p-6 space-y-6 text-sm text-gray-600 dark:text-gray-300">
        <section>
          <h3 className="text-base font-semibold text-brand-600 dark:text-brand-400 mb-2">1. Importing Playlists</h3>
          <p>You can import multiple playlists via <strong>local .m3u files</strong> or <strong>direct URLs</strong>. 
          When importing, the app automatically assigns a <strong>Tag</strong> based on the filename (e.g., "sports-fr.m3u" → "sports-fr"). 
          This tag is crucial for organizing channels later.</p>
        </section>
        
        <section>
          <h3 className="text-base font-semibold text-brand-600 dark:text-brand-400 mb-2">2. Status Indicators</h3>
          <ul className="space-y-2">
            <li className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-gray-300"></div> <strong>Grey:</strong> Untested channel.</li>
            <li className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500 shadow-sm shadow-green-500/50"></div> <strong>Green:</strong> Online (Verified via HEAD request).</li>
            <li className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500 shadow-sm shadow-red-500/50"></div> <strong>Red:</strong> Offline or unreachable.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-base font-semibold text-brand-600 dark:text-brand-400 mb-2">3. Cleaning & Organizing</h3>
          <p className="mb-2">Use the <strong>Bulk Edit</strong> panel to perform mass updates:</p>
          <ul className="list-disc pl-5 space-y-3">
            <li>
              <strong>Find & Replace:</strong> Quickly remove unwanted text.
              <br/>
              <span className="text-xs bg-gray-100 dark:bg-dark-bg p-1 rounded inline-block mt-1">
                 Toggle <strong>.*</strong> for Regex Mode to use capture groups ($1, $2).
              </span>
              <div className="mt-1 bg-gray-100 dark:bg-dark-bg p-2 rounded font-mono text-xs border-l-2 border-brand-400">
                 <span className="font-semibold text-gray-500">Example (Reformat Name):</span><br/>
                 Input: "Sky Sports (UK) [HD]"<br/>
                 Find (Regex): <span className="text-purple-600 dark:text-purple-400">(.*) \((.*)\) \[(.*)\]</span><br/>
                 Replace: <span className="text-green-600 dark:text-green-400">$2 - $1</span><br/>
                 Result: "UK - Sky Sports"
              </div>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 bg-yellow-50 dark:bg-yellow-900/10 p-2 rounded border border-yellow-200 dark:border-yellow-900/30">
                <span className="font-bold text-yellow-700 dark:text-yellow-500">Pro Tip:</span> If you are replacing the entire string and getting double results (e.g. "ABCABC" instead of "ABC"), use anchors <code>^</code> (start) and <code>$</code> (end). <br/>
                Use <code>^[\s\S]*$</code> instead of <code>[\s\S]*</code>.
              </div>
            </li>
            <li><strong>Regrouping:</strong> Create standardized group names using patterns.
              <div className="mt-1 bg-gray-100 dark:bg-dark-bg p-2 rounded font-mono text-xs">
                Pattern: {'{tag}'} &gt; {'{group}'}<br/>
                Result: FR &gt; News
              </div>
            </li>
            <li><strong>Sorting:</strong>
                <ul className="list-disc pl-5 mt-1">
                    <li><strong>Bulk Sort:</strong> Click the column headers (Name, Group, Tag) to sort the entire playlist A-Z or Z-A.</li>
                    <li><strong>Manual Sort:</strong> Drag and drop the handle icon <GripVertical size={12} className="inline"/> at the end of any row to reorder manually.</li>
                </ul>
            </li>
          </ul>
        </section>

        <section>
          <h3 className="text-base font-semibold text-brand-600 dark:text-brand-400 mb-2">4. Undo</h3>
          <p>The app maintains a history of your last 10 major actions (Import, Delete, Bulk Edit). You can undo these actions using the <RotateCcw size={14} className="inline"/> button. For individual text edits in the table, the state is saved when you click into the field.</p>
        </section>

        <section>
          <h3 className="text-base font-semibold text-brand-600 dark:text-brand-400 mb-2">5. Exporting</h3>
          <p>Export your curated playlist to M3U or M3U8 formats. You can choose to export the entire list or only the currently selected channels.</p>
        </section>
      </div>
      <div className="p-4 border-t border-gray-100 dark:border-dark-border bg-gray-50 dark:bg-dark-bg/50 flex justify-end">
        <button onClick={onClose} className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors">
          Got it
        </button>
      </div>
    </div>
  </div>
);

// --- Main App Component ---

const App = () => {
  // State
  const [playlist, setPlaylist] = useState<Channel[]>([]);
  const [history, setHistory] = useState<Channel[][]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // UI State
  const [darkMode, setDarkMode] = useState(true); // Default to Dark Mode
  const [showHelp, setShowHelp] = useState(false);
  const [isBulkPanelOpen, setIsBulkPanelOpen] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Sorting State
  const [sortConfig, setSortConfig] = useState<{key: keyof Channel | null, direction: 'asc' | 'desc'}>({
    key: null,
    direction: 'asc'
  });

  // Filters
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    group: '',
    tag: '',
    source: '',
    showDuplicatesOnly: false,
  });

  // Rename & Regroup State
  const [renameScope, setRenameScope] = useState<'name' | 'group' | 'tag'>('name');
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [useRegex, setUseRegex] = useState(false);
  const [regroupPattern, setRegroupPattern] = useState('{tag} {group}');

  // Theme Init - Effect to toggle class based on state
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // --- Derived State (Options & Filtered Playlist) ---

  const uniqueGroups = useMemo(() => {
    return Array.from(new Set(playlist.map(c => c.group))).sort();
  }, [playlist]);

  const uniqueTags = useMemo(() => {
    return Array.from(new Set(playlist.map(c => c.tag))).sort();
  }, [playlist]);

  const uniqueSources = useMemo(() => {
    return Array.from(new Set(playlist.map(c => c.source))).sort();
  }, [playlist]);

  const filteredPlaylist = useMemo(() => {
    let result = playlist;

    // 1. Basic Filters (AND logic)
    if (filters.search) {
      const lowerSearch = filters.search.toLowerCase();
      result = result.filter(c => c.name.toLowerCase().includes(lowerSearch));
    }
    if (filters.group) {
      const lowerGroup = filters.group.toLowerCase();
      result = result.filter(c => c.group.toLowerCase().includes(lowerGroup));
    }
    if (filters.tag) {
      const lowerTag = filters.tag.toLowerCase();
      result = result.filter(c => c.tag.toLowerCase().includes(lowerTag));
    }
    if (filters.source) {
      const lowerSource = filters.source.toLowerCase();
      result = result.filter(c => c.source.toLowerCase().includes(lowerSource));
    }

    // 2. Duplicate Filter
    if (filters.showDuplicatesOnly) {
      const urlCounts = new Map<string, number>();
      playlist.forEach(c => {
        urlCounts.set(c.url, (urlCounts.get(c.url) || 0) + 1);
      });
      result = result.filter(c => (urlCounts.get(c.url) || 0) > 1);
    }

    return result;
  }, [playlist, filters]);

  const selectedCount = useMemo(() => filteredPlaylist.filter(c => c.selected).length, [filteredPlaylist]);
  const totalCount = filteredPlaylist.length;

  // --- History Management ---
  const saveHistory = () => {
    setHistory(prev => {
      const newHistory = [...prev, playlist];
      if (newHistory.length > 10) {
        return newHistory.slice(newHistory.length - 10);
      }
      return newHistory;
    });
  };

  const undo = () => {
    setHistory(prev => {
      if (prev.length === 0) return prev;
      const newHistory = [...prev];
      const previousState = newHistory.pop();
      if (previousState) {
        setPlaylist(previousState);
      }
      return newHistory;
    });
  };

  // --- Actions ---

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    saveHistory(); // Save before import

    Array.from(files).forEach((f) => {
      const file = f as File;
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const tag = file.name.replace(/\.[^/.]+$/, "");
        const newChannels = parseM3U(content, file.name, tag);
        
        setPlaylist(prev => [...prev, ...newChannels]);
        setSources(prev => [...prev, file.name]);
      };
      reader.readAsText(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUrlImport = async () => {
    if (!urlInput) return;
    setLoading(true);
    saveHistory(); // Save before import
    try {
      const response = await fetch(urlInput);
      if (!response.ok) throw new Error('Failed to fetch');
      const content = await response.text();
      const fileName = urlInput.split('/').pop() || 'url-import';
      const tag = fileName.replace(/\.[^/.]+$/, "");
      const newChannels = parseM3U(content, fileName, tag);
      setPlaylist(prev => [...prev, ...newChannels]);
      setSources(prev => [...prev, fileName]);
      setUrlInput('');
    } catch (error) {
      alert('Error importing URL. Ensure CORS is allowed for this URL.');
      console.error(error);
      // Revert history if failed? No, because we only appended if success. 
      // But we pushed history already. 
      // Actually, if we pushed history but didn't change playlist, undo does nothing, which is fine.
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    saveHistory();
    setPlaylist([]);
    setSources([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const updateChannel = (id: string, field: keyof Channel, value: string) => {
    setPlaylist(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const toggleSelect = (id: string) => {
    setPlaylist(prev => prev.map(c => c.id === id ? { ...c, selected: !c.selected } : c));
  };

  const toggleSelectAll = (select: boolean) => {
    const filteredIds = new Set(filteredPlaylist.map(c => c.id));
    setPlaylist(prev => prev.map(c => 
      filteredIds.has(c.id) ? { ...c, selected: select } : c
    ));
  };

  const selectByStatus = (status: 'online' | 'offline' | 'unknown') => {
    const filteredIds = new Set(filteredPlaylist.map(c => c.id));
    setPlaylist(prev => prev.map(c => 
      filteredIds.has(c.id) && c.status === status ? { ...c, selected: true } : c
    ));
  };

  const deleteSelected = () => {
    if (selectedCount === 0) return;
    saveHistory();
    setPlaylist(prev => prev.filter(c => !c.selected));
  };

  const removeDuplicates = () => {
    saveHistory();
    const seenUrls = new Set();
    setPlaylist(prev => prev.filter(c => {
      if (seenUrls.has(c.url)) return false;
      seenUrls.add(c.url);
      return true;
    }));
  };

  // --- Sorting & Moving ---

  const handleSort = (key: keyof Channel) => {
    saveHistory();
    
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    setSortConfig({ key, direction });

    setPlaylist(prev => {
      const sorted = [...prev].sort((a, b) => {
        const valA = (a[key] || '').toString().toLowerCase();
        const valB = (b[key] || '').toString().toLowerCase();
        
        if (valA < valB) return direction === 'asc' ? -1 : 1;
        if (valA > valB) return direction === 'asc' ? 1 : -1;
        return 0;
      });
      return sorted;
    });
  };

  const handleMoveChannel = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;
    saveHistory();

    setPlaylist(prev => {
      const newPlaylist = [...prev];
      const sourceIndex = newPlaylist.findIndex(c => c.id === sourceId);
      const targetIndex = newPlaylist.findIndex(c => c.id === targetId);
      
      if (sourceIndex === -1 || targetIndex === -1) return prev;

      const [removed] = newPlaylist.splice(sourceIndex, 1);
      newPlaylist.splice(targetIndex, 0, removed);
      
      return newPlaylist;
    });
  };

  const checkStatus = async () => {
    const selectedChannels = playlist.filter(c => c.selected);
    if (selectedChannels.length === 0) {
      alert("Please select channels to check.");
      return;
    }
    
    setLoading(true);
    const BATCH_SIZE = 5;
    const tempPlaylist = [...playlist]; 

    // Check if we are in a secure context (HTTPS) to handle Mixed Content logic
    const isSecureContext = window.location.protocol === 'https:';

    for (let i = 0; i < selectedChannels.length; i += BATCH_SIZE) {
      const batch = selectedChannels.slice(i, i + BATCH_SIZE);
      await Promise.all(batch.map(async (channel) => {
        try {
          const urlLower = channel.url.toLowerCase();
          
          // 1. Check for Mixed Content (HTTPS App -> HTTP Stream)
          // Browsers block this immediately. We cannot check status.
          // Mark as 'unknown' (Grey) so user knows we didn't fail, we just couldn't check.
          if (isSecureContext && urlLower.startsWith('http:')) {
             const index = tempPlaylist.findIndex(c => c.id === channel.id);
             if (index !== -1) tempPlaylist[index] = { ...tempPlaylist[index], status: 'unknown' };
             return;
          }

          if (!urlLower.startsWith('http')) {
             const index = tempPlaylist.findIndex(c => c.id === channel.id);
             if (index !== -1) tempPlaylist[index] = { ...tempPlaylist[index], status: 'unknown' };
             return;
          }

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // Increased to 10s
          
          try {
            // Attempt 1: Standard HEAD request
            const res = await fetch(channel.url, { method: 'HEAD', signal: controller.signal });
            clearTimeout(timeoutId);
            
            const index = tempPlaylist.findIndex(c => c.id === channel.id);
            if (index !== -1) {
              tempPlaylist[index] = { ...tempPlaylist[index], status: res.ok ? 'online' : 'offline' };
            }
          } catch (headError) {
            clearTimeout(timeoutId);
            
            // Attempt 2: Fallback to 'no-cors' GET
            const controller2 = new AbortController();
            const timeoutId2 = setTimeout(() => controller2.abort(), 10000); 
            
            await fetch(channel.url, { method: 'GET', mode: 'no-cors', signal: controller2.signal });
            clearTimeout(timeoutId2);

            const index = tempPlaylist.findIndex(c => c.id === channel.id);
            if (index !== -1) {
              tempPlaylist[index] = { ...tempPlaylist[index], status: 'online' };
            }
          }

        } catch (e) {
          const index = tempPlaylist.findIndex(c => c.id === channel.id);
          if (index !== -1) {
            tempPlaylist[index] = { ...tempPlaylist[index], status: 'offline' };
          }
        }
      }));
      setPlaylist([...tempPlaylist]);
    }
    setLoading(false);
  };

  const exportPlaylist = (mode: 'all' | 'selected', format: 'm3u' | 'm3u8') => {
    const targetChannels = mode === 'selected' 
      ? playlist.filter(c => c.selected) 
      : playlist;

    if (targetChannels.length === 0) {
      alert('No channels to export.');
      return;
    }

    let content = '#EXTM3U\n';
    targetChannels.forEach(c => {
      content += `#EXTINF:-1 group-title="${c.group}" tvg-logo="${c.logo}",${c.name}\n${c.url}\n`;
    });
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shinigami-playlist.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const applyRename = () => {
    if (!findText) return;

    if (useRegex) {
      try {
        new RegExp(findText, 'g');
      } catch (e) {
        alert(`Invalid Regular Expression: ${(e as Error).message}`);
        return;
      }
    }

    saveHistory(); // Save before bulk rename

    setPlaylist(prev => prev.map(c => {
      if (!c.selected) return c;
      const currentValue = c[renameScope];
      let newValue = currentValue;
      
      if (useRegex) {
         try {
           const regex = new RegExp(findText, 'g');
           newValue = currentValue.replace(regex, replaceText);
         } catch(e) {}
      } else {
         newValue = currentValue.split(findText).join(replaceText);
      }
      
      return { ...c, [renameScope]: newValue };
    }));
  };

  const applyRegroup = () => {
    saveHistory(); // Save before regroup
    setPlaylist(prev => prev.map(c => {
      if (!c.selected) return c;
      let newGroup = regroupPattern
        .replace(/{tag}/g, c.tag || '')
        .replace(/{group}/g, c.group || '')
        .replace(/{name}/g, c.name || '');
      newGroup = newGroup.replace(/\s+/g, ' ').trim();
      return { ...c, group: newGroup };
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-dark-bg flex flex-col text-sm text-gray-800 dark:text-gray-200 transition-colors duration-200">
      
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

      {/* HEADER */}
      <header className="bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border p-4 shadow-sm flex justify-between items-center z-30 transition-colors">
        <div className="flex items-center gap-3">
          <div className="bg-brand-500 p-1.5 rounded-lg shadow-lg shadow-brand-500/30 text-white">
             <LogoIcon />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white leading-tight">Shinigami <span className="text-brand-500">Playlist</span></h1>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-semibold">M3U MANAGER</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowHelp(true)}
            className="p-2 text-gray-500 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-dark-bg"
            title="Help Guide"
          >
            <HelpCircle size={20} />
          </button>
          <div className="h-6 w-px bg-gray-200 dark:bg-dark-border mx-1"></div>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 text-gray-500 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-dark-bg"
            title="Toggle Theme"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      {/* IMPORT BAR */}
      <div className="bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border p-3 flex flex-wrap gap-4 items-center justify-between transition-colors">
        <div className="flex gap-3 items-center w-full md:w-auto">
          <input 
            type="file" 
            accept=".m3u,.m3u8" 
            multiple 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 bg-brand-50 hover:bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 dark:hover:bg-brand-900/50 px-4 py-2 rounded-lg transition font-medium border border-brand-200 dark:border-brand-800"
          >
            <Upload size={16} /> Import File
          </button>

          <div className="flex flex-1 items-center gap-2 bg-gray-50 dark:bg-dark-bg p-1 rounded-lg border border-gray-200 dark:border-dark-border focus-within:border-brand-400 transition-colors">
            <LinkIcon size={16} className="text-gray-400 ml-2" />
            <input 
              type="text" 
              placeholder="Paste M3U URL..." 
              className="bg-transparent outline-none px-2 py-1 w-full md:w-64 text-gray-700 dark:text-gray-200 placeholder-gray-400"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUrlImport()}
            />
            <button 
              onClick={handleUrlImport}
              className="bg-white dark:bg-dark-surface hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1 rounded shadow-sm text-xs font-medium border border-gray-200 dark:border-dark-border"
            >
              Add
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {sources.length > 0 ? (
              <span className="flex flex-wrap gap-2 justify-end">
                {sources.map((s, i) => (
                  <span key={i} className="bg-gray-100 dark:bg-dark-bg border border-gray-200 dark:border-dark-border px-2 py-1 rounded text-gray-600 dark:text-gray-400 max-w-[150px] truncate">{s}</span>
                ))}
              </span>
            ) : (
              <span className="italic opacity-50">No playlists loaded</span>
            )}
          </div>
          {sources.length > 0 && (
             <button onClick={clearAll} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded transition text-xs font-medium">
               Clear All
             </button>
          )}
        </div>
      </div>

      {/* CONTROL DECK */}
      <div className="bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border p-4 sticky top-0 z-20 shadow-sm space-y-4 transition-colors">
        
        {/* Row 1: Filters */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-4 flex items-center gap-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-lg px-3 py-2 transition-colors focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-500">
            <Search size={16} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Search channels..." 
              className="bg-transparent outline-none w-full text-gray-700 dark:text-gray-200 placeholder-gray-400"
              value={filters.search}
              onChange={(e) => setFilters(f => ({...f, search: e.target.value}))}
            />
          </div>
          
          <div className="md:col-span-8 flex gap-2 flex-wrap items-center">
            <Combobox 
              placeholder="Filter Group"
              value={filters.group}
              onChange={(val) => setFilters(f => ({...f, group: val}))}
              options={uniqueGroups}
              width="w-32 md:w-40 shrink-0"
            />
            <Combobox 
              placeholder="Filter Tag"
              value={filters.tag}
              onChange={(val) => setFilters(f => ({...f, tag: val}))}
              options={uniqueTags}
              width="w-28 shrink-0"
            />
            <Combobox 
              placeholder="Source"
              value={filters.source}
              onChange={(val) => setFilters(f => ({...f, source: val}))}
              options={uniqueSources}
              width="w-28 shrink-0"
            />
            
            <button 
              className={`px-3 py-2 border rounded-lg flex items-center gap-2 transition whitespace-nowrap shrink-0 ${filters.showDuplicatesOnly ? 'bg-orange-50 border-orange-200 text-orange-600 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-400' : 'bg-white dark:bg-dark-bg border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-400'}`}
              onClick={() => setFilters(f => ({...f, showDuplicatesOnly: !f.showDuplicatesOnly}))}
            >
              <Copy size={14} /> Duplicates
            </button>
             <button 
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 px-2 shrink-0"
              onClick={() => setFilters({search: '', group: '', tag: '', source: '', showDuplicatesOnly: false})}
              title="Reset Filters"
            >
              <XCircle size={18} />
            </button>
          </div>
        </div>

        {/* Row 2: Actions */}
        <div className="flex flex-wrap gap-3 justify-between items-center">
          <div className="flex gap-2 items-center">
            <div className="flex bg-gray-100 dark:bg-dark-bg rounded-lg p-1 gap-1 border border-gray-200 dark:border-dark-border">
                <button onClick={() => toggleSelectAll(true)} className="px-3 py-1.5 rounded hover:bg-white dark:hover:bg-dark-surface shadow-sm hover:shadow text-xs font-medium transition-all">All</button>
                <button onClick={() => toggleSelectAll(false)} className="px-3 py-1.5 rounded hover:bg-white dark:hover:bg-dark-surface shadow-sm hover:shadow text-xs font-medium transition-all">None</button>
                <div className="w-px bg-gray-300 dark:bg-dark-border mx-1 my-1"></div>
                <button onClick={() => selectByStatus('online')} className="px-3 py-1.5 rounded hover:bg-white dark:hover:bg-dark-surface shadow-sm hover:shadow text-green-600 dark:text-green-400 text-xs font-medium transition-all">Live</button>
                <button onClick={() => selectByStatus('offline')} className="px-3 py-1.5 rounded hover:bg-white dark:hover:bg-dark-surface shadow-sm hover:shadow text-red-600 dark:text-red-400 text-xs font-medium transition-all">Dead</button>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium ml-2 hidden sm:inline-block">
              {selectedCount} <span className="text-gray-300 dark:text-gray-600">/</span> {totalCount}
            </span>
          </div>

          <div className="flex gap-2 items-center">
            <button
              onClick={undo}
              disabled={history.length === 0}
              className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-dark-bg border border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold transition"
              title="Undo last action"
            >
              <RotateCcw size={14} />
            </button>

             <button 
              onClick={() => setIsBulkPanelOpen(!isBulkPanelOpen)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold transition ${isBulkPanelOpen ? 'bg-brand-50 border-brand-200 text-brand-700 dark:bg-brand-900/30 dark:border-brand-700 dark:text-brand-300' : 'bg-white dark:bg-dark-bg border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            >
              <Edit size={14} /> Bulk Edit
            </button>

            <div className="w-px h-6 bg-gray-200 dark:bg-dark-border mx-1"></div>

            <button 
              onClick={deleteSelected}
              disabled={selectedCount === 0}
              className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-dark-bg border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-40 disabled:hover:bg-transparent text-xs font-semibold transition"
            >
              <Trash2 size={14} /> Delete
            </button>
            
            <button 
              onClick={removeDuplicates}
              disabled={!filters.showDuplicatesOnly} 
              className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-dark-bg border border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold transition"
              title={filters.showDuplicatesOnly ? "Keep first occurrence, remove others" : "Enable 'Duplicates' filter to use this feature"}
            >
              <Copy size={14} /> Clean Dupes
            </button>
            
            <button 
              onClick={checkStatus}
              disabled={loading || selectedCount === 0}
              className="flex items-center gap-2 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 disabled:opacity-50 text-xs font-semibold transition"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Check Status
            </button>

            <div className="relative">
              <button 
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={totalCount === 0}
                className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 shadow-sm shadow-brand-500/20 text-xs font-semibold transition"
              >
                <Download size={14} /> Export <ChevronDown size={12} />
              </button>
              
              {showExportMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)}></div>
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-surface rounded-lg shadow-xl border border-gray-200 dark:border-dark-border z-20 py-1 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">M3U File</div>
                    <button onClick={() => exportPlaylist('all', 'm3u')} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex justify-between items-center">
                      All Channels <FileDown size={14} className="opacity-50"/>
                    </button>
                    <button onClick={() => exportPlaylist('selected', 'm3u')} disabled={selectedCount === 0} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex justify-between items-center disabled:opacity-40">
                      Selected Only <FileDown size={14} className="opacity-50"/>
                    </button>
                    <div className="border-t border-gray-100 dark:border-dark-border my-1"></div>
                    <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">M3U8 File</div>
                     <button onClick={() => exportPlaylist('all', 'm3u8')} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex justify-between items-center">
                      All Channels <FileDown size={14} className="opacity-50"/>
                    </button>
                    <button onClick={() => exportPlaylist('selected', 'm3u8')} disabled={selectedCount === 0} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex justify-between items-center disabled:opacity-40">
                      Selected Only <FileDown size={14} className="opacity-50"/>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Row 3: Bulk Operations Panel (Expandable) */}
        {isBulkPanelOpen && (
          <div className="bg-gray-50 dark:bg-dark-surface/50 border border-gray-200 dark:border-dark-border rounded-lg p-4 grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in slide-in-from-top-2 duration-200">
            {/* Rename Section */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider flex items-center gap-2">
                <Edit size={12}/> Find & Replace
              </h3>
              <div className="flex flex-wrap gap-2">
                <select 
                  className="border border-gray-200 dark:border-dark-border rounded px-2 py-1.5 bg-white dark:bg-dark-bg text-gray-700 dark:text-gray-200 text-xs focus:ring-1 focus:ring-brand-500 outline-none"
                  value={renameScope}
                  onChange={(e) => setRenameScope(e.target.value as any)}
                >
                  <option value="name">Name</option>
                  <option value="group">Group</option>
                  <option value="tag">Tag</option>
                </select>
                <button
                  onClick={() => setUseRegex(!useRegex)}
                  className={`px-2 py-1.5 rounded border text-xs font-mono font-bold transition-colors ${useRegex ? 'bg-brand-100 border-brand-300 text-brand-700 dark:bg-brand-900/50 dark:border-brand-600 dark:text-brand-300' : 'bg-white border-gray-200 text-gray-400 dark:bg-dark-bg dark:border-dark-border dark:text-gray-500 hover:text-gray-600'}`}
                  title="Toggle Regex Mode"
                >
                  .*
                </button>
                <input 
                  className="border border-gray-200 dark:border-dark-border rounded px-3 py-1.5 flex-1 min-w-0 bg-white dark:bg-dark-bg text-gray-700 dark:text-gray-200 text-xs focus:ring-1 focus:ring-brand-500 outline-none" 
                  placeholder={useRegex ? "Regex pattern (e.g. ^(.*) $)" : "Find..."}
                  value={findText}
                  onChange={(e) => setFindText(e.target.value)}
                />
                <input 
                  className="border border-gray-200 dark:border-dark-border rounded px-3 py-1.5 flex-1 min-w-0 bg-white dark:bg-dark-bg text-gray-700 dark:text-gray-200 text-xs focus:ring-1 focus:ring-brand-500 outline-none" 
                  placeholder={useRegex ? "Replacement (e.g. $1)" : "Replace with..."}
                  value={replaceText}
                  onChange={(e) => setReplaceText(e.target.value)}
                />
                <button onClick={applyRename} className="bg-brand-600 text-white px-4 py-1.5 rounded text-xs hover:bg-brand-700 transition font-medium">Apply</button>
              </div>
              {useRegex && (
                 <p className="text-[10px] text-gray-500 dark:text-gray-400">
                    <span className="font-bold text-orange-500">Note:</span> Remember to escape special characters like <code className="bg-gray-100 dark:bg-dark-bg px-1 rounded">[</code> <code className="bg-gray-100 dark:bg-dark-bg px-1 rounded">]</code> <code className="bg-gray-100 dark:bg-dark-bg px-1 rounded">(</code> <code className="bg-gray-100 dark:bg-dark-bg px-1 rounded">)</code> with a backslash <code className="bg-gray-100 dark:bg-dark-bg px-1 rounded">\</code> if you want to match them literally.
                 </p>
              )}
            </div>
            
            {/* Regroup Section */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider flex items-center gap-2">
                <Layers size={12} /> Regroup Pattern
              </h3>
              <div className="flex gap-2 items-center">
                <input 
                  className="border border-gray-200 dark:border-dark-border rounded px-3 py-1.5 w-full flex-1 min-w-0 bg-white dark:bg-dark-bg text-gray-700 dark:text-gray-200 text-xs focus:ring-1 focus:ring-brand-500 outline-none font-mono" 
                  placeholder="Pattern ex: {tag} {group}" 
                  value={regroupPattern}
                  onChange={(e) => setRegroupPattern(e.target.value)}
                />
                <button onClick={applyRegroup} className="bg-purple-600 text-white px-4 py-1.5 rounded text-xs hover:bg-purple-700 transition font-medium shrink-0">Apply</button>
              </div>
              <p className="text-[10px] text-gray-400">Use <span className="font-mono bg-gray-100 dark:bg-dark-bg px-1 rounded">{'{tag}'}</span>, <span className="font-mono bg-gray-100 dark:bg-dark-bg px-1 rounded">{'{group}'}</span>, <span className="font-mono bg-gray-100 dark:bg-dark-bg px-1 rounded">{'{name}'}</span> as placeholders.</p>
            </div>
          </div>
        )}
      </div>

      {/* DATA TABLE */}
      <div className="flex-1 overflow-auto custom-scrollbar p-4 bg-gray-100 dark:bg-dark-bg transition-colors">
        <div className="bg-white dark:bg-dark-surface rounded-xl shadow-sm border border-gray-200 dark:border-dark-border min-w-[800px] overflow-hidden transition-colors">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border text-gray-500 dark:text-gray-400 font-semibold sticky top-0 z-10 text-xs uppercase tracking-wide">
              <tr>
                <th className="p-4 w-12 text-center">
                  <CheckSquare size={16} className="text-gray-300 dark:text-gray-600 mx-auto" />
                </th>
                <th className="p-4 w-16 text-center">Status</th>
                <th 
                  className="p-4 w-1/4 cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors select-none"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-1">
                    Name 
                    {sortConfig.key === 'name' && (
                       sortConfig.direction === 'asc' ? <ArrowUp size={14} className="text-brand-500"/> : <ArrowDown size={14} className="text-brand-500"/>
                    )}
                    {sortConfig.key !== 'name' && <ArrowUpDown size={12} className="opacity-20"/>}
                  </div>
                </th>
                <th 
                  className="p-4 w-1/5 cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors select-none"
                  onClick={() => handleSort('group')}
                >
                  <div className="flex items-center gap-1">
                    Group
                    {sortConfig.key === 'group' && (
                       sortConfig.direction === 'asc' ? <ArrowUp size={14} className="text-brand-500"/> : <ArrowDown size={14} className="text-brand-500"/>
                    )}
                    {sortConfig.key !== 'group' && <ArrowUpDown size={12} className="opacity-20"/>}
                  </div>
                </th>
                <th 
                  className="p-4 w-32 cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors select-none"
                  onClick={() => handleSort('tag')}
                >
                  <div className="flex items-center gap-1">
                    Tag
                    {sortConfig.key === 'tag' && (
                       sortConfig.direction === 'asc' ? <ArrowUp size={14} className="text-brand-500"/> : <ArrowDown size={14} className="text-brand-500"/>
                    )}
                    {sortConfig.key !== 'tag' && <ArrowUpDown size={12} className="opacity-20"/>}
                  </div>
                </th>
                <th className="p-4">Source</th>
                <th className="p-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
              {filteredPlaylist.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-16 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                      <Layers size={48} className="mb-4 opacity-20" />
                      <p className="text-lg font-medium">No channels found</p>
                      <p className="text-sm">Import a file or adjust your filters to see content.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPlaylist.map((channel) => (
                  <tr 
                    key={channel.id} 
                    className={`group transition-colors ${channel.selected ? 'bg-brand-50 dark:bg-brand-900/10' : 'hover:bg-gray-50 dark:hover:bg-dark-bg/50'}`}
                    draggable={true}
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", channel.id);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    onDragOver={(e) => {
                       e.preventDefault(); // Necessary to allow dropping
                       e.dataTransfer.dropEffect = "move";
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const sourceId = e.dataTransfer.getData("text/plain");
                      handleMoveChannel(sourceId, channel.id);
                    }}
                  >
                    <td className="p-4 text-center">
                      <input 
                        type="checkbox" 
                        checked={channel.selected} 
                        onChange={() => toggleSelect(channel.id)}
                        className="w-4 h-4 text-brand-600 rounded border-gray-300 dark:border-gray-600 focus:ring-brand-500 dark:bg-dark-bg cursor-pointer"
                      />
                    </td>
                    <td className="p-4 flex justify-center items-center h-full">
                      {channel.status === 'unknown' && <div className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-gray-600" title="Unknown" />}
                      {channel.status === 'online' && <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" title="Online" />}
                      {channel.status === 'offline' && <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]" title="Offline" />}
                    </td>
                    <td className="p-2">
                      <input 
                        className="w-full bg-transparent border-b border-transparent hover:border-gray-200 dark:hover:border-gray-700 focus:border-brand-400 focus:bg-white dark:focus:bg-dark-bg outline-none px-2 py-1 transition rounded-sm text-gray-800 dark:text-gray-200"
                        value={channel.name}
                        onFocus={() => saveHistory()}
                        onChange={(e) => updateChannel(channel.id, 'name', e.target.value)}
                      />
                    </td>
                    <td className="p-2">
                      <input 
                        className="w-full bg-transparent border-b border-transparent hover:border-gray-200 dark:hover:border-gray-700 focus:border-brand-400 focus:bg-white dark:focus:bg-dark-bg outline-none px-2 py-1 transition rounded-sm text-gray-600 dark:text-gray-400"
                        value={channel.group}
                        onFocus={() => saveHistory()}
                        onChange={(e) => updateChannel(channel.id, 'group', e.target.value)}
                      />
                    </td>
                    <td className="p-2">
                      <input 
                        className="w-full bg-transparent border-b border-transparent hover:border-gray-200 dark:hover:border-gray-700 focus:border-brand-400 focus:bg-white dark:focus:bg-dark-bg outline-none px-2 py-1 transition rounded-sm text-xs font-mono text-brand-600 dark:text-brand-400 bg-brand-50/50 dark:bg-brand-900/10"
                        value={channel.tag}
                        onFocus={() => saveHistory()}
                        onChange={(e) => updateChannel(channel.id, 'tag', e.target.value)}
                      />
                    </td>
                    <td className="p-4 text-gray-400 text-xs truncate max-w-[150px]" title={channel.source}>
                      {channel.source}
                    </td>
                    <td className="p-4 text-center cursor-move text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                      <GripVertical size={16} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* FOOTER STATS */}
      <div className="bg-white dark:bg-dark-surface border-t border-gray-200 dark:border-dark-border px-4 py-2 text-xs text-gray-500 dark:text-gray-400 flex justify-between transition-colors">
        <span>Total Channels: {playlist.length}</span>
        <span>Showing: {filteredPlaylist.length}</span>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
