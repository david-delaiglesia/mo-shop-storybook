import{j as r}from"./jsx-runtime-CR8kToUD.js";import{A as n}from"./Arrow-CnlxIOMb.js";import"./index-D_eiCwOZ.js";import"./Icon-BkYp6zYs.js";import"./index-PmWe_g6L.js";import"./index-BHSVxysL.js";try{let e=typeof window<"u"?window:typeof global<"u"?global:typeof globalThis<"u"?globalThis:typeof self<"u"?self:{},c=new e.Error().stack;c&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[c]="808ed40f-c944-423a-8819-e1570aa287d2",e._sentryDebugIdIdentifier="sentry-dbid-808ed40f-c944-423a-8819-e1570aa287d2")}catch{}const E={title:"System UI/Arrow",component:n,tags:["autodocs"],argTypes:{direction:{control:"radio",options:["left","right","up","down"],description:"Direction of the arrow"},isVisible:{control:"boolean",description:"Visibility of the arrow"},disabled:{control:"boolean",description:"Disabled state"},ariaLabel:{control:"text",description:"Accessible label"}},args:{click:()=>alert("Arrow clicked!")}},i={args:{direction:"left",isVisible:!0}},s={args:{direction:"right",isVisible:!0}},t={args:{direction:"right",isVisible:!0,disabled:!0}},o={args:{direction:"right",isVisible:!1}},a={render:()=>r.jsxs("div",{style:{display:"flex",gap:"200px",alignItems:"center"},children:[r.jsx(n,{direction:"left",click:()=>{},isVisible:!0}),r.jsx("span",{children:"Content"}),r.jsx(n,{direction:"right",click:()=>{},isVisible:!0})]})};var d,l,p;i.parameters={...i.parameters,docs:{...(d=i.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    direction: 'left',
    isVisible: true
  }
}`,...(p=(l=i.parameters)==null?void 0:l.docs)==null?void 0:p.source}}};var g,u,m;s.parameters={...s.parameters,docs:{...(g=s.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    direction: 'right',
    isVisible: true
  }
}`,...(m=(u=s.parameters)==null?void 0:u.docs)==null?void 0:m.source}}};var b,f,h;t.parameters={...t.parameters,docs:{...(b=t.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    direction: 'right',
    isVisible: true,
    disabled: true
  }
}`,...(h=(f=t.parameters)==null?void 0:f.docs)==null?void 0:h.source}}};var y,V,w;o.parameters={...o.parameters,docs:{...(y=o.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    direction: 'right',
    isVisible: false
  }
}`,...(w=(V=o.parameters)==null?void 0:V.docs)==null?void 0:w.source}}};var x,D,I;a.parameters={...a.parameters,docs:{...(x=a.parameters)==null?void 0:x.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: '200px',
    alignItems: 'center'
  }}>
      <Arrow direction="left" click={() => {}} isVisible />
      <span>Content</span>
      <Arrow direction="right" click={() => {}} isVisible />
    </div>
}`,...(I=(D=a.parameters)==null?void 0:D.docs)==null?void 0:I.source}}};const L=["Left","Right","Disabled","Hidden","NavigationPair"];export{t as Disabled,o as Hidden,i as Left,a as NavigationPair,s as Right,L as __namedExportsOrder,E as default};
