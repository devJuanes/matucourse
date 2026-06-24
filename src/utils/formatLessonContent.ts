/** Formatea contenido de lección: markdown ligero + bloques de código. */
export function formatLessonContent(text: string): string {
  const lines = text.split('\n')
  const parts: string[] = []
  let inCode = false
  let codeBuf: string[] = []

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      if (inCode) {
        parts.push(
          `<pre class="bg-[#1c1d1f] text-[#f7f9fa] p-4 text-xs font-mono overflow-x-auto my-3 rounded-sm"><code>${escapeHtml(codeBuf.join('\n'))}</code></pre>`,
        )
        codeBuf = []
        inCode = false
      } else {
        inCode = true
      }
      continue
    }
    if (inCode) {
      codeBuf.push(line)
      continue
    }
    if (line.startsWith('**') && line.endsWith('**')) {
      parts.push(`<strong>${escapeHtml(line.slice(2, -2))}</strong>`)
      continue
    }
    const imgMatch = line.match(/^!\[.*\]\((.+)\)$/)
    if (imgMatch?.[1]) {
      parts.push(`<img src="${escapeHtml(imgMatch[1])}" alt="" class="max-w-full my-3 border border-[#d1d7dc]" />`)
      continue
    }
    parts.push(escapeHtml(line))
  }

  return parts.join('<br/>')
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
