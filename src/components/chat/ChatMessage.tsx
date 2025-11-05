import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import "./chat.css";
import { useEffect, useState } from "react";
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
}

type LinkItem = { url: string; domain: string; precision?: string };

export const ChatMessage = ({ message, isLatest = false }: ChatMessageProps) => {
  const isUser = message.role === "user";

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Find URLs in text
  const findUrls = (text: string) => {
    if (!text) return [];
    const urlRegex = /(https?:\/\/[^\s)]+)/g;
    const matches = text.match(urlRegex);
    return matches ? Array.from(new Set(matches)) : [];
  };

  // Extract precision near a URL
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

  // Remove URLs & metadata lines from displayed content
  const stripUrlsAndMeta = (text: string) => {
    if (!text) return "";
    const urlRegex = /(https?:\/\/[^\s)]+)/g;
    let cleaned = text.replace(urlRegex, "");
    cleaned = cleaned.replace(/^.*\b(URL|Title)\b:.*$/gim, "");
    cleaned = cleaned.replace(/(?:Relevance|Precision)[:\s]*[0-9]*\.?[0-9]+/gi, "");
    cleaned = cleaned.replace(/\bURL:\b/gi, "");
    cleaned = cleaned.replace(/\bTitle:\b/gi, "");
    cleaned = cleaned.replace(/\*/g, "");
    cleaned = cleaned.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).join("\n");
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

  // ✅ NEW: auto-structure long paragraph content
  const autoStructureText = (text: string): string => {
    if (!text) return "";

    let structured = text.trim();

    // Add line breaks after periods followed by capital letter
    structured = structured.replace(/\. ([A-Z])/g, ".\n\n$1");

    // Bold section headers ending with :
    structured = structured.replace(/([A-Z][A-Za-z\s]{2,40}):/g, "\n\n**$1:**");

    // Add bullet points before numeric enumerations
    structured = structured.replace(/\b\d+\.\s+/g, "\n- ");

    // Add bullets before keywords like Step, Point, Process, etc.
    structured = structured.replace(/\b(Step|Point|Process|Phase)\s*\d*[:\-]?\s*/gi, "\n- **$&** ");

    // Fix extra line breaks
    structured = structured.replace(/\n{3,}/g, "\n\n");

    return structured.trim();
  };

  // Clean + format text
  const displayedContent =
    message.role === "assistant"
      ? autoStructureText(stripUrlsAndMeta(message.content))
      : message.content;

  // For structured rendering (same detection logic as before)
  const shouldConvertToBullets = message.role === "assistant" && message.id !== "1";

  // Parse structured blocks (unchanged logic)
  type StructuredBlock =
    | { type: "list"; items: string[] }
    | { type: "section"; title: string; content: string | string[] }
    | { type: "paragraph"; text: string };

  const parseStructured = (text: string): StructuredBlock[] => {
    if (!text) return [];
    const lines = text.split(/\r?\n/).map((l) => l.trim());
    const blocks: StructuredBlock[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Detect section
      if (/:\s*$/.test(line)) {
        const title = line.replace(/:$/, "").trim();
        i++;
        const contentLines: string[] = [];
        while (i < lines.length && lines[i].trim() !== "" && !/:\s*$/.test(lines[i])) {
          contentLines.push(lines[i]);
          i++;
        }
        const content = contentLines.join(" ").trim();
        if (content.match(/^(\s*[-*•]|\s*\d+\.)\s+/)) {
          const items = content
            .split(/\r?\n/)
            .map((l) => l.replace(/^(\s*[-*•]|\s*\d+\.)\s+/, "").trim())
            .filter(Boolean);
          blocks.push({ type: "section", title, content: items });
        } else {
          blocks.push({ type: "section", title, content });
        }
        continue;
      }

      // Detect list
      if (/^(\s*[-*•]|\s*\d+\.)\s+/.test(line)) {
        const items: string[] = [];
        while (i < lines.length && /^(\s*[-*•]|\s*\d+\.)\s+/.test(lines[i])) {
          items.push(lines[i].replace(/^(\s*[-*•]|\s*\d+\.)\s+/, "").trim());
          i++;
        }
        blocks.push({ type: "list", items });
        continue;
      }

      // Paragraph fallback
      if (line.trim() !== "") {
        const paraLines: string[] = [];
        while (i < lines.length && lines[i].trim() !== "") {
          paraLines.push(lines[i]);
          i++;
        }
        blocks.push({ type: "paragraph", text: paraLines.join(" ") });
      } else {
        i++;
      }
    }

    return blocks;
  };

  const structured = shouldConvertToBullets ? parseStructured(displayedContent) : [];

  return (
    <div
      className={cn(
        "flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
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

      {/* Message Content */}
      <div
        className={cn(
          "flex max-w-[75%] flex-col gap-2",
          isUser ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-5 py-3 shadow-sm transition-all hover:shadow-md",
            isUser
              ? "bg-primary text-primary-foreground rounded-br-sm"
              : "bg-card border rounded-bl-sm"
          )}
        >
          {/* Render assistant structured output */}
          {message.role === "assistant" && shouldConvertToBullets ? (
            structured.map((blk, idx) => {
              if (blk.type === "list") {
                return (
                  <ul key={idx} className="list-disc ml-4 text-sm leading-relaxed">
                    {blk.items.map((it, j) => (
                      <li key={j}>
                        <div className="inline prose-sm max-w-none">
                          <ReactMarkdown>{it}</ReactMarkdown>
                        </div>
                      </li>
                    ))}
                  </ul>
                );
              }
              if (blk.type === "section") {
                return (
                  <div key={idx} className="mt-2">
                    <strong className="text-sm font-semibold">{blk.title}</strong>
                    {Array.isArray(blk.content) ? (
                      <ul className="list-disc ml-6 text-sm leading-relaxed">
                        {blk.content.map((it, j) => (
                          <li key={j}>
                            <div className="inline prose-sm max-w-none">
                              <ReactMarkdown>{it}</ReactMarkdown>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="mt-1 text-sm leading-relaxed prose-sm max-w-none">
                        <ReactMarkdown>{blk.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <div
                  key={idx}
                  className="whitespace-pre-wrap break-words text-sm leading-relaxed prose-sm max-w-none"
                >
                  <ReactMarkdown>{blk.text}</ReactMarkdown>
                </div>
              );
            })
          ) : (
            <div className="whitespace-pre-wrap break-words text-sm leading-relaxed prose-sm max-w-none">
              <ReactMarkdown>{displayedContent}</ReactMarkdown>
            </div>
          )}

          {/* Inline link buttons */}
          {!isUser && links.length > 0 && (
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
                      {it.precision && (
                        <span className="text-xs opacity-90 bg-slate-100 px-2 py-0.5 rounded-md text-slate-800">
                          Precision {it.precision}
                        </span>
                      )}
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
