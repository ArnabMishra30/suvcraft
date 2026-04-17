import { Node, mergeAttributes } from '@tiptap/core';

export const Iframe = Node.create({
  name: 'iframe',
  group: 'block',
  atom: true,
  draggable: true,
  addAttributes() {
    return {
      src: { default: null },
      width: { default: '560' },
      height: { default: '315' },
      frameborder: { default: '0' },
      allowfullscreen: { default: 'true' },
    };
  },
  parseHTML() { return [{ tag: 'iframe' }]; },
  renderHTML({ HTMLAttributes }) {
    return ['div', { class: 'tiptap-iframe-wrap' }, ['iframe', mergeAttributes(HTMLAttributes)]];
  },
  addCommands() {
    return {
      setIframe: (attrs) => ({ commands }) => commands.insertContent({ type: this.name, attrs }),
    };
  },
});

export const Video = Node.create({
  name: 'video',
  group: 'block',
  atom: true,
  draggable: true,
  addAttributes() {
    return {
      src: { default: null },
      width: { default: null },
      height: { default: null },
      controls: { default: true, parseHTML: (el) => el.hasAttribute('controls') ? true : false, renderHTML: (a) => (a.controls ? { controls: '' } : {}) },
      poster: { default: null },
    };
  },
  parseHTML() { return [{ tag: 'video' }]; },
  renderHTML({ HTMLAttributes }) {
    return ['div', { class: 'tiptap-video-wrap' }, ['video', mergeAttributes(HTMLAttributes)]];
  },
  addCommands() {
    return {
      setVideo: (attrs) => ({ commands }) => commands.insertContent({ type: this.name, attrs }),
    };
  },
});

export function youtubeEmbedUrl(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([\w-]{11})/);
  if (m) return `https://www.youtube.com/embed/${m[1]}`;
  const v = url.match(/vimeo\.com\/(\d+)/);
  if (v) return `https://player.vimeo.com/video/${v[1]}`;
  return url;
}