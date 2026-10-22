// Keeps generated lessons in memory AND on disk (./.lesson-cache), so a server
// restart no longer replaces a saved video with a generic rebuilt script.
import fs from "fs";
import path from "path";
import type { Lesson } from "./topic-content";

const DIR = path.resolve(process.cwd(), ".lesson-cache");
const memory = new Map<string, Lesson>();
const SAFE_ID = /^[a-z0-9-]{1,64}$/i; // ids come from URLs: never allow path tricks

function file(id: string): string | undefined {
  return SAFE_ID.test(id) ? path.join(DIR, `${id}.json`) : undefined;
}

export const lessonStore = {
  get(id: string): Lesson | undefined {
    const hit = memory.get(id);
    if (hit) return hit;
    const f = file(id);
    if (!f) return undefined;
    try {
      const lesson = JSON.parse(fs.readFileSync(f, "utf8")) as Lesson;
      if (lesson && typeof lesson.script === "string" && Array.isArray(lesson.beats)) {
        memory.set(id, lesson);
        return lesson;
      }
    } catch {
      /* not cached */
    }
    return undefined;
  },
  set(id: string, lesson: Lesson): void {
    memory.set(id, lesson);
    const f = file(id);
    if (!f) return;
    try {
      fs.mkdirSync(DIR, { recursive: true });
      fs.writeFileSync(f, JSON.stringify(lesson));
    } catch (e) {
      console.warn("Could not persist lesson:", e instanceof Error ? e.message : e);
    }
  },
};
