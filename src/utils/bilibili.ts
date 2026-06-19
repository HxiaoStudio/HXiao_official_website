// bilibili.ts - B站 API 工具函数

export interface VideoMeta {
  bvid: string;
  title: string;
  pic: string;
  play: number;
  date: string;
}

// ── 工具 ────────────────────────────────────────────────

/**
 * 安全的 JSON 解析：先检查 Content-Type，避免把 HTML 验证页当 JSON 解析
 */
async function safeParseJSON(res: Response): Promise<any> {
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await res.text().catch(() => '');
    throw new Error(
      `B站 API 返回非 JSON（Content-Type: ${contentType}），可能被反爬拦截。` +
      `响应前 120 字符: ${text.slice(0, 120)}`
    );
  }
  return res.json();
}

// ── API ─────────────────────────────────────────────────

/**
 * 通过 BVID 从 B站 API 获取视频元数据（仅在服务端构建时调用）
 */
export async function fetchVideoMeta(bvid: string): Promise<VideoMeta | null> {
  try {
    const res = await fetch(`https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.bilibili.com',
      },
    });
    const json = await safeParseJSON(res);
    if (json.code === 0) {
      const d = json.data;
      return {
        bvid: d.bvid,
        title: d.title,
        pic: d.pic.replace('http://', 'https://'),
        play: d.stat?.view ?? 0,
        date: new Date(d.pubdate * 1000).toLocaleDateString('zh-CN'),
      };
    }
    console.warn(`[bilibili] B站 API 返回 code=${json.code} for ${bvid}: ${json.message}`);
  } catch (e) {
    console.warn(`[bilibili] 获取视频信息失败 ${bvid}:`, e);
  }
  return null;
}

/**
 * 格式化播放量
 */
export function formatPlay(num: number): string {
  if (num >= 10000) return (num / 10000).toFixed(1) + '万';
  return num.toLocaleString();
}
