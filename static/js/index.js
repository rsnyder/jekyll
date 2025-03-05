console.log('index.js');

const classes = new Set('left right center medium small box-shadow'.split(' '))
const components = {
  aichat: {
    booleans: 'nocaption',
    positional: 'model'
  },
  'google-book': {
    booleans: 'nocaption',
    positional: 'id caption'
  },
  header: {
    booleans: '',
    positional: '',
    disabled: true
  },
  'ia-book': {
    booleans: 'cover nocaption showannos static',
    positional: 'id caption'
  },
  'iiif-tify': {
    booleans: 'cover nocaption',
    positional: 'manifest caption'
  },
  'iiif-juncture': {
    booleans: 'cover nocaption showannos static',
    positional: 'src caption'
  },
  image: {
    booleans: 'nocaption',
    positional: 'src label'
  },
  map: {
    booleans: 'marker nocaption',
    positional: 'center zoom caption'
  },
  video: {
    booleans: 'nocaption',
    positional: 'src caption',
    disabled: true
  }
}
const tagMap = {}
Object.entries(components).forEach(([tag, attrs]) => {
  tagMap[tag] = { 
    booleans : new Set((attrs.booleans || '').split(' ').filter(s => s)),
    positional: (attrs.positional || '').split(' ').filter(s => s),
    disabled: attrs.disabled || false
  }
})

const camelToKebab = (input) => input.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
const parseCodeEl = (el) => {
  let tokens = []
  el.textContent.replace(/”/g,'"').replace(/”/g,'"').replace(/’/g,"'").match(/[^\s"]+|"([^"]*)"/gmi)?.filter(t => t).forEach(token => {
    if (tokens.length > 0 && tokens[tokens.length-1].indexOf('=') === tokens[tokens.length-1].length-1) tokens[tokens.length-1] = `${tokens[tokens.length-1]}${token}`
    else tokens.push(token)
  })
  let parsed = {}
  let args = {}
  let tokenIdx = 0
  let tagObj
  while (tokenIdx < tokens.length) {
    let token = tokens[tokenIdx].replace(/<em>/g, '_').replace(/<\/em>/g, '_')
    if (token.indexOf('=') > 0 && /^[\w-:]+=/.test(token)) {
      let idx = token.indexOf('=')
      let key = token.slice(0, idx)
      let value = token.slice(idx+1)
      value = value[0] === '"' && value[value.length-1] === '"' ? value.slice(1, -1) : value
      if (key[0] === ':') { // single style
        key = camelToKebab(key.slice(1))
        if (!parsed.style) parsed.style = {}
        parsed.style[key] = value
      } else if (key === 'style') { // multiple styles
        if (!parsed.style) parsed.style = {}
        value.split(';').forEach(style => {
          if (!style) return
          let separatorIdx = style.indexOf(':')
          let k = camelToKebab(style.slice(0,separatorIdx).trim())
          let v = style.slice(separatorIdx+1).trim()
          parsed.style[k] = v
        })
      } else { // kwargs
        if (!parsed.kwargs) parsed.kwargs = {}
        if (parsed.kwargs[key]) parsed.kwargs[key] += ` ${value}`
        else parsed.kwargs[key] = value
      }
    }
    else if (token[0] === '.' || classes.has(token)) {
      let className = token.replace(/^\./,'')
      if (parsed.class) parsed.class += ` ${className}`
      else parsed.class = className
    }
    else if (token[0] === '"') {
      // args.push(token.slice(1,-1))
      args[tokenIdx-1] = token.slice(1,-1)
    }
    else if (/#\w+/.test(token)) parsed['id'] = token.slice(1)
    else if (/^Q\d+$/.test(token) && !parsed.tag) { // entity identifier
      if (!parsed.entities) parsed.entities = []
      parsed.entities.push(token)
    }
    else if (tokenIdx === 0 && !parsed.tag && tagMap[token.replace(/^\./,'')]) {
      parsed.tag = token.replace(/^\./,'')
      tagObj = tagMap[parsed.tag]
    }
    else {
      if (tagObj?.booleans.has(token)) {
        if (!parsed.booleans) parsed.booleans = []
        parsed.booleans.push(token)
      } else {
        // args.push(token)
        args[tokenIdx-1] = token
        /*
        if (tagObj?.positional.length >= tokenIdx) {
          if (!parsed.kwargs) parsed.kwargs = {}
          parsed.kwargs[tagObj.positional[tokenIdx-1]] = token
        }
        else {
          if (!parsed.args) parsed.args = []
          parsed.args.push(token)
        }
        */
      }
    }
    tokenIdx++
  }
  if (tagObj?.positional?.length > 0) {
    for (let idx = 0; idx < tagObj.positional.length; idx++) {
      if (args[idx]) {
        if (!parsed.kwargs) parsed.kwargs = {}
        parsed.kwargs[tagObj.positional[idx]] = args[idx]
        delete args[idx]
      } else {
        break
      }
    }
    parsed.args = Object.values(args)
  }
  // console.log(parsed)
  return parsed
}

// convert <code> tags to HTML iframe elements
const convertTags = (rootEl) => {
  let base = document.querySelector('base')?.getAttribute('href')
  rootEl.querySelectorAll('p > code').forEach(code => {
    let tokens = []
    code.textContent.replace(/”/g,'"').replace(/”/g,'"').replace(/’/g,"'").match(/[^\s"]+|"([^"]*)"/gmi)?.filter(t => t).forEach(token => {
      if (tokens.length > 0 && tokens[tokens.length-1].indexOf('=') === tokens[tokens.length-1].length-1) tokens[tokens.length-1] = `${tokens[tokens.length-1]}${token}`
      else tokens.push(token)
    })
    let ifcPrefix = 'https://ifc.juncture-digital.org/'
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

export { convertTags }