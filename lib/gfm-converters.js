'use strict'

function cell (content, node) {
  var index = Array.prototype.indexOf.call(node.parentNode.childNodes, node)
  var prefix = ' '
  if (index === 0) prefix = '| '
  return prefix + content + ' |'
}

var highlightRegEx = /highlight highlight-(\S+)/

module.exports = [
  {
    filter: 'br',
    replacement: function () {
      return '\n'
    }
  },
  {
    filter: ['del', 's', 'strike'],
    replacement: function (content) {
      return '~~' + content + '~~'
    }
  },

  {
    filter: function (node) {
      return node.type === 'checkbox' && node.parentNode.nodeName === 'LI'
    },
    replacement: function (content, node) {
      return (node.checked ? '[x]' : '[ ]') + ' '
    }
  },

  {
    filter: ['th', 'td'],
    replacement: function (content, node) {
      return cell(content, node)
    }
  },

  {
    filter: 'tr',
    replacement: function (content) {
      return '\n' + content
    }
  },

  {
    filter: 'table',
    replacement: function (content, node) {
      // check if any of the children contain a THEAD
      let containsThead = false
      for (let childNode of node.childNodes) {
        if (childNode.nodeName === 'THEAD') {
          containsThead = true
        }
      }

      if (containsThead) {
        // if there is a THEAD then the THEAD knows how to render itself
        return '\n\n' + content + '\n\n'
      } else {
        // if there is no THEAD an empty THEAD row has to be added
        let emptyHead = ''
        const firstChildNode = node.childNodes[0]
        const maybeTBody = firstChildNode.childNodes[0]
        if (maybeTBody) {
          for (let i = 0; i < maybeTBody.childNodes.length; i++) {
            emptyHead += cell('---', maybeTBody.childNodes[i])
          }
        }
        return '\n\n' + emptyHead + content + '\n\n'
      }
    }
  },

  {
    filter: 'thead',
    replacement: function (content, node) {
      let result = ''
      const alignMap = { left: ':--', right: '--:', center: ':-:' }
      const firstChildNode = node.childNodes[0]
      if (firstChildNode) {
        for (let i = 0; i < firstChildNode.childNodes.length; i++) {
          var align = firstChildNode.childNodes[i].attributes.align
          var border = '---'

          if (align) border = alignMap[align.value] || border

          result += cell(border, firstChildNode.childNodes[i])
        }
      }
      return content + '\n' + result
    }
  },

  {
    filter: 'tbody',
    replacement: function (content) {
      return content
    }
  },

  {
    filter: 'tfoot',
    replacement: function (content) {
      return content
    }
  },

  // Fenced code blocks
  {
    filter: function (node) {
      return node.nodeName === 'PRE' &&
      node.firstChild &&
      node.firstChild.nodeName === 'CODE'
    },
    replacement: function (content, node) {
      return '\n\n```\n' + node.firstChild.textContent + '\n```\n\n'
    }
  },

  // Syntax-highlighted code blocks
  {
    filter: function (node) {
      return node.nodeName === 'PRE' &&
      node.parentNode.nodeName === 'DIV' &&
      highlightRegEx.test(node.parentNode.className)
    },
    replacement: function (content, node) {
      var language = node.parentNode.className.match(highlightRegEx)[1]
      return '\n\n```' + language + '\n' + node.textContent + '\n```\n\n'
    }
  },

  {
    filter: function (node) {
      return node.nodeName === 'DIV' &&
      highlightRegEx.test(node.className)
    },
    replacement: function (content) {
      return '\n\n' + content + '\n\n'
    }
  }
]
