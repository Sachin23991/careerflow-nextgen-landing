import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs";
import fetch from "node-fetch";

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

const parseForm = (req: NextApiRequest): Promise<formidable.Files> =>
  new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve(files);
    });
  });

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
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
      return res.status(400).json({ error: "No file uploaded" });
    }

    // formidable returns an array for multiple files or an object for one; normalize
    const fileObject = Array.isArray(fileEntry) ? fileEntry[0] : fileEntry;
    const filePath = fileObject.filepath || fileObject.path || fileObject.file;
    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(400).json({ error: "Uploaded file missing on server" });
    }

    const buffer = fs.readFileSync(filePath);

    // 1) Upload to AssemblyAI /v2/upload
    const uploadResp = await fetch(ASSEMBLYAI_UPLOAD_URL, {
      method: "POST",
      headers: {
        Authorization: ASSEMBLY_KEY,
        "Transfer-Encoding": "chunked",
        "Content-Type": "application/octet-stream",
      },
      body: buffer,
    });

    if (!uploadResp.ok) {
      const txt = await uploadResp.text();
      console.error("AssemblyAI upload failed:", txt);
      return res.status(500).json({ error: "Upload to AssemblyAI failed" });
    }

    const uploadJson = await uploadResp.json();
    const audio_url = uploadJson.upload_url;
    if (!audio_url) {
      console.error("AssemblyAI upload did not return upload_url:", uploadJson);
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
        // optional config tweaks:
        auto_chapters: false,
        punctuate: true,
        format_text: true,
      }),
    });

    if (!createResp.ok) {
      const txt = await createResp.text();
      console.error("AssemblyAI create transcript failed:", txt);
      return res.status(500).json({ error: "Failed to create transcript" });
    }

    const createData = await createResp.json();
    const transcriptId = createData.id;
    if (!transcriptId) {
      console.error("Missing transcript id:", createData);
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
        console.error("AssemblyAI poll error:", txt);
        return res.status(500).json({ error: "AssemblyAI polling failed" });
      }
      const pollData = await pollResp.json();
      const status = pollData.status;
      if (status === "completed") {
        transcriptText = pollData.text || "";
        break;
      } else if (status === "error") {
        console.error("AssemblyAI reported error:", pollData.error);
        return res.status(500).json({ error: `Transcription failed: ${pollData.error}` });
      }
      // Wait before next poll (500ms -> up to ~30 seconds)
      await new Promise((r) => setTimeout(r, 500));
    }

    // Cleanup temp file
    try {
      fs.unlinkSync(filePath);
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