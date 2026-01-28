import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// アドバイスのレスポンス型
export interface WeeklyAdviceResponse {
  focusPhrase: string;        // 今週の強化フレーズ
  focusPhraseJapanese: string; // 日本語訳
  interestAnalysis: string;   // お子様の興味分析
  conversationTip: string;    // 具体的な語りかけ案
}

// フォールバック用のデフォルトアドバイス
const FALLBACK_ADVICE: WeeklyAdviceResponse = {
  focusPhrase: "Let's go on an adventure!",
  focusPhraseJapanese: '冒険に出かけよう！',
  interestAnalysis: 'お子様は冒険や探検に興味を持っているようです。新しい発見が大好きな様子です。',
  conversationTip: 'お散歩に行く時に「Let\'s go on an adventure!」と声をかけて、日常を小さな冒険に変えてあげましょう。',
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { titles, channelNames, topWords, topPhrases } = body as {
      titles: string[];
      channelNames: string[];
      topWords: string[];
      topPhrases?: { phrase: string; meaning?: string }[];
    };

    // 入力データがない場合はフォールバック
    if (!titles || titles.length === 0) {
      return NextResponse.json({
        success: true,
        data: FALLBACK_ADVICE,
        source: 'fallback',
      });
    }

    // Gemini APIキーの確認
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your-gemini-api-key-here') {
      console.log('Gemini API key not configured, using fallback advice');
      return NextResponse.json({
        success: true,
        data: FALLBACK_ADVICE,
        source: 'fallback',
      });
    }

    try {
      // Gemini AIクライアントを初期化
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

      // データを準備
      const limitedTitles = titles.slice(0, 50).join('\n');
      const limitedChannels = [...new Set(channelNames)].slice(0, 20).join(', ');
      const limitedWords = topWords.slice(0, 20).join(', ');

      // 聞いたフレーズTOP5があればそれを使用
      const phrasesInfo = topPhrases && topPhrases.length > 0
        ? topPhrases.map((p, i) => `${i + 1}. "${p.phrase}"${p.meaning ? ` (${p.meaning})` : ''}`).join('\n')
        : '（フレーズ情報なし）';

      const prompt = `あなたは親しみやすい幼児英語教育のAIコーチです。以下はお子様がYouTubeで視聴した動画の情報です。

【視聴動画タイトル】
${limitedTitles}

【視聴チャンネル】
${limitedChannels}

【頻出単語】
${limitedWords}

【聞いたフレーズTOP5】
${phrasesInfo}

上記の情報を分析し、以下の内容を親しみやすいトーンで出力してください。必ずJSON形式で回答してください。

{
  "focusPhrase": "（今週の強化フレーズ。聞いたフレーズTOP5の中から最も象徴的な1つを選ぶか、動画タイトルから抽出した印象的なフレーズ。2-6語程度の英語）",
  "focusPhraseJapanese": "（上記フレーズの日本語訳）",
  "interestAnalysis": "（お子様の興味分析。視聴傾向から今どんなもの（動物、乗り物、魔法、プリンセスなど）にハマっているかを推測。50文字以内）",
  "conversationTip": "（具体的な語りかけ案。強化フレーズを使い、日常のどんなシーン（公園、お風呂、食事時、寝る前など）でお子様に声をかけると効果的かを提案。100文字以内）"
}

【重要な注意事項】
- focusPhraseは聞いたフレーズTOP5から選ぶか、それがない場合は動画タイトルから象徴的なフレーズを抽出してください
- 親御さんが「あ、これ動画で聞いた！」と一致感を持てるフレーズを選んでください
- conversationTipは具体的な場面と声かけ例を含めてください
- 全体的に親しみやすい「AIコーチ」のトーンで書いてください
- JSON形式のみで回答し、他のテキストは含めないでください`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // JSONをパース
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('Failed to parse Gemini response as JSON:', text);
        return NextResponse.json({
          success: true,
          data: FALLBACK_ADVICE,
          source: 'fallback',
        });
      }

      const parsed = JSON.parse(jsonMatch[0]) as WeeklyAdviceResponse;

      // 必須フィールドの検証
      if (!parsed.focusPhrase || !parsed.focusPhraseJapanese || !parsed.interestAnalysis || !parsed.conversationTip) {
        console.error('Gemini response missing required fields:', parsed);
        return NextResponse.json({
          success: true,
          data: FALLBACK_ADVICE,
          source: 'fallback',
        });
      }

      return NextResponse.json({
        success: true,
        data: parsed,
        source: 'gemini',
      });
    } catch (aiError) {
      console.error('Gemini API error:', aiError);
      return NextResponse.json({
        success: true,
        data: FALLBACK_ADVICE,
        source: 'fallback',
      });
    }
  } catch (error) {
    console.error('Generate advice API error:', error);
    return NextResponse.json({
      success: true,
      data: FALLBACK_ADVICE,
      source: 'fallback',
    });
  }
}
