export function getPossibleElementByQuerySelector(queryArray, shadowRootMode) {
  if (!queryArray) return
  function queryShadowRoots(host, selector) {
    const matchingElements = []

    function searchShadowRoot(root) {
      const elements = root.querySelectorAll(selector)
      for (const element of elements) {
        matchingElements.push(element)
      }

      const shadowRoots = Array.from(root.querySelectorAll('*'))
        .map((element) => element.shadowRoot)
        .filter((root) => !!root)
      for (const shadowRoot of shadowRoots) {
        searchShadowRoot(shadowRoot)
      }
    }

    if (host.shadowRoot) {
      searchShadowRoot(host.shadowRoot)
    }

    return matchingElements
  }
  for (const query of queryArray) {
    if (query) {
      try {
        let element = null
        if (shadowRootMode) {
          const hostElement = document.querySelector('#app')
          element = queryShadowRoots(hostElement, query)
          element = element[0]
        } else {
          element = document.querySelector(query)
        }
        if (element) {
          return element
        }
      } catch (e) {
        /* empty */
      }
    }
  }
}
