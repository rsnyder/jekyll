console.log('index.js');

// convert <code> tags to HTML iframe elements
const convertTags = () => {
  console.log('convertTags');
  let base = document.querySelector('base')?.getAttribute('href')
  document.body.querySelectorAll('p > code').forEach(code => {
    console.log('code', code)
    if (code.textContent === 'breadcrumbs') {
      code.parentElement.replaceWith(makeBreadcrumbs())
      return
    }
    let tokens = []
    code.textContent.replace(/”/g,'"').replace(/”/g,'"').replace(/’/g,"'").match(/[^\s"]+|"([^"]*)"/gmi)?.filter(t => t).forEach(token => {
      if (tokens.length > 0 && tokens[tokens.length-1].indexOf('=') === tokens[tokens.length-1].length-1) tokens[tokens.length-1] = `${tokens[tokens.length-1]}${token}`
      else tokens.push(token)
    })
    let ifcPrefix = location.host === 'localhost:8080' ? '' : 'https://ifc.juncture-digital.org/'
    let parsed = parseCodeEl(code)
    if (!parsed.tag || tagMap[parsed.tag].disabled) return
    if (base) {
      if (!parsed.kwargs) parsed.kwargs = {}
      parsed.kwargs.base = base
    }
    let componentArgs = [...Object.entries(parsed.kwargs || {}).map(([key, value]) => `${key}=${value}`), ...(parsed.booleans || [])].join('&')
    let iframe = document.createElement('iframe')
    if (parsed.id) iframe.id = parsed.id
    if (parsed.class) iframe.className = parsed.class
    if (parsed.style) applyStyle(iframe, parsed.style)
    iframe.setAttribute('allowfullscreen', '')
    iframe.setAttribute('allow', 'clipboard-write')
    iframe.src = `${ifcPrefix}/${parsed.tag}?${componentArgs}`
    code.parentElement.replaceWith(iframe)
  })
}

convertTags()