// bilibili.ts - B站 API 工具函数

export interface VideoMeta {
  bvid: string;
  title: string;
  pic: string;
  play: number;
  date: string;
}

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
    const json = await res.json();
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
 * 遇限流时自动重试 1 次（间隔 2 秒）
 */
export async function fetchLatestVideo(uid: string): Promise<VideoMeta | null> {
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
      const json = await res.json();
      if (json.code === 0 && json.data?.list?.vlist?.length > 0) {
        const v = json.data.list.vlist[0];
        return {
          bvid: v.bvid,
          title: v.title,
          pic: v.pic.replace('http://', 'https://'),
          play: v.play ?? 0,
          date: new Date(v.created * 1000).toLocaleDateString('zh-CN'),
        };
      }
      // 非 0 状态码（含限流），延时重试
      if (attempt < 2) {
        console.warn(`[bilibili] 状态码 ${json.code}，2 秒后重试...`);
        await new Promise(r => setTimeout(r, 2000));
        continue;
      }
      console.warn(`[bilibili] 获取最新视频失败 for uid=${uid}:`, json.message || '无视频');
    } catch (e) {
      console.warn(`[bilibili] 获取最新视频失败:`, e);
    }
    break;
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
