import pako from 'pako'
import { Readable } from 'stream'
import tar from 'tar-stream'

const defaultMirror = 'https://registry.npmmirror.com'

// 解压缩 .tgz 文件
async function extractTGZ(arrayBuffer) {
  // 解压 gzip
  const ungzipped = pako.ungzip(new Uint8Array(arrayBuffer))

  console.log(ungzipped)

  // 解析 tar
  const extract = tar.extract()
  const files = {}

  extract.on('entry', (header, stream, next) => {
    // console.log('entry', header, stream, next)
    const chunks = []
    stream.on('data', chunk => chunks.push(chunk))
    stream.on('end', () => {
      files[header.name] = new Blob(chunks)
      next()
    })
    stream.resume()
  })

  await new Promise((resolve, reject) => {
    extract.on('finish', resolve)
    extract.on('error', reject)

    const stream = new Readable()
    stream._read = () => {} // No-op
    stream.push(Buffer.from(ungzipped))
    stream.push(null)
    stream.pipe(extract)
  })

  return files
}

// 从解压后的文件中读取 .js 文件内容
async function readJSFiles(files) {
  const jsFiles = {}

  for (const [filename, file] of Object.entries(files)) {
    if (filename.endsWith('.js')) {
      const text = await file.text()
      jsFiles[filename] = text
    }
  }

  return jsFiles
}

export async function fetchTgz(module, mirror = defaultMirror) {
  const res = await fetch(`${mirror}/${module}`).then(res => res.json())
  const versions = Object.keys(res.versions).filter(
    v => v.indexOf('-') === -1 && v.startsWith('2.6'),
  )

  const version = versions[0]
  const tgzUrl = `${mirror}/${module}/-/${module}-${version}.tgz`
  const arrayBuffer = await fetch(tgzUrl).then(res => res.arrayBuffer())
  const files = await extractTGZ(arrayBuffer)
  const jsFiles = await readJSFiles(files)
  return jsFiles
}
