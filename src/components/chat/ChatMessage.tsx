import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import './chat.css';
import { useEffect, useState } from "react";

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

	// find URLs in text
	const findUrls = (text: string) => {
		if (!text) return [];
		const urlRegex = /(https?:\/\/[^\s)]+)/g;
		const matches = text.match(urlRegex);
		return matches ? Array.from(new Set(matches)) : [];
	};

	// extract precision near a URL (e.g. "Relevance: 0.800" or "Precision: 0.800")
	const extractPrecisionNearUrl = (url: string, text: string): string | undefined => {
		if (!text) return undefined;
		const idx = text.indexOf(url);
		const windowSizeBefore = 80;
		const windowSizeAfter = 120;
		const start = Math.max(0, (idx === -1 ? 0 : idx) - windowSizeBefore);
		const end = Math.min(text.length, (idx === -1 ? text.length : idx) + url.length + windowSizeAfter);
		const snippet = text.slice(start, end);
		// common patterns: "Relevance: 0.800" or "Precision: 0.800"
		const precMatch = snippet.match(/(?:Relevance|Precision)[:\s]*([0-9]*\.?[0-9]+)/i);
		if (precMatch) return precMatch[1];
		// fallback: nearest decimal like 0.800
		const decMatch = snippet.match(/0\.\d{2,}/g);
		if (decMatch && decMatch.length) return decMatch[0];
		return undefined;
	};

	// remove URLs and metadata lines from displayed content
	const stripUrlsAndMeta = (text: string) => {
		if (!text) return "";
		// remove URL occurrences
		const urlRegex = /(https?:\/\/[^\s)]+)/g;
		let cleaned = text.replace(urlRegex, "");
		// remove entire lines that include "URL:" or "Title:" (case-insensitive)
		cleaned = cleaned.replace(/^.*\b(URL|Title)\b:.*$/gim, "");
		// remove common tokens like "Relevance: 0.800" etc.
		cleaned = cleaned.replace(/(?:Relevance|Precision)[:\s]*[0-9]*\.?[0-9]+/gi, "");
		// remove leftover labels like "URL:" or "Title:" if any remain
		cleaned = cleaned.replace(/\bURL:\b/gi, "");
		cleaned = cleaned.replace(/\bTitle:\b/gi, "");
		// remove stray asterisks
		cleaned = cleaned.replace(/\*/g, "");
		// remove common leading bullets / icons (like stars or emoji) that start a line
		cleaned = cleaned.replace(/^[\s\-\*\u2600-\u26FF\u2700-\u27BF\p{So}]+/gmu, "");
		// tidy whitespace and empty lines
		cleaned = cleaned.split(/\r?\n/).map(l => l.trim()).filter(Boolean).join(" ");
		cleaned = cleaned.replace(/\s{2,}/g, " ").trim();
		return cleaned;
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
		// initialise with hostname fallback quickly + attempt to extract precision
		const initial = urls.map((u) => {
			try {
				return { url: u, domain: new URL(u).hostname.replace(/^www\./, ""), precision: extractPrecisionNearUrl(u, message.content) };
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

	// cleaned version of message text shown to the user (no raw URLs / metadata)
	// Apply stripping only for assistant responses; leave user messages unchanged.
	const displayedContent = message.role === "assistant"
		? stripUrlsAndMeta(message.content)
		: message.content;

	// convert cleaned content into short bullet points (boolean-like list)
	// Only for assistant responses that are not the prewritten greeting (id === "1")
	const shouldConvertToBullets = message.role === "assistant" && message.id !== "1";
	const contentToBullets = (text: string) => {
		if (!text) return [];
		const parts = text
			.split(/\r?\n|(?<=[.?!])\s+/)
			.map((s) => s.trim().replace(/^[\-\•\*]+\s*/, ""))
			.filter((s) => s.length > 2);
		return parts;
	};
	// Parse assistant content into structured blocks:
	// - list: recognized when lines start with -, *, • or numbered "1."
	// - section: heading line ending with ":" followed by content lines
	// - paragraph: plain text
	type StructuredBlock = 
		| { type: "list"; items: string[] } 
		| { type: "section"; title: string; content: string | string[] }
		| { type: "paragraph"; text: string };
	
	const parseStructured = (text: string): StructuredBlock[] => {
		if (!text) return [];
		const cleanText = text.trim();
		const lines = cleanText.split(/\r?\n/).map(l => l.replace(/^\s+|\s+$/g, ""));

		// detect explicit list lines
		const listLines = lines.filter(l => /^(\s*[-\*\u2022]|\s*\d+\.)\s+/.test(l));
		if (listLines.length === lines.length && listLines.length > 0) {
			// whole message is a list
			const items = lines.map(l => l.replace(/^(\s*[-\*\u2022]|\s*\d+\.)\s+/, "").trim()).filter(Boolean);
			return [{ type: "list", items }];
		}

		// detect sections like "Steps:" or "Pros:" etc.
		const blocks: StructuredBlock[] = [];
		let i = 0;
		while (i < lines.length) {
			const line = lines[i];
			// heading detection: line that ends with ":" or is uppercase-ish short title
			if (/:\s*$/.test(line) || (/^[A-Z][\w\s]{1,40}$/.test(line) && i+1 < lines.length && lines[i+1].length > 0)) {
				const title = line.replace(/:$/, "").trim();
				i++;
				const sectionLines: string[] = [];
				while (i < lines.length && !(/:\s*$/.test(lines[i]))) {
					// stop if next line is a heading (heuristic)
					if (/^[A-Z][\w\s]{1,40}:?$/.test(lines[i]) && lines[i].endsWith(":")) break;
					sectionLines.push(lines[i]);
					i++;
				}
				const sectionContent = sectionLines.join(" ").trim();
				// if section content contains list markers, split to items
				if (sectionLines.some(l => /^(\s*[-\*\u2022]|\s*\d+\.)\s+/.test(l))) {
					const items = sectionLines.map(l => l.replace(/^(\s*[-\*\u2022]|\s*\d+\.)\s+/, "").trim()).filter(Boolean);
					blocks.push({ type: "section", title, content: items });
				} else {
					blocks.push({ type: "section", title, content: sectionContent });
				}
				continue;
			}

			// If line itself is a list start, gather contiguous list block
			if (/^(\s*[-\*\u2022]|\s*\d+\.)\s+/.test(line)) {
				const items: string[] = [];
				while (i < lines.length && /^(\s*[-\*\u2022]|\s*\d+\.)\s+/.test(lines[i])) {
					items.push(lines[i].replace(/^(\s*[-\*\u2022]|\s*\d+\.)\s+/, "").trim());
					i++;
				}
				blocks.push({ type: "list", items });
				continue;
			}

			// fallback: paragraph (collect contiguous non-empty lines)
			const paraLines: string[] = [];
			while (i < lines.length && lines[i].trim() !== "") {
				paraLines.push(lines[i]);
				i++;
			}
			if (paraLines.length) {
				blocks.push({ type: "paragraph", text: paraLines.join(" ").trim() });
			}
			i++;
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
					{/* Render assistant responses in a structured way; user & prewritten assistant stay unchanged. */}
					{message.role === "assistant" && shouldConvertToBullets ? (
						structured.map((blk, idx) => {
							if (blk.type === "list") {
								return (
									<ul key={idx} className="list-disc ml-4 text-sm leading-relaxed">
										{blk.items.map((it, j) => <li key={j}>{it.replace(/\*+/g, "")}</li>)}
									</ul>
								);
							}
							if (blk.type === "section") {
								return (
									<div key={idx} className="mt-2">
										<strong className="text-sm">{blk.title}</strong>
										{Array.isArray(blk.content) ? (
											<ul className="list-disc ml-6 text-sm leading-relaxed">
												{blk.content.map((it, j) => <li key={j}>{it.replace(/\*+/g, "")}</li>)}
											</ul>
										) : (
											<p className="mt-1 text-sm leading-relaxed">{(blk.content || "").replace(/\*+/g, "")}</p>
										)}
									</div>
								);
							}
							// paragraph
							return <p key={idx} className="whitespace-pre-wrap break-words text-sm leading-relaxed">{blk.text.replace(/\*+/g, "")}</p>;
						})
					) : displayedContent ? (
						<p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
							{displayedContent.replace(/\*+/g, "")}
						</p>
					) : null}

					{/* Inline link buttons (appear under assistant messages only) — simple styling, show Precision badge */}
					{!isUser && links.length > 0 && (
						<div className="mt-3 flex flex-col gap-2">
							{links.map((it) => (
								<button
									key={it.url}
									onClick={() => handleLinkClick(it.url)}
									title={it.domain}
									className="w-full text-left px-3 py-2 rounded-md text-sm"
									style={{
										background: "transparent",
										border: "1px solid rgba(15,23,42,0.06)",
										color: "inherit",
									}}
								>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<span className="truncate font-medium">{it.domain}</span>
											{it.precision ? (
												<span className="text-xs opacity-90 bg-slate-100 px-2 py-0.5 rounded-md" style={{ color: "#0f172a" }}>
													Precision {it.precision}
												</span>
											) : null}
										</div>
										<span className="ml-3 text-xs uppercase bg-transparent px-2 py-1 rounded-md" style={{ color: "#0f172a" }}>
											Visit
										</span>
									</div>
								</button>
							))}
						</div>
					)}
				</div>
				<span className="px-2 text-xs text-muted-foreground">
					{formatTime(message.timestamp)}
				</span>
			</div>
		</div>
	);
};
