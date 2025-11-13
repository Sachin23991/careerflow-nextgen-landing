// src/lib/pdfGenerator.ts (NEW FILE)

import { jsPDF } from "jspdf";

// Define the Message type here so we can use it
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// TODO: This is a stub function.
// You need to implement this to call your AI backend.
async function getConversationSummary(messages: Message[]): Promise<string> {
  console.log("Generating summary for", messages.length, "messages...");
  
  // 1. Combine the conversation into a single string
  const transcript = messages
    .map((msg) => `${msg.role === 'user' ? 'User' : 'Sancara AI'}: ${msg.content}`)
    .join("\n\n");

  /*
  // 2. TODO: Send this 'transcript' to a new endpoint on your backend
  // (e.g., in 'counselorService.ts') that is designed for summarization.
  //
  // Example (you would need to create this service):
  // const summary = await summarizeConversation(transcript);
  // return summary;
  */

  // 3. For now, return a placeholder
  return "This is a placeholder summary. TODO: Implement AI summarization by sending the conversation transcript to your backend API.";
}


// --- Main PDF Generation Function ---

export async function generateConversationPdf(
  sessionTitle: string,
  messages: Message[]
) {
  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  const margin = 15;
  const maxLineWidth = pageWidth - margin * 2;
  let cursorY = margin; // Top-down cursor

  // --- 1. Add Title ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(sessionTitle, pageWidth / 2, cursorY, { align: "center" });
  cursorY += 10;
  
  const chatDate = messages.length > 0 ? messages[0].timestamp.toLocaleDateString() : new Date().toLocaleDateString();
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Conversation from: ${chatDate}`, pageWidth / 2, cursorY, { align: "center" });
  cursorY += 10;
  
  doc.setLineWidth(0.5);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 10;

  // --- 2. Add Messages ---
  for (const msg of messages) {
    // Check if we need a new page
    if (cursorY > pageHeight - margin * 2) { // 2 margins for footer space
      doc.addPage();
      cursorY = margin;
    }

    const prefix = msg.role === "user" ? "You:" : "Sancara AI:";
    const text = msg.content;
    const timestamp = msg.timestamp.toLocaleTimeString();

    // Set font for prefix
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(prefix, margin, cursorY);
    
    // Set font for timestamp
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(timestamp, pageWidth - margin, cursorY, { align: "right" });
    cursorY += 5;

    // Set font for content
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    // Use splitTextToSize to handle line wrapping
    const lines = doc.splitTextToSize(text, maxLineWidth - 5); // -5 for indent
    doc.text(lines, margin + 5, cursorY);

    // Update cursor position based on number of lines
    cursorY += (lines.length * doc.getLineHeight() * 0.35) + 5; // Add line height + padding
    
    cursorY += 5; // Extra padding between messages
  }

  // --- 3. Add Summary Page ---
  doc.addPage();
  cursorY = margin;
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Conversation Summary", pageWidth / 2, cursorY, { align: "center" });
  cursorY += 15;

  // Get the summary
  const summary = await getConversationSummary(messages);

  // Set font for summary content
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  const summaryLines = doc.splitTextToSize(summary, maxLineWidth);
  doc.text(summaryLines, margin, cursorY);

  // --- 4. Save the PDF ---
  const fileName = `Sancara_AI_Chat_${sessionTitle.replace(/[\s:]/g, "_")}.pdf`;
  doc.save(fileName);
}