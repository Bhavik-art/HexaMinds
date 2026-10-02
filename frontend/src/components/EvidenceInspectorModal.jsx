import React, { useState, useEffect } from 'react';
import { 
  X, GitCommit, GitBranch, Terminal, Folder, FolderOpen, FileCode, 
  CheckCircle2, AlertTriangle, Copy, Check, ExternalLink, ShieldCheck, 
  Play, Search, ChevronRight, ChevronDown, Cpu, FileText, Layers
} from 'lucide-react';
import { EVIDENCE_CARDS_DATA } from '../data/evidenceCardsData';

export default function EvidenceInspectorModal({ 
  isOpen, 
  onClose, 
  initialCardId = 'pytest',
  candidate 
}) {
  const [activeCardId, setActiveCardId] = useState(initialCardId);
  const [activeTab, setActiveTab] = useState('commit'); // 'commit' | 'tree' | 'ci'
  const [selectedDiffIndex, setSelectedDiffIndex] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLogs, setCopiedLogs] = useState(false);
  const [openFolders, setOpenFolders] = useState({ 'tests': true, 'src': true, 'src/worker': true, 'src/hooks': true, 'src/tests': true });
  const [logSearchQuery, setLogSearchQuery] = useState('');

  // Update activeCardId when initialCardId changes
  useEffect(() => {
    if (initialCardId && EVIDENCE_CARDS_DATA[initialCardId]) {
      setActiveCardId(initialCardId);
      setSelectedDiffIndex(0);
    }
  }, [initialCardId]);

  const currentCard = EVIDENCE_CARDS_DATA[activeCardId] || EVIDENCE_CARDS_DATA.pytest;

  // Whenever card changes, set default selected file from tree
  useEffect(() => {
    if (currentCard && currentCard.fileTree) {
      // Find first file or first verified file
      const findFirstFile = (nodes) => {
        for (const node of nodes) {
          if (node.type === 'file') return node;
          if (node.children) {
            const found = findFirstFile(node.children);
            if (found) return found;
          }
        }
        return null;
      };
      setSelectedFile(findFirstFile(currentCard.fileTree));
    }
  }, [activeCardId]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopyHash = () => {
    navigator.clipboard.writeText(currentCard.commit.hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleCopyCode = () => {
    if (selectedFile?.content) {
      navigator.clipboard.writeText(selectedFile.content);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleCopyLogs = () => {
    if (currentCard.ciLogs?.rawTerminal) {
      navigator.clipboard.writeText(currentCard.ciLogs.rawTerminal);
      setCopiedLogs(true);
      setTimeout(() => setCopiedLogs(false), 2000);
    }
  };

  const toggleFolder = (folderName) => {
    setOpenFolders(prev => ({
      ...prev,
      [folderName]: !prev[folderName]
    }));
  };

  // Render directory tree recursively
  const renderTreeNodes = (nodes, currentPath = '') => {
    return nodes.map((node) => {
      const fullPath = currentPath ? `${currentPath}/${node.name}` : node.name;
      if (node.type === 'folder') {
        const isFolderOpen = openFolders[fullPath] !== false;
        return (
          <div key={fullPath} className="select-none text-xs">
            <button
              onClick={() => toggleFolder(fullPath)}
              className="w-full flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors text-left"
            >
              {isFolderOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
              )}
              {isFolderOpen ? (
                <FolderOpen className="w-4 h-4 text-[#d4ff3a] shrink-0" />
              ) : (
                <Folder className="w-4 h-4 text-neutral-400 shrink-0" />
              )}
              <span className="font-semibold truncate">{node.name}</span>
            </button>
            {isFolderOpen && node.children && (
              <div className="pl-4 border-l border-neutral-800/80 ml-2.5 mt-0.5 space-y-0.5">
                {renderTreeNodes(node.children, fullPath)}
              </div>
            )}
          </div>
        );
      }

      // File Node
      const isSelected = selectedFile?.name === node.name && selectedFile?.content === node.content;
      return (
        <button
          key={fullPath}
          onClick={() => setSelectedFile(node)}
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all text-left ${
            isSelected
              ? 'bg-[#d4ff3a]/15 text-[#d4ff3a] font-bold border border-[#d4ff3a]/30'
              : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            <FileCode className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#d4ff3a]' : 'text-neutral-500'}`} />
            <span className="truncate">{node.name}</span>
          </div>
          {node.isVerifiedProof && (
            <span className="shrink-0 bg-emerald-950 text-emerald-400 text-[9px] font-bold px-1.5 py-0.5 rounded border border-emerald-800/60 flex items-center gap-0.5">
              ✓ Proof
            </span>
          )}
        </button>
      );
    });
  };

  // Split and style patch diff lines
  const activeDiff = currentCard.commit.diffs[selectedDiffIndex] || currentCard.commit.diffs[0];
  const diffLines = activeDiff ? activeDiff.patch.split('\n') : [];

  // Filter terminal lines
  const terminalLines = (currentCard.ciLogs.rawTerminal || '').split('\n').filter(line => {
    if (!logSearchQuery) return true;
    return line.toLowerCase().includes(logSearchQuery.toLowerCase());
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="bg-[#0f1115] text-neutral-100 rounded-3xl max-w-5xl w-full border border-neutral-800 shadow-2xl relative flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Header Bar */}
        <div className="px-6 py-4 border-b border-neutral-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#14171d]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-neutral-900 border border-neutral-700/80 flex items-center justify-center text-[#d4ff3a] shadow-inner">
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white tracking-tight flex items-center gap-2">
                  <span>SkillProof Code Inspector</span>
                </h3>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                  currentCard.status === 'PROVEN'
                    ? 'bg-[#d4ff3a] text-black border-black'
                    : 'bg-amber-400 text-black border-amber-600'
                }`}>
                  {currentCard.status}
                </span>
                <span className="text-xs text-neutral-500 font-mono hidden md:inline">
                  {currentCard.repoName}
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Verifying real GitHub commit SHA, filesystem tree, and continuous integration logs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={currentCard.repoUrl}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-semibold border border-neutral-700 transition-colors"
            >
              <GitBranch className="w-3.5 h-3.5 text-[#d4ff3a]" />
              <span>{currentCard.branch}</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-750 transition-colors ml-auto sm:ml-0"
              aria-label="Close Inspector"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Card Quick-Switcher Bar */}
        <div className="px-6 py-2.5 bg-neutral-950/70 border-b border-neutral-800/80 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider shrink-0 mr-1">
            Evidence Cards:
          </span>
          {Object.values(EVIDENCE_CARDS_DATA).map((card) => {
            const isActive = card.id === activeCardId;
            return (
              <button
                key={card.id}
                onClick={() => {
                  setActiveCardId(card.id);
                  setSelectedDiffIndex(0);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#d4ff3a] text-black shadow-sm'
                    : 'bg-neutral-900/90 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
                }`}
              >
                <span>{card.title}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                  isActive ? 'bg-black/20 text-neutral-950 font-black' : 'bg-neutral-800 text-neutral-400'
                }`}>
                  {card.status === 'PROVEN' ? '✓' : '⚠'}
                </span>
              </button>
            );
          })}
        </div>

        {/* 3 Main Inspection Tabs Header */}
        <div className="px-6 border-b border-neutral-800 flex items-center justify-between gap-4 bg-[#121418]">
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => setActiveTab('commit')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
                activeTab === 'commit'
                  ? 'border-[#d4ff3a] text-[#d4ff3a] bg-neutral-900/60'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <GitCommit className="w-4 h-4" />
              <span>Commit Hashes & Diffs</span>
              <span className="text-[10px] bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded font-mono">
                {currentCard.commit.shortHash}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('tree')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
                activeTab === 'tree'
                  ? 'border-[#d4ff3a] text-[#d4ff3a] bg-neutral-900/60'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Folder className="w-4 h-4" />
              <span>Repository File Tree</span>
              <span className="text-[10px] bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded font-mono">
                Explorer
              </span>
            </button>

            <button
              onClick={() => setActiveTab('ci')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
                activeTab === 'ci'
                  ? 'border-[#d4ff3a] text-[#d4ff3a] bg-neutral-900/60'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>CI / CD Pipeline Logs</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                currentCard.ciLogs.status === 'success' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
              }`}>
                {currentCard.ciLogs.duration}
              </span>
            </button>
          </div>
        </div>

        {/* Tab 1 Content: Commit Hashes & Diffs */}
        {activeTab === 'commit' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            
            {/* Commit Metadata Card */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 sm:p-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-neutral-800/80">
                <div>
                  <h4 className="font-extrabold text-sm sm:text-base text-white font-mono flex items-center gap-2">
                    <span>{currentCard.commit.message}</span>
                  </h4>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-neutral-400">
                    <div className="flex items-center gap-1.5">
                      <img 
                        src={currentCard.commit.authorAvatar} 
                        alt={currentCard.commit.author} 
                        className="w-5 h-5 rounded-full border border-neutral-700 object-cover" 
                      />
                      <span className="text-white font-semibold">{currentCard.commit.author}</span>
                      <span className="text-neutral-500 font-mono">({currentCard.commit.authorHandle})</span>
                    </div>
                    <span>•</span>
                    <span>{currentCard.commit.timestamp}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60 text-[11px]">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{currentCard.commit.gpgKeyId}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-xl font-mono text-xs flex items-center gap-2 text-neutral-300">
                    <span className="text-[#d4ff3a] font-bold">SHA:</span>
                    <span className="font-bold text-white">{currentCard.commit.shortHash}</span>
                    <button
                      onClick={handleCopyHash}
                      className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white transition-colors"
                      title="Copy Full Commit SHA"
                    >
                      {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Full SHA Bar */}
              <div className="pt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-500 font-mono">
                <div className="truncate max-w-full flex items-center gap-2">
                  <span className="text-neutral-400 font-sans font-bold">Full Commit Hash:</span>
                  <span className="text-neutral-300 select-all">{currentCard.commit.hash}</span>
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="text-emerald-400 font-bold">+{currentCard.commit.stats.additions}</span>
                  <span className="text-rose-400 font-bold">-{currentCard.commit.stats.deletions}</span>
                  <span className="text-neutral-400">{currentCard.commit.stats.filesChanged} files changed</span>
                </div>
              </div>
            </div>

            {/* Resume Claim Verification Context Callout */}
            <div className="bg-neutral-900/80 rounded-2xl p-4 border border-neutral-800 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#d4ff3a]/10 border border-[#d4ff3a]/30 text-[#d4ff3a] flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-extrabold uppercase text-[10px] tracking-wider text-[#d4ff3a] block mb-0.5">
                  Audit Verification Logic:
                </span>
                <p className="text-neutral-300 leading-relaxed">
                  <strong className="text-white">Claimed in Résumé:</strong> "{currentCard.claimText}"
                </p>
                <p className="text-neutral-400 mt-1 leading-relaxed">
                  <strong className="text-emerald-400">Proof Found:</strong> {currentCard.summary}
                </p>
              </div>
            </div>

            {/* Changed Files Diffs Viewer */}
            <div className="bg-neutral-950 rounded-2xl border border-neutral-800 overflow-hidden font-mono text-xs">
              
              {/* File Diff Tabs */}
              <div className="bg-neutral-900/90 px-4 py-2 border-b border-neutral-800 flex items-center gap-2 overflow-x-auto">
                <span className="text-[10px] font-sans font-bold text-neutral-400 uppercase tracking-wider shrink-0 mr-1">
                  Commit Diff:
                </span>
                {currentCard.commit.diffs.map((diff, index) => {
                  const isDiffActive = index === selectedDiffIndex;
                  return (
                    <button
                      key={diff.filename}
                      onClick={() => setSelectedDiffIndex(index)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${
                        isDiffActive
                          ? 'bg-neutral-800 text-white border border-neutral-700'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      <FileCode className="w-3 h-3 text-[#d4ff3a]" />
                      <span>{diff.filename}</span>
                      <span className="text-[10px] text-emerald-400">+{diff.additions}</span>
                      <span className="text-[10px] text-rose-400">-{diff.deletions}</span>
                    </button>
                  );
                })}
              </div>

              {/* Diff Code Container */}
              <div className="p-4 overflow-x-auto max-h-96 leading-relaxed select-text">
                {diffLines.map((line, idx) => {
                  const isAddition = line.startsWith('+') && !line.startsWith('+++');
                  const isDeletion = line.startsWith('-') && !line.startsWith('---');
                  const isHunkHeader = line.startsWith('@@');

                  return (
                    <div
                      key={idx}
                      className={`flex items-start px-2 py-0.5 rounded-sm font-mono text-[11px] ${
                        isAddition
                          ? 'bg-emerald-950/40 text-emerald-300 border-l-2 border-emerald-500'
                          : isDeletion
                          ? 'bg-rose-950/40 text-rose-300 border-l-2 border-rose-500'
                          : isHunkHeader
                          ? 'text-cyan-400 bg-neutral-900/60 font-bold my-1'
                          : 'text-neutral-400'
                      }`}
                    >
                      <span className="w-8 shrink-0 select-none opacity-40 text-right pr-3">{idx + 1}</span>
                      <span className="whitespace-pre">{line}</span>
                    </div>
                  );
                })}
              </div>

            </div>

          </div>
        )}

        {/* Tab 2 Content: Repository File Tree */}
        {activeTab === 'tree' && (
          <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-neutral-800">
            
            {/* Left Column: Interactive File Tree Explorer */}
            <div className="md:col-span-4 p-4 overflow-y-auto max-h-[35vh] md:max-h-[60vh] bg-neutral-950/60">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-800 text-xs text-neutral-400 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Folder className="w-3.5 h-3.5 text-[#d4ff3a]" />
                  <span>Files ({currentCard.repoName})</span>
                </span>
                <span className="text-[10px] text-neutral-500 font-mono">{currentCard.branch}</span>
              </div>
              <div className="space-y-0.5">
                {renderTreeNodes(currentCard.fileTree)}
              </div>
            </div>

            {/* Right Column: Code Viewer */}
            <div className="md:col-span-8 flex flex-col overflow-hidden bg-neutral-950">
              
              {/* File Title Bar */}
              <div className="px-4 py-2.5 bg-neutral-900/80 border-b border-neutral-800 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2 truncate">
                  <FileCode className="w-4 h-4 text-[#d4ff3a] shrink-0" />
                  <span className="font-bold text-white truncate">{selectedFile?.name || 'Select a file'}</span>
                  {selectedFile?.isVerifiedProof && (
                    <span className="bg-[#d4ff3a] text-black text-[9px] font-black px-2 py-0.5 rounded-full">
                      VERIFIED PROOF
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-neutral-500 text-[11px]">{selectedFile?.size}</span>
                  <button
                    onClick={handleCopyCode}
                    className="p-1.5 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors"
                    title="Copy File Content"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Code Content */}
              <div className="flex-1 p-4 overflow-y-auto max-h-[50vh] md:max-h-[55vh] font-mono text-[11px] leading-relaxed select-text">
                {selectedFile?.content ? (
                  selectedFile.content.split('\n').map((line, idx) => (
                    <div key={idx} className="flex hover:bg-neutral-900/60 px-1 py-0.5 rounded">
                      <span className="w-10 select-none text-neutral-600 text-right pr-4 font-mono">{idx + 1}</span>
                      <span className="text-neutral-200 whitespace-pre">{line}</span>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-neutral-500 font-sans">
                    Select a file from the explorer on the left to inspect code.
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* Tab 3 Content: CI / CD Pipeline Logs */}
        {activeTab === 'ci' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            
            {/* Runner Summary Card */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800/80">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                    currentCard.ciLogs.status === 'success'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-amber-950 text-amber-400 border border-amber-800'
                  }`}>
                    {currentCard.ciLogs.status === 'success' ? '✓' : '⚠'}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base text-white">
                      Workflow: {currentCard.ciLogs.workflow}
                    </h4>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Runner: {currentCard.ciLogs.runner} • Completed in <strong className="text-white">{currentCard.ciLogs.duration}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyLogs}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-xs font-semibold text-neutral-300 hover:text-white border border-neutral-800 transition-colors"
                  >
                    {copiedLogs ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy Full Logs</span>
                  </button>
                </div>
              </div>

              {/* Pipeline Step Progress */}
              <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {currentCard.ciLogs.steps.map((step, idx) => (
                  <div 
                    key={idx} 
                    className="bg-neutral-900/70 border border-neutral-800/80 p-2.5 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <span className="w-4 h-4 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/80 flex items-center justify-center text-[10px] font-bold shrink-0">
                        ✓
                      </span>
                      <span className="font-medium text-neutral-300 truncate">{step.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-500 shrink-0">{step.duration}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Terminal Window */}
            <div className="bg-[#050608] rounded-2xl border border-neutral-800 overflow-hidden shadow-2xl">
              
              {/* Terminal Window Header Bar */}
              <div className="px-4 py-2.5 bg-neutral-950 border-b border-neutral-850 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                  </div>
                  <span className="text-neutral-500 font-mono text-[11px] ml-2">runner@github-actions:~/{currentCard.title.toLowerCase().replace(/\\s+/g, '-')}</span>
                </div>

                {/* Filter logs input */}
                <div className="relative w-48 sm:w-60">
                  <Search className="w-3 h-3 text-neutral-500 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Filter terminal output..."
                    value={logSearchQuery}
                    onChange={(e) => setLogSearchQuery(e.target.value)}
                    className="w-full pl-7 pr-3 py-1 bg-neutral-900 rounded-lg border border-neutral-800 text-[11px] font-mono text-neutral-300 focus:outline-none focus:border-[#d4ff3a]"
                  />
                </div>
              </div>

              {/* Terminal Console Viewport */}
              <div className="p-4 font-mono text-[11px] leading-relaxed overflow-x-auto max-h-96 select-text space-y-0.5">
                {terminalLines.map((line, idx) => {
                  const isPassed = line.includes('PASSED') || line.includes('SUCCESS') || line.includes('✓');
                  const isWarning = line.includes('WARNING') || line.includes('!') || line.includes('⚠');
                  const isInfo = line.includes('[INFO]') || line.includes('[RUN]');
                  const isHeader = line.startsWith('===') || line.startsWith('---');

                  return (
                    <div
                      key={idx}
                      className={`whitespace-pre ${
                        isPassed
                          ? 'text-emerald-400 font-bold'
                          : isWarning
                          ? 'text-amber-400 font-bold'
                          : isHeader
                          ? 'text-cyan-400 font-bold'
                          : isInfo
                          ? 'text-neutral-400'
                          : 'text-neutral-300'
                      }`}
                    >
                      {line}
                    </div>
                  );
                })}
              </div>

            </div>

          </div>
        )}

        {/* Footer info note */}
        <div className="px-6 py-3 bg-neutral-950 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#d4ff3a] animate-pulse"></span>
            <span>SkillProof Zero-Trust Cryptographic Engine Active</span>
          </div>
          <span className="text-[11px] font-mono text-neutral-400">
            SHA: {currentCard.commit.hash.substring(0, 16)}...
          </span>
        </div>

      </div>
    </div>
  );
}
