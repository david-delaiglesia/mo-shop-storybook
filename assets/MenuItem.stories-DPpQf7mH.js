import{j as r}from"./jsx-runtime-CR8kToUD.js";import{R as a}from"./index-D_eiCwOZ.js";try{let e=typeof window<"u"?window:typeof global<"u"?global:typeof globalThis<"u"?globalThis:typeof self<"u"?self:{},s=new e.Error().stack;s&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[s]="527eaa8b-17e9-410f-b37a-40034a3ad0bc",e._sentryDebugIdIdentifier="sentry-dbid-527eaa8b-17e9-410f-b37a-40034a3ad0bc")}catch{}const n=({icon:e="🛒",label:s="Menu item",sublabel:m,badge:u,showArrow:j=!0,disabled:d=!1,onClick:S})=>r.jsxs("button",{className:`menu-item${d?" menu-item--disabled":""}`,onClick:d?void 0:S,disabled:d,type:"button",children:[r.jsx("span",{className:"menu-item__icon",children:e}),r.jsxs("span",{className:"menu-item__label",children:[s,m&&r.jsx("span",{className:"menu-item__sublabel",style:{display:"block"},children:m})]}),u&&r.jsx("span",{className:"menu-item__badge",children:u}),j&&r.jsx("span",{className:"menu-item__arrow",children:"❯"})]}),W={title:"Components / MenuItem",component:n,tags:["autodocs"],parameters:{layout:"padded"},decorators:[e=>a.createElement("div",{style:{maxWidth:360,border:"1px solid #eee",borderRadius:12,overflow:"hidden"}},a.createElement(e,null))],args:{icon:"🛒",label:"Mis pedidos",showArrow:!0}},t={},o={args:{icon:"📍",label:"Dirección de entrega",sublabel:"Calle Gran Vía 12, Madrid"}},c={args:{icon:"🔔",label:"Notificaciones",badge:"3"}},l={args:{icon:"🔒",label:"Opciones bloqueadas",disabled:!0}},i={render:()=>a.createElement("div",null,a.createElement(n,{icon:"🛒",label:"Mis pedidos",badge:"2"}),a.createElement(n,{icon:"📍",label:"Direcciones",sublabel:"3 direcciones guardadas"}),a.createElement(n,{icon:"💳",label:"Métodos de pago"}),a.createElement(n,{icon:"🔔",label:"Notificaciones",badge:"5"}),a.createElement(n,{icon:"⚙️",label:"Configuración"}),a.createElement(n,{icon:"❓",label:"Ayuda"}))};var b,p,g;t.parameters={...t.parameters,docs:{...(b=t.parameters)==null?void 0:b.docs,source:{originalSource:"{}",...(g=(p=t.parameters)==null?void 0:p.docs)==null?void 0:g.source}}};var f,E,M;o.parameters={...o.parameters,docs:{...(f=o.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    icon: '📍',
    label: 'Dirección de entrega',
    sublabel: 'Calle Gran Vía 12, Madrid'
  }
}`,...(M=(E=o.parameters)==null?void 0:E.docs)==null?void 0:M.source}}};var y,h,_;c.parameters={...c.parameters,docs:{...(y=c.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    icon: '🔔',
    label: 'Notificaciones',
    badge: '3'
  }
}`,...(_=(h=c.parameters)==null?void 0:h.docs)==null?void 0:_.source}}};var I,x,D;l.parameters={...l.parameters,docs:{...(I=l.parameters)==null?void 0:I.docs,source:{originalSource:`{
  args: {
    icon: '🔒',
    label: 'Opciones bloqueadas',
    disabled: true
  }
}`,...(D=(x=l.parameters)==null?void 0:x.docs)==null?void 0:D.source}}};var R,N,w;i.parameters={...i.parameters,docs:{...(R=i.parameters)==null?void 0:R.docs,source:{originalSource:`{
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
}`,...(w=(N=i.parameters)==null?void 0:N.docs)==null?void 0:w.source}}};const k=["Default","WithSublabel","WithBadge","Disabled","MenuList"];export{t as Default,l as Disabled,i as MenuList,c as WithBadge,o as WithSublabel,k as __namedExportsOrder,W as default};
