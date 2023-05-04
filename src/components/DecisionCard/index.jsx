import { LightBulbIcon, SearchIcon } from '@primer/octicons-react'
import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import ConversationCard from '../ConversationCard'
import { getPossibleElementByQuerySelector, endsWithQuestionMark } from '../../utils'
import { useTranslation } from 'react-i18next'
import { useConfig } from '../../hooks/use-config.mjs'

function DecisionCard(props) {
  const { t } = useTranslation()
  const [triggered, setTriggered] = useState(false)
  const [render, setRender] = useState(false)
  const config = useConfig(() => {
    setRender(true)
  })

  const question = props.question

  const updatePosition = () => {
    if (!render) return

    const container = props.container
    const siteConfig = props.siteConfig
    container.classList.remove('chatgptbox-sidebar-free')

    if (config.appendQuery) {
      const appendContainer = getPossibleElementByQuerySelector([config.appendQuery])
      if (appendContainer) {
        appendContainer.appendChild(container)
        return
      }
    }

    if (config.prependQuery) {
      const prependContainer = getPossibleElementByQuerySelector([config.prependQuery])
      if (prependContainer) {
        prependContainer.prepend(container)
        return
      }
    }

    if (!siteConfig) return

    if (siteConfig.appendOnBody) {
      const targetElement = getPossibleElementByQuerySelector(
        siteConfig.targetQuery,
        siteConfig.shadowRootMode,
      )
      // 使用 getBoundingClientRect() 方法获取目标元素的边界矩形信息
      var rect = targetElement.getBoundingClientRect()

      // 获取滚动条的偏移量
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop
      var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft

      // 获取目标元素的坐标位置（相对于文档）
      var x = rect.left + scrollLeft
      var y = rect.top + scrollTop

      const width = Math.floor(rect.width)
      const height = Math.floor(rect.height)

      console.log('height', height)

      // 设置元素的定位为 fixed
      container.style.position = 'fixed'

      // 设置元素的位置
      container.style.top = `${y}px` // 设置距离顶部的距离
      container.style.left = `${x + width + 20}px` // 设置距离左侧的距离
      container.style.width = `${width}px`
      container.style.height = `${height}px`
      container.style.overflow = 'auto'
      document.body.append(container)
      return
    }

    if (config.insertAtTop) {
      const resultsContainerQuery = getPossibleElementByQuerySelector(
        siteConfig.resultsContainerQuery,
      )
      if (resultsContainerQuery) resultsContainerQuery.prepend(container)
    } else {
      const sidebarContainer = getPossibleElementByQuerySelector(
        siteConfig.sidebarContainerQuery,
        siteConfig.shadowRootMode,
      )
      if (sidebarContainer) {
        sidebarContainer.prepend(container)
      } else {
        const appendContainer = getPossibleElementByQuerySelector(
          siteConfig.appendContainerQuery,
          siteConfig.shadowRootMode,
        )
        if (appendContainer) {
          container.classList.add('chatgptbox-sidebar-free')
          appendContainer.appendChild(container)
        } else {
          const resultsContainerQuery = getPossibleElementByQuerySelector(
            siteConfig.resultsContainerQuery,
            siteConfig.shadowRootMode,
          )
          if (resultsContainerQuery) resultsContainerQuery.prepend(container)
        }
      }
    }
  }

  useEffect(() => updatePosition(), [config])

  return (
    render && (
      <div data-theme={config.themeMode}>
        {(() => {
          if (question)
            switch (config.triggerMode) {
              case 'always':
                return <ConversationCard session={props.session} question={question} />
              case 'manually':
                if (triggered) {
                  return <ConversationCard session={props.session} question={question} />
                }
                return (
                  <p className="gpt-inner manual-btn" onClick={() => setTriggered(true)}>
                    <span className="icon-and-text">
                      <SearchIcon size="small" /> {t('Ask ChatGPT')}
                    </span>
                  </p>
                )
              case 'questionMark':
                if (endsWithQuestionMark(question.trim())) {
                  return <ConversationCard session={props.session} question={question} />
                }
                if (triggered) {
                  return <ConversationCard session={props.session} question={question} />
                }
                return (
                  <p className="gpt-inner manual-btn" onClick={() => setTriggered(true)}>
                    <span className="icon-and-text">
                      <SearchIcon size="small" /> {t('Ask ChatGPT')}
                    </span>
                  </p>
                )
            }
          else
            return (
              <p className="gpt-inner">
                <span className="icon-and-text">
                  <LightBulbIcon size="small" /> {t('No Input Found')}
                </span>
              </p>
            )
        })()}
      </div>
    )
  )
}

DecisionCard.propTypes = {
  session: PropTypes.object.isRequired,
  question: PropTypes.string.isRequired,
  siteConfig: PropTypes.object.isRequired,
  container: PropTypes.object.isRequired,
}

export default DecisionCard
