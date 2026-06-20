/**
 * PDF 生成移动端兼容性检测
 * window.print() 在移动端浏览器（iOS Safari、微信 WebView 等）无法可靠地生成 PDF
 * @returns {boolean} true 表示当前为移动端/微信浏览器，应阻止 PDF 生成
 */
export function shouldBlockPdfOnMobile() {
  const ua = navigator.userAgent;
  const isMobile = /iPhone|iPad|iPod|Android/i.test(ua);
  const isWeChat = /MicroMessenger/i.test(ua);
  return isMobile || isWeChat;
}
