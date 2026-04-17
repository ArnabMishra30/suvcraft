'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle, Color, FontSize } from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';
import { useEffect, useRef, useState } from 'react';
import Modal from './modal';
import { Iframe, Video, youtubeEmbedUrl } from './tiptap-extensions';

const FONT_SIZES = ['10px', '12px', '14px', '16px', '18px', '20px', '24px', '32px', '48px'];
const COLORS = ['#000000', '#475569', '#dc2626', '#ea580c', '#f59e0b', '#16a34a', '#0ea5e9', '#4f46e5', '#9333ea', '#db2777', '#ffffff'];
const HIGHLIGHTS = ['#fef08a', '#fda4af', '#bbf7d0', '#bfdbfe', '#e9d5ff', '#fed7aa', '#a5f3fc', '#fbcfe8'];

export default function RichTextEditor({ value = '', onChange, minHeight = 160 }) {
  const [fullscreen, setFullscreen] = useState(false);
  const [sourceMode, setSourceMode] = useState(false);
  const [sourceText, setSourceText] = useState(value);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-indigo-600 underline' } }),
      Image,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      FontSize,
      Iframe,
      Video,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value || '',
    immediatelyRender: false,
    editorProps: { attributes: { class: 'focus:outline-none px-3 py-2', style: `min-height:${minHeight}px` } },
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      const out = html === '<p></p>' ? '' : html;
      onChange?.(out);
      setSourceText(out);
    },
  });

  const lastValueRef = useRef(value);
  useEffect(() => {
    if (!editor) return;
    if (value !== lastValueRef.current && value !== editor.getHTML()) {
      editor.commands.setContent(value || '', false);
      lastValueRef.current = value;
      setSourceText(value || '');
    }
  }, [value, editor]);

  useEffect(() => {
    if (!fullscreen) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [fullscreen]);

  function applySource() {
    if (!editor) return;
    editor.commands.setContent(sourceText || '', false);
    onChange?.(sourceText);
    setSourceMode(false);
  }

  if (!editor) {
    return (
      <div className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-400" style={{ minHeight }}>
        Loading editor…
      </div>
    );
  }

  const wrapperCls = fullscreen
    ? 'fixed inset-0 z-[90] bg-white dark:bg-slate-950 flex flex-col'
    : 'rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 overflow-visible';

  return (
    <div className={wrapperCls}>
      <Toolbar
        editor={editor}
        sourceMode={sourceMode}
        toggleSource={() => setSourceMode((s) => !s)}
        fullscreen={fullscreen}
        toggleFullscreen={() => setFullscreen((f) => !f)}
      />
      <div className={`border-t border-slate-200 dark:border-slate-800 ${fullscreen ? 'flex-1 overflow-y-auto' : ''}`}>
        {sourceMode ? (
          <div className="p-2">
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              className="w-full font-mono text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              style={{ minHeight: fullscreen ? 'calc(100vh - 180px)' : minHeight }}
            />
            <div className="mt-2 flex gap-2 justify-end">
              <button type="button" onClick={() => setSourceMode(false)} className="px-3 py-1.5 rounded-md text-sm border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
              <button type="button" onClick={applySource} className="px-3 py-1.5 rounded-md text-sm bg-indigo-600 hover:bg-indigo-500 text-white">Apply</button>
            </div>
          </div>
        ) : (
          <EditorContent editor={editor} />
        )}
      </div>
    </div>
  );
}

function Btn({ active, onClick, title, children, disabled }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`p-1.5 rounded-md text-sm transition disabled:opacity-40 disabled:cursor-not-allowed ${
        active
          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
      }`}
    >
      {children}
    </button>
  );
}

function Sep() { return <span className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-0.5" />; }

function Popover({ open, onClose, children, anchorRef }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target) && !anchorRef?.current?.contains(e.target)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open, onClose, anchorRef]);
  if (!open) return null;
  return (
    <div ref={ref} className="absolute top-full mt-1 z-50 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-2">
      {children}
    </div>
  );
}

