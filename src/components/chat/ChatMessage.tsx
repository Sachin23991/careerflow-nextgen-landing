import { cn } from "@/lib/utils";
import { Bot, User, Clipboard } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import "./chat.css";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

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
}

type LinkItem = { url: string; domain: string; precision?: string };

export const ChatMessage = ({
  message,
  isLatest = false,
  animationEnabled = true,
  wordDelayMs = 30,
}: ChatMessageProps) => {
  const isUser = message.role === "user";

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const findUrls = (text: string) => {
    if (!text) return [];
    const urlRegex = /(https?:\/\/[^\s)]+)/g;
    const matches = text.match(urlRegex);
    return matches ? Array.from(new Set(matches)) : [];
  };

  const extractPrecisionNearUrl = (url: string, text: string): string | undefined => {
    if (!text) return undefined;
    const idx = text.indexOf(url);
    const windowSizeBefore = 80;
    const windowSizeAfter = 120;
    const start = Math.max(0, (idx === -1 ? 0 : idx) - windowSizeBefore);
    const end = Math.min(text.length, (idx === -1 ? text.length : idx) + url.length + windowSizeAfter);
    const snippet = text.slice(start, end);
    const precMatch = snippet.match(/(?:Relevance|Precision)[:\s]*([0-9]*\.?[0-9]+)/i);
    if (precMatch) return precMatch[1];
    const decMatch = snippet.match(/0\.\d{2,}/g);
    if (decMatch && decMatch.length) return decMatch[0];
    return undefined;
  };

  // Strip URLs & metadata but keep markdown asterisks so intentional bold/italic remain
  const stripUrlsAndMeta = (text: string) => {
    if (!text) return "";
    const urlRegex = /(https?:\/\/[^\s)]+)/g;
    let cleaned = text.replace(urlRegex, "");
    cleaned = cleaned.replace(/^.*\b(URL|Title)\b:.*$/gim, "");
    // Remove any lines that mention Relevance or Precision (handles stars or non-numeric text)
    cleaned = cleaned.replace(/^.*\b(Relevance|Precision)\b.*$/gim, "");
    // Remove any star emoji remnants like "⭐" that may be left over
    cleaned = cleaned.replace(/⭐+/g, "");
    cleaned = cleaned.replace(/\bURL:\b/gi, "");
    cleaned = cleaned.replace(/\bTitle:\b/gi, "");
    // Preserve user-visible blank lines and asterisks for markdown. Trim overall edges.
    cleaned = cleaned.split(/\r?\n/).map((l) => l).join("\n");
    return cleaned.trim();
  };

  const [links, setLinks] = useState<LinkItem[]>([]);

  useEffect(() => {
    if (message.role !== "assistant") {
      setLinks([]);
      return;
    }
    const urls = findUrls(message.content);
    if (!urls.length) {
      setLinks([]);
      return;
    }
    const initial = urls.map((u) => {
      try {
        return {
          url: u,
          domain: new URL(u).hostname.replace(/^www\./, ""),
          precision: extractPrecisionNearUrl(u, message.content),
        };
      } catch {
        return { url: u, domain: u, precision: extractPrecisionNearUrl(u, message.content) };
      }
    });
    setLinks(initial);
  }, [message]);

  const handleLinkClick = async (url: string) => {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(url);
    } catch {}
    if (typeof window !== "undefined") {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  // Auto-structure but be conservative about what we treat as headers or list-keywords
  const autoStructureText = (text: string): string => {
    if (!text) return "";

    let structured = text.trim();

    // Only treat lines that start with a capitalized phrase followed by ":" as section headers
    structured = structured.replace(/^([A-Z][A-Za-z\s]{2,40}):/gm, "\n\n**$1:**");

    // Add line breaks after periods followed by capital letter (keeps paragraphs readable)
    structured = structured.replace(/\. ([A-Z])/g, ".\n\n$1");

    // Add bullet points before numeric enumerations
    structured = structured.replace(/\b(\d+)\.\s+/g, "\n- ");

    // Only match Step/Point/Process/Phase as whole words (avoid matching within words like 'processes')
    // Capture optional number after the keyword and keep it in the bolded label.
    structured = structured.replace(/\b(Step|Point|Process|Phase)\b\s*(\d*)[:\-]?\s*/gi, (_, p1, p2) =>
      `\n- **${p1}${p2 ? " " + p2 : ""}** `
    );

    // Minimize excessive empty lines
    structured = structured.replace(/\n{3,}/g, "\n\n");

    return structured.trim();
  };

  const displayedContent =
    message.role === "assistant"
      ? autoStructureText(stripUrlsAndMeta(message.content))
      : message.content;

  // Animated reveal: token by token (preserve spacing)
  const [typedContent, setTypedContent] = useState<string>(displayedContent);
  const timersRef = useRef<number[]>([]);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const animKeyRef = useRef<number>(0);

  useEffect(() => {
    animKeyRef.current += 1;
    const myKey = animKeyRef.current;

    const shouldAnimate = message.role === "assistant" && isLatest && animationEnabled;

    if (!shouldAnimate) {
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current = [];
      setTypedContent(displayedContent);
      setIsAnimating(false);
      return;
    }

    if (!displayedContent) {
      setTypedContent("");
      setIsAnimating(false);
      return;
    }

    setTypedContent("");
    setIsAnimating(true);
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];

    const tokens = displayedContent.match(/(\S+|\s+)/g) || [];

    let accumulatedDelay = 0;
    tokens.forEach((token, idx) => {
      const isWhitespace = /^\s+$/.test(token);
      const delayForThis = isWhitespace ? 0 : wordDelayMs;
      accumulatedDelay += delayForThis;

      const t = window.setTimeout(() => {
        if (animKeyRef.current !== myKey) return;
        setTypedContent((prev) => prev + token);
        if (idx === tokens.length - 1) {
          setIsAnimating(false);
        }
      }, accumulatedDelay);

      timersRef.current.push(t);
    });

    return () => {
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current = [];
      setIsAnimating(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message, displayedContent, isLatest, animationEnabled, wordDelayMs]);

  const handleSkipAnimation = () => {
    if (!isAnimating) return;
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
    setTypedContent(displayedContent);
    setIsAnimating(false);
  };

  // Code block renderer with one-click copy
  const CodeBlockRenderer = ({ inline, className, children }: any) => {
    const codeString = String(children).replace(/\n$/, "");
    const isBlock = !inline;
    const language = className ? className.replace("language-", "") : "";

    const [copied, setCopied] = useState(false);
    const copy = async () => {
      try {
        await navigator.clipboard.writeText(codeString);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      } catch {}
    };

    if (!isBlock) {
      return <code className={cn("inline-code")}>{codeString}</code>;
    }

    return (
      <div className="code-block">
        <div className="code-block-header">
          <span className="code-lang">{language || "code"}</span>
          <button className="code-copy-btn" onClick={copy} aria-label="Copy code">
            <Clipboard className="h-4 w-4" />
            <span className="code-copy-text">{copied ? "Copied!" : "Copy"}</span>
          </button>
        </div>
        <pre className="code-pre">
          <code className={className}>{codeString}</code>
        </pre>
      </div>
    );
  };

  const contentToRender = isAnimating ? typedContent : displayedContent;

  return (
    <div
      className={cn(
        "flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <Avatar
        className={cn(
          "h-10 w-10 shadow-sm transition-all chat-avatar-border",
          isUser ? "border-primary/20 bg-primary" : "border-accent bg-accent"
        )}
      >
        <AvatarFallback className={isUser ? "bg-primary" : "bg-accent"}>
          {isUser ? (
            <User className="h-5 w-5 text-primary-foreground" />
          ) : (
            <Bot className="h-5 w-5 text-accent-foreground" />
          )}
        </AvatarFallback>
      </Avatar>

      <div
        className={cn(
          "flex max-w-[75%] flex-col gap-2",
          isUser ? "items-end" : "items-start"
        )}
      >
        <div
          onClick={handleSkipAnimation}
          className={cn(
            "rounded-2xl px-5 py-3 shadow-sm transition-all hover:shadow-md",
            isUser
              ? "bg-primary text-primary-foreground rounded-br-sm"
              : "bg-card border rounded-bl-sm",
            isAnimating ? "cursor-pointer" : ""
          )}
        >
          <div className="whitespace-pre-wrap break-words text-sm leading-relaxed prose-sm max-w-none">
            <ReactMarkdown components={{ code: CodeBlockRenderer }}>
              {contentToRender}
            </ReactMarkdown>
          </div>

          {!isUser && links.length > 0 && !isAnimating && (
            <div className="mt-3 flex flex-col gap-2">
              {links.map((it) => (
                <button
                  key={it.url}
                  onClick={() => handleLinkClick(it.url)}
                  title={it.domain}
                  className="w-full text-left px-3 py-2 rounded-md text-sm border border-slate-200 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="truncate font-medium">{it.domain}</span>
                    </div>
                    <span className="ml-3 text-xs uppercase text-slate-700">Visit</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <span className="px-2 text-xs text-muted-foreground">{formatTime(message.timestamp)}</span>
      </div>
    </div>
  );
};