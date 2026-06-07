import { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { query, systemInstruction } = JSON.parse(event.body || '{}');
    const apiKey = process.env.CUSTOM_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "API kaliti sozlanmagan. Netlify panelida CUSTOM_GEMINI_API_KEY yoki GEMINI_API_KEY o'rnating." }),
      };
    }

    // Direct HTTP request to Google Gemini API (zero-dependency, highly resilient in Netlify Functions)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const apiBody = {
      contents: [
        {
          parts: [
            {
              text: query || ''
            }
          ]
        }
      ],
      systemInstruction: systemInstruction ? {
        parts: [
          {
            text: systemInstruction
          }
        ]
      } : undefined,
      generationConfig: {
        temperature: 0.3
      }
    };

    const apiResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(apiBody)
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      return {
        statusCode: apiResponse.status,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: `Gemini API xatoligi: ${errorText}` })
      };
    }

    const data = await apiResponse.json() as any;
    const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTION'
      },
      body: JSON.stringify({ text: replyText }),
    };
  } catch (error: any) {
    console.error('Chat error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: error.message || 'Ichki xatolik yuz berdi' }),
    };
  }
};
