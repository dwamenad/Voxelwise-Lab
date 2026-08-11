export const parseDuration = (afinfoOutput) => {
  const match = afinfoOutput.match(/estimated duration:\s*([\d.]+)\s*sec/i);
  if (!match) {
    throw new Error(`Unable to read audio duration from afinfo output:\n${afinfoOutput}`);
  }
  return Number(match[1]);
};

export const formatTimestamp = (seconds) => {
  const milliseconds = Math.max(0, Math.round(seconds * 1000));
  const hours = Math.floor(milliseconds / 3_600_000);
  const minutes = Math.floor((milliseconds % 3_600_000) / 60_000);
  const secs = Math.floor((milliseconds % 60_000) / 1000);
  const millis = milliseconds % 1000;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")},${String(millis).padStart(3, "0")}`;
};

export const toTtsText = (value) =>
  value
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\.\./g, " dot dot ")
    .replace(/(^|\s)\.(?=\s|$)/g, "$1 dot ")
    .replace(/(^|\s)~(?=\s|$)/g, "$1 tilde ")
    .replace(/\.feat\b/gi, " dot feat")
    .replace(/\.fsf\b/gi, " dot F S F")
    .replace(/\bFSLEyes\b/g, "F S L Eyes")
    .replace(/\bfslinfo\b/gi, "F S L info")
    .replace(/\bfslstats\b/gi, "F S L stats")
    .replace(/\bfslmaths\b/gi, "F S L maths")
    .replace(/\bfslmeants\b/gi, "F S L means")
    .replace(/\bFSL\b/g, "F S L")
    .replace(/\bFMRIB\b/g, "F M R I B")
    .replace(/\bfMRI\b/g, "functional M R I")
    .replace(/\bMRI\b/g, "M R I")
    .replace(/\bNIfTI\b/g, "nifty")
    .replace(/\bBIDS\b/g, "bids")
    .replace(/\bHRF\b/g, "H R F")
    .replace(/\bEVs\b/g, "E V's")
    .replace(/\bEV\b/g, "E V")
    .replace(/\bGLM\b/g, "G L M")
    .replace(/\bBOLD\b/g, "bold")
    .replace(/\bTR\b/g, "T R")
    .replace(/\bQC\b/g, "quality control")
    .replace(/\b4D\b/g, "four-D")
    .replace(/\b3D\b/g, "three-D")
    .replace(/mm³/g, "cubic millimetres")
    .replace(/→/g, " then ")
    .replace(/×/g, " by ")
    .replace(/\s+/g, " ")
    .trim();

const wrapWords = (words, maxLineLength = 42) => {
  const lines = [];
  let line = "";
  for (const originalWord of words) {
    let word = originalWord;
    if (word.length > maxLineLength) {
      if (line) {
        lines.push(line);
        line = "";
      }
      while (word.length > maxLineLength) {
        lines.push(word.slice(0, maxLineLength));
        word = word.slice(maxLineLength);
      }
      if (word) line = word;
      continue;
    }
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length <= maxLineLength) {
      line = candidate;
    } else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
};

export const splitCaptionCues = (text, maxLineLength = 42, maxLines = 2) => {
  const sentences =
    text.match(/.+?(?:[.!?]+(?=\s|$)|$)/gs)?.map((sentence) => sentence.trim()).filter(Boolean) ??
    [text];
  const cues = [];

  for (const sentence of sentences) {
    const words = sentence.split(/\s+/).filter(Boolean);
    const lines = wrapWords(words, maxLineLength);
    for (let index = 0; index < lines.length; index += maxLines) {
      cues.push(lines.slice(index, index + maxLines).join("\n"));
    }
  }

  return cues;
};

export const wordCount = (text) => text.trim().split(/\s+/).filter(Boolean).length;
