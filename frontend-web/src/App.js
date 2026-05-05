import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
    Upload,
    X,
    Loader2,
    CheckCircle2,
    AlertCircle,
    BarChart3,
    FileVideo,
    Clock,
    Shield,
    Zap,
    Eye,
    Mail,
    Download,
    History,
    ShieldCheck,
    Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

// Utility
const cn = (...args) => args.filter(Boolean).join(' ');

// API Configuration
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:8000' 
    : 'https://truthlens-backend-v2-229580017780.us-central1.run.app';

// Video Upload Component
const VideoUpload = ({
    onFileSelect,
    isUploading,
    uploadedFile,
    onRemove,
}) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef(null);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback(
        (e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragOver(false);

            const files = Array.from(e.dataTransfer.files);
            const videoFile = files.find((file) => file.type.startsWith('video/'));

            if (videoFile) {
                onFileSelect(videoFile);
            }
        },
        [onFileSelect]
    );

    const handleFileChange = useCallback(
        (e) => {
            const file = e.target.files?.[0];
            if (file && file.type.startsWith('video/')) {
                onFileSelect(file);
            }
        },
        [onFileSelect]
    );

    const handleClick = () => {
        if (!isUploading && !uploadedFile) {
            fileInputRef.current?.click();
        }
    };

    return (
        <div className="w-full">
            <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/avi,video/mov,video/*"
                onChange={handleFileChange}
                className="sr-only"
            />

            {uploadedFile ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative bg-[#0a0f1a] border-2 border-cyan-500/40 rounded-2xl p-8 shadow-[0_0_30px_-5px_rgba(6,182,212,0.2)]"
                >
                    <button
                        onClick={onRemove}
                        className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all shadow-lg z-10"
                    >
                        <X size={18} />
                    </button>

                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="w-full md:w-48 aspect-video bg-black/40 rounded-xl border border-cyan-500/20 flex items-center justify-center relative group overflow-hidden">
                            {uploadedFile.type.startsWith('video/') ? (
                                <video
                                    src={URL.createObjectURL(uploadedFile)}
                                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                                />
                            ) : (
                                <FileVideo className="w-12 h-12 text-cyan-500/40" />
                            )}
                            <div className="absolute inset-0 bg-cyan-500/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                <p className="text-[10px] font-mono text-cyan-400">VIDEO READY</p>
                            </div>
                        </div>
                        <div className="flex-1 min-w-0 text-center md:text-left">
                            <h4 className="text-xl font-bold font-mono text-cyan-50 truncate mb-1">
                                {uploadedFile.name}
                            </h4>
                            <p className="text-sm font-mono text-cyan-400/60 uppercase tracking-widest mb-4">
                                {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB • READY FOR SCAN
                            </p>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-[10px] font-mono text-green-400 font-bold">STAGED</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            ) : (
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={handleClick}
                    className={cn(
                        'relative border-2 border-dashed rounded-3xl p-16 transition-all cursor-pointer overflow-hidden group',
                        isDragOver
                            ? 'border-cyan-400 bg-cyan-500/10'
                            : 'border-cyan-500/20 bg-black/40 hover:border-cyan-400/40 hover:bg-cyan-500/5'
                    )}
                >
                    {/* Background Glow */}
                    <div className="absolute -inset-24 bg-cyan-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                    <div className="flex flex-col items-center gap-8 relative z-10">
                        <div className="relative">
                            <div className="w-24 h-24 bg-cyan-500/10 rounded-2xl flex items-center justify-center border border-cyan-500/20 group-hover:scale-110 transition-transform">
                                <Upload className="w-10 h-10 text-cyan-400" />
                            </div>
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center animate-bounce shadow-lg shadow-cyan-500/50">
                                <span className="text-black font-black text-xs">+</span>
                            </div>
                        </div>

                        <div className="text-center max-w-sm">
                            <p className="text-2xl font-bold font-mono text-white mb-3">
                                Upload Target Media
                            </p>
                            <p className="text-sm font-mono text-cyan-400/60 leading-relaxed">
                                Select a video file to initiate multi-modal scan.
                                <br />
                                <span className="text-[10px] uppercase tracking-widest mt-4 block">MP4 • AVI • MOV • Max 50MB</span>
                            </p>
                            <p className="text-[10px] font-mono text-cyan-500/40 mt-6 flex items-center justify-center gap-2">
                                <ShieldCheck className="w-3 h-3" />
                                No data stored • Files processed securely
                            </p>
                        </div>

                        <div className="flex items-center gap-6 mt-4 opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                            <div className="flex flex-col items-center gap-2">
                                <Zap className="w-4 h-4 text-cyan-400" />
                                <span className="text-[8px] font-mono">FAST</span>
                            </div>
                            <div className="w-px h-4 bg-cyan-500/20" />
                            <div className="flex flex-col items-center gap-2">
                                <Shield className="w-4 h-4 text-cyan-400" />
                                <span className="text-[8px] font-mono">SECURE</span>
                            </div>
                            <div className="w-px h-4 bg-cyan-500/20" />
                            <div className="flex flex-col items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-cyan-400" />
                                <span className="text-[8px] font-mono">ACCURATE</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Result Display Component
