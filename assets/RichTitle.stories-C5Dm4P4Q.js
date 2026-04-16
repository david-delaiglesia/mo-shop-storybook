import{j as s}from"./jsx-runtime-CR8kToUD.js";import{r as H}from"./index-D_eiCwOZ.js";import{p as e}from"./index-BHSVxysL.js";import{b as u}from"./index-BZNHOSKP.js";import{u as P}from"./useTranslation-jnQkdB0s.js";import"./index-PmWe_g6L.js";import"./index-DUXFFBFE.js";import"./context-BkADXMS_.js";try{let t=typeof window<"u"?window:typeof global<"u"?global:typeof globalThis<"u"?globalThis:typeof self<"u"?self:{},o=new t.Error().stack;o&&(t._sentryDebugIds=t._sentryDebugIds||{},t._sentryDebugIds[o]="a503867b-545a-4f3d-8422-618b836bf80b",t._sentryDebugIdIdentifier="sentry-dbid-a503867b-545a-4f3d-8422-618b836bf80b")}catch{}const D=({labelAction:t,label:o,content:w,showEditButton:I,buttonAction:E,labeldatatest:L,showSecondaryButton:k=!1,secondaryButtonText:M,secondaryButtonAction:A,subtitle:O,...q})=>{const{t:d}=P();return s.jsxs("div",{className:"rich-title",children:[s.jsxs("button",{onClick:t,className:"rich-title-label","data-testid":L,...q,children:[s.jsx("span",{className:"title2-b",children:o}),w]}),I&&s.jsx(u.Button,{variant:"text","aria-label":d("button.edit"),onClick:E,children:d("button.edit")}),k&&s.jsxs(H.Fragment,{children:[s.jsx(u.Button,{variant:"secondary",size:"small",className:"rich-title__button",onClick:A,children:M}),s.jsx("p",{className:"rich-title__subtitle footnote1-r",children:O})]})]})};D.propTypes={content:e.node,label:e.string.isRequired,showEditButton:e.bool,labelAction:e.func,buttonAction:e.func,labeldatatest:e.string.isRequired,showSecondaryButton:e.bool,secondaryButtonText:e.string,secondaryButtonAction:e.func,subtitle:e.string};const X={title:"Components / RichTitle",component:D,tags:["autodocs"],parameters:{layout:"padded"},args:{title:"Tu carrito de la compra",subtitle:"12 productos seleccionados",icon:"🛒",size:"medium"}},a={},r={args:{title:"Detalles del producto",subtitle:"Leche entera 1L",icon:"📦",size:"small"}},n={args:{title:"Bienvenido a Mercadona Online",subtitle:"Haz tu compra desde casa con entrega a domicilio",icon:"🏠",size:"large"}},i={args:{title:"Mis pedidos recientes",subtitle:"Revisa el estado de tus últimos pedidos",icon:void 0}},c={args:{title:"Pedido confirmado",subtitle:"Recibirás tu pedido mañana entre las 10:00 y las 12:00",icon:"✅",centered:!0}},l={args:{title:"Categorías",icon:"📋",subtitle:void 0}};var m,p,b;a.parameters={...a.parameters,docs:{...(m=a.parameters)==null?void 0:m.docs,source:{originalSource:"{}",...(b=(p=a.parameters)==null?void 0:p.docs)==null?void 0:b.source}}};var g,f,h;r.parameters={...r.parameters,docs:{...(g=r.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    title: 'Detalles del producto',
    subtitle: 'Leche entera 1L',
    icon: '📦',
    size: 'small'
  }
}`,...(h=(f=r.parameters)==null?void 0:f.docs)==null?void 0:h.source}}};var y,x,S;n.parameters={...n.parameters,docs:{...(y=n.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    title: 'Bienvenido a Mercadona Online',
    subtitle: 'Haz tu compra desde casa con entrega a domicilio',
    icon: '🏠',
    size: 'large'
  }
}`,...(S=(x=n.parameters)==null?void 0:x.docs)==null?void 0:S.source}}};var _,j,v;i.parameters={...i.parameters,docs:{...(_=i.parameters)==null?void 0:_.docs,source:{originalSource:`{
  args: {
    title: 'Mis pedidos recientes',
    subtitle: 'Revisa el estado de tus últimos pedidos',
    icon: undefined
  }
}`,...(v=(j=i.parameters)==null?void 0:j.docs)==null?void 0:v.source}}};var N,R,T;c.parameters={...c.parameters,docs:{...(N=c.parameters)==null?void 0:N.docs,source:{originalSource:`{
  args: {
    title: 'Pedido confirmado',
    subtitle: 'Recibirás tu pedido mañana entre las 10:00 y las 12:00',
    icon: '✅',
    centered: true
  }
}`,...(T=(R=c.parameters)==null?void 0:R.docs)==null?void 0:T.source}}};var z,B,C;l.parameters={...l.parameters,docs:{...(z=l.parameters)==null?void 0:z.docs,source:{originalSource:`{
  args: {
    title: 'Categorías',
    icon: '📋',
    subtitle: undefined
  }
}`,...(C=(B=l.parameters)==null?void 0:B.docs)==null?void 0:C.source}}};const Y=["Default","Small","Large","NoIcon","Centered","NoSubtitle"];export{c as Centered,a as Default,n as Large,i as NoIcon,l as NoSubtitle,r as Small,Y as __namedExportsOrder,X as default};
