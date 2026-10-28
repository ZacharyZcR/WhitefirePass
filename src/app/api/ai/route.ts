/**
 * 大模型服务端代理：前端把 OpenAI 兼容的请求发到同源 /api/ai，这里原样转给上游，结果原样返回。
 * 规避浏览器跨域限制，也避免 https 页面访问 http 端点被当作混合内容拦截。
 *
 * 请求体：{ apiUrl, ...chat/completions 的请求体 }，Authorization 头照转。
 */

import { NextRequest, NextResponse } from 'next/server';

const FALLBACK_URL = 'https://api.deepseek.com';

export async function POST(request: NextRequest) {
  try {
    const { apiUrl, ...body } = (await request.json()) as { apiUrl?: string } & Record<string, unknown>;
    const base = (apiUrl || FALLBACK_URL).replace(/\/+$/, '');
    if (!/^https?:\/\//.test(base)) return NextResponse.json({ error: { message: 'apiUrl 必须是 http(s) 地址' } }, { status: 400 });

    const upstream = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: request.headers.get('authorization') ?? '' },
      body: JSON.stringify(body),
    });
    return new NextResponse(await upstream.text(), {
      status: upstream.status,
      headers: { 'Content-Type': upstream.headers.get('content-type') ?? 'application/json' },
    });
  } catch (error) {
    // 上游连不上：按 502 回给前端，前端会当作可重试的错误
    return NextResponse.json({ error: { message: error instanceof Error ? error.message : String(error) } }, { status: 502 });
  }
}
