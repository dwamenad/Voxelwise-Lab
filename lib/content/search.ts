import { courses, getAllLessons } from "@/lib/content/catalog";
import { glossaryTerms } from "@/lib/content/glossary";
import { troubleshootingArticles } from "@/lib/content/troubleshooting";

export type SearchCategory = "All" | "Courses" | "Lessons" | "Commands" | "Glossary" | "Troubleshooting";

export interface SearchResult {
  id: string;
  type: "Course" | "Lesson" | "Command" | "Glossary" | "Troubleshooting";
  title: string;
  description: string;
  snippet?: string;
  href: string;
  score: number;
}

// Levenshtein edit distance algorithm for typo tolerance
function levenshteinDistance(s1: string, s2: string): number {
  if (s1 === s2) return 0;
  if (!s1.length) return s2.length;
  if (!s2.length) return s1.length;

  const row = Array.from({ length: s2.length + 1 }, (_, i) => i);
  for (let i = 1; i <= s1.length; i++) {
    let prev = i;
    for (let j = 1; j <= s2.length; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      const val = Math.min(row[j] + 1, prev + 1, row[j - 1] + cost);
      row[j - 1] = prev;
      prev = val;
    }
    row[s2.length] = prev;
  }
  return row[s2.length];
}

function tokenFuzzyScore(queryToken: string, targetToken: string): number {
  if (queryToken === targetToken) return 1.0;
  if (targetToken.startsWith(queryToken)) return 0.85;
  if (targetToken.includes(queryToken)) return 0.7;

  // For tokens length >= 4, allow 1-2 character edits
  if (queryToken.length >= 4 && targetToken.length >= 4) {
    const dist = levenshteinDistance(queryToken, targetToken);
    const maxLen = Math.max(queryToken.length, targetToken.length);
    if (dist <= (queryToken.length >= 6 ? 2 : 1)) {
      return 1.0 - dist / maxLen;
    }
  }
  return 0;
}

function scoreText(queryTokens: string[], text: string, weight: number): { score: number; bestSnippet?: string } {
  if (!text) return { score: 0 };
  const lower = text.toLowerCase();
  const words = lower.split(/[^a-z0-9_-]+/).filter(Boolean);

  let totalScore = 0;
  let firstMatchIndex = -1;

  for (const qToken of queryTokens) {
    let tokenMax = 0;
    // Direct substring bonus
    const subIdx = lower.indexOf(qToken);
    if (subIdx !== -1) {
      tokenMax = 1.0;
      if (firstMatchIndex === -1 || subIdx < firstMatchIndex) firstMatchIndex = subIdx;
    } else {
      for (const word of words) {
        const score = tokenFuzzyScore(qToken, word);
        if (score > tokenMax) {
          tokenMax = score;
          if (score > 0.6 && firstMatchIndex === -1) {
            firstMatchIndex = lower.indexOf(word);
          }
        }
      }
    }
    totalScore += tokenMax;
  }

  const normalized = (totalScore / queryTokens.length) * weight;

  let snippet: string | undefined;
  if (firstMatchIndex !== -1 && text.length > 80) {
    const start = Math.max(0, firstMatchIndex - 30);
    const end = Math.min(text.length, firstMatchIndex + 90);
    snippet = `${start > 0 ? "…" : ""}${text.slice(start, end).trim()}${end < text.length ? "…" : ""}`;
  }

  return { score: normalized, bestSnippet: snippet };
}

