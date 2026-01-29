import {
  VocabDistribution,
  WordFrequency,
  PhraseFrequency,
  AnalysisReport,
  VocabLevel,
  WordCategory,
  CategoryWords,
} from '@/types';
import { getVocabLevel } from './dolchList';

// カテゴリ別の単語リスト
const CATEGORY_WORDS: Record<WordCategory, { label: string; emoji: string; words: Set<string> }> = {
  colors: {
    label: '色',
    emoji: '🎨',
    words: new Set([
      'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'black', 'white', 'brown',
      'gray', 'grey', 'gold', 'silver', 'rainbow', 'colorful', 'color', 'colours', 'bright', 'dark',
    ]),
  },
  animals: {
    label: '動物',
    emoji: '🐾',
    words: new Set([
      'dog', 'cat', 'bird', 'fish', 'rabbit', 'bunny', 'bear', 'lion', 'tiger', 'elephant',
      'monkey', 'horse', 'cow', 'pig', 'sheep', 'duck', 'chicken', 'frog', 'butterfly', 'bee',
      'dinosaur', 'dragon', 'unicorn', 'puppy', 'kitten', 'mouse', 'snake', 'turtle', 'penguin', 'panda',
      'giraffe', 'zebra', 'wolf', 'fox', 'owl', 'dolphin', 'shark', 'whale', 'octopus', 'crab',
    ]),
  },
  food: {
    label: '食べ物',
    emoji: '🍎',
    words: new Set([
      'apple', 'banana', 'orange', 'strawberry', 'grape', 'watermelon', 'cake', 'cookie', 'candy', 'chocolate',
      'ice', 'cream', 'pizza', 'bread', 'milk', 'juice', 'water', 'egg', 'cheese', 'fruit',
      'vegetable', 'carrot', 'tomato', 'potato', 'corn', 'rice', 'noodle', 'soup', 'sandwich', 'breakfast',
      'lunch', 'dinner', 'snack', 'yummy', 'delicious', 'hungry', 'eat', 'drink', 'taste', 'sweet',
    ]),
  },
  bodyParts: {
    label: '体の部位',
    emoji: '🖐️',
    words: new Set([
      'head', 'face', 'eye', 'eyes', 'nose', 'mouth', 'ear', 'ears', 'hair', 'hand', 'hands',
      'finger', 'fingers', 'arm', 'arms', 'leg', 'legs', 'foot', 'feet', 'toe', 'toes',
      'body', 'heart', 'tummy', 'belly', 'shoulder', 'knee', 'elbow', 'neck', 'teeth', 'tongue',
    ]),
  },
  family: {
    label: '家族',
    emoji: '👨‍👩‍👧‍👦',
    words: new Set([
      'mom', 'mommy', 'mother', 'dad', 'daddy', 'father', 'baby', 'brother', 'sister', 'grandma',
      'grandpa', 'grandmother', 'grandfather', 'family', 'parent', 'parents', 'kids', 'children', 'child', 'son',
      'daughter', 'aunt', 'uncle', 'cousin', 'friend', 'friends', 'boy', 'girl', 'man', 'woman',
    ]),
  },
  princess: {
    label: 'おとぎ話',
    emoji: '👸',
    words: new Set([
      'princess', 'prince', 'queen', 'king', 'castle', 'palace', 'crown', 'fairy', 'magic', 'magical',
      'witch', 'wizard', 'dragon', 'knight', 'hero', 'mermaid', 'unicorn', 'spell', 'wand', 'treasure',
      'kingdom', 'royal', 'dress', 'gown', 'ball', 'dance', 'happily', 'ever', 'after', 'dream',
      'wish', 'beautiful', 'handsome', 'brave', 'adventure', 'story', 'tale', 'once', 'upon', 'mirror',
    ]),
  },
  vehicles: {
    label: '乗り物',
    emoji: '🚗',
    words: new Set([
      'car', 'cars', 'truck', 'bus', 'train', 'plane', 'airplane', 'helicopter', 'boat', 'ship',
      'bike', 'bicycle', 'motorcycle', 'rocket', 'spaceship', 'tractor', 'ambulance', 'fire', 'police', 'taxi',
      'wheel', 'wheels', 'drive', 'ride', 'fly', 'fast', 'speed', 'engine', 'road', 'street',
    ]),
  },
  nature: {
    label: '自然・時間',
    emoji: '🌳',
    words: new Set([
      'sun', 'moon', 'star', 'stars', 'sky', 'cloud', 'clouds', 'rain', 'rainbow', 'snow',
      'tree', 'flower', 'grass', 'leaf', 'leaves', 'plant', 'garden', 'forest', 'mountain', 'river',
      'ocean', 'sea', 'beach', 'sand', 'rock', 'water', 'wind', 'weather', 'spring', 'summer',
      'fall', 'autumn', 'winter', 'night', 'day', 'morning', 'afternoon', 'evening', 'sunshine', 'storm',
      'time', 'today', 'tomorrow', 'yesterday', 'week', 'month', 'year', 'hour', 'minute', 'second',
    ]),
  },
  toys: {
    label: 'おもちゃ・遊び',
    emoji: '🧸',
    words: new Set([
      'toy', 'toys', 'ball', 'doll', 'teddy', 'block', 'blocks', 'puzzle', 'game', 'play',
      'playground', 'swing', 'slide', 'balloon', 'balloon', 'robot', 'lego', 'playdoh', 'crayon', 'draw',
      'paint', 'color', 'sing', 'song', 'dance', 'music', 'fun', 'laugh', 'smile',
      'party', 'birthday', 'present', 'gift', 'surprise', 'hide', 'seek', 'jump', 'run', 'catch',
    ]),
  },
  feelings: {
    label: '気持ち',
    emoji: '💖',
    words: new Set([
      'love', 'like', 'happy', 'sad', 'angry', 'scared', 'afraid', 'excited', 'surprised', 'tired',
      'sleepy', 'hungry', 'thirsty', 'sick', 'hurt', 'feel', 'feeling', 'feelings', 'cry', 'miss',
      'sorry', 'thank', 'thanks', 'please', 'help', 'nice', 'kind', 'good', 'bad', 'great',
      'wonderful', 'amazing', 'awesome', 'cool', 'silly', 'funny', 'proud', 'brave', 'shy', 'lonely',
    ]),
  },
  actions: {
    label: '動作',
    emoji: '🏃',
    words: new Set([
      'show', 'way', 'tell', 'say', 'talk', 'ask', 'answer', 'think', 'learn', 'teach',
      'read', 'write', 'count', 'try', 'find', 'give', 'take', 'put', 'pick', 'hold',
      'open', 'close', 'push', 'pull', 'turn', 'move', 'stop', 'start', 'wait', 'watch',
      'listen', 'hear', 'call', 'bring', 'carry', 'throw', 'kick', 'hit', 'clap', 'wave',
      'walk', 'climb', 'swim', 'sleep', 'wake', 'sit', 'stand', 'clean', 'wash', 'brush',
    ]),
  },
  size: {
    label: '大きさ・様子',
    emoji: '📏',
    words: new Set([
      'little', 'big', 'small', 'large', 'tiny', 'huge', 'tall', 'short', 'long', 'wide',
      'high', 'low', 'fat', 'thin', 'round', 'square', 'new', 'old', 'young', 'soft',
      'hard', 'hot', 'cold', 'warm', 'cool', 'wet', 'dry', 'clean', 'dirty', 'full',
      'empty', 'heavy', 'light', 'fast', 'slow', 'loud', 'quiet', 'strong', 'weak', 'same',
    ]),
  },
};