const ResultDisplay = ({ result }) => {
    const getVerdictColor = (verdict) => {
        if (verdict.toLowerCase().includes('authentic')) return 'text-green-400';
        if (verdict.toLowerCase().includes('suspicious')) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getVerdictBg = (verdict) => {
        if (verdict.toLowerCase().includes('authentic')) return 'bg-green-500/10 border-green-500/30';
        if (verdict.toLowerCase().includes('suspicious')) return 'bg-yellow-500/10 border-yellow-500/30';
        return 'bg-red-500/10 border-red-500/30';
    };

    const formatConfidence = (confidence, verdict) => {
        const percentage = (confidence * 100).toFixed(0);
        if (verdict.toLowerCase().includes('authentic')) return `${percentage}% likely authentic`;
        if (verdict.toLowerCase().includes('suspicious')) return `${percentage}% suspicious features`;
        return `${percentage}% likely manipulated`;
    };

    const getConfidenceInterpretation = (confidence) => {
        if (confidence < 0.4) return "Low risk — likely authentic";
        if (confidence <= 0.7) return "Moderate risk — requires review";
        return "High risk — likely manipulated";
    };

    const downloadReport = () => {
        const report = {
            title: "TruthLens Detection Report",
            timestamp: new Date().toISOString(),
            verdict: result.verdict,
            confidence: result.confidence,
            interpretation: getConfidenceInterpretation(result.confidence),
            breakdown: result.breakdown,
            flags: result.flags,
            reason: result.reason,
            processing_time: result.processing_time
        };
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `truthlens_report_${Date.now()}.json`;
        a.click();
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="space-y-6"
        >
            {/* Verdict Card */}
            <Card className={cn('p-8 border-2 shadow-2xl relative overflow-hidden', getVerdictBg(result.verdict))}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-current opacity-5 blur-3xl -mr-16 -mt-16 rounded-full" />

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                    <div>
                        <p className="text-sm font-mono text-cyan-400/60 mb-2 uppercase tracking-widest">Final Analysis Verdict</p>
                        <h3 className={cn('text-4xl md:text-5xl font-black font-mono', getVerdictColor(result.verdict))}>
                            {result.verdict}
                        </h3>
                        <div className="flex items-center gap-2 mt-4">
                            <Shield className="w-4 h-4 text-cyan-400" />
                            <p className="text-sm text-cyan-400/80 font-mono">
                                Multi-modal AI verification complete
                            </p>
                        </div>
                    </div>
                    <div className="text-left md:text-right bg-black/20 p-4 rounded-xl border border-white/5 backdrop-blur-sm min-w-[200px]">
                        <p className="text-xs font-mono text-cyan-400/60 mb-1 uppercase tracking-widest">Detection Confidence</p>
                        <p className="text-3xl font-bold font-mono text-cyan-100">
                            {formatConfidence(result.confidence, result.verdict)}
                        </p>
                        <p className="text-[10px] font-mono text-cyan-400/40 mt-1 uppercase">
                            {getConfidenceInterpretation(result.confidence)}
                        </p>
                        <div className="mt-3">
                            <Progress value={result.confidence * 100} className="h-1.5" />
                        </div>
                    </div>
                </div>
            </Card>

            {/* Detailed Analysis Report */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
            >
                <Card className="p-8 bg-[#0a0f1a]/80 border-2 border-cyan-500/20 backdrop-blur-md relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <BarChart3 className="w-16 h-16 text-cyan-400" />
                    </div>
                    
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 bg-cyan-500/10 rounded-lg flex items-center justify-center border border-cyan-500/20">
                            <Shield className="w-4 h-4 text-cyan-400" />
                        </div>
                        <h4 className="text-sm font-bold font-mono text-cyan-400 uppercase tracking-[0.2em]">Technical Findings Report</h4>
                    </div>

                    <div className="space-y-6">
                        {result.reason.split('. ').map((sentence, idx) => {
                            if (!sentence) return null;
                            const isAlert = sentence.toLowerCase().includes('alert') || sentence.toLowerCase().includes('manipulation');
                            const isSuccess = sentence.toLowerCase().includes('successful') || sentence.toLowerCase().includes('authentic');
                            
                            return (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + (idx * 0.1) }}
                                    className={cn(
                                        "p-4 rounded-xl border transition-all duration-300",
                                        isAlert ? "bg-red-500/5 border-red-500/20" : 
                                        isSuccess ? "bg-green-500/5 border-green-500/20" : 
                                        "bg-white/5 border-white/10"
                                    )}
                                >
                                    <div className="flex gap-4 items-start">
                                        <div className={cn(
                                            "mt-1.5 w-2 h-2 rounded-full shrink-0 animate-pulse",
                                            isAlert ? "bg-red-500" : isSuccess ? "bg-green-500" : "bg-cyan-500"
                                        )} />
                                        <p className="text-lg font-mono text-cyan-50/90 leading-relaxed">
                                            {sentence.trim()}{sentence.endsWith('.') ? '' : '.'}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    <div className="mt-8 flex flex-wrap items-center gap-6 py-4 border-t border-cyan-500/10">
                        <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-400/40 uppercase tracking-widest">
                            <Clock className="w-3.5 h-3.5" />
                            Analysis Latency: {result.processing_time}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-400/40 uppercase tracking-widest">
                            <Zap className="w-3.5 h-3.5 text-yellow-500/40" />
                            Engine: TruthLens-Core v2.1
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-400/40 uppercase tracking-widest">
                            <ShieldCheck className="w-3.5 h-3.5 text-green-500/40" />
                            Protocol: Multi-Modal Scan
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Breakdown */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid md:grid-cols-2 gap-6"
            >
                <Card className="p-6 bg-[#0a0f1a]/50 border border-cyan-500/20">
                    <h4 className="text-sm font-bold font-mono text-cyan-100 mb-6 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-cyan-400" />
                        ANALYSIS BREAKDOWN
                    </h4>
                    <div className="space-y-6">
                        {[
                            { label: 'Video Consistency', value: result.breakdown.video, tip: 'Frame-level artifact detection' },
                            { label: 'Audio Signatures', value: result.breakdown.audio, tip: 'Acoustic anomaly analysis' },
                            { label: 'Lip-Sync Alignment', value: result.breakdown.lip_sync, tip: 'Visual-audio synchronization' }
                        ].map((item, i) => (
                            <div key={i} className="group relative">
                                <div className="flex justify-between mb-2">
                                    <span className="text-xs font-mono text-cyan-400/80 uppercase flex items-center gap-1">
                                        {item.label}
                                        <Info className="w-3 h-3 opacity-30 group-hover:opacity-100 transition-opacity" />
                                    </span>
                                    <span className="text-xs font-mono text-cyan-100">
                                        {(item.value * 100).toFixed(0)}%
                                    </span>
                                </div>
                                <Progress value={item.value * 100} className="h-1.5" />
                                <div className="absolute top-full left-0 mt-2 bg-cyan-950 text-[10px] font-mono text-cyan-200 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-cyan-500/20">
                                    {item.tip}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {result.flags.length > 0 && (
                    <Card className="p-6 bg-red-500/5 border border-red-500/20">
                        <h4 className="text-sm font-bold font-mono text-red-400 mb-4 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            ANOMALIES DETECTED
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {result.flags.map((flag, idx) => (
                                <Badge
                                    key={idx}
                                    variant="outline"
                                    className="bg-red-500/10 text-red-400 border-red-500/30 font-mono py-1 px-3"
                                >
                                    {flag}
                                </Badge>
                            ))}
                        </div>
                        <p className="mt-4 text-xs font-mono text-red-400/60 leading-tight">
                            Manual verification recommended for high-stakes decisions.
                        </p>
                    </Card>
                )}
            </motion.div>

            <div className="flex gap-4">
                <Button 
                    onClick={downloadReport}
                    variant="outline"
                    className="flex-1 border-cyan-500/20 hover:bg-cyan-500/10 text-cyan-400 font-mono py-4"
                >
                    <Download className="w-4 h-4 mr-2" />
                    Download Report
                </Button>
            </div>
        </motion.div>
    );
};

// Analytics Component
const Analytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/analytics`);
                setData(response.data);
            } catch (err) {
                console.error("Analytics fetch failed", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            <p className="font-mono text-cyan-400/60">Fetching global metrics...</p>
        </div>
    );

    if (!data) return (
        <Card className="p-12 text-center border-dashed border-2 border-cyan-500/20">
            <BarChart3 className="w-12 h-12 text-cyan-400/20 mx-auto mb-4" />
            <p className="font-mono text-cyan-400/60">Analytics data temporarily unavailable.</p>
        </Card>
    );

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const maxCount = Math.max(...data.daily);

    return (
        <div className="space-y-6">
            <Card className="p-6 bg-[#0a0f1a] border-2 border-cyan-500/30">
                <h3 className="text-xl font-bold font-mono text-cyan-100 mb-6 uppercase tracking-widest">
                    Detection Activity (Last 5 Days)
                </h3>
                <div className="flex items-end justify-between gap-4 h-64">
                    {data.daily.map((count, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${(count / maxCount) * 100}%` }}
                                transition={{ duration: 1, type: "spring" }}
                                className="w-full bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-lg min-h-[10px] relative group"
                            >
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-cyan-900 text-cyan-100 px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    {count} scans
                                </div>
                            </motion.div>
                            <span className="text-xs font-mono text-cyan-400/60">{days[i]}</span>
                        </div>
                    ))}
                </div>
            </Card>

            <Card className="p-6 bg-[#0a0f1a] border-2 border-cyan-500/30">
                <h3 className="text-xl font-bold font-mono text-cyan-100 mb-6 uppercase tracking-widest">
                    Media Format Distribution
                </h3>
                <div className="space-y-6">
                    {Object.entries(data.types).map(([type, count]) => {
                        const total = Object.values(data.types).reduce((a, b) => a + b, 0);
                        const percentage = ((count / total) * 100).toFixed(0);
                        return (
                            <div key={type}>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-mono text-cyan-400 uppercase">{type} Format</span>
                                    <span className="text-sm font-mono text-cyan-100">{percentage}%</span>
                                </div>
                                <Progress value={percentage} className="h-2" />
                            </div>
                        );
                    })}
                </div>
            </Card>

            <RecentHistory />
        </div>
    );
};

