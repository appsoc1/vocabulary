// src/lib/srs/masking.ts
function isLetter(ch: string) {
  return /[A-Za-z]/.test(ch);
}

export function maskWord(word: string): string {
  const chars = [...word];
  const letterIdx: number[] = [];
  chars.forEach((ch, i) => {
    if (isLetter(ch)) letterIdx.push(i);
  });

  if (letterIdx.length === 0) return word;

  // Không che chữ cái đầu tiên
  const canHide = letterIdx.filter(i => i !== letterIdx[0]);
  if (canHide.length === 0) return word;

  // Từ ngắn (<=5 chữ cái): chỉ che 1 ký tự
  // Từ dài (>5 chữ cái): che 2 ký tự nhưng KHÔNG liền nhau
  const hideCount = letterIdx.length <= 5 ? 1 : 2;

  // Shuffle để random
  const shuffled = [...canHide].sort(() => Math.random() - 0.5);

  const chosen: number[] = [];
  for (const idx of shuffled) {
    if (chosen.length >= hideCount) break;

    // Kiểm tra KHÔNG liền nhau với bất kỳ ký tự đã chọn
    const isAdjacent = chosen.some(c => Math.abs(c - idx) === 1);
    if (!isAdjacent) {
      chosen.push(idx);
    }
  }

  // Nếu cần 2 mà không tìm được 2 cái không liền nhau -> chỉ che 1
  if (chosen.length === 0 && shuffled.length > 0) {
    chosen.push(shuffled[0]);
  }

  for (const i of chosen) {
    chars[i] = "_";
  }
  return chars.join("");
}

export function maskSentenceByKeyword(sentence: string, keyword: string): string {
  const kw = keyword.trim();
  if (!kw) return sentence;

  const blanks = kw.split(/\s+/).map(() => "____").join(" ");
  const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const re = new RegExp(escaped, "i");
  if (!re.test(sentence)) return sentence;

  return sentence.replace(re, blanks);
}