function Toolbar({ editor, sourceMode, toggleSource, fullscreen, toggleFullscreen }) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);
  const [hlOpen, setHlOpen] = useState(false);
  const [tableOpen, setTableOpen] = useState(false);
  const colorRef = useRef(null);
  const hlRef = useRef(null);
  const tableRef = useRef(null);

  const headingValue =
    editor.isActive('heading', { level: 1 }) ? 'h1' :
    editor.isActive('heading', { level: 2 }) ? 'h2' :
    editor.isActive('heading', { level: 3 }) ? 'h3' : 'p';

  const currentSize = editor.getAttributes('textStyle').fontSize || '14px';

  return (
    <>
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-slate-50 dark:bg-slate-900">
        <Btn title="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6-6m-6 6l6 6" /></svg>
        </Btn>
        <Btn title="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 10H11a8 8 0 00-8 8v2m18-10l-6-6m6 6l-6 6" /></svg>
        </Btn>
        <Sep />

        <Btn title="Insert/Edit Link" active={editor.isActive('link')} onClick={() => setLinkOpen(true)}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
        </Btn>
        <Btn title="Insert/Edit Image" onClick={() => setImageOpen(true)}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        </Btn>
        <Btn title="Insert/Edit Media" onClick={() => setMediaOpen(true)}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </Btn>
        <Sep />

        <Btn title="Source code" active={sourceMode} onClick={toggleSource}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
        </Btn>
        <Btn title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'} active={fullscreen} onClick={toggleFullscreen}>
          {fullscreen ? (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4M9 9H4M15 9V4M15 9h5M9 15v5M9 15H4M15 15v5M15 15h5" /></svg>
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
          )}
        </Btn>
        <Sep />

        <select
          value={headingValue}
          onChange={(e) => {
            const v = e.target.value;
            if (v === 'p') editor.chain().focus().setParagraph().run();
            else editor.chain().focus().toggleHeading({ level: Number(v.slice(1)) }).run();
          }}
          className="text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2 py-1 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="p">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
        </select>

        <select
          value={FONT_SIZES.includes(currentSize) ? currentSize : '14px'}
          onChange={(e) => editor.chain().focus().setFontSize(e.target.value).run()}
          className="text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2 py-1 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          {FONT_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <Sep />

        <Btn title="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}><span className="font-bold text-sm">B</span></Btn>
        <Btn title="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}><span className="italic text-sm">I</span></Btn>
        <Btn title="Underline" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}><span className="underline text-sm">U</span></Btn>
        <Btn title="Strike" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}><span className="line-through text-sm">S</span></Btn>

        <div ref={colorRef} className="relative">
          <Btn title="Text color" onClick={() => { setColorOpen((v) => !v); setHlOpen(false); setTableOpen(false); }}>
            <span className="inline-flex items-center"><span className="font-bold text-sm leading-none">A</span><span className="block w-3 h-1 mt-0.5" style={{ background: editor.getAttributes('textStyle').color || '#000' }} /></span>
          </Btn>
          <Popover open={colorOpen} onClose={() => setColorOpen(false)} anchorRef={colorRef}>
            <div className="grid grid-cols-6 gap-1 w-44">
              {COLORS.map((c) => (
                <button key={c} type="button" onClick={() => { editor.chain().focus().setColor(c).run(); setColorOpen(false); }} className="w-6 h-6 rounded border border-slate-300 dark:border-slate-700" style={{ background: c }} title={c} />
              ))}
            </div>
            <button type="button" onClick={() => { editor.chain().focus().unsetColor().run(); setColorOpen(false); }} className="mt-2 w-full text-xs px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700">Reset</button>
          </Popover>
        </div>

        <div ref={hlRef} className="relative">
          <Btn title="Highlight" onClick={() => { setHlOpen((v) => !v); setColorOpen(false); setTableOpen(false); }}>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
          </Btn>
          <Popover open={hlOpen} onClose={() => setHlOpen(false)} anchorRef={hlRef}>
            <div className="grid grid-cols-4 gap-1 w-32">
              {HIGHLIGHTS.map((c) => (
                <button key={c} type="button" onClick={() => { editor.chain().focus().setHighlight({ color: c }).run(); setHlOpen(false); }} className="w-6 h-6 rounded border border-slate-300 dark:border-slate-700" style={{ background: c }} title={c} />
              ))}
            </div>
            <button type="button" onClick={() => { editor.chain().focus().unsetHighlight().run(); setHlOpen(false); }} className="mt-2 w-full text-xs px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700">Reset</button>
          </Popover>
        </div>
        <Sep />

        <Btn title="Align left" active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h10M4 18h16" /></svg>
        </Btn>
        <Btn title="Align center" active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M7 12h10M4 18h16" /></svg>
        </Btn>
        <Btn title="Align right" active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M10 12h10M4 18h16" /></svg>
        </Btn>
        <Btn title="Justify" active={editor.isActive({ textAlign: 'justify' })} onClick={() => editor.chain().focus().setTextAlign('justify').run()}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
        </Btn>
        <Sep />

        <Btn title="Bullet list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h.01M4 12h.01M4 18h.01M8 6h12M8 12h12M8 18h12" /></svg>
        </Btn>
        <Btn title="Ordered list" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 6h.01M3 12h.01M3 18h.01M7 6h13M7 12h13M7 18h13" /></svg>
        </Btn>
        <Btn title="Blockquote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M7 8h6v6H7V8zm10 0h-2v6h2V8z" /></svg>
        </Btn>
        <Sep />

        <div ref={tableRef} className="relative">
          <Btn title="Table" active={editor.isActive('table')} onClick={() => { setTableOpen((v) => !v); setColorOpen(false); setHlOpen(false); }}>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18M9 6v12M15 6v12M5 6h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z" /></svg>
          </Btn>
          <Popover open={tableOpen} onClose={() => setTableOpen(false)} anchorRef={tableRef}>
            <div className="w-44">
              <button type="button" onClick={() => { editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(); setTableOpen(false); }} className="w-full text-left px-3 py-1.5 text-sm rounded-md hover:bg-slate-100 dark:hover:bg-slate-800">Insert 3×3 table</button>
              <div className="my-1 border-t border-slate-200 dark:border-slate-800" />
              <button type="button" disabled={!editor.can().addRowBefore()} onClick={() => editor.chain().focus().addRowBefore().run()} className="w-full text-left px-3 py-1.5 text-sm rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40">Row above</button>
              <button type="button" disabled={!editor.can().addRowAfter()} onClick={() => editor.chain().focus().addRowAfter().run()} className="w-full text-left px-3 py-1.5 text-sm rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40">Row below</button>
              <button type="button" disabled={!editor.can().deleteRow()} onClick={() => editor.chain().focus().deleteRow().run()} className="w-full text-left px-3 py-1.5 text-sm rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40">Delete row</button>
              <div className="my-1 border-t border-slate-200 dark:border-slate-800" />
              <button type="button" disabled={!editor.can().addColumnBefore()} onClick={() => editor.chain().focus().addColumnBefore().run()} className="w-full text-left px-3 py-1.5 text-sm rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40">Column left</button>
              <button type="button" disabled={!editor.can().addColumnAfter()} onClick={() => editor.chain().focus().addColumnAfter().run()} className="w-full text-left px-3 py-1.5 text-sm rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40">Column right</button>
              <button type="button" disabled={!editor.can().deleteColumn()} onClick={() => editor.chain().focus().deleteColumn().run()} className="w-full text-left px-3 py-1.5 text-sm rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40">Delete column</button>
              <div className="my-1 border-t border-slate-200 dark:border-slate-800" />
              <button type="button" disabled={!editor.can().toggleHeaderRow()} onClick={() => editor.chain().focus().toggleHeaderRow().run()} className="w-full text-left px-3 py-1.5 text-sm rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40">Toggle header row</button>
              <button type="button" disabled={!editor.can().deleteTable()} onClick={() => { editor.chain().focus().deleteTable().run(); setTableOpen(false); }} className="w-full text-left px-3 py-1.5 text-sm rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 disabled:opacity-40">Delete table</button>
            </div>
          </Popover>
        </div>
        <Sep />

        <Btn title="Clear formatting" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M9 4l-3 11M14 4l-3 11M5 21l14-14" /></svg>
        </Btn>
      </div>

      <LinkDialog open={linkOpen} onClose={() => setLinkOpen(false)} editor={editor} />
      <ImageDialog open={imageOpen} onClose={() => setImageOpen(false)} editor={editor} />
      <MediaDialog open={mediaOpen} onClose={() => setMediaOpen(false)} editor={editor} />
    </>
  );
}

