'use client'

import Editor, { OnMount } from '@monaco-editor/react'

type Props = {
  value: string
  onChange: (val: string) => void
}

export default function IdlEditor({ value, onChange }: Props) {
  const handleMount: OnMount = (editor, monaco) => {
    monaco.editor.defineTheme('solscaffold-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#09090b',
        'editor.foreground': '#e4e4e7',
        'editorLineNumber.foreground': '#52525b',
        'editor.lineHighlightBackground': '#18181b',
        'editor.selectionBackground': '#27272a',
        'editorCursor.foreground': '#fafafa',
      },
    })
    monaco.editor.setTheme('solscaffold-dark')
    editor.focus()
  }

  return (
    <Editor
      height="100%"
      language="json"
      value={value}
      onChange={(val) => onChange(val ?? '')}
      onMount={handleMount}
      options={{
        minimap: { enabled: false },
        fontSize: 13,
        fontFamily: 'monospace',
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        wordWrap: 'on',
        padding: { top: 12, bottom: 12 },
        lineNumbers: 'on',
        // @ts-expect-error monaco json options
        json: {
          schemaValidation: 'error',
          trailingCommas: 'error',
        },
      }}
    />
  )
}
