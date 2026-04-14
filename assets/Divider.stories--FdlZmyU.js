import{j as r}from"./jsx-runtime-CR8kToUD.js";import"./index-D_eiCwOZ.js";try{let e=typeof window<"u"?window:typeof global<"u"?global:typeof globalThis<"u"?globalThis:typeof self<"u"?self:{},o=new e.Error().stack;o&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[o]="8896c374-03fc-4482-85a2-f63486d434a1",e._sentryDebugIdIdentifier="sentry-dbid-8896c374-03fc-4482-85a2-f63486d434a1")}catch{}const v=({orientation:e="horizontal",children:o})=>r.jsxs("div",{className:"divider",role:"separator","aria-orientation":e,children:[r.jsx("div",{className:"divider__separator"}),o&&r.jsx("span",{className:"divider__text subhead1-r",children:o}),r.jsx("div",{className:"divider__separator"})]}),g={title:"System UI/Divider",component:v,tags:["autodocs"],decorators:[e=>r.jsx("div",{style:{width:"400px"},children:r.jsx(e,{})})],argTypes:{orientation:{control:"radio",options:["horizontal","vertical"]}}},t={args:{orientation:"horizontal"}},i={args:{orientation:"horizontal",children:"or"}},n={render:()=>r.jsxs("div",{children:[r.jsx("p",{children:"Section above the divider"}),r.jsx(v,{children:"or"}),r.jsx("p",{children:"Section below the divider"})]})};var s,a,d;t.parameters={...t.parameters,docs:{...(s=t.parameters)==null?void 0:s.docs,source:{originalSource:`{
  args: {
    orientation: 'horizontal'
  }
}`,...(d=(a=t.parameters)==null?void 0:a.docs)==null?void 0:d.source}}};var c,l,p;i.parameters={...i.parameters,docs:{...(c=i.parameters)==null?void 0:c.docs,source:{originalSource:`{
  args: {
    orientation: 'horizontal',
    children: 'or'
  }
}`,...(p=(l=i.parameters)==null?void 0:l.docs)==null?void 0:p.source}}};var h,m,u;n.parameters={...n.parameters,docs:{...(h=n.parameters)==null?void 0:h.docs,source:{originalSource:`{
  render: () => <div>
      <p>Section above the divider</p>
      <Divider>or</Divider>
      <p>Section below the divider</p>
    </div>
}`,...(u=(m=n.parameters)==null?void 0:m.docs)==null?void 0:u.source}}};const b=["Horizontal","WithText","InContext"];export{t as Horizontal,n as InContext,i as WithText,b as __namedExportsOrder,g as default};
