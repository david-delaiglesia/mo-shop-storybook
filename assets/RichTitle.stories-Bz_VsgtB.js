import{j as o}from"./jsx-runtime-CR8kToUD.js";import{r as I}from"./index-D_eiCwOZ.js";import{p as t}from"./index-BHSVxysL.js";import{b as d}from"./index-BZNHOSKP.js";import{u as R}from"./useTranslation-jnQkdB0s.js";import"./index-PmWe_g6L.js";import"./index-DUXFFBFE.js";import"./context-BkADXMS_.js";try{let e=typeof window<"u"?window:typeof global<"u"?global:typeof globalThis<"u"?globalThis:typeof self<"u"?self:{},a=new e.Error().stack;a&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[a]="b9b50af1-cfd9-4ff3-8651-2753602d1744",e._sentryDebugIdIdentifier="sentry-dbid-b9b50af1-cfd9-4ff3-8651-2753602d1744")}catch{}const C=({labelAction:e,label:a,content:E,showEditButton:T,buttonAction:_,labeldatatest:D,showSecondaryButton:S=!1,secondaryButtonText:A,secondaryButtonAction:N,subtitle:M,...W})=>{const{t:l}=R();return o.jsxs("div",{className:"rich-title",children:[o.jsxs("button",{onClick:e,className:"rich-title-label","data-testid":D,...W,children:[o.jsx("span",{className:"title2-b",children:a}),E]}),T&&o.jsx(d.Button,{variant:"text","aria-label":l("button.edit"),onClick:_,children:l("button.edit")}),S&&o.jsxs(I.Fragment,{children:[o.jsx(d.Button,{variant:"secondary",size:"small",className:"rich-title__button",onClick:N,children:A}),o.jsx("p",{className:"rich-title__subtitle footnote1-r",children:M})]})]})};C.propTypes={content:t.node,label:t.string.isRequired,showEditButton:t.bool,labelAction:t.func,buttonAction:t.func,labeldatatest:t.string.isRequired,showSecondaryButton:t.bool,secondaryButtonText:t.string,secondaryButtonAction:t.func,subtitle:t.string};const c=()=>{},H={title:"Components / RichTitle",component:C,tags:["autodocs"],parameters:{layout:"padded"},args:{label:"Dirección de entrega",labeldatatest:"rich-title-address",labelAction:c}},n={},r={args:{label:"Dirección de entrega",content:o.jsx("span",{className:"footnote1-r",style:{color:"#666"},children:"Calle Gran Vía 12, Madrid"})}},s={args:{label:"Método de pago",showEditButton:!0,buttonAction:c}},i={args:{label:"Franja de entrega",showSecondaryButton:!0,secondaryButtonText:"Cambiar franja",secondaryButtonAction:c,subtitle:"Mañana, 9:00 - 10:00"}};var u,p,m;n.parameters={...n.parameters,docs:{...(u=n.parameters)==null?void 0:u.docs,source:{originalSource:"{}",...(m=(p=n.parameters)==null?void 0:p.docs)==null?void 0:m.source}}};var b,f,g;r.parameters={...r.parameters,docs:{...(b=r.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    label: 'Dirección de entrega',
    content: <span className="footnote1-r" style={{
      color: '#666'
    }}>Calle Gran Vía 12, Madrid</span>
  }
}`,...(g=(f=r.parameters)==null?void 0:f.docs)==null?void 0:g.source}}};var h,y,x;s.parameters={...s.parameters,docs:{...(h=s.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    label: 'Método de pago',
    showEditButton: true,
    buttonAction: noop
  }
}`,...(x=(y=s.parameters)==null?void 0:y.docs)==null?void 0:x.source}}};var B,j,w;i.parameters={...i.parameters,docs:{...(B=i.parameters)==null?void 0:B.docs,source:{originalSource:`{
  args: {
    label: 'Franja de entrega',
    showSecondaryButton: true,
    secondaryButtonText: 'Cambiar franja',
    secondaryButtonAction: noop,
    subtitle: 'Mañana, 9:00 - 10:00'
  }
}`,...(w=(j=i.parameters)==null?void 0:j.docs)==null?void 0:w.source}}};const J=["Default","WithContent","WithEditButton","WithSecondaryButton"];export{n as Default,r as WithContent,s as WithEditButton,i as WithSecondaryButton,J as __namedExportsOrder,H as default};
