import{j as o}from"./jsx-runtime-CR8kToUD.js";import{r as l}from"./index-D_eiCwOZ.js";try{let e=typeof window<"u"?window:typeof global<"u"?global:typeof globalThis<"u"?globalThis:typeof self<"u"?self:{},r=new e.Error().stack;r&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[r]="b5099b39-17c0-4dac-9a4c-a702dd78720f",e._sentryDebugIdIdentifier="sentry-dbid-b5099b39-17c0-4dac-9a4c-a702dd78720f")}catch{}const S=({triggerLabel:e="Hover me",title:r,content:w="Popover content goes here.",placement:D="bottom",children:z})=>{const[d,s]=l.useState(!1),c=l.useRef(null);return l.useEffect(()=>{const p=N=>{c.current&&!c.current.contains(N.target)&&s(!1)};return document.addEventListener("mousedown",p),()=>document.removeEventListener("mousedown",p)},[]),o.jsxs("div",{className:"popover-wrapper",ref:c,children:[o.jsxs("button",{className:"popover-trigger",onClick:()=>s(!d),onMouseEnter:()=>s(!0),onMouseLeave:()=>s(!1),"aria-haspopup":!0,"aria-expanded":d,children:[e,o.jsx("span",{style:{fontSize:10},children:"▼"})]}),d&&o.jsxs("div",{className:`popover-box popover-box--${D}`,children:[o.jsx("div",{className:"popover-arrow"}),r&&o.jsx("p",{className:"popover-title",children:r}),o.jsx("div",{className:"popover-content",children:z||w})]})]})},C={title:"Components / PopOver",component:S,tags:["autodocs"],parameters:{layout:"centered"},args:{triggerLabel:"Más información",title:"Detalles del envío",content:"Los envíos se realizan de lunes a sábado en horario de 9:00 a 21:00.",placement:"bottom"}},a={},t={args:{placement:"top",triggerLabel:"Ver arriba",title:"Aviso",content:"Este producto tiene disponibilidad limitada."}},n={args:{title:void 0,content:"Entrega estimada: 24-48 horas."}},i={args:{title:"Política de devoluciones",content:"Dispones de 30 días desde la recepción del pedido para realizar devoluciones. Los productos deben estar en su embalaje original y sin abrir. El reembolso se realizará en el mismo método de pago utilizado."}};var u,m,g;a.parameters={...a.parameters,docs:{...(u=a.parameters)==null?void 0:u.docs,source:{originalSource:"{}",...(g=(m=a.parameters)==null?void 0:m.docs)==null?void 0:g.source}}};var b,f,v;t.parameters={...t.parameters,docs:{...(b=t.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    placement: 'top',
    triggerLabel: 'Ver arriba',
    title: 'Aviso',
    content: 'Este producto tiene disponibilidad limitada.'
  }
}`,...(v=(f=t.parameters)==null?void 0:f.docs)==null?void 0:v.source}}};var h,x,y;n.parameters={...n.parameters,docs:{...(h=n.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    title: undefined,
    content: 'Entrega estimada: 24-48 horas.'
  }
}`,...(y=(x=n.parameters)==null?void 0:x.docs)==null?void 0:y.source}}};var E,j,L;i.parameters={...i.parameters,docs:{...(E=i.parameters)==null?void 0:E.docs,source:{originalSource:`{
  args: {
    title: 'Política de devoluciones',
    content: 'Dispones de 30 días desde la recepción del pedido para realizar devoluciones. Los productos deben estar en su embalaje original y sin abrir. El reembolso se realizará en el mismo método de pago utilizado.'
  }
}`,...(L=(j=i.parameters)==null?void 0:j.docs)==null?void 0:L.source}}};const I=["Default","Top","NoTitle","LongContent"];export{a as Default,i as LongContent,n as NoTitle,t as Top,I as __namedExportsOrder,C as default};
