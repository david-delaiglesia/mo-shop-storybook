window.zEmbed ||
  (function () {
    let n,
      o,
      d,
      i,
      s,
      a = [],
      r = document.createElement('iframe')

    ;((window.zEmbed = function () {
      a.push(arguments)
    }),
      (window.zE = window.zE || window.zEmbed),
      (r.src = 'javascript:false'),
      (r.title = ''),
      (r.role = 'presentation'),
      ((r.frameElement || r).style.cssText = 'display: none'),
      (d = document.getElementsByTagName('script')),
      (d = d[d.length - 1]),
      d.parentNode.insertBefore(r, d),
      (i = r.contentWindow),
      (s = i.document))
    try {
      o = s
    } catch {
      ;((n = document.domain),
        (r.src =
          'javascript:var d=document.open();d.domain="' + n + '";void(0);'),
        (o = s))
    }
    ;((o.open()._l = function () {
      let e = this.createElement('script')
      ;(n && (this.domain = n),
        (e.id = 'js-iframe-async'),
        (e.src = 'https://static.zdassets.com/ekr/asset_composer.js'),
        (this.t = +new Date()),
        (this.zendeskHost = import.meta.env.VITE_ZENDESK_DOMAIN),
        (this.zEQueue = a),
        this.body.appendChild(e))
    }),
      o.write('<body onload="document._l();">'),
      o.close())
  })()
