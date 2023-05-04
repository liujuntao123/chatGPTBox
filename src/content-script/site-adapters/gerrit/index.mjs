import { cropText } from '../../../utils'

function parseLocation() {
  const url = new URL(location.href)
  const { host, pathname } = url
  const segments = pathname.split('/').filter((segment) => segment)
  const changeId = `${segments[2]}/${segments[3]}/${segments[4]}/${segments[5]}` // 修改这里，只保留segments[3]和segments[4]
  const revisionId = segments[7]
  const baseUrl = `http://${host}/gerrit`
  console.log('changeId', changeId)

  return { baseUrl, changeId: encodeURIComponent(changeId), revisionId: parseInt(revisionId, 10) }
}

async function fetchData({ baseUrl, changeId, revisionId }) {
  const url = `${baseUrl}/changes/${changeId}~${revisionId}/revisions/1/files?parent=1`
  console.log('url', url)
  console.log(
    'url',
    'http://gerrit.ai.cmri.cn:29480/gerrit/changes/JTC%2Fbase%2Ffront%2Fjt-common-frontend-management~94472/revisions/1/files?parent=1',
  )

  try {
    const response = await fetch(url)
    const data = (await response.text()).slice(4)
    const parsedData = JSON.parse(data)
    console.log('parsedData', parsedData)
    return Object.entries(parsedData).map(([key, value]) => ({ path: key, ...value }))
  } catch (error) {
    console.error(`fetchData 请求失败: ${error.message}`)
    return []
  }
}

async function fetchDetails({ baseUrl, changeId, revisionId }, files) {
  const details = {}
  const handledFiles = files.slice(2)

  for (const { path } of handledFiles) {
    const encodedPath = encodeURIComponent(path)
    const url = `${baseUrl}/changes/${changeId}~${revisionId}/revisions/1/files/${encodedPath}/diff?context=ALL&intraline&whitespace=IGNORE_ALL&parent=1`

    try {
      const response = await fetch(url)
      const data = (await response.text()).slice(4)
      details[path] = JSON.parse(data)
    } catch (error) {
      console.error(`fetchDetails 请求失败: ${error.message}`)
    }
  }

  return details
}

function generateResultString(details) {
  let result = ''

  for (const path in details) {
    const diffInfo = details[path]
    const diffHeader = diffInfo.diff_header.join('\n')
    const content = diffInfo.content
      .map((item) => {
        const lines = []
        if (item.a) lines.push(`-${item.a.join('\n-')}`)

        // 如果包含一些上下文的代码，会大幅增加请求文本，导致请求文本被截断
        // if (item.ab) {
        //   if (item.ab.length > 4) {
        //     const head = item.ab.slice(0, 2).join('\n ');
        //     const tail = item.ab.slice(-2).join('\n ');
        //     // console.log('>>>head',head)
        //     // console.log('>>>tail',tail)
        //     lines.push(` ${head}\n ...\n ${tail}`);
        //   } else {
        //     lines.push(` ${item.ab.join('\n ')}`);
        //   }
        // }

        if (item.b) lines.push(`+${item.b.join('\n+')}`)
        return lines.join('\n')
      })
      .join('\n')

    // result += `File: ${path}\n\n${diffHeader}\n${content}\n\n`;
    result += `${diffHeader}\n${content}\n\n`
  }

  return result
}

export default {
  inputQuery: async () => {
    console.log('inputQuery')
    try {
      const { baseUrl, changeId, revisionId } = parseLocation()
      const files = await fetchData({ baseUrl, changeId, revisionId })
      const details = await fetchDetails({ baseUrl, changeId, revisionId }, files)
      const patchData = generateResultString(details)

      if (!patchData) return
      console.log(patchData)

      return cropText(
        `分析这些git commit的内容, 然后总结它们.` +
          `总结的格式如下：` +
          `
        这些commit包含了以下内容：
        {文件名}:{内容}.
        ` +
          `我为你提供的git commit 内容如下:\n${patchData}`,
      )
    } catch (e) {
      console.log(e)
    }
  },
}
