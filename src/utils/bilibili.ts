// bilibili.ts - B站 API 工具函数

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export interface VideoMeta {
  bvid: string;
  title: string;
  pic: string;
  play: number;
  date: string;
}

// ── 缓存 ────────────────────────────────────────────────

const CACHE_DIR = join(process.cwd(), 'src', 'data', '.cache');
const LATEST_VIDEO_CACHE = join(CACHE_DIR, 'latest-video.json');
const CACHE_TTL = 30 * 60 * 1000; // 30 分钟

function ensureCacheDir() {
  if (!existsSync(CACHE_DIR)) {
    mkdirSync(CACHE_DIR, { recursive: true });
  }
}

function readCache(file: string): { data: VideoMeta; timestamp: number } | null {
  try {
    if (existsSync(file)) {
      return JSON.parse(readFileSync(file, 'utf-8'));
    }
  } catch { /* 缓存损坏则忽略 */ }
  return null;
}

function writeCache(file: string, data: VideoMeta) {
  try {
    ensureCacheDir();
    writeFileSync(file, JSON.stringify({ data, timestamp: Date.now() }));
  } catch { /* 写入失败不阻塞 */ }
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
 * 通过 UID 获取用户最新发布的视频（默认取最近 1 条）
 * - 优先使用缓存（30 分钟 TTL）
 * - API 失败时降级为过期缓存
 * - 遇限流自动重试 1 次（间隔 2 秒）
 */
export async function fetchLatestVideo(uid: string): Promise<VideoMeta | null> {
  // 1. 检查有效缓存
  const cached = readCache(LATEST_VIDEO_CACHE);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  // 2. 请求 API
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetch(
        `https://api.bilibili.com/x/space/arc/search?mid=${uid}&ps=1&pn=1&order=pubdate`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': 'https://www.bilibili.com',
          },
        }
      );
      const json = await safeParseJSON(res);
      if (json.code === 0 && json.data?.list?.vlist?.length > 0) {
        const v = json.data.list.vlist[0];
        const data: VideoMeta = {
          bvid: v.bvid,
          title: v.title,
          pic: v.pic.replace('http://', 'https://'),
          play: v.play ?? 0,
          date: new Date(v.created * 1000).toLocaleDateString('zh-CN'),
        };
        writeCache(LATEST_VIDEO_CACHE, data);
        return data;
      }
      // 非 0 状态码（含限流），延时重试
      if (attempt < 2) {
        console.warn(`[bilibili] 状态码 ${json.code}，2 秒后重试...`);
        await new Promise(r => setTimeout(r, 2000));
        continue;
      }
      console.warn(`[bilibili] 获取最新视频失败 for uid=${uid}:`, json.message || '无视频');
    } catch (e) {
      if (attempt < 2) {
        console.warn(`[bilibili] 第 ${attempt} 次请求失败，2 秒后重试...`, e);
        await new Promise(r => setTimeout(r, 2000));
        continue;
      }
      console.warn(`[bilibili] 获取最新视频失败:`, e);
    }
    break;
  }

  // 3. API 失败 → 降级使用过期缓存
  if (cached) {
    console.warn('[bilibili] API 请求失败，降级使用过期缓存');
    return cached.data;
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

/** 浮晓工作室 B站 UID */
export const BILI_UID = '1232406878';
