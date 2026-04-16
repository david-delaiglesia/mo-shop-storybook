import{j as S}from"./jsx-runtime-CR8kToUD.js";import{N as v}from"./react-router-dom-CB66kmim.js";import{p as t}from"./index-BHSVxysL.js";import{R as a}from"./index-D_eiCwOZ.js";import"./react-router-CYZJUDQM.js";import"./setPrototypeOf-DiOlr_ig.js";import"./tiny-invariant-DsAsvojH.js";import"./hoist-non-react-statics.cjs-BtOrefUY.js";try{let e=typeof window<"u"?window:typeof global<"u"?global:typeof globalThis<"u"?globalThis:typeof self<"u"?self:{},r=new e.Error().stack;r&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[r]="4899d92c-44c7-460c-b7c9-c8dde0cd9afa",e._sentryDebugIdIdentifier="sentry-dbid-4899d92c-44c7-460c-b7c9-c8dde0cd9afa")}catch{}const n=({exact:e,isActive:r,label:w,link:N})=>S.jsx(v,{exact:e,isActive:r,className:"menu-item subhead1-sb",to:N,children:w});n.propTypes={label:t.string.isRequired,link:t.string.isRequired,exact:t.bool,isActive:t.func};const L={title:"Components / MenuItem",component:n,tags:["autodocs"],parameters:{layout:"padded"},decorators:[e=>a.createElement("div",{style:{maxWidth:360,border:"1px solid #eee",borderRadius:12,overflow:"hidden"}},a.createElement(e,null))],args:{icon:"🛒",label:"Mis pedidos",showArrow:!0}},o={},s={args:{icon:"📍",label:"Dirección de entrega",sublabel:"Calle Gran Vía 12, Madrid"}},c={args:{icon:"🔔",label:"Notificaciones",badge:"3"}},i={args:{icon:"🔒",label:"Opciones bloqueadas",disabled:!0}},l={render:()=>a.createElement("div",null,a.createElement(n,{icon:"🛒",label:"Mis pedidos",badge:"2"}),a.createElement(n,{icon:"📍",label:"Direcciones",sublabel:"3 direcciones guardadas"}),a.createElement(n,{icon:"💳",label:"Métodos de pago"}),a.createElement(n,{icon:"🔔",label:"Notificaciones",badge:"5"}),a.createElement(n,{icon:"⚙️",label:"Configuración"}),a.createElement(n,{icon:"❓",label:"Ayuda"}))};var d,m,u;o.parameters={...o.parameters,docs:{...(d=o.parameters)==null?void 0:d.docs,source:{originalSource:"{}",...(u=(m=o.parameters)==null?void 0:m.docs)==null?void 0:u.source}}};var b,p,g;s.parameters={...s.parameters,docs:{...(b=s.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    icon: '📍',
    label: 'Dirección de entrega',
    sublabel: 'Calle Gran Vía 12, Madrid'
  }
}`,...(g=(p=s.parameters)==null?void 0:p.docs)==null?void 0:g.source}}};var f,E,M;c.parameters={...c.parameters,docs:{...(f=c.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    icon: '🔔',
    label: 'Notificaciones',
    badge: '3'
  }
}`,...(M=(E=c.parameters)==null?void 0:E.docs)==null?void 0:M.source}}};var y,I,R;i.parameters={...i.parameters,docs:{...(y=i.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    icon: '🔒',
    label: 'Opciones bloqueadas',
    disabled: true
  }
}`,...(R=(I=i.parameters)==null?void 0:I.docs)==null?void 0:R.source}}};var h,D,x;l.parameters={...l.parameters,docs:{...(h=l.parameters)==null?void 0:h.docs,source:{originalSource:`{
  render: () => React.createElement('div', null, React.createElement(MenuItem, {
    icon: '🛒',
    label: 'Mis pedidos',
    badge: '2'
  }), React.createElement(MenuItem, {
    icon: '📍',
    label: 'Direcciones',
    sublabel: '3 direcciones guardadas'
  }), React.createElement(MenuItem, {
    icon: '💳',
    label: 'Métodos de pago'
  }), React.createElement(MenuItem, {
    icon: '🔔',
    label: 'Notificaciones',
    badge: '5'
  }), React.createElement(MenuItem, {
    icon: '⚙️',
    label: 'Configuración'
  }), React.createElement(MenuItem, {
    icon: '❓',
    label: 'Ayuda'
  }))
}`,...(x=(D=l.parameters)==null?void 0:D.docs)==null?void 0:x.source}}};const O=["Default","WithSublabel","WithBadge","Disabled","MenuList"];export{o as Default,i as Disabled,l as MenuList,c as WithBadge,s as WithSublabel,O as __namedExportsOrder,L as default};
