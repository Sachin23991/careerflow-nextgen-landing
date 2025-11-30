// src/components/chat/ChatMessage.tsx
import { cn } from "@/lib/utils";
import {
  User,
  Copy,
  Check,
  Sparkles,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  Lightbulb,
  BookOpen,
  Code2,
  ListChecks,
  MessageCircle,
  Zap,
  Brain,
  Target,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import "./chat.css";
import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import ReactMarkdown from "react-markdown";

// ============================================
// INTERFACES
// ============================================
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
  onRegenerate?: (message: Message) => void;
}

type ResponseType =
  | "quick"
  | "definition"
  | "howto"
  | "list"
  | "comparison"
  | "roadmap"
  | "code"
  | "conversational"
  | "detailed";

// ============================================
// INTELLIGENT RESPONSE TYPE DETECTOR
// ============================================
const detectResponseType = (content: string): ResponseType => {
  const lowerContent = content.toLowerCase();
  const contentLength = content.length;

  // Quick answers (under 200 chars, no markdown headers or code fences)
  if (contentLength < 200 && !content.includes("#") && !content.includes("```")) {
    return "quick";
  }

  // Code response: contains any code fence
  if (content.includes("```")) {
    return "code";
  }

  // Roadmap detection
  if (
    lowerContent.includes("roadmap") ||
    lowerContent.includes("step 1") ||
    lowerContent.includes("phase 1") ||
    (lowerContent.includes("week") && lowerContent.includes("month"))
  ) {
    return "roadmap";
  }

  // Comparison detection (tables usually appear here)
  if (
    lowerContent.includes(" vs ") ||
    lowerContent.includes("versus") ||
    lowerContent.includes("comparison") ||
    lowerContent.includes("difference between") ||
    content.includes("|") // Markdown table indicator
  ) {
    return "comparison";
  }

  // List detection (multiple bullet points or numbered items)
  const bulletCount = (content.match(/^[\-\*]\s/gm) || []).length;
  const numberCount = (content.match(/^\d+\.\s/gm) || []).length;
  if (bulletCount >= 4 || numberCount >= 4) {
    return "list";
  }

  // Definition (What is X?)
  if (
    lowerContent.includes("is defined as") ||
    lowerContent.includes("refers to") ||
    lowerContent.includes("is a field") ||
    lowerContent.includes("is the process")
  ) {
    return "definition";
  }

  // How-to guide
  if (
    lowerContent.includes("here's how") ||
    lowerContent.includes("steps to") ||
    lowerContent.includes("to do this") ||
    lowerContent.includes("follow these")
  ) {
    return "howto";
  }

  // Conversational (short, casual)
  if (contentLength < 500 && !content.includes("##")) {
    return "conversational";
  }

  return "detailed";
};

// ============================================
// RESPONSE TYPE INDICATOR COMPONENT
// ============================================
const ResponseTypeIndicator = ({ type }: { type: ResponseType }) => {
  const config = {
    quick: { icon: Zap, label: "Quick Answer", color: "text-emerald-500", bg: "bg-emerald-500/10" },
    definition: { icon: BookOpen, label: "Definition", color: "text-blue-500", bg: "bg-blue-500/10" },
    howto: { icon: ListChecks, label: "How-To Guide", color: "text-purple-500", bg: "bg-purple-500/10" },
    list: { icon: ListChecks, label: "List", color: "text-orange-500", bg: "bg-orange-500/10" },
    comparison: { icon: Target, label: "Comparison", color: "text-pink-500", bg: "bg-pink-500/10" },
    roadmap: { icon: Target, label: "Roadmap", color: "text-indigo-500", bg: "bg-indigo-500/10" },
    code: { icon: Code2, label: "Code", color: "text-cyan-500", bg: "bg-cyan-500/10" },
    conversational: { icon: MessageCircle, label: "Chat", color: "text-gray-500", bg: "bg-gray-500/10" },
    detailed: { icon: Brain, label: "Detailed", color: "text-violet-500", bg: "bg-violet-500/10" },
  };

  const { icon: Icon, label, color, bg } = config[type];

  return (
    <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", bg, color)}>
      <Icon className="w-3.5 h-3.5" />
      <span>{label}</span>
    </div>
  );
};

