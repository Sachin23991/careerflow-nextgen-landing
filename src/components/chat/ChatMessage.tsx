import { cn } from "@/lib/utils";
import { 
  User, 
  Copy, 
  Check, 
  Edit2, 
  Sparkles, 
  ThumbsUp, 
  ThumbsDown, 
  RotateCcw,
  ExternalLink
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import "./chat.css";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "./remark-gfm-shim"; // <-- use local shim

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
  isLatest?: boolean;
  animationEnabled?: boolean;
  wordDelayMs?: number;
  onEdit?: (message: Message) => void;
  onRegenerate?: (message: Message) => void; // Optional: Handler for regeneration
}

type LinkItem = { url: string; domain: string };

export const ChatMessage = ({
  message,
  isLatest = false,
  animationEnabled = true,
  wordDelayMs = 15, // Gemini is fast
  onEdit,
  onRegenerate
}: ChatMessageProps) => {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);

  // ----------------------------------------------------------------------
  // 1. DATA PROCESSING (Intent Recognition & Link Extraction)
  // ----------------------------------------------------------------------

  const findUrls = (text: string) => {
    if (!text) return [];
    const urlRegex = /(https?:\/\/[^\s)]+)/g;
    const matches = text.match(urlRegex);
    return matches ? Array.from(new Set(matches)) : [];
  };

  const [links, setLinks] = useState<LinkItem[]>([]);

  // Sanitize and Structure Logic (Preserved from previous fix)
  const processContent = (raw: string) => {
    if (!raw) return "";
    let text = raw.replace(/\r\n/g, "\n");

    // Remove URLs from body text (we display them as chips later)
    const urlRegex = /(https?:\/\/[^\s)]+)/g;
    text = text.replace(urlRegex, "");
    
    // Remove Metadata
    text = text.replace(/^.*\b(URL|Title|Relevance|Precision)\b:.*$/gim, "");
    text = text.replace(/⭐+/g, "");

    // Intent Detection
    const hasXml = /<SUMMARY>|<COMPREHENSIVE_EXPLANATION>|<RELEVANT_INSIGHTS>/i.test(text);
    const hasHeader = /^##\s+Summary/im.test(text);

    // If precise answer (no structure), return clean text
    if (!hasXml && !hasHeader) {
      return text.replace(/\*?This answer is based on the model's knowledge[\s\S]*$/i, "").trim();
    }

    // Extraction Logic
    const sections: Record<string, string> = { summary: "", explanation: "", insights: "" };
    try {
      const xmlSummary = /<SUMMARY>([\s\S]*?)<\/SUMMARY>/i.exec(text);
      const xmlExplanation = /<COMPREHENSIVE_EXPLANATION>([\s\S]*?)<\/COMPREHENSIVE_EXPLANATION>/i.exec(text);
      const xmlInsights = /<RELEVANT_INSIGHTS>([\s\S]*?)<\/RELEVANT_INSIGHTS>/i.exec(text);

      if (xmlSummary) sections.summary = (xmlSummary[1] || "").trim();
      if (xmlExplanation) sections.explanation = (xmlExplanation[1] || "").trim();
      if (xmlInsights) sections.insights = (xmlInsights[1] || "").trim();

      const parts: string[] = [];
      if (sections.summary) parts.push(`### Summary\n${sections.summary}`);
      if (sections.explanation) parts.push(`### Detailed Analysis\n${sections.explanation}`);
      if (sections.insights) {
        const ins = sections.insights.trim();
        const bullets = ins.split(/\n+/).filter(Boolean);
        const bulletText = bullets.length > 1 
          ? bullets.map(b => `- ${b.trim()}`).join("\n") 
          : `- ${ins}`;
        parts.push(`### Key Insights\n${bulletText}`);
      }
      return parts.join("\n\n") || text;
    } catch {
      return text;
    }
  };

  // Process links and content on mount/update
  useEffect(() => {
    if (message.role === "assistant") {
      const urls = findUrls(message.content);
      setLinks(urls.map(u => ({ 
        url: u, 
        domain: new URL(u).hostname.replace(/^www\./, "") 
      })));
    }
  }, [message.content, message.role]);

  const displayedContent = message.role === "assistant" 
    ? processContent(message.content) 
    : message.content;


  // ----------------------------------------------------------------------
  // 2. ANIMATION LOGIC (Smoother "Streaming" feel)
  // ----------------------------------------------------------------------
  
  const [typedContent, setTypedContent] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const animRef = useRef<number>();

  useEffect(() => {
    if (!animationEnabled || !isLatest || message.role === "user") {
      setTypedContent(displayedContent);
      setIsAnimating(false);
      return;
    }

    setTypedContent("");
    setIsAnimating(true);
    let currentIndex = 0;
    const chars = displayedContent.split("");
    
    // Dynamic speed: faster for longer text
    const speed = chars.length > 500 ? 5 : wordDelayMs;

    const animate = () => {
      // Add a chunk of characters at once for "streaming" feel, not typewriter
      const chunk = 3; 
      if (currentIndex < chars.length) {
        setTypedContent(prev => prev + chars.slice(currentIndex, currentIndex + chunk).join(""));
        currentIndex += chunk;
        animRef.current = window.setTimeout(animate, speed);
      } else {
        setIsAnimating(false);
      }
    };

    animate();
    return () => clearTimeout(animRef.current);
  }, [displayedContent, isLatest, animationEnabled, message.role]);


  // ----------------------------------------------------------------------
  // 3. UTILITIES (Copy, Code Block)
  // ----------------------------------------------------------------------

  const handleCopy = async () => {
    await navigator.clipboard.writeText(displayedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const CodeBlock = ({ inline, className, children }: any) => {
    const code = String(children).replace(/\n$/, "");
    if (inline) return <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-pink-600 dark:text-pink-400">{code}</code>;
    
    return (
      <div className="relative my-4 overflow-hidden rounded-lg border bg-zinc-950 dark:bg-zinc-900">
        <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800">
          <span className="text-xs text-zinc-400 font-mono">{className?.replace("language-", "") || "Code"}</span>
          <button 
            onClick={() => navigator.clipboard.writeText(code)}
            className="text-xs text-zinc-400 hover:text-white transition-colors"
          >
            Copy
          </button>
        </div>
        <pre className="p-4 overflow-x-auto text-sm text-zinc-100 font-mono">
          <code>{code}</code>
        </pre>
      </div>
    );
  };

  // ----------------------------------------------------------------------
  // 4. RENDER
  // ----------------------------------------------------------------------

  // USER MESSAGE (Pill / Bubble style)
  if (isUser) {
    return (
      <div className="flex w-full flex-row-reverse gap-4 mb-6 animate-in slide-in-from-bottom-2 duration-300 group">
        <Avatar className="h-8 w-8 bg-zinc-200 dark:bg-zinc-800 shrink-0">
          <AvatarFallback><User className="h-4 w-4 text-zinc-600 dark:text-zinc-300" /></AvatarFallback>
        </Avatar>
        <div className="relative max-w-[70%]">
          <div className="bg-zinc-100 dark:bg-zinc-800 text-foreground px-5 py-3 rounded-[20px] rounded-tr-sm">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
          </div>
          {/* Edit Button (appears on hover outside bubble) */}
          <div className="absolute top-0 right-full mr-2 h-full flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
             <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => onEdit?.(message)}>
                <Edit2 className="h-4 w-4 text-muted-foreground" />
             </Button>
          </div>
        </div>
      </div>
    );
  }

  // ASSISTANT MESSAGE (Document / Gemini style)
  return (
    <div className="flex w-full gap-4 mb-8 animate-in slide-in-from-bottom-2 duration-500 group">
      {/* Icon Column */}
      <div className="shrink-0 mt-1">
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-sm animate-pulse-subtle">
           <Sparkles className="h-4 w-4 text-white" />
        </div>
      </div>

      {/* Content Column */}
      <div className="flex-1 min-w-0 overflow-hidden">
        {/* Header Name */}
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-sm">Sancara AI</span>
          <span className="text-xs text-muted-foreground">{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}</span>
        </div>

        {/* Markdown Content - Transparent Background */}
        <div className="prose prose-slate dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:p-0 prose-headings:font-semibold prose-headings:text-foreground">
          <ReactMarkdown 
            remarkPlugins={remarkGfm ? [remarkGfm] : []} 
            components={{ code: CodeBlock }}
          >
            {isAnimating ? typedContent : displayedContent}
          </ReactMarkdown>
        </div>

        {/* Sources / Links (Chips) */}
        {!isAnimating && links.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {links.map((link, i) => (
              <a 
                key={i} 
                href={link.url} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-background hover:bg-accent/50 transition-colors text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                {link.domain}
                <ExternalLink className="h-3 w-3 opacity-50" />
              </a>
            ))}
          </div>
        )}

        {/* Action Bar (Below Content) */}
        {!isAnimating && (
          <div className="mt-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
             <Button 
               variant="ghost" size="icon" 
               className="h-8 w-8 text-muted-foreground hover:text-foreground"
               onClick={handleCopy}
               title="Copy to clipboard"
             >
               {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
             </Button>

             <Button 
               variant="ghost" size="icon" 
               className="h-8 w-8 text-muted-foreground hover:text-foreground"
               onClick={() => onRegenerate?.(message)}
               title="Regenerate response"
             >
               <RotateCcw className="h-4 w-4" />
             </Button>
            
             <div className="h-4 w-px bg-border mx-1" />

             <Button 
               variant="ghost" size="icon" 
               className={cn("h-8 w-8 text-muted-foreground", feedback === "up" && "text-green-600 bg-green-50 dark:bg-green-900/20")}
               onClick={() => setFeedback(feedback === "up" ? null : "up")}
             >
               <ThumbsUp className="h-4 w-4" />
             </Button>

             <Button 
               variant="ghost" size="icon" 
               className={cn("h-8 w-8 text-muted-foreground", feedback === "down" && "text-red-600 bg-red-50 dark:bg-red-900/20")}
               onClick={() => setFeedback(feedback === "down" ? null : "down")}
             >
               <ThumbsDown className="h-4 w-4" />
             </Button>
          </div>
        )}
      </div>
    </div>
  );
};