// Recent History Component
const RecentHistory = () => {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/history`);
                setHistory(response.data);
            } catch (err) {
                console.error("History fetch failed", err);
            }
        };
        fetchHistory();
    }, []);

    if (history.length === 0) return null;

    return (
        <Card className="p-6 bg-[#0a0f1a] border-2 border-cyan-500/30">
            <h3 className="text-xl font-bold font-mono text-cyan-100 mb-6 uppercase tracking-widest flex items-center gap-2">
                <History className="w-5 h-5 text-cyan-400" />
                Recent Scans
            </h3>
            <div className="space-y-4">
                {history.slice(0, 5).map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-cyan-500/10">
                        <div className="min-w-0 flex-1 mr-4">
                            <p className="text-sm font-mono text-cyan-100 truncate">{item.filename}</p>
                            <p className="text-[10px] font-mono text-cyan-400/40">{new Date(item.created_at).toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                            <Badge variant="outline" className={cn(
                                "font-mono py-0 px-2",
                                item.verdict === 'Authentic' ? 'text-green-400 border-green-500/30' : 'text-red-400 border-red-500/30'
                            )}>
                                {item.verdict}
                            </Badge>
                            <span className="text-xs font-mono text-cyan-400/60 w-12 text-right">
                                {(item.confidence * 100).toFixed(0)}%
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

// Loading Sequence Component
const LoadingSequence = ({ currentStep }) => {
    const steps = [
        "Extracting video frames...",
        "Analyzing audio patterns...",
        "Checking lip-sync consistency...",
        "Generating final verdict..."
    ];

    return (
        <div className="space-y-8 py-8">
            <div className="flex flex-col items-center gap-6">
                <div className="relative">
                    <Loader2 className="w-16 h-16 text-cyan-400 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 bg-cyan-400/20 rounded-full animate-ping" />
                    </div>
                </div>
                <h4 className="text-xl font-mono text-cyan-100 text-center">
                    {steps[currentStep]}
                </h4>
            </div>

            <div className="max-w-md mx-auto space-y-4">
                {steps.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                        <div className={cn(
                            "w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold font-mono transition-colors",
                            idx < currentStep ? "bg-cyan-500 border-cyan-500 text-black" :
                                idx === currentStep ? "border-cyan-400 text-cyan-400 animate-pulse" :
                                    "border-cyan-500/20 text-cyan-500/20"
                        )}>
                            {idx < currentStep ? "✓" : idx + 1}
                        </div>
                        <span className={cn(
                            "text-sm font-mono transition-colors",
                            idx <= currentStep ? "text-cyan-100" : "text-cyan-400/20"
                        )}>
                            {step}
                        </span>
                    </div>
                ))}
            </div>

            <div className="mt-8">
                <Progress value={(currentStep + 1) * 25} className="h-1 bg-cyan-500/10" />
                <p className="text-center text-[10px] font-mono text-cyan-400/40 mt-2 uppercase tracking-[0.2em]">
                    Running Neural Engine Analysis • MODALITY_v4
                </p>
            </div>
        </div>
    );
};

// Main App Component
const TruthLensApp = () => {
    const [uploadedFile, setUploadedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [loadingStep, setLoadingStep] = useState(0);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('home');
    const [systemOnline, setSystemOnline] = useState(false);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/`);
                if (response.data.status === 'online') setSystemOnline(true);
            } catch {
                setSystemOnline(false);
            }
        };
        checkStatus();
        const interval = setInterval(checkStatus, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleFileSelect = (file) => {
        if (file.size > 50 * 1024 * 1024) {
            setError("File too large. Maximum size is 50MB.");
            return;
        }
        setUploadedFile(file);
        setFilePreview(URL.createObjectURL(file));
        setResult(null);
        setError(null);
    };

    const handleRemove = () => {
        if (filePreview) URL.revokeObjectURL(filePreview);
        setUploadedFile(null);
        setFilePreview(null);
        setResult(null);
        setError(null);
    };

    const handleDemo = () => {
        const mockFile = new File(["demo"], "sample_interview_deepfake.mp4", { type: "video/mp4" });
        handleFileSelect(mockFile);
    };

    const handleUpload = async () => {
        if (!uploadedFile) return;

        setIsUploading(true);
        setLoadingStep(0);
        setError(null);

        const stepInterval = setInterval(() => {
            setLoadingStep(prev => (prev < 3 ? prev + 1 : prev));
        }, 1500);

        const formData = new FormData();
        formData.append('file', uploadedFile);

        try {
            const response = await axios.post(`${API_BASE_URL}/api/detect`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setTimeout(() => {
                clearInterval(stepInterval);
                setResult(response.data);
                setIsUploading(false);
            }, 6000);
            
        } catch (err) {
            clearInterval(stepInterval);
            console.error(err);
            setError("Unable to reach detection server. Please try again.");
            setIsUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#030712] text-cyan-100">
            {/* System Status Indicator */}
            <div className="fixed top-4 right-4 z-50">
                <div className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-md transition-all",
                    systemOnline ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"
                )}>
                    <div className={cn("w-2 h-2 rounded-full", systemOnline ? "bg-green-500 animate-pulse" : "bg-red-500")} />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                        {systemOnline ? "API Online" : "API Offline"}
                    </span>
                </div>
            </div>

            {/* Hero Section */}
            <div className="relative overflow-hidden border-b border-cyan-500/10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#0e749020,transparent)]" />
                <div className="container mx-auto px-4 py-20 relative">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center max-w-4xl mx-auto"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/5 border border-cyan-500/20 mb-8 backdrop-blur-sm"
                        >
                            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                            <span className="text-[10px] font-mono text-cyan-400 tracking-widest uppercase font-bold">Research Prototype</span>
                        </motion.div>
                        
                        <div className="flex flex-col items-center justify-center gap-1 mb-8">
                            <h1 className="text-7xl md:text-9xl font-black font-mono tracking-tighter text-cyan-50">
                                TruthLens
                            </h1>
                            <p className="text-sm font-mono text-cyan-400 font-bold uppercase tracking-[0.4em]">
                                Real-Time Multi-Modal Deepfake Detection System
                            </p>
                        </div>

                        <h2 className="text-2xl md:text-3xl font-mono mb-6 text-cyan-100 font-light max-w-3xl mx-auto">
                            Detect manipulated media before it spreads misinformation.
                        </h2>
                        
                        <p className="text-base font-mono text-cyan-400/60 max-w-2xl mx-auto mb-10 leading-relaxed">
                            Real-time multi-modal deepfake detection system for research and demonstration.
                        </p>

                        <div className="flex flex-wrap justify-center gap-4">
                            <Button 
                                onClick={() => document.getElementById('main-tool').scrollIntoView({ behavior: 'smooth' })}
                                className="bg-cyan-500 hover:bg-cyan-600 text-black font-mono px-8 py-6 h-auto text-lg rounded-xl shadow-lg shadow-cyan-500/20"
                            >
                                Start Analysis
                            </Button>
                            <Button 
                                variant="outline"
                                onClick={handleDemo}
                                className="border-cyan-500/30 hover:bg-cyan-500/10 text-cyan-400 font-mono px-8 py-6 h-auto text-lg rounded-xl"
                            >
                                Try Sample Video
                            </Button>
                        </div>

                        <p className="mt-8 text-[10px] font-mono text-cyan-500/40 uppercase tracking-[0.3em]">
                            Not for legal or forensic use
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Main Content */}
            <div id="main-tool" className="container mx-auto px-4 py-20">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full max-w-sm mx-auto grid-cols-2 mb-16 bg-[#0a0f1a]/50 p-1 border border-cyan-500/10 rounded-xl">
                        <TabsTrigger
                            value="home"
                            className="rounded-lg font-mono py-3 data-[state=active]:bg-cyan-500 data-[state=active]:text-black"
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            Analysis
                        </TabsTrigger>
                        <TabsTrigger
                            value="analytics"
                            className="rounded-lg font-mono py-3 data-[state=active]:bg-cyan-500 data-[state=active]:text-black"
                        >
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Live Metrics
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="home" className="space-y-12">
                        <div className="max-w-4xl mx-auto">
                            {!isUploading && !result && (
                                <Card className="bg-[#0a0f1a]/40 border-2 border-cyan-500/10 p-2 overflow-hidden shadow-2xl">
                                    <VideoUpload
                                        onFileSelect={handleFileSelect}
                                        isUploading={isUploading}
                                        uploadedFile={uploadedFile}
                                        onRemove={handleRemove}
                                    />
                                </Card>
                            )}

                            {isUploading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="max-w-md mx-auto"
                                >
                                    <LoadingSequence currentStep={loadingStep} />
                                </motion.div>
                            )}

                            {uploadedFile && !result && !isUploading && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-10"
                                >
                                    <Button
                                        onClick={handleUpload}
                                        disabled={isUploading}
                                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-black font-mono font-bold text-xl py-8 rounded-2xl shadow-[0_0_40px_-10px_rgba(6,182,212,0.5)] transition-all hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Zap className={cn("w-6 h-6 mr-3 fill-current", isUploading && "animate-pulse")} />
                                        {isUploading ? "Analyzing..." : "Analyze Video"}
                                    </Button>
                                    <p className="text-center mt-4 text-xs font-mono text-cyan-400/40 uppercase tracking-[0.3em]">
                                        Secure Multi-modal Scan Ready
                                    </p>
                                </motion.div>
                            )}

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="mt-8"
                                >
                                    <Card className="p-6 bg-red-500/5 border-2 border-red-500/20 rounded-2xl flex items-center gap-4">
                                        <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center shrink-0">
                                            <AlertCircle className="w-6 h-6 text-red-400" />
                                        </div>
                                        <div>
                                            <p className="font-bold font-mono text-red-400 mb-1">Analysis Aborted</p>
                                            <p className="text-sm font-mono text-red-400/60">{error}</p>
                                        </div>
                                    </Card>
                                </motion.div>
                            )}

                            {result && (
                                <div className="mt-8 space-y-10">
                                    <ResultDisplay result={result} />
                                    <div className="flex justify-center pt-4">
                                        <Button
                                            onClick={handleRemove}
                                            className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-mono px-12 py-6 h-auto rounded-xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_-5px_rgba(6,182,212,0.3)]"
                                        >
                                            <Upload className="w-4 h-4 mr-2" />
                                            Start New Analysis
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="analytics">
                        <div className="max-w-4xl mx-auto">
                            <Analytics />
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Features Section */}
            <div className="container mx-auto px-4 py-16 border-t border-cyan-500/20">
                <h2 className="text-3xl font-bold font-mono text-center mb-12 text-cyan-100">
                    HOW IT WORKS
                </h2>
                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {[
                        {
                            icon: Upload,
                            title: 'Upload Video',
                            description: 'Drag and drop or select your video file (MP4, AVI, MOV)',
                        },
                        {
                            icon: Eye,
                            title: 'AI Analysis',
                            description: 'Our system analyzes visual, audio, and behavioral signals',
                        },
                        {
                            icon: CheckCircle2,
                            title: 'Get Results',
                            description: 'Receive verdict with confidence score and detailed breakdown',
                        },
                    ].map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Card className="p-6 bg-[#0a0f1a] border-2 border-cyan-500/30 text-center">
                                <div className="w-12 h-12 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <feature.icon className="w-6 h-6 text-cyan-400" />
                                </div>
                                <h3 className="text-lg font-bold font-mono text-cyan-100 mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-sm font-mono text-cyan-400/60">{feature.description}</p>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Contact Section */}
            <div className="container mx-auto px-4 py-16 border-t border-cyan-500/20">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-3xl font-bold font-mono mb-6 text-cyan-100">GET IN TOUCH</h2>
                    <p className="text-base font-mono text-cyan-400/60 mb-8">
                        Have questions or feedback? We'd love to hear from you.
                    </p>
                    <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-mono">
                        <Mail className="w-4 h-4 mr-2" />
                        Contact Us
                    </Button>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-cyan-500/20 py-8">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm font-mono text-cyan-400/60">
                            © 2024 TruthLens. All rights reserved.
                        </p>
                        <div className="flex gap-6">
                            <a href="#" className="text-sm font-mono text-cyan-400/60 hover:text-cyan-400">
                                Privacy
                            </a>
                            <a href="#" className="text-sm font-mono text-cyan-400/60 hover:text-cyan-400">
                                Terms
                            </a>
                            <a href="#" className="text-sm font-mono text-cyan-400/60 hover:text-cyan-400">
                                About
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default TruthLensApp;