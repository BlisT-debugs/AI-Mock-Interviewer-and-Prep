import { useUser } from '@stackframe/stack'
import React, { useState } from 'react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from '@/components/ui/textarea'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from 'next/image'
import { Experts } from '@/services/Options'
import { Button } from '@/components/ui/button'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { LoaderCircle, CheckCircle2, AlertCircle } from 'lucide-react' // Added new icons
import { useRouter } from 'next/navigation'

function UserInputDialog({ children, options }) {
    const user = useUser();
    // Added optional chaining safety net here!
    const isMockInterview = options?.name === 'Mock Interviews';
    const router = useRouter();
    const createDiscussionRoom = useMutation(api.DiscussionRoom.CreateRoom);

    // Standard States
    const [selectedExpert, setSelectedExpert] = useState();
    const [topic, setTopic] = useState('');
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);

    // New Mock Interview States
    const [resumeFile, setResumeFile] = useState(null);
    const [jdFile, setJdFile] = useState(null);
    const [jdText, setJdText] = useState('');
    const [role, setRole] = useState('');
    const [industry, setIndustry] = useState('');

    // --- PHASE 3: ROBUST PARSING STATES ---
    const [finalResumeText, setFinalResumeText] = useState("");
    const [isParsingResume, setIsParsingResume] = useState(false);
    const [resumeParsed, setResumeParsed] = useState(false);
    
    const [isParsingJd, setIsParsingJd] = useState(false);
    const [jdParsed, setJdParsed] = useState(false);

    // --- PHASE 3: INSTANT PARSE LOGIC ---
    const handlePdfUpload = async (file, isResume) => {
        if (!file) return;
        
        if (isResume) setIsParsingResume(true);
        else setIsParsingJd(true);

        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch('/api/parse-pdf', { method: 'POST', body: formData });
            const data = await res.json();
            
            if (data.error) throw new Error(data.error);
            
            if (isResume) {
                setFinalResumeText(data.text);
                setResumeParsed(true);
            } else {
                setJdText(data.text); // Populate the text area automatically!
                setJdParsed(true);
            }
        } catch (error) {
            console.error("PDF Parse Error:", error);
            alert(`Failed to read ${isResume ? 'resume' : 'job description'}. Is it password protected?`);
            // Reset if failed
            if (isResume) {
                setResumeFile(null);
                setResumeParsed(false);
            } else {
                setJdFile(null);
                setJdParsed(false);
            }
        } finally {
            if (isResume) setIsParsingResume(false);
            else setIsParsingJd(false);
        }
    };

    const onClickNext = async () => {
        setLoading(true);
        try {
            // Because we parsed instantly, we don't need to parse here anymore!
            // We just pass the state variables directly to Convex.
            const result = await createDiscussionRoom({
                Topic: isMockInterview ? (role || "General Interview") : topic,
                Option: options?.name,
                Assistant: selectedExpert,
                resumeText: finalResumeText,
                jdText: jdText,
                role: role,
                industry: industry,
                userId: user?.id 
            });

            setOpenDialog(false);
            router.push('/DiscussionRoom/' + result);
        } catch (error) {
            console.error("Failed to start session:", error);
            alert("Failed to create room. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    // Validation: Require Topic for normal mode. Require successful Resume parse for Mock mode.
    const isReady = isMockInterview 
        ? (resumeParsed && selectedExpert && !loading && !isParsingResume && !isParsingJd) 
        : (topic && selectedExpert && !loading);

    return (
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            
            <DialogContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                        {options?.name || "Session"}
                    </DialogTitle>
                    <DialogDescription asChild>
                        <div className="mt-4 space-y-6">
                            
                            {/* --- CONDITIONAL RENDERING BASED ON MODE --- */}
                            {!isMockInterview ? (
                                <div>
                                    <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-2">
                                        Which topic do you want to cover today?
                                    </h2>
                                    <Textarea 
                                        placeholder="E.g., React Hooks, Python Basics, Advanced C++..." 
                                        className="min-h-[100px] bg-gray-50 dark:bg-gray-800"
                                        onChange={(e) => setTopic(e.target.value)}
                                    />
                                </div>
                            ) : (
                                <div className="space-y-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        
                                        {/* Resume Upload (Required) */}
                                        <div className="space-y-2">
                                            <Label className="text-gray-900 dark:text-gray-200 font-semibold flex items-center gap-2">
                                                Resume (Required) <span className="text-red-500">*</span>
                                            </Label>
                                            <Input 
                                                type="file" 
                                                accept=".pdf" 
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    setResumeFile(file);
                                                    handlePdfUpload(file, true); // Instantly parse!
                                                }}
                                                className={`cursor-pointer file:border-0 file:rounded-md file:px-4 file:py-1 transition-all ${
                                                    resumeParsed 
                                                    ? 'file:bg-green-100 file:text-green-700 bg-green-50/50 border-green-200' 
                                                    : 'file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
                                                }`}
                                            />
                                            {/* Visual Feedback */}
                                            {isParsingResume && <p className="text-xs text-blue-600 flex items-center gap-1 animate-pulse"><LoaderCircle className="w-3 h-3 animate-spin"/> Extracting text...</p>}
                                            {resumeParsed && <p className="text-xs text-green-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Successfully parsed</p>}
                                        </div>

                                        {/* JD Upload (Optional) */}
                                        <div className="space-y-2">
                                            <Label className="text-gray-900 dark:text-gray-200 font-semibold">
                                                Job Description PDF (Optional)
                                            </Label>
                                            <Input 
                                                type="file" 
                                                accept=".pdf" 
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    setJdFile(file);
                                                    handlePdfUpload(file, false); // Instantly parse!
                                                }}
                                                className={`cursor-pointer file:border-0 file:rounded-md file:px-4 file:py-1 transition-all ${
                                                    jdParsed 
                                                    ? 'file:bg-green-100 file:text-green-700 bg-green-50/50 border-green-200' 
                                                    : 'file:bg-gray-100 file:text-gray-700'
                                                }`}
                                            />
                                            {/* Visual Feedback */}
                                            {isParsingJd && <p className="text-xs text-blue-600 flex items-center gap-1 animate-pulse"><LoaderCircle className="w-3 h-3 animate-spin"/> Extracting text...</p>}
                                            {jdParsed && <p className="text-xs text-green-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Job description loaded</p>}
                                        </div>
                                    </div>

                                    {/* JD Text Fallback (Populates automatically if they upload a PDF!) */}
                                    <div className="space-y-2">
                                        <Label className="text-gray-900 dark:text-gray-200 font-semibold text-xs text-muted-foreground flex items-center gap-1">
                                            Job Description Text {jdParsed && <span className="text-green-600">(Extracted from PDF)</span>}
                                        </Label>
                                        <Textarea 
                                            placeholder="Paste the requirements, responsibilities, etc..." 
                                            className={`min-h-[80px] transition-colors ${jdParsed ? 'bg-green-50/30 border-green-100' : ''}`}
                                            value={jdText}
                                            onChange={(e) => {
                                                setJdText(e.target.value);
                                                if (e.target.value === '') setJdParsed(false);
                                            }}
                                        />
                                    </div>

                                    {/* Role & Industry (Fixed Mobile Squishing: grid-cols-1 sm:grid-cols-2) */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                                        <div className="space-y-2">
                                            <Label className="text-gray-900 dark:text-gray-200 font-semibold text-sm">Target Role</Label>
                                            <Input placeholder="e.g. Frontend Developer" onChange={(e) => setRole(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-gray-900 dark:text-gray-200 font-semibold text-sm">Industry</Label>
                                            <Input placeholder="e.g. Fintech, Healthcare" onChange={(e) => setIndustry(e.target.value)} />
                                        </div>
                                    </div>
                                    
                                </div>
                            )}
                            
                            {/* --- EXPERT SELECTION --- */}
                            <div>
                                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-200 mb-3 text-center">
                                    Select your Interviewer
                                </h2>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {Experts.map((expert, index) => (
                                        <div 
                                            key={index} 
                                            onClick={() => setSelectedExpert(expert.name)} 
                                            className={`flex flex-col items-center justify-center p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                                                selectedExpert === expert.name 
                                                ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 shadow-sm transform scale-105' 
                                                : 'bg-white dark:bg-gray-800 border-2 border-transparent hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-gray-200 dark:hover:border-gray-600'
                                            }`}
                                        >
                                            <Image 
                                                src={expert.avatar} 
                                                alt={expert.name} 
                                                width={64} 
                                                height={64} 
                                                className="rounded-full object-cover mb-2 drop-shadow-sm" 
                                            />
                                            <h2 className={`text-xs font-medium text-center ${
                                                selectedExpert === expert.name ? 'text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                                            }`}>
                                                {expert.name}
                                            </h2>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* --- ACTION BUTTONS --- */}
                            <div className="flex gap-3 justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
                                <DialogClose asChild>
                                    <Button variant="ghost" className="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button 
                                    disabled={!isReady} 
                                    onClick={onClickNext}
                                    className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
                                >
                                    {loading ? <LoaderCircle className="h-4 w-4 animate-spin mr-2"/> : null}
                                    {loading ? 'Starting...' : 'Let\'s Go'}
                                </Button>
                            </div>
                        </div>
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}

export default UserInputDialog