// ============================================
// CODE BLOCK COMPONENT WITH SYNTAX HIGHLIGHTING
// ============================================
const CodeBlock = ({ language, children }: { language: string; children: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(String(children).replace(/\n$/, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-block my-4 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
      {/* Header */}
      <div className="code-block-header flex items-center justify-between px-4 py-2.5 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
        <span className="code-lang text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {language || "code"}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-7 px-2.5 text-xs gap-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied!" : "Copy"}
        </Button>
      </div>
      {/* Code Content */}
      <pre className="code-pre p-4 overflow-x-auto bg-slate-950 dark:bg-slate-900">
        <code className="text-sm font-mono text-slate-100 leading-relaxed whitespace-pre">
          {String(children).replace(/\n$/, "")}
        </code>
      </pre>
    </div>
  );
};

// ============================================
// MARKDOWN COMPONENTS - FIXED TABLE RENDERING
// ============================================
const createMarkdownComponents = () => ({
  // Headers
  h1: ({ children }: any) => (
    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-6 mb-4 flex items-center gap-2">
      <Sparkles className="w-5 h-5 text-violet-500 flex-shrink-0" />
      <span>{children}</span>
    </h1>
  ),
  h2: ({ children }: any) => (
    <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mt-5 mb-3 pb-2 border-b border-slate-200 dark:border-slate-700">
      {children}
    </h2>
  ),
  h3: ({ children }: any) => (
    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mt-4 mb-2">
      {children}
    </h3>
  ),
  h4: ({ children }: any) => (
    <h4 className="text-base font-semibold text-slate-700 dark:text-slate-300 mt-3 mb-2">
      {children}
    </h4>
  ),

  // Paragraphs
  p: ({ children }: any) => (
    <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4 last:mb-0">
      {children}
    </p>
  ),

  // Lists
  ul: ({ children }: any) => (
    <ul className="space-y-2 mb-4 ml-1">{children}</ul>
  ),
  ol: ({ children }: any) => (
    <ol className="space-y-2 mb-4 ml-1 counter-reset-item">{children}</ol>
  ),
  li: ({ children }: any) => (
    <li className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-gradient-to-r from-violet-500 to-blue-500 flex-shrink-0" />
      <span className="flex-1 leading-relaxed">{children}</span>
    </li>
  ),

  // Blockquotes - Insight Cards
  blockquote: ({ children }: any) => (
    <blockquote className="my-4 p-4 rounded-xl bg-gradient-to-r from-violet-50 to-blue-50 dark:from-violet-900/20 dark:to-blue-900/20 border-l-4 border-violet-500">
      <div className="flex items-start gap-3">
        <Lightbulb className="w-5 h-5 text-violet-500 mt-0.5 flex-shrink-0" />
        <div className="text-slate-700 dark:text-slate-300 italic leading-relaxed">{children}</div>
      </div>
    </blockquote>
  ),

  // Strong & Emphasis
  strong: ({ children }: any) => (
    <strong className="font-semibold text-slate-800 dark:text-slate-100">{children}</strong>
  ),
  em: ({ children }: any) => (
    <em className="italic text-slate-600 dark:text-slate-400">{children}</em>
  ),

  // Links
  a: ({ href, children }: any) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 underline underline-offset-2 decoration-violet-300 dark:decoration-violet-600 hover:decoration-violet-500 transition-colors inline-flex items-center gap-1"
    >
      {children}
      <ExternalLink className="w-3 h-3" />
    </a>
  ),

  // Horizontal Rule
  hr: () => (
    <hr className="my-6 border-0 h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent" />
  ),

  // ========== TABLE COMPONENTS (FIXED) ==========
  table: ({ children }: any) => (
    <div className="my-6 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <table className="w-full min-w-[600px] border-collapse text-sm">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }: any) => (
    <thead className="bg-gradient-to-r from-violet-50 to-blue-50 dark:from-violet-900/30 dark:to-blue-900/30">
      {children}
    </thead>
  ),
  tbody: ({ children }: any) => (
    <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-900/50">
      {children}
    </tbody>
  ),
  tr: ({ children }: any) => (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      {children}
    </tr>
  ),
  th: ({ children }: any) => (
    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b-2 border-violet-200 dark:border-violet-800 whitespace-nowrap">
      {children}
    </th>
  ),
  td: ({ children }: any) => (
    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 align-top leading-relaxed">
      {children}
    </td>
  ),

  // Code - Inline & Block
  code: ({ inline, className, children }: any) => {
    const match = /language-(\w+)/.exec(className || "");
    const language = match ? match[1] : "";

    if (inline) {
      return (
        <code className="px-1.5 py-0.5 rounded-md bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 font-mono text-sm">
          {children}
        </code>
      );
    }

    return <CodeBlock language={language}>{String(children)}</CodeBlock>;
  },

  // Pre - wrapper for code blocks
  pre: ({ children }: any) => <>{children}</>,
});

// ============================================
// WORD-BY-WORD (now CHARACTER) ANIMATION HOOK
// ============================================
const useAnimatedText = (
  text: string,
  enabled: boolean,
  wordDelayMs: number = 30
): { displayedText: string; isAnimating: boolean } => {
  const [displayedText, setDisplayedText] = useState(enabled ? "" : text);
  const [isAnimating, setIsAnimating] = useState(enabled);
  const animationRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) {
      setDisplayedText(text);
      setIsAnimating(false);
      return;
    }

    if (!text || typeof text !== "string") {
      setDisplayedText("");
      setIsAnimating(false);
      return;
    }

    // Character-by-character animation to avoid dropping words/whitespace.
    const total = text.length;
    if (total === 0) {
      setDisplayedText("");
      setIsAnimating(false);
      return;
    }

    // Show first character immediately to avoid initial empty render,
    // then append remaining characters on the configured interval.
    setDisplayedText(text.charAt(0));
    setIsAnimating(total > 1);

    let index = 1;

    const animate = () => {
      if (index < total) {
        setDisplayedText((prev) => prev + text.charAt(index));
        index++;
        animationRef.current = setTimeout(animate, wordDelayMs);
      } else {
        setIsAnimating(false);
        animationRef.current = null;
      }
    };

    if (index < total) {
      animationRef.current = setTimeout(animate, wordDelayMs);
    } else {
      // single-character message; finish immediately
      setIsAnimating(false);
    }

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [text, enabled, wordDelayMs]);

  return { displayedText, isAnimating };
};

// ============================================
// NORMALIZE / UNESCAPE MARKDOWN (fix double-escaping & outer code-wrapping)
// ============================================
const normalizeMarkdown = (input: string) => {
	// quick guard
	if (!input || typeof input !== "string") return input;

	let out = input;

	// Unescape common escaped newline sequences
	out = out.replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n");

	// Unescape escaped pipe and common HTML entity encodings for pipe
	out = out.replace(/\\\|/g, "|").replace(/&#124;|&#x7C;/g, "|");

	// Basic HTML entity decoding for <, >, &
	out = out.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

	// If the entire message is wrapped in triple backticks and the inner text contains a table-like pipe pattern,
	// remove the outer code fence so ReactMarkdown (with remark-gfm) can render the table instead of showing it as code.
	if (/^```/.test(out) && /```$/.test(out)) {
		const inner = out.replace(/^```[\w-]*\n?/, "").replace(/\n?```$/, "");
		if (inner.includes("|") && inner.includes("\n")) {
			out = inner;
		}
	}

	return out;
};

// ============================================
// MAIN CHAT MESSAGE COMPONENT
// ============================================
export const ChatMessage = ({
  message,
  isLatest = false,
  animationEnabled = false,
  wordDelayMs = 30,
  onRegenerate,
}: ChatMessageProps) => {
  // Dynamically load remark-gfm at runtime to avoid Vite import resolution errors
  const [remarkPlugins, setRemarkPlugins] = useState<any[]>([]);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const mod = await import("remark-gfm");
        if (mounted) setRemarkPlugins([mod.default || mod]);
      } catch (err) {
        // If remark-gfm isn't installed, we fallback to no plugin and log a hint.
        if (mounted) setRemarkPlugins([]);
        // eslint-disable-next-line no-console
        console.warn("remark-gfm not found. Install it to enable GFM tables: npm install remark-gfm");
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const [showActions, setShowActions] = useState(false);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const [copied, setCopied] = useState(false);

  const isUser = message.role === "user";

  // Preserve the original content but run a minimal normalization step so Markdown tables
  // and escaped pipes are rendered correctly (unescape sequences, unwrap fenced code
  // that contains tables). Do NOT animate or alter the text.
  const rawContent = message.content;
  const mdContent = useMemo(() => normalizeMarkdown(rawContent), [rawContent]);

  // Use normalized content for response type detection.
  const responseType = useMemo(() => detectResponseType(mdContent), [mdContent]);

  // Disable animation so nothing is altered during render.
  const shouldAnimate = false;
  const { displayedText, isAnimating } = useAnimatedText(mdContent, shouldAnimate, wordDelayMs);
  const content = mdContent;

  // Memoize markdown components
  const markdownComponents = useMemo(() => createMarkdownComponents(), []);

  // Copy message content
  const handleCopyMessage = useCallback(async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [message.content]);

  // Format timestamp
  const formattedTime = useMemo(() => {
    return new Date(message.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [message.timestamp]);

  // ========== USER MESSAGE ==========
  if (isUser) {
    return (
      <div className="flex justify-end mb-6 animate-fade-in-up">
        <div className="flex items-end gap-3 max-w-[80%]">
          <div className="group relative">
            <div className="px-5 py-3 rounded-2xl rounded-br-md bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-500/20">
              <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
            </div>
            <span className="absolute -bottom-5 right-2 text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
              {formattedTime}
            </span>
          </div>
          <Avatar className="w-8 h-8 border-2 border-violet-200 dark:border-violet-800 flex-shrink-0">
            <AvatarFallback className="bg-gradient-to-br from-violet-100 to-blue-100 dark:from-violet-900 dark:to-blue-900 text-violet-700 dark:text-violet-300 text-sm font-medium">
              <User className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    );
  }

  // ========== ASSISTANT MESSAGE ==========
  return (
    <div
      className="flex mb-6 animate-fade-in-up"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex gap-4 max-w-[90%] w-full">
        {/* AI Avatar */}
        <div className="flex-shrink-0">
          <Avatar className="w-9 h-9 ai-avatar border-2 border-violet-300 dark:border-violet-700 shadow-lg shadow-violet-500/20">
            <AvatarFallback className="bg-gradient-to-br from-violet-600 to-blue-600 text-white">
              <Sparkles className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Message Content */}
        <div className="flex-1 min-w-0">
          {/* Response Type Badge */}
          <div className="mb-3">
            <ResponseTypeIndicator type={responseType} />
          </div>

          {/* Message Body */}
          <div
            className={cn(
              "rich-text prose prose-slate dark:prose-invert max-w-none",
              "bg-white dark:bg-slate-800/50 rounded-2xl rounded-tl-md p-5",
              "border border-slate-200 dark:border-slate-700",
              "shadow-sm hover:shadow-md transition-shadow duration-200"
            )}
          >
            {/* Render normalized Markdown so tables and GFM features render correctly. */}
            <ReactMarkdown remarkPlugins={remarkPlugins} components={markdownComponents}>
              {content}
            </ReactMarkdown>

             {/* Typing Indicator */}
             {isAnimating && (
               <span className="inline-flex items-center gap-1 ml-1">
                 <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                 <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                 <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: "300ms" }} />
               </span>
             )}
           </div>

          {/* Action Buttons */}
          <div
            className={cn(
              "flex items-center gap-1 mt-3 transition-all duration-200",
              showActions || isAnimating ? "opacity-100" : "opacity-0"
            )}
          >
            {/* Copy */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyMessage}
              className="h-8 px-2.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </Button>

            {/* Regenerate */}
            {onRegenerate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRegenerate(message)}
                className="h-8 px-2.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            )}

            {/* Divider */}
            <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1" />

            {/* Thumbs Up */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFeedback(feedback === "up" ? null : "up")}
              className={cn(
                "h-8 px-2.5",
                feedback === "up"
                  ? "text-green-500 bg-green-500/10"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
              )}
            >
              <ThumbsUp className="w-4 h-4" />
            </Button>

            {/* Thumbs Down */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFeedback(feedback === "down" ? null : "down")}
              className={cn(
                "h-8 px-2.5",
                feedback === "down"
                  ? "text-red-500 bg-red-500/10"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
              )}
            >
              <ThumbsDown className="w-4 h-4" />
            </Button>

            {/* Timestamp */}
            <span className="text-xs text-slate-400 ml-2">{formattedTime}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