function LinkDialog({ open, onClose, editor }) {
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('_blank');

  useEffect(() => {
    if (!open) return;
    const attrs = editor.getAttributes('link') || {};
    const sel = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(sel.from, sel.to, ' ');
    setUrl(attrs.href || '');
    setText(selectedText || '');
    setTitle(attrs.title || '');
    setTarget(attrs.target || '_blank');
  }, [open, editor]);

  function save() {
    if (!url) { editor.chain().focus().unsetLink().run(); onClose(); return; }
    const chain = editor.chain().focus();
    if (text && editor.state.selection.empty) {
      chain.insertContent(`<a href="${url}" target="${target}" title="${title}">${text}</a>`);
    } else {
      chain.extendMarkRange('link').setLink({ href: url, target, title });
    }
    chain.run();
    onClose();
  }

  const inputCls = 'block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Insert/Edit Link"
      footer={<>
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
        <button type="button" onClick={save} className="px-4 py-2 rounded-md text-sm bg-indigo-600 hover:bg-indigo-500 text-white">Save</button>
      </>}
    >
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">URL</label>
          <input autoFocus value={url} onChange={(e) => setUrl(e.target.value)} className={inputCls} placeholder="https://example.com" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Text to display</label>
          <input value={text} onChange={(e) => setText(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Open link in…</label>
          <select value={target} onChange={(e) => setTarget(e.target.value)} className={inputCls}>
            <option value="_blank">New window</option>
            <option value="_self">Same window</option>
          </select>
        </div>
      </div>
    </Modal>
  );
}

function ImageDialog({ open, onClose, editor }) {
  const [src, setSrc] = useState('');
  const [alt, setAlt] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [locked, setLocked] = useState(true);
  const [aspect, setAspect] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState('');
  const fileRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const a = editor.getAttributes('image') || {};
    setSrc(a.src || ''); setAlt(a.alt || ''); setWidth(a.width || ''); setHeight(a.height || ''); setAspect(null);
    setUploadErr('');
  }, [open, editor]);

  async function onPickFile(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true); setUploadErr('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('kind', 'image');
      const res = await fetch('/api/admin/uploads', { method: 'POST', body: fd });
      const json = await res.json();
      if (json.error) { setUploadErr(json.message || 'Upload failed.'); return; }
      setSrc(json.data.url || `/${json.data.path}`);
    } catch {
      setUploadErr('Network error.');
    } finally {
      setUploading(false);
    }
  }

  useEffect(() => {
    if (!src) return;
    const img = new window.Image();
    img.onload = () => {
      if (img.naturalWidth && img.naturalHeight) {
        setAspect(img.naturalWidth / img.naturalHeight);
        if (!width && !height) { setWidth(String(img.naturalWidth)); setHeight(String(img.naturalHeight)); }
      }
    };
    img.src = src.startsWith('http') || src.startsWith('/') ? src : `/${src.replace(/^\/?/, '')}`;
  }, [src]);

  function changeWidth(v) {
    setWidth(v);
    if (locked && aspect && v) setHeight(String(Math.round(Number(v) / aspect)));
  }
  function changeHeight(v) {
    setHeight(v);
    if (locked && aspect && v) setWidth(String(Math.round(Number(v) * aspect)));
  }

  function save() {
    if (!src) { onClose(); return; }
    const url = src.startsWith('http') || src.startsWith('/') ? src : `/${src.replace(/^\/?/, '')}`;
    const attrs = { src: url, alt };
    if (width) attrs.width = width;
    if (height) attrs.height = height;
    editor.chain().focus().setImage(attrs).run();
    onClose();
  }

  const inputCls = 'block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Insert/Edit Image"
      footer={<>
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
        <button type="button" onClick={save} className="px-4 py-2 rounded-md text-sm bg-indigo-600 hover:bg-indigo-500 text-white">Save</button>
      </>}
    >
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Source</label>
          <div className="flex gap-2">
            <input autoFocus value={src} onChange={(e) => setSrc(e.target.value)} className={inputCls} placeholder="uploads/media/2024/image.jpg or https://…" />
            <input ref={fileRef} type="file" accept="image/*" onChange={onPickFile} className="hidden" />
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} title="Upload from device" className="shrink-0 inline-flex items-center justify-center px-3 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-60">
              {uploading ? (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 9a8 8 0 0114-3m2 9a8 8 0 01-14 3" /></svg>
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12" /></svg>
              )}
            </button>
          </div>
          {uploadErr && <p className="mt-1 text-xs text-red-600">{uploadErr}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Alternative description</label>
          <input value={alt} onChange={(e) => setAlt(e.target.value)} className={inputCls} />
        </div>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Width</label>
            <input type="number" value={width} onChange={(e) => changeWidth(e.target.value)} className={inputCls} />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Height</label>
            <input type="number" value={height} onChange={(e) => changeHeight(e.target.value)} className={inputCls} />
          </div>
          <button type="button" onClick={() => setLocked((v) => !v)} title={locked ? 'Unlock aspect ratio' : 'Lock aspect ratio'} className={`p-2 rounded-md ${locked ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
            {locked ? (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function MediaDialog({ open, onClose, editor }) {
  const [mode, setMode] = useState('upload');
  const [src, setSrc] = useState('');
  const [width, setWidth] = useState('560');
  const [height, setHeight] = useState('315');
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [uploadedName, setUploadedName] = useState('');
  const [uploadErr, setUploadErr] = useState('');
  const fileRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setMode('upload'); setSrc(''); setWidth('560'); setHeight('315');
    setUploadedUrl(''); setUploadedName(''); setUploadErr('');
  }, [open]);

  async function onPickFile(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true); setUploadErr('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('kind', 'video');
      const res = await fetch('/api/admin/uploads', { method: 'POST', body: fd });
      const json = await res.json();
      if (json.error) { setUploadErr(json.message || 'Upload failed.'); return; }
      setUploadedUrl(json.data.url || `/${json.data.path}`);
      setUploadedName(json.data.name || file.name);
    } catch {
      setUploadErr('Network error.');
    } finally {
      setUploading(false);
    }
  }

  function save() {
    if (mode === 'embed') {
      if (!src) { onClose(); return; }
      const embed = youtubeEmbedUrl(src);
      editor.chain().focus().setIframe({ src: embed, width, height }).run();
    } else {
      if (!uploadedUrl) { onClose(); return; }
      editor.chain().focus().setVideo({ src: uploadedUrl, width: width || null, height: height || null, controls: true }).run();
    }
    onClose();
  }

  const inputCls = 'block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Insert/Edit Media"
      footer={<>
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
        <button type="button" onClick={save} className="px-4 py-2 rounded-md text-sm bg-indigo-600 hover:bg-indigo-500 text-white">Save</button>
      </>}
    >
      <div className="space-y-3">
        <div className="inline-flex rounded-lg border border-slate-300 dark:border-slate-700 p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-3 py-1.5 rounded-md font-medium ${mode === 'upload' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            Upload from device
          </button>
          <button
            type="button"
            onClick={() => setMode('embed')}
            className={`px-3 py-1.5 rounded-md font-medium ${mode === 'embed' ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            Embed link
          </button>
        </div>

        {mode === 'embed' ? (
          <div key="embed-section">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Source URL</label>
            <input key="embed-url" autoFocus value={src} onChange={(e) => setSrc(e.target.value)} className={inputCls} placeholder="YouTube / Vimeo / iframe URL" />
            <p className="mt-1 text-xs text-slate-500">YouTube and Vimeo URLs are auto-converted to embeds.</p>
          </div>
        ) : (
          <div key="upload-section">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Video file</label>
            <input key="upload-file" ref={fileRef} type="file" accept="video/mp4,video/webm,video/ogg,video/quicktime" onChange={onPickFile} className="hidden" />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 px-4 py-6 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 disabled:opacity-60"
            >
              {uploading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 9a8 8 0 0114-3m2 9a8 8 0 01-14 3" /></svg>
                  Uploading…
                </>
              ) : uploadedUrl ? (
                <>
                  <svg className="w-5 h-5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  <span className="truncate max-w-[16rem]">{uploadedName}</span>
                  <span className="text-xs text-slate-500">— click to replace</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12" /></svg>
                  Choose video to upload
                </>
              )}
            </button>
            <p className="mt-1 text-xs text-slate-500">MP4, WebM, OGG, MOV — up to 100MB.</p>
            {uploadErr && <p className="mt-1 text-xs text-red-600">{uploadErr}</p>}
          </div>
        )}

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Width</label>
            <input type="number" value={width} onChange={(e) => setWidth(e.target.value)} className={inputCls} placeholder={mode === 'upload' ? 'auto' : '560'} />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Height</label>
            <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className={inputCls} placeholder={mode === 'upload' ? 'auto' : '315'} />
          </div>
        </div>
      </div>
    </Modal>
  );
}