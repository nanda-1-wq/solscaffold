import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import type { ScaffoldFile } from './templates'

export async function buildAndDownloadZip(
  projectName: string,
  files: ScaffoldFile[]
): Promise<void> {
  const zip = new JSZip()
  const root = zip.folder(projectName)
  if (!root) throw new Error('Failed to create zip root folder')

  for (const file of files) {
    root.file(file.path, file.content)
  }

  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  })

  saveAs(blob, `${projectName}.zip`)
}