export function searchContent(query: string, category: SearchCategory = "All"): SearchResult[] {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return [];

  const queryTokens = cleanQuery.split(/\s+/).filter(Boolean);
  const results: SearchResult[] = [];

  // 1. Search Courses
  if (category === "All" || category === "Courses") {
    for (const course of courses) {
      const titleMatch = scoreText(queryTokens, course.title, 10);
      const descMatch = scoreText(queryTokens, course.description, 4);
      const objMatch = scoreText(queryTokens, course.objectives.join(" "), 3);
      const maxScore = Math.max(titleMatch.score, descMatch.score, objMatch.score);

      if (maxScore > 0.4) {
        results.push({
          id: course.id,
          type: "Course",
          title: course.title,
          description: course.description,
          snippet: titleMatch.bestSnippet || descMatch.bestSnippet,
          href: `/courses/${course.slug}`,
          score: maxScore + (course.title.toLowerCase() === cleanQuery ? 15 : 0),
        });
      }
    }
  }

  // 2. Search Lessons and Lesson Blocks (commands, concepts, troubleshooting)
  if (category === "All" || category === "Lessons" || category === "Commands") {
    for (const course of courses) {
      for (const lesson of getAllLessons(course)) {
        const lessonTitleMatch = scoreText(queryTokens, lesson.title, 10);
        const lessonDescMatch = scoreText(queryTokens, lesson.description, 4);
        let bestBlockScore = 0;
        let bestBlockSnippet: string | undefined;
        let commandMatchFound: { command: string; explanation: string } | null = null;

        for (const block of lesson.blocks) {
          if (block.type === "command") {
            const cmdScore = scoreText(queryTokens, block.command, 8);
            const expScore = scoreText(queryTokens, block.explanation, 4);
            const combined = Math.max(cmdScore.score, expScore.score);
            if (combined > bestBlockScore) {
              bestBlockScore = combined;
              bestBlockSnippet = block.explanation;
              commandMatchFound = { command: block.command, explanation: block.explanation };
            }
          } else if (block.type === "concept") {
            const cScore = scoreText(queryTokens, `${block.title} ${block.body}`, 6);
            if (cScore.score > bestBlockScore) {
              bestBlockScore = cScore.score;
              bestBlockSnippet = cScore.bestSnippet || block.body;
            }
          } else if (block.type === "text") {
            const tScore = scoreText(queryTokens, block.body, 2);
            if (tScore.score > bestBlockScore) {
              bestBlockScore = tScore.score;
              bestBlockSnippet = tScore.bestSnippet;
            }
          }
        }

        const overallScore = Math.max(lessonTitleMatch.score, lessonDescMatch.score, bestBlockScore);

        if (category === "Commands" && commandMatchFound && bestBlockScore > 0.5) {
          results.push({
            id: `cmd-${lesson.id}`,
            type: "Command",
            title: commandMatchFound.command,
            description: `${lesson.title} · ${commandMatchFound.explanation}`,
            snippet: bestBlockSnippet,
            href: `/courses/${course.slug}/lessons/${lesson.slug}`,
            score: bestBlockScore + 2,
          });
        } else if (overallScore > 0.4 && category !== "Commands") {
          results.push({
            id: lesson.id,
            type: "Lesson",
            title: lesson.title,
            description: `${course.shortTitle} · ${lesson.description}`,
            snippet: bestBlockSnippet || lessonTitleMatch.bestSnippet,
            href: `/courses/${course.slug}/lessons/${lesson.slug}`,
            score: overallScore + (lesson.title.toLowerCase() === cleanQuery ? 15 : 0),
          });
        }
      }
    }
  }

  // 3. Search Glossary
  if (category === "All" || category === "Glossary") {
    for (const term of glossaryTerms) {
      const termMatch = scoreText(queryTokens, term.term, 9);
      const defMatch = scoreText(queryTokens, term.definition, 4);
      const score = Math.max(termMatch.score, defMatch.score);

      if (score > 0.4) {
        results.push({
          id: `glossary-${term.slug}`,
          type: "Glossary",
          title: term.term,
          description: term.definition,
          snippet: termMatch.bestSnippet || defMatch.bestSnippet,
          href: `/glossary?q=${encodeURIComponent(term.term)}`,
          score: score + (term.term.toLowerCase() === cleanQuery ? 15 : 0),
        });
      }
    }
  }

  // 4. Search Troubleshooting
  if (category === "All" || category === "Troubleshooting") {
    for (const article of troubleshootingArticles) {
      const titleMatch = scoreText(queryTokens, article.title, 8);
      const sympMatch = scoreText(queryTokens, article.symptom, 6);
      const resMatch = scoreText(queryTokens, article.resolution, 4);
      const score = Math.max(titleMatch.score, sympMatch.score, resMatch.score);

      if (score > 0.4) {
        results.push({
          id: `trouble-${article.id}`,
          type: "Troubleshooting",
          title: article.title,
          description: article.resolution,
          snippet: sympMatch.bestSnippet || resMatch.bestSnippet,
          href: `/troubleshooting?q=${encodeURIComponent(article.title)}`,
          score: score,
        });
      }
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, 50);
}
