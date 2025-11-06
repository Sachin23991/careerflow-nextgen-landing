import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs/promises";

// Disable Next's body parser so formidable can parse multipart
export const config = {
  api: {
    bodyParser: false,
  },
};

type Data = {
  text?: string;
  error?: string;
};

const ASSEMBLYAI_UPLOAD_URL = "https://api.assemblyai.com/v2/upload";
const ASSEMBLYAI_TRANSCRIPT_URL = "https://api.assemblyai.com/v2/transcript";

const ASSEMBLY_KEY = process.env.ASSEMBLYAI_API_KEY;

if (!ASSEMBLY_KEY) {
  // We don't throw at module eval time; handle in handler
  // console.warn("Missing ASSEMBLYAI_API_KEY env var.");
}

// Use promise-based parse with reasonable options
const parseForm = (req: NextApiRequest): Promise<formidable.Files> =>
  new Promise((resolve, reject) => {
    const form = formidable({ multiples: false, keepExtensions: true });
    form.parse(req, (err, _fields, files) => {
      if (err) return reject(err);
      resolve(files);
    });
  });

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  console.log("[transcribe] handler invoked", req.method, "content-type:", req.headers["content-type"]);
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!ASSEMBLY_KEY) {
    return res.status(500).json({ error: "Missing AssemblyAI API key. Set process.env.ASSEMBLYAI_API_KEY" });
  }

  try {
    const files = await parseForm(req);
    // "file" input name expected from the frontend
    const fileEntry = (files as any).file;
    if (!fileEntry) {
      console.error("No file field in uploaded form:", Object.keys(files || {}));
      return res.status(400).json({ error: "No file uploaded" });
    }

    // formidable returns an array for multiple files or an object for one; normalize
    const fileObject = Array.isArray(fileEntry) ? fileEntry[0] : fileEntry;
    // Accept common filepath properties used by different formidable versions
    const filePath = fileObject?.filepath || fileObject?.filepath || fileObject?.path || fileObject?.file;
    if (!filePath) {
      console.error("Uploaded file object missing filepath property:", fileObject);
      return res.status(400).json({ error: "Uploaded file missing on server" });
    }

    // Read file as buffer using fs.promises
    let buffer: Buffer;
    try {
      buffer = await fs.readFile(filePath);
    } catch (readErr) {
      console.error("Failed to read uploaded file:", readErr);
      // attempt cleanup if possible
      try { await fs.unlink(filePath); } catch {}
      return res.status(500).json({ error: "Failed to read uploaded file on server" });
    }

    // Convert Buffer to Uint8Array (ArrayBufferView) so fetch accepts it in TypeScript
    const uploadBody = new Uint8Array(buffer);

    // 1) Upload to AssemblyAI /v2/upload
    const uploadResp = await fetch(ASSEMBLYAI_UPLOAD_URL, {
      method: "POST",
      headers: {
        Authorization: ASSEMBLY_KEY,
        // let fetch manage transfer encoding; content-type is octet-stream for raw bytes
        "Content-Type": "application/octet-stream",
      },
      body: uploadBody,
    });

    if (!uploadResp.ok) {
      const txt = await uploadResp.text();
      console.error("AssemblyAI upload failed:", uploadResp.status, txt);
      try { await fs.unlink(filePath); } catch {}
      return res.status(500).json({ error: "Upload to AssemblyAI failed" });
    }

    const uploadJson = await uploadResp.json();
    const audio_url = uploadJson.upload_url;
    if (!audio_url) {
      console.error("AssemblyAI upload did not return upload_url:", uploadJson);
      try { await fs.unlink(filePath); } catch {}
      return res.status(500).json({ error: "AssemblyAI upload did not return an upload_url" });
    }

    // 2) Create a transcription
    const createResp = await fetch(ASSEMBLYAI_TRANSCRIPT_URL, {
      method: "POST",
      headers: {
        Authorization: ASSEMBLY_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        audio_url,
        auto_chapters: false,
        punctuate: true,
        format_text: true,
      }),
    });

    if (!createResp.ok) {
      const txt = await createResp.text();
      console.error("AssemblyAI create transcript failed:", createResp.status, txt);
      try { await fs.unlink(filePath); } catch {}
      return res.status(500).json({ error: "Failed to create transcript" });
    }

    const createData = await createResp.json();
    const transcriptId = createData.id;
    if (!transcriptId) {
      console.error("Missing transcript id:", createData);
      try { await fs.unlink(filePath); } catch {}
      return res.status(500).json({ error: "Missing transcript id from AssemblyAI" });
    }

    // 3) Poll for completion
    const pollUrl = `${ASSEMBLYAI_TRANSCRIPT_URL}/${transcriptId}`;
    let transcriptText = "";
    for (let i = 0; i < 60; i++) {
      const pollResp = await fetch(pollUrl, {
        headers: { Authorization: ASSEMBLY_KEY },
      });
      if (!pollResp.ok) {
        const txt = await pollResp.text();
        console.error("AssemblyAI poll error:", pollResp.status, txt);
        try { await fs.unlink(filePath); } catch {}
        return res.status(500).json({ error: "AssemblyAI polling failed" });
      }
      const pollData = await pollResp.json();
      const status = pollData.status;
      if (status === "completed") {
        transcriptText = pollData.text || "";
        break;
      } else if (status === "error") {
        console.error("AssemblyAI reported error:", pollData.error, pollData);
        try { await fs.unlink(filePath); } catch {}
        return res.status(500).json({ error: `Transcription failed: ${pollData.error}` });
      }
      // Wait before next poll (500ms -> up to ~30 seconds)
      await new Promise((r) => setTimeout(r, 500));
    }

    // Cleanup temp file
    try {
      await fs.unlink(filePath);
    } catch (e) {
      // ignore cleanup errors
    }

    if (!transcriptText) {
      return res.status(500).json({ error: "Transcription timed out" });
    }

    return res.status(200).json({ text: transcriptText });
  } catch (err: any) {
    console.error("Transcribe error:", err);
    return res.status(500).json({ error: err?.message || "Transcription failed" });
  }
}