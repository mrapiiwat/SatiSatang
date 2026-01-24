declare global {
  namespace Intl {
    class Segmenter {
      constructor(
        locale: string,
        options?: { granularity: "grapheme" | "word" | "sentence" }
      );
      segment(input: string): IterableIterator<{
        segment: string;
        index: number;
        input: string;
        isWordLike?: boolean;
      }>;
    }
  }
}

export {};
