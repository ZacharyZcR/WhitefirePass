/**
 * DeepSeek API 服务端代理路由
 * 前端通过同源 /api/ai 访问，规避浏览器跨域(CORS)限制，由服务器转发到 DeepSeek RTX Pro。
 */

import { NextRequest, NextResponse } from 'next/server';

const DEEPSEEK_MODEL = 'DeepSeek-V4-Flash-0731';
const DEEPSEEK_BASE_URL = 'http://110.42.47.158:12345/deepseek-v4-rtxpro/v1';

/** 结果统一为 200 外壳，客户端读取内部 status 决定是否重试 */
interface ProxyResult {
  status: number;
  text: string;
  errorMessage: string;
}

/**
 * 解析上游响应。推理模型 content 为空时回退到 reasoning_content。
 * @param response
 */
async function readUpstream(response: Response): Promise<ProxyResult> {
  if (!response.ok) {
    const errorData = (await response.json().catch(() => null)) as {
      error?: { message?: string };
    } | null;
    return {
      status: response.status,
      text: '',
      errorMessage:
        errorData?.error?.message ?? `DeepSeek API 错误 (${response.status})`,
    };
  }

  const data = (await response.json()) as {
    choices?: Array<{
      message?: { content?: string | null; reasoning_content?: string | null };
    }>;
  };
  const message = data.choices?.[0]?.message;
  return {
    status: 200,
    text: (message?.content ?? message?.reasoning_content ?? '').trim(),
    errorMessage: '',
  };
}

/**
 *
 * @param request
 */
export async function POST(request: NextRequest) {
  try {
    const { apiKey, apiUrl, prompt } = (await request.json()) as {
      apiKey?: string;
      apiUrl?: string;
      prompt?: string;
    };

    if (!apiKey || !prompt) {
      return NextResponse.json(
        { error: '缺少 apiKey 或 prompt' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${apiUrl || DEEPSEEK_BASE_URL}/chat/completions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: DEEPSEEK_MODEL,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.9,
          max_tokens: 16384,
        }),
      }
    );

    return NextResponse.json(await readUpstream(response));
  } catch (error) {
    return NextResponse.json({
      status: 500,
      text: '',
      errorMessage: error instanceof Error ? error.message : String(error),
    });
  }
}
