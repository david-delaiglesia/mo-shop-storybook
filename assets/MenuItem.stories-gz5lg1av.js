import{j as s}from"./jsx-runtime-CR8kToUD.js";import{N as k}from"./react-router-dom-DxFaF5mZ.js";import{p as o}from"./index-BHSVxysL.js";import{M}from"./react-router-Da7IngNn.js";import"./index-D_eiCwOZ.js";import"./tiny-invariant-DsAsvojH.js";import"./setPrototypeOf-DiOlr_ig.js";import"./hoist-non-react-statics.cjs-BtOrefUY.js";try{let e=typeof window<"u"?window:typeof global<"u"?global:typeof globalThis<"u"?globalThis:typeof self<"u"?self:{},n=new e.Error().stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="4e228d1a-9346-4e2d-9bf6-a1bbd761bd11",e._sentryDebugIdIdentifier="sentry-dbid-4e228d1a-9346-4e2d-9bf6-a1bbd761bd11")}catch{}const r=({exact:e,isActive:n,label:x,link:y})=>s.jsx(k,{exact:e,isActive:n,className:"menu-item subhead1-sb",to:y,children:x});r.propTypes={label:o.string.isRequired,link:o.string.isRequired,exact:o.bool,isActive:o.func};const R={title:"Components / MenuItem",component:r,tags:["autodocs"],parameters:{layout:"padded"},decorators:[e=>s.jsx(M,{children:s.jsx("div",{style:{maxWidth:360,border:"1px solid #eee",borderRadius:12,overflow:"hidden"},children:s.jsx(e,{})})})],args:{label:"Mis pedidos",link:"/orders"}},a={},t={args:{label:"Inicio",link:"/",exact:!0}},i={render:()=>s.jsxs("div",{children:[s.jsx(r,{label:"Mis pedidos",link:"/orders"}),s.jsx(r,{label:"Direcciones",link:"/addresses"}),s.jsx(r,{label:"Métodos de pago",link:"/payment"}),s.jsx(r,{label:"Configuración",link:"/settings"}),s.jsx(r,{label:"Ayuda",link:"/help"})]})};var d,l,c;a.parameters={...a.parameters,docs:{...(d=a.parameters)==null?void 0:d.docs,source:{originalSource:"{}",...(c=(l=a.parameters)==null?void 0:l.docs)==null?void 0:c.source}}};var p,u,m;t.parameters={...t.parameters,docs:{...(p=t.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    label: 'Inicio',
    link: '/',
    exact: true
  }
}`,...(m=(u=t.parameters)==null?void 0:u.docs)==null?void 0:m.source}}};var b,f,g;i.parameters={...i.parameters,docs:{...(b=i.parameters)==null?void 0:b.docs,source:{originalSource:`{
  render: () => <div>
      <MenuItem label="Mis pedidos" link="/orders" />
      <MenuItem label="Direcciones" link="/addresses" />
      <MenuItem label="Métodos de pago" link="/payment" />
      <MenuItem label="Configuración" link="/settings" />
      <MenuItem label="Ayuda" link="/help" />
    </div>
}`,...(g=(f=i.parameters)==null?void 0:f.docs)==null?void 0:g.source}}};const T=["Default","Exact","MenuList"];export{a as Default,t as Exact,i as MenuList,T as __namedExportsOrder,R as default};
