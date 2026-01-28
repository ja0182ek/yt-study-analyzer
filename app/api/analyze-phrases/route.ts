import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// フォールバック用の鉄板フレーズリスト
const FALLBACK_PHRASES = [
  {
    phrase: 'Once upon a time',
    japanese: 'むかしむかし',
    background: 'おとぎ話の冒頭で必ず使われる定番フレーズです',
    category: '物語の王道',
    categoryEmoji: '🏰',
  },
  {
    phrase: 'Look at this',
    japanese: 'これを見て',
    background: '注目させたい物を紹介する時の定番です',
    category: '疑問と観察',
    categoryEmoji: '🔬',
  },
  {
    phrase: 'What happens next',
    japanese: '次は何が起こるかな？',
    background: '実験動画や物語で続きを予想させる時に使います',
    category: '疑問と観察',
    categoryEmoji: '🔬',
  },
  {
    phrase: "Don't be afraid",
    japanese: '怖がらないで',
    background: '怖がっている相手を勇気づける表現です',
    category: '感情・気遣い',
    categoryEmoji: '💖',
  },
  {
    phrase: "Let's play",
    japanese: '遊ぼう！',
    background: '遊びに誘う時の基本フレーズです',
    category: '意気込み・誘い',
    categoryEmoji: '🎉',
  },
];

// カテゴリに対応する絵文字
const CATEGORY_EMOJIS: Record<string, string> = {
  '探す・発見する': '🔍',
  '物語の王道': '🏰',
  '疑問と観察': '🔬',
  '感情・気遣い': '💖',
  '意気込み・誘い': '🎉',
};

interface ParsedPhrase {
  phrase: string;
  japanese: string;
  background: string;
  category: string;
}

interface VocabularyTheme {
  theme: string;
  themeEmoji: string;
  keywords: string[];
  insight: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { titles } = body as { titles: string[] };

    if (!titles || !Array.isArray(titles) || titles.length === 0) {
      return NextResponse.json({
        success: true,
        data: FALLBACK_PHRASES,
        vocabularyThemes: [],
        source: 'fallback',
      });
    }

    // Gemini APIキーの確認
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your-gemini-api-key-here') {
      console.log('Gemini API key not configured, using fallback phrases');
      return NextResponse.json({
        success: true,
        data: FALLBACK_PHRASES,
        vocabularyThemes: [],
        source: 'fallback',
      });
    }

    try {
      // Gemini AIクライアントを初期化
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

      // タイトルを最大100件に制限して結合
      const limitedTitles = titles.slice(0, 100);
      const titlesText = limitedTitles.join('\n');

      const prompt = `あなたは幼児英語教育の専門家です。以下は子供が直近7日間にYouTube Kidsで視聴した動画のタイトル一覧です。

【動画タイトル一覧（直近7日間）】
${titlesText}

上記を分析し、以下の2つを抽出してください：

1. 【習得フレーズ】子供が「実際によく耳にしていたはず」の決まり文句（フレーズ）を5つ
2. 【語彙テーマ】今週よく触れていた英単語のテーマ分析

以下のJSON形式で回答してください。他のテキストは含めないでください。

{
  "phrases": [
    {
      "phrase": "（英語のフレーズ。2-6語程度。動画で実際に聞こえてくるフレーズ）",
      "japanese": "（日本語訳）",
      "background": "（このフレーズがどんな場面で流れるか。親が『あ、これ動画で聞いた！』と思えるような具体的説明）",
      "category": "（探す・発見する、物語の王道、疑問と観察、感情・気遣い、意気込み・誘い のいずれか）"
    }
  ],
  "vocabularyThemes": [
    {
      "theme": "（テーマ名：動物、色、感情、数字、食べ物、乗り物、自然、体のパーツ など）",
      "themeEmoji": "（テーマに合った絵文字1つ）",
      "keywords": ["（そのテーマに関連する英単語を3-5個）"],
      "insight": "（このテーマについて親へのワンポイントアドバイス。30文字以内）"
    }
  ]
}

【フレーズカテゴリの選択肢】
1. 探す・発見する（かくれんぼ、宝探し、Where are you?など）
2. 物語の王道（おとぎ話、Once upon a time、The endなど）
3. 疑問と観察（質問、実験、What's this?など）
4. 感情・気遣い（感謝、励まし、I love youなど）
5. 意気込み・誘い（Let's go!、Here we goなど）

【重要】
- 動画タイトルに含まれるキーワードから、その動画で流れているであろうフレーズを推測してください
- 子供向けYouTube動画の定番フレーズを優先してください
- 語彙テーマは動画タイトルから最も頻出するテーマを3つ抽出してください
- 親御さんが「あ、これ動画で聞いた！」と一致感を持てる内容にしてください`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // JSONをパース
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('Failed to parse Gemini response as JSON:', text);
        return NextResponse.json({
          success: true,
          data: FALLBACK_PHRASES,
          vocabularyThemes: [],
          source: 'fallback',
        });
      }

      const parsed = JSON.parse(jsonMatch[0]) as {
        phrases: ParsedPhrase[];
        vocabularyThemes?: VocabularyTheme[];
      };

      if (!parsed.phrases || !Array.isArray(parsed.phrases) || parsed.phrases.length === 0) {
        console.error('Gemini response missing phrases array:', parsed);
        return NextResponse.json({
          success: true,
          data: FALLBACK_PHRASES,
          vocabularyThemes: [],
          source: 'fallback',
        });
      }

      // 絵文字を追加
      const phrasesWithEmoji = parsed.phrases.map(phrase => ({
        ...phrase,
        categoryEmoji: CATEGORY_EMOJIS[phrase.category] || '📚',
      }));

      return NextResponse.json({
        success: true,
        data: phrasesWithEmoji,
        vocabularyThemes: parsed.vocabularyThemes || [],
        source: 'gemini',
      });
    } catch (aiError) {
      console.error('Gemini analysis failed, using fallback:', aiError);
      return NextResponse.json({
        success: true,
        data: FALLBACK_PHRASES,
        vocabularyThemes: [],
        source: 'fallback',
      });
    }
  } catch (error) {
    console.error('Phrase analysis API error:', error);
    return NextResponse.json({
      success: true,
      data: FALLBACK_PHRASES,
      vocabularyThemes: [],
      source: 'fallback',
    });
  }
}
