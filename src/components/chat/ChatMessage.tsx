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

/**
 * Improved ChatMessage:
 * - sanitizeAssistantContent now canonically extracts and re-orders
 *   Summary, Detailed Explanation/Explanation, Relevant Insights from:
 *     - XML-like tags (<SUMMARY>...</SUMMARY>)
 *     - Markdown headings (## Summary)
 *     - Plain labelled lines ("Summary:", "Detailed Explanation")
 *   and builds a clean markdown output where each section's content appears
 *   directly beneath its heading (Summary → Detailed Explanation → Relevant Insights).
 *
 * This fixes the issue where headings appear but their content is shown later or detached.
 */

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
    cleaned = cleaned.split(/\r?\n/).map((l) => l).join("\n");
    return cleaned.trim();
  };

  // New robust sanitizer that extracts sections wherever they appear
  const sanitizeAssistantContent = (raw: string) => {
    if (!raw) return "";

    let text = raw;

    // Normalize line endings
    text = text.replace(/\r\n/g, "\n");

    // Section keys and canonical order
    const sectionKeys: { key: string; labels: string[] }[] = [
      { key: "summary", labels: ["summary"] },
      { key: "explanation", labels: ["detailed explanation", "explanation", "comprehensive explanation", "answer"] },
      { key: "insights", labels: ["relevant insights", "insights"] },
    ];

    const sections: Record<string, string> = {
      summary: "",
      explanation: "",
      insights: "",
    };

    // 1) XML tags extraction (highest-confidence)
    try {
      const xmlSummary = /<SUMMARY>([\s\S]*?)<\/SUMMARY>/i.exec(text);
      const xmlExplanation = /<COMPREHENSIVE_EXPLANATION>([\s\S]*?)<\/COMPREHENSIVE_EXPLANATION>/i.exec(text);
      const xmlInsights = /<RELEVANT_INSIGHTS>([\s\S]*?)<\/RELEVANT_INSIGHTS>/i.exec(text);

      if (xmlSummary) sections.summary = (xmlSummary[1] || "").trim();
      if (xmlExplanation) sections.explanation = (xmlExplanation[1] || "").trim();
      if (xmlInsights) sections.insights = (xmlInsights[1] || "").trim();

      // If we found any xml sections, assemble and return canonical order
      if (xmlSummary || xmlExplanation || xmlInsights) {
        const parts: string[] = [];
        if (sections.summary) parts.push(`**Summary**\n\n${sections.summary}`);
        if (sections.explanation) parts.push(`**Detailed Explanation**\n\n${sections.explanation}`);
        if (sections.insights) {
          // convert insights block into bullets when appropriate
          const ins = sections.insights.trim();
          const bullets = ins.split(/\n+/).filter(Boolean);
          if (bullets.length > 1) {
            parts.push(`**Relevant Insights**\n\n${bullets.map((b) => `- ${b.trim()}`).join("\n")}`);
          } else if (ins) {
            const sentences = ins.split(/(?<=[.!?])\s+/).filter(Boolean);
            if (sentences.length > 1) {
              parts.push(`**Relevant Insights**\n\n${sentences.map((s) => `- ${s.trim()}`).join("\n")}`);
            } else {
              parts.push(`**Relevant Insights**\n\n- ${ins}`);
            }
          }
        }
        // Append any non-XML remainder (sources/disclaimers) after removing xml blocks
        const remainder = text.replace(/<SUMMARY>[\s\S]*?<\/SUMMARY>/gi, "")
                              .replace(/<COMPREHENSIVE_EXPLANATION>[\s\S]*?<\/COMPREHENSIVE_EXPLANATION>/gi, "")
                              .replace(/<RELEVANT_INSIGHTS>[\s\S]*?<\/RELEVANT_INSIGHTS>/gi, "")
                              .trim();
        if (remainder) {
          const cleanedRem = remainder.replace(/\*?This answer is based on the model's knowledge[\s\S]*$/i, "").trim();
          if (cleanedRem) parts.push(cleanedRem);
        }
        return parts.join("\n\n").trim();
      }
    } catch (e) {
      // fallthrough to heading-based parsing
    }

    // 2) Heading/label-based extraction:
    // We'll scan the text line-by-line, detect lines that are "labels" (markdown headings or plain labels),
    // record their positions, then assign content between labels as that section's content.
    const lines = text.split("\n");
    type LabelPos = { idx: number; labelKey: string; line: string };
    const foundLabels: LabelPos[] = [];

    // Helper: match a line to one of our labels
    const findLabelKey = (line: string): string | null => {
      if (!line) return null;
      const trimmed = line.trim();
      // markdown headings like "## Summary" or "# Summary"
      const mdHeadingMatch = trimmed.match(/^#{1,6}\s*(.+)$/);
      const maybeLabel = mdHeadingMatch ? mdHeadingMatch[1].trim().toLowerCase() : trimmed.toLowerCase();
      // also accept "Summary:" or "Summary -"
      const cleanLabel = maybeLabel.replace(/[:\-–—]+$/, "").trim();

      for (const sk of sectionKeys) {
        for (const lbl of sk.labels) {
          if (cleanLabel === lbl) return sk.key;
        }
      }
      // also accept if the line equals the label (case-insensitive) even if not markdown
      for (const sk of sectionKeys) {
        for (const lbl of sk.labels) {
          if (trimmed.toLowerCase().replace(/[:\-]+$/, "").trim() === lbl) return sk.key;
        }
      }
      // accept "Summary:" inline as well (single-line label)
      const inlineLabelMatch = trimmed.match(/^(.{3,80}?)\s*[:\-]\s*$/);
      if (inlineLabelMatch) {
        const candidate = inlineLabelMatch[1].toLowerCase().trim();
        for (const sk of sectionKeys) {
          for (const lbl of sk.labels) {
            if (candidate === lbl) return sk.key;
          }
        }
      }
      return null;
    };

    for (let i = 0, pos = 0; i < lines.length; i++) {
      const line = lines[i];
      const key = findLabelKey(line);
      if (key) {
        // record label position with index of the character
        const lineStartIndex = pos;
        foundLabels.push({ idx: lineStartIndex, labelKey: key, line });
      }
      pos += line.length + 1; // +1 for newline
    }

    if (foundLabels.length > 0) {
      // Compute content ranges
      // Map label occurrences to content: from after the label line to before next label line
      const labelRanges: { key: string; start: number; end: number }[] = [];
      for (let i = 0; i < foundLabels.length; i++) {
        const startPos = foundLabels[i].idx;
        // find index of end of that label line
        // we need the character index of the end of the line
        // recompute by scanning chars to the end of that line
        const labelLine = foundLabels[i].line;
        // compute start char index for content after line:
        // find nth line start char index: sum lengths before (we already have idx); the content starts after that line plus newline
        let startContent = startPos + labelLine.length;
        // skip following newline if present
        if (text[startContent] === "\n") startContent += 1;
        const endContent = (i + 1 < foundLabels.length) ? foundLabels[i + 1].idx : text.length;
        labelRanges.push({ key: foundLabels[i].labelKey, start: startContent, end: endContent });
      }

      // Extract and dedupe: concatenate content pieces if label occurs multiple times
      for (const lr of labelRanges) {
        const rawContent = text.slice(lr.start, lr.end).trim();
        if (rawContent) {
          // If explanation contains extra heading names, remove them (defensive)
          const cleaned = rawContent.replace(/\n{2,}/g, "\n\n").trim();
          if (!sections[lr.key]) sections[lr.key] = cleaned;
          else sections[lr.key] += "\n\n" + cleaned;
        }
      }

      // Additionally, if content exists before the first detected label, it likely belongs to 'explanation'
      // if explanation is still empty, assign the leading content.
      const firstLabelStart = foundLabels[0].idx;
      if (firstLabelStart > 0) {
        const leading = text.slice(0, firstLabelStart).trim();
        if (leading && !sections.explanation) {
          sections.explanation = leading;
        } else if (leading && !sections.summary && leading.split(/\s+/).length < 40) {
          // if it's short, treat leading as a summary when summary empty
          sections.summary = leading;
        }
      }

      // Build canonical output in order: Summary, Detailed Explanation, Relevant Insights
      const parts: string[] = [];
      if (sections.summary) parts.push(`**Summary**\n\n${sections.summary}`);
      if (sections.explanation) parts.push(`**Detailed Explanation**\n\n${sections.explanation}`);
      if (sections.insights) {
        const ins = sections.insights.trim();
        const bullets = ins.split(/\n+/).filter(Boolean);
        if (bullets.length > 1) {
          parts.push(`**Relevant Insights**\n\n${bullets.map((b) => `- ${b.trim()}`).join("\n")}`);
        } else {
          const sentences = ins.split(/(?<=[.!?])\s+/).filter(Boolean);
          if (sentences.length > 1) {
            parts.push(`**Relevant Insights**\n\n${sentences.map((s) => `- ${s.trim()}`).join("\n")}`);
          } else {
            parts.push(`**Relevant Insights**\n\n- ${ins}`);
          }
        }
      }

      // Append any trailing remainder after last label that isn't the same text (e.g., sources/disclaimers)
      const lastLabelEnd = labelRanges[labelRanges.length - 1].end;
      const trailing = text.slice(lastLabelEnd).trim();
      if (trailing) {
        const cleanedRem = trailing.replace(/\*?This answer is based on the model's knowledge[\s\S]*$/i, "").trim();
        if (cleanedRem) parts.push(cleanedRem);
      }

      const assembled = parts.join("\n\n").trim();
      // If result is empty, fallback to original text trimmed
      return assembled || text.trim();
    }

    // 3) No labels detected: return the cleaned original (remove trailing disclaimers)
    const fallback = text.replace(/\*?This answer is based on the model's knowledge[\s\S]*$/i, "").trim();
    return fallback;
  };

  // Auto-structure but be conservative about what we treat as headers or list-keywords
  const autoStructureText = (text: string): string => {
    if (!text) return "";

    let structured = text.trim();

    // Only treat lines that start with a capitalized phrase followed by ":" as section headers
    // (Require at least 2 words and a colon to reduce false positives)
    structured = structured.replace(/^([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+){1,4}):/gm, "\n\n**$1:**");

    // Add line breaks after periods followed by capital letter (keeps paragraphs readable)
    structured = structured.replace(/\. ([A-Z])/g, ".\n\n$1");

    // Add bullet points before numeric enumerations (add newline before enumerations)
    structured = structured.replace(/(^|\n)\s*(\d+)\.\s+/g, "\n- ");

    // Only match Step/Point/Process/Phase as whole words (avoid matching within words like 'processes')
    // Capture optional number after the keyword and keep it in the bolded label.
    structured = structured.replace(/\b(Step|Point|Process|Phase)\b\s*(\d*)[:\-]?\s*/gi, (_, p1, p2) =>
      `\n- **${p1}${p2 ? " " + p2 : ""}** `
    );

    // Minimize excessive empty lines
    structured = structured.replace(/\n{3,}/g, "\n\n");

    return structured.trim();
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

  // Compose displayedContent:
  // - For assistant messages: sanitize legacy tags/headings first, strip metadata/URLs, then auto-structure.
  // - For user messages: show raw content.
  const assistantPreSanitized = message.role === "assistant" ? sanitizeAssistantContent(message.content) : message.content;
  const displayedContent =
    message.role === "assistant"
      ? autoStructureText(stripUrlsAndMeta(assistantPreSanitized))
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