/**
 * テキストを単語に分割（英語）
 */
function tokenize(text: string): string[] {
  // 小文字化して、単語以外の文字で分割
  return text
    .toLowerCase()
    .replace(/['']/g, "'") // スマートクォートを標準化
    .split(/[^a-z']+/)
    .filter(word => word.length > 0 && word !== "'");
}

/**
 * 単語の頻度をカウント
 */
export function countWordFrequencies(transcript: string): Map<string, number> {
  const words = tokenize(transcript);
  const frequencies = new Map<string, number>();

  words.forEach(word => {
    const count = frequencies.get(word) || 0;
    frequencies.set(word, count + 1);
  });

  return frequencies;
}


/**
 * 語彙レベル分布を計算
 */
export function calculateVocabDistribution(
  wordFrequencies: Map<string, number>
): VocabDistribution[] {
  const levelCounts: Record<VocabLevel, number> = {
    'Pre-K': 0,
    'K': 0,
    '1st': 0,
    '2nd': 0,
    '3rd': 0,
    'Noun': 0,
    'Other': 0,
  };

  let totalCount = 0;

  wordFrequencies.forEach((count, word) => {
    const level = getVocabLevel(word) as VocabLevel;
    levelCounts[level] += count;
    totalCount += count;
  });

  const distribution: VocabDistribution[] = Object.entries(levelCounts).map(
    ([level, count]) => ({
      level: level as VocabLevel,
      count,
      percentage: totalCount > 0 ? (count / totalCount) * 100 : 0,
    })
  );

  return distribution;
}

/**
 * 単語が有効な英単語かチェック（母音を含むか）
 */
function isValidEnglishWord(word: string): boolean {
  // 母音を含むかチェック（y も母音として扱う）
  const hasVowel = /[aeiouy]/i.test(word);
  // 子音のみの組み合わせは除外
  if (!hasVowel) return false;
  // 同じ文字が3回以上連続する場合は除外（例: "aaa", "ooo"）
  if (/(.)\1{2,}/.test(word)) return false;
  // 数字を含む場合は除外
  if (/\d/.test(word)) return false;
  return true;
}

/**
 * 上位N件の単語を取得（ストップワード除外）
 */
export function getTopWords(
  wordFrequencies: Map<string, number>,
  topN: number = 10
): WordFrequency[] {
  // 除外するストップワード（拡張版）
  const stopWords = new Set([
    // 代名詞
    'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves',
    'you', 'your', 'yours', 'yourself', 'yourselves',
    'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself',
    'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves',
    // 冠詞・指示詞
    'a', 'an', 'the', 'this', 'that', 'these', 'those',
    // be動詞
    'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being',
    // 助動詞
    'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing',
    'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can',
    // 接続詞・前置詞
    'and', 'or', 'but', 'if', 'so', 'as', 'of', 'at', 'by', 'for', 'with', 'to', 'in', 'on',
    'from', 'into', 'onto', 'upon', 'about', 'above', 'below', 'between', 'under', 'over',
    'through', 'during', 'before', 'after', 'around', 'among', 'along', 'across', 'behind',
    // 副詞・その他機能語
    'not', 'no', 'yes', 'just', 'now', 'then', 'here', 'there', 'very', 'really', 'quite',
    'what', 'when', 'where', 'who', 'whom', 'whose', 'which', 'how', 'why',
    'all', 'some', 'any', 'much', 'many', 'more', 'most', 'other', 'another', 'each', 'every',
    'up', 'down', 'out', 'off', 'away', 'again', 'also', 'back', 'only', 'own', 'same', 'than',
    'too', 'well', 'even', 'still', 'such', 'because', 'while', 'although', 'though',
    // 基本動詞
    'let', 'lets', 'us', 'gonna', 'gotta', 'wanna', 'got', 'get', 'gets', 'getting',
    'go', 'goes', 'going', 'went', 'gone', 'come', 'comes', 'coming', 'came',
    'know', 'knows', 'knowing', 'knew', 'known',
    'see', 'sees', 'seeing', 'saw', 'seen',
    'like', 'likes', 'liking', 'liked',
    'want', 'wants', 'wanting', 'wanted',
    'make', 'makes', 'making', 'made',
    'take', 'takes', 'taking', 'took', 'taken',
    'put', 'puts', 'putting',
    'say', 'says', 'saying', 'said',
    'tell', 'tells', 'telling', 'told',
    'think', 'thinks', 'thinking', 'thought',
    'look', 'looks', 'looking', 'looked',
    'use', 'uses', 'using', 'used',
    'give', 'gives', 'giving', 'gave', 'given',
    'need', 'needs', 'needing', 'needed',
    'try', 'tries', 'trying', 'tried',
    // 短縮形の残骸（アポストロフィなし）
    're', 'll', 've', 't', 's', 'd', 'm', 'n',
    'don', 'won', 'didn', 'doesn', 'isn', 'aren', 'wasn', 'weren',
    'couldn', 'wouldn', 'shouldn', 'hasn', 'hadn', 'haven',
    'ain', 'cant', 'wont', 'dont', 'im', 'youre', 'theyre', 'weve', 'thats', 'whats',
    // 短縮形（アポストロフィ付き）
    "let's", "don't", "won't", "can't", "isn't", "aren't", "wasn't", "weren't",
    "doesn't", "didn't", "couldn't", "wouldn't", "shouldn't", "haven't", "hasn't", "hadn't",
    "it's", "that's", "what's", "there's", "here's", "where's", "who's", "how's",
    "i'm", "you're", "we're", "they're", "he's", "she's",
    "i've", "you've", "we've", "they've",
    "i'll", "you'll", "we'll", "they'll", "he'll", "she'll", "it'll",
    "i'd", "you'd", "we'd", "they'd", "he'd", "she'd",
    "ain't", "gonna", "gotta", "wanna", "kinda", "sorta", "outta", "lotta",
    // 感嘆詞・フィラー
    'oh', 'ah', 'uh', 'um', 'er', 'eh', 'hm', 'hmm', 'huh', 'ha', 'haha', 'hehe',
    'wow', 'whoa', 'yay', 'yea', 'yeah', 'yep', 'nope', 'nah',
    'hey', 'hi', 'hello', 'bye', 'goodbye',
    'okay', 'ok', 'alright', 'right',
    // 歌詞でよく出る意味のない音
    'la', 'na', 'da', 'ba', 'pa', 'ta', 'fa', 'ma', 'ra', 'wa', 'ya', 'za',
    'doo', 'boo', 'woo', 'loo', 'moo', 'poo', 'too', 'zoo',
    'dee', 'bee', 'fee', 'gee', 'lee', 'pee', 'tee', 'wee', 'zee',
    'ooh', 'aah', 'eee', 'ooo',
    // 数字
    'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
    'first', 'second', 'third',
    // HTMLエンティティの残骸
    'amp', 'gt', 'lt', 'quot', 'apos', 'nbsp', 'rsquo', 'lsquo', 'rdquo', 'ldquo', 'ndash', 'mdash',
    // 自動生成字幕でよく出る誤認識
    'musi', 'mus', 'ktick', 'tic', 'tik', 'applause', 'laughter', 'music',
    // その他
    'thing', 'things', 'something', 'anything', 'nothing', 'everything',
    'way', 'ways', 'time', 'times', 'day', 'days', 'year', 'years',
    'people', 'person', 'man', 'men', 'woman', 'women',
    'life', 'world', 'part', 'place', 'case', 'point', 'fact',
    'being', 'having', 'getting', 'going', 'coming', 'doing', 'making', 'taking',
  ]);

  const sorted = Array.from(wordFrequencies.entries())
    .filter(([word]) => {
      // ストップワードは除外
      if (stopWords.has(word)) return false;
      // 3文字未満は除外
      if (word.length < 3) return false;
      // 有効な英単語かチェック
      if (!isValidEnglishWord(word)) return false;
      return true;
    })
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN);

  return sorted.map(([word, count]) => {
    // カテゴリを検索
    let category: string | undefined;
    let categoryEmoji: string | undefined;
    for (const [, catConfig] of Object.entries(CATEGORY_WORDS)) {
      if (catConfig.words.has(word)) {
        category = catConfig.label;
        categoryEmoji = catConfig.emoji;
        break;
      }
    }

    return {
      word,
      count,
      level: getVocabLevel(word) as VocabLevel,
      category,
      categoryEmoji,
    };
  });
}

/**
 * フォールバック用のデフォルトフレーズを取得
 * AIフレーズ分析が使用できない場合に使用
 */
export function getDefaultPhrases(): PhraseFrequency[] {
  // 鉄板フレーズリストからデフォルト5件を返す
  const defaultPhrases: PhraseFrequency[] = [
    {
      phrase: 'Once upon a time',
      count: 1,
      category: '物語の王道',
      categoryEmoji: '🏰',
      meaning: 'むかしむかし',
      scene: 'おとぎ話の冒頭で必ず使われる定番フレーズです',
    },
    {
      phrase: 'Look at this',
      count: 1,
      category: '疑問と観察',
      categoryEmoji: '🔬',
      meaning: 'これを見て',
      scene: '注目させたい物を紹介する時の定番です',
    },
    {
      phrase: 'What happens next',
      count: 1,
      category: '疑問と観察',
      categoryEmoji: '🔬',
      meaning: '次は何が起こるかな？',
      scene: '実験動画や物語で続きを予想させる時に使います',
    },
    {
      phrase: "Don't be afraid",
      count: 1,
      category: '感情・気遣い',
      categoryEmoji: '💖',
      meaning: '怖がらないで',
      scene: '怖がっている相手を勇気づける表現です',
    },
    {
      phrase: "Let's play",
      count: 1,
      category: '意気込み・誘い',
      categoryEmoji: '🎉',
      meaning: '遊ぼう！',
      scene: '遊びに誘う時の基本フレーズです',
    },
  ];

  return defaultPhrases;
}

/**
 * 字幕テキスト内でフレーズの出現回数をカウント
 */
export function countPhraseOccurrences(
  phrases: PhraseFrequency[],
  transcriptText: string
): PhraseFrequency[] {
  // テキストを小文字化して正規化
  const normalizedText = transcriptText
    .toLowerCase()
    .replace(/['']/g, "'")
    .replace(/\s+/g, ' ');

  return phrases.map((phrase) => {
    // フレーズを小文字化して検索
    const searchPhrase = phrase.phrase.toLowerCase().replace(/['']/g, "'");

    // フレーズの出現回数をカウント
    let count = 0;
    let pos = 0;
    while ((pos = normalizedText.indexOf(searchPhrase, pos)) !== -1) {
      count++;
      pos += searchPhrase.length;
    }

    return {
      ...phrase,
      count: count > 0 ? count : phrase.count, // 見つからなければ元のカウントを維持
    };
  });
}

/**
 * 分析結果からアドバイスを生成
 */
function generateAdvice(
  vocabDistribution: VocabDistribution[],
  topWords: WordFrequency[]
): string[] {
  const advice: string[] = [];

  // 語彙レベルの分析
  const dolchTotal = vocabDistribution
    .filter(d => d.level !== 'Other')
    .reduce((sum, d) => sum + d.count, 0);
  const otherCount = vocabDistribution.find(d => d.level === 'Other')?.count || 0;
  const total = dolchTotal + otherCount;

  if (total === 0) {
    return ['字幕データが取得できませんでした。字幕付きの動画を視聴するとより詳しい分析ができます。'];
  }

  const dolchPercentage = (dolchTotal / total) * 100;

  if (dolchPercentage >= 70) {
    advice.push('基本的な語彙（Dolch Words）の割合が高く、初心者向けの動画を視聴しています。');
  } else if (dolchPercentage >= 50) {
    advice.push('基本語彙と発展語彙がバランスよく含まれています。');
  } else {
    advice.push('発展的な語彙が多く含まれる動画を視聴しています。お子さまのレベルに合っているか確認してください。');
  }

  // Pre-K, K レベルの比率
  const beginnerLevels = vocabDistribution
    .filter(d => d.level === 'Pre-K' || d.level === 'K')
    .reduce((sum, d) => sum + d.count, 0);
  const beginnerPercentage = (beginnerLevels / total) * 100;

  if (beginnerPercentage >= 40) {
    advice.push('最も基礎的な単語が多く使われており、英語初心者のお子さまに適しています。');
  }

  // 頻出単語についてのアドバイス
  const dolchWords = topWords.filter(w => w.level !== 'Other');
  if (dolchWords.length >= 5) {
    const levels = dolchWords.slice(0, 5).map(w => w.level);
    const uniqueLevels = new Set(levels);
    if (uniqueLevels.size <= 2) {
      advice.push('頻出単語が特定のレベルに集中しています。様々なレベルの動画を見るとバランスよく学習できます。');
    }
  }

  // 名詞の使用について
  const nounCount = vocabDistribution.find(d => d.level === 'Noun')?.count || 0;
  const nounPercentage = (nounCount / total) * 100;
  if (nounPercentage >= 10) {
    advice.push('具体的な名詞が多く含まれており、語彙を増やすのに役立ちます。');
  }

  return advice;
}

/**
 * カテゴリ別に単語を分類して取得
 */
function getCategoryWords(
  wordFrequencies: Map<string, number>,
  topN: number = 5
): CategoryWords[] {
  const result: CategoryWords[] = [];

  for (const [category, config] of Object.entries(CATEGORY_WORDS)) {
    const categoryWordList: WordFrequency[] = [];

    for (const [word, count] of wordFrequencies.entries()) {
      if (config.words.has(word)) {
        categoryWordList.push({
          word,
          count,
          level: getVocabLevel(word) as VocabLevel,
        });
      }
    }

    // カウント順にソートして上位N件を取得
    categoryWordList.sort((a, b) => b.count - a.count);
    const topCategoryWords = categoryWordList.slice(0, topN);

    if (topCategoryWords.length > 0) {
      result.push({
        category: category as WordCategory,
        label: config.label,
        emoji: config.emoji,
        words: topCategoryWords,
      });
    }
  }

  // 単語数が多いカテゴリ順にソート
  result.sort((a, b) => {
    const totalA = a.words.reduce((sum, w) => sum + w.count, 0);
    const totalB = b.words.reduce((sum, w) => sum + w.count, 0);
    return totalB - totalA;
  });

  return result;
}

/**
 * 複数の字幕テキストを分析してレポートを生成
 * 注意: フレーズ分析はAI APIで行われ、page.tsxで上書きされます
 */
export function analyzeTranscripts(transcripts: string[]): AnalysisReport {
  // 全テキストを結合
  const combinedText = transcripts.join(' ');

  // 単語頻度
  const wordFrequencies = countWordFrequencies(combinedText);

  // 語彙分布
  const vocabDistribution = calculateVocabDistribution(wordFrequencies);

  // 上位単語
  const topWords = getTopWords(wordFrequencies, 10);

  // カテゴリ別単語
  const categoryWords = getCategoryWords(wordFrequencies, 5);

  // フレーズ（デフォルト値、AI分析結果で上書きされる）
  const topPhrases = getDefaultPhrases();

  // 統計
  const totalWords = Array.from(wordFrequencies.values()).reduce((sum, count) => sum + count, 0);
  const uniqueWords = wordFrequencies.size;

  // アドバイス生成
  const advice = generateAdvice(vocabDistribution, topWords);

  return {
    topWords,
    categoryWords,
    topPhrases,
    vocabDistribution,
    totalWords,
    uniqueWords,
    advice,
  };
}
