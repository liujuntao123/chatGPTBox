import { cropText } from '../../../utils'

export default {
  inputQuery: async () => {
    try {
      const title = document.querySelector('#activity-name')?.textContent
      const description = document.querySelector('#js_content')?.textContent
      if (title && description) {
        const author = document.querySelector('#js_name')?.textContent

        const sidebar = document.querySelector('.qr_code_pc')
        if (sidebar) {
          sidebar.style.right = '-400px'
          sidebar.style.width = '400px'
          sidebar.style.textAlign = 'left'
          sidebar.style.alignItems = 'center'
          sidebar.style.display = 'flex'
          sidebar.style.flexDirection = 'column'
          sidebar.style.background = 'transparent'
        }

        return await cropText(
          `以下是一篇文章,标题是:"${title}",文章来源是:"${author}公众号",内容是:\n"${description}".请将文章总结为若干个要点，格式如下：
          {文章标题}
          ======
          {要点}
          `,
        )
      }
    } catch (e) {
      console.log(e)
    }
  },
}
