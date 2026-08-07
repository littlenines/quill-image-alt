import { useRef, useState } from 'react'
import type Quill from 'quill'
import type { Delta } from 'quill'
import QuillEditor from './QuillEditor'

function App() {
  const quillRef = useRef<Quill | null>(null)
  const [html, setHtml] = useState('')
  const [delta, setDelta] = useState<Delta | null>(null)

  const handleShowContent = () => {
    const quill = quillRef.current
    if (!quill) return

    setHtml(quill.root.innerHTML)
    setDelta(quill.getContents())
  }

  return (
    <section id="editor-page">
      <h1>Quill Editor</h1>
      <p>Insert an image from the toolbar, then drag its corner handles to resize it.</p>
      <QuillEditor ref={quillRef} />

      <button onClick={handleShowContent} style={{ marginTop: '1rem' }}>
        Show HTML & Delta
      </button>

      {html && (
        <div style={{ marginTop: '2rem' }}>
          <h3>HTML Output</h3>
          <div
            style={{ border: '1px solid #ccc', padding: '10px', background: '#fff' }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      )}

      {delta && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Delta Output</h3>
          <pre style={{ background: '#f9f9f9', padding: '10px', border: '1px solid #ccc', overflowX: 'auto' }}>
            {JSON.stringify(delta, null, 2)}
          </pre>
        </div>
      )}
    </section>
  )
}

export default App
