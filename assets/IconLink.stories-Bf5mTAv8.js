import{R as i}from"./index-D_eiCwOZ.js";try{let e=typeof window<"u"?window:typeof global<"u"?global:typeof globalThis<"u"?globalThis:typeof self<"u"?self:{},a=new e.Error().stack;a&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[a]="248fe384-e7c8-408a-95b9-6bdc665f3564",e._sentryDebugIdIdentifier="sentry-dbid-248fe384-e7c8-408a-95b9-6bdc665f3564")}catch{}const R=({icon:e="🔗",label:a="Link",href:l,variant:C="primary",size:d="medium",disabled:m=!1,onClick:T})=>{const V=["icon-link",C==="secondary"?"icon-link--secondary":"",d==="small"?"icon-link--small":"",d==="large"?"icon-link--large":"",m?"icon-link--disabled":""].filter(Boolean).join(" "),x=l?"a":"button",p={className:V,onClick:m?void 0:T};return l&&(p.href=l),i.createElement(x,p,i.createElement("span",{className:"icon-link__icon"},e),i.createElement("span",{className:"icon-link__label"},a))},B={title:"Components / IconLink",component:R,tags:["autodocs"],parameters:{layout:"padded"},args:{icon:"📍",label:"Ver mapa",variant:"primary",size:"medium"}},r={},s={args:{icon:"📞",label:"Contacto",variant:"secondary"}},n={args:{icon:"✏️",label:"Editar",size:"small"}},o={args:{icon:"🛒",label:"Ir al carrito",size:"large"}},c={args:{icon:"🔒",label:"No disponible",disabled:!0}},t={args:{icon:"🌐",label:"Visitar web",href:"#"}};var u,b,g;r.parameters={...r.parameters,docs:{...(u=r.parameters)==null?void 0:u.docs,source:{originalSource:"{}",...(g=(b=r.parameters)==null?void 0:b.docs)==null?void 0:g.source}}};var f,y,k;s.parameters={...s.parameters,docs:{...(f=s.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    icon: '📞',
    label: 'Contacto',
    variant: 'secondary'
  }
}`,...(k=(y=s.parameters)==null?void 0:y.docs)==null?void 0:k.source}}};var S,_,I;n.parameters={...n.parameters,docs:{...(S=n.parameters)==null?void 0:S.docs,source:{originalSource:`{
  args: {
    icon: '✏️',
    label: 'Editar',
    size: 'small'
  }
}`,...(I=(_=n.parameters)==null?void 0:_.docs)==null?void 0:I.source}}};var D,w,E;o.parameters={...o.parameters,docs:{...(D=o.parameters)==null?void 0:D.docs,source:{originalSource:`{
  args: {
    icon: '🛒',
    label: 'Ir al carrito',
    size: 'large'
  }
}`,...(E=(w=o.parameters)==null?void 0:w.docs)==null?void 0:E.source}}};var h,L,N;c.parameters={...c.parameters,docs:{...(h=c.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    icon: '🔒',
    label: 'No disponible',
    disabled: true
  }
}`,...(N=(L=c.parameters)==null?void 0:L.docs)==null?void 0:N.source}}};var v,z,A;t.parameters={...t.parameters,docs:{...(v=t.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    icon: '🌐',
    label: 'Visitar web',
    href: '#'
  }
}`,...(A=(z=t.parameters)==null?void 0:z.docs)==null?void 0:A.source}}};const O=["Default","Secondary","Small","Large","Disabled","AsAnchor"];export{t as AsAnchor,r as Default,c as Disabled,o as Large,s as Secondary,n as Small,O as __namedExportsOrder,B as default};
