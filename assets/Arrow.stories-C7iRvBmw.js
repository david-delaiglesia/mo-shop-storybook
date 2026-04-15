import{j as r}from"./jsx-runtime-CR8kToUD.js";import{I as T}from"./Icon-Bse031qR.js";import{c as C}from"./index-PmWe_g6L.js";import{p as i}from"./index-BHSVxysL.js";import"./index-D_eiCwOZ.js";try{let e=typeof window<"u"?window:typeof global<"u"?global:typeof globalThis<"u"?globalThis:typeof self<"u"?self:{},t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]="876b2f97-a800-4339-8aaf-fa5bddcbe158",e._sentryDebugIdIdentifier="sentry-dbid-876b2f97-a800-4339-8aaf-fa5bddcbe158")}catch{}const s=({direction:e,click:t,ariaLabel:p,isVisible:A,disabled:l})=>{const S=C("arrow",`arrow--${e}`,{hidden:!A},{disabled:l}),_=()=>{l||t()},R=p||`arrow--${e}`;return r.jsx("div",{"aria-hidden":!0,onClick:_,disabled:l,className:S,"aria-label":R,children:r.jsx(T,{icon:"big-chevron"})})};s.propTypes={direction:i.string.isRequired,click:i.func.isRequired,ariaLabel:i.string,isVisible:i.bool,disabled:i.bool};s.defaultProps={isVisible:!0,isDisabled:!1};const H={title:"System UI/Arrow",component:s,tags:["autodocs"],argTypes:{direction:{control:"radio",options:["left","right","up","down"],description:"Direction of the arrow"},isVisible:{control:"boolean",description:"Visibility of the arrow"},disabled:{control:"boolean",description:"Disabled state"},ariaLabel:{control:"text",description:"Accessible label"}},args:{click:()=>alert("Arrow clicked!")}},o={args:{direction:"left",isVisible:!0}},a={args:{direction:"right",isVisible:!0}},n={args:{direction:"right",isVisible:!0,disabled:!0}},c={args:{direction:"right",isVisible:!1}},d={render:()=>r.jsxs("div",{style:{display:"flex",gap:"200px",alignItems:"center"},children:[r.jsx(s,{direction:"left",click:()=>{},isVisible:!0}),r.jsx("span",{children:"Content"}),r.jsx(s,{direction:"right",click:()=>{},isVisible:!0})]})};var b,u,g;o.parameters={...o.parameters,docs:{...(b=o.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    direction: 'left',
    isVisible: true
  }
}`,...(g=(u=o.parameters)==null?void 0:u.docs)==null?void 0:g.source}}};var f,m,h;a.parameters={...a.parameters,docs:{...(f=a.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    direction: 'right',
    isVisible: true
  }
}`,...(h=(m=a.parameters)==null?void 0:m.docs)==null?void 0:h.source}}};var y,w,x;n.parameters={...n.parameters,docs:{...(y=n.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    direction: 'right',
    isVisible: true,
    disabled: true
  }
}`,...(x=(w=n.parameters)==null?void 0:w.docs)==null?void 0:x.source}}};var V,I,k;c.parameters={...c.parameters,docs:{...(V=c.parameters)==null?void 0:V.docs,source:{originalSource:`{
  args: {
    direction: 'right',
    isVisible: false
  }
}`,...(k=(I=c.parameters)==null?void 0:I.docs)==null?void 0:k.source}}};var D,j,v;d.parameters={...d.parameters,docs:{...(D=d.parameters)==null?void 0:D.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: '200px',
    alignItems: 'center'
  }}>
      <Arrow direction="left" click={() => {}} isVisible />
      <span>Content</span>
      <Arrow direction="right" click={() => {}} isVisible />
    </div>
}`,...(v=(j=d.parameters)==null?void 0:j.docs)==null?void 0:v.source}}};const $=["Left","Right","Disabled","Hidden","NavigationPair"];export{n as Disabled,c as Hidden,o as Left,d as NavigationPair,a as Right,$ as __namedExportsOrder,H as default};
