import{j as o}from"./jsx-runtime-CR8kToUD.js";import"./index-D_eiCwOZ.js";try{let t=typeof window<"u"?window:typeof global<"u"?global:typeof globalThis<"u"?globalThis:typeof self<"u"?self:{},n=new t.Error().stack;n&&(t._sentryDebugIds=t._sentryDebugIds||{},t._sentryDebugIds[n]="c77394ff-4438-4e66-b16b-4a78e80df51c",t._sentryDebugIdIdentifier="sentry-dbid-c77394ff-4438-4e66-b16b-4a78e80df51c")}catch{}var e=(t=>(t.TOP="top",t.BOTTOM="bottom",t.LEFT="left",t.RIGHT="right",t))(e||{});const B=({children:t,tooltipPosition:n="bottom",title:l,text:H,...I})=>o.jsxs("div",{className:"tooltip",...I,children:[t,o.jsxs("div",{className:`tooltip-text ${n}`,role:"tooltip",children:[l&&o.jsx("p",{className:"subhead1-b",children:l}),o.jsx("p",{className:"subhead1-r",children:H})]})]}),_={title:"Components/Tooltip",component:B,tags:["autodocs"],argTypes:{tooltipPosition:{control:"select",options:Object.values(e),description:"Position of the tooltip relative to the trigger"},text:{control:"text",description:"Tooltip text content"},title:{control:"text",description:"Optional tooltip title"}},decorators:[t=>o.jsx("div",{style:{padding:"100px",display:"flex",justifyContent:"center"},children:o.jsx(t,{})})]},s={args:{tooltipPosition:e.BOTTOM,text:"This is a tooltip message",children:o.jsx("button",{style:{padding:"8px 16px"},children:"Hover me"})}},i={args:{tooltipPosition:e.TOP,text:"Tooltip on top",children:o.jsx("button",{style:{padding:"8px 16px"},children:"Hover me"})}},r={args:{tooltipPosition:e.LEFT,text:"Tooltip on the left",children:o.jsx("button",{style:{padding:"8px 16px"},children:"Hover me"})}},a={args:{tooltipPosition:e.RIGHT,text:"Tooltip on the right",children:o.jsx("button",{style:{padding:"8px 16px"},children:"Hover me"})}},p={args:{tooltipPosition:e.BOTTOM,title:"Important Info",text:"This tooltip has both a title and description text.",children:o.jsx("button",{style:{padding:"8px 16px"},children:"Hover for details"})}};var d,c,x;s.parameters={...s.parameters,docs:{...(d=s.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    tooltipPosition: TooltipPosition.BOTTOM,
    text: 'This is a tooltip message',
    children: <button style={{
      padding: '8px 16px'
    }}>Hover me</button>
  }
}`,...(x=(c=s.parameters)==null?void 0:c.docs)==null?void 0:x.source}}};var m,u,h;i.parameters={...i.parameters,docs:{...(m=i.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    tooltipPosition: TooltipPosition.TOP,
    text: 'Tooltip on top',
    children: <button style={{
      padding: '8px 16px'
    }}>Hover me</button>
  }
}`,...(h=(u=i.parameters)==null?void 0:u.docs)==null?void 0:h.source}}};var g,T,b;r.parameters={...r.parameters,docs:{...(g=r.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    tooltipPosition: TooltipPosition.LEFT,
    text: 'Tooltip on the left',
    children: <button style={{
      padding: '8px 16px'
    }}>Hover me</button>
  }
}`,...(b=(T=r.parameters)==null?void 0:T.docs)==null?void 0:b.source}}};var f,y,P;a.parameters={...a.parameters,docs:{...(f=a.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    tooltipPosition: TooltipPosition.RIGHT,
    text: 'Tooltip on the right',
    children: <button style={{
      padding: '8px 16px'
    }}>Hover me</button>
  }
}`,...(P=(y=a.parameters)==null?void 0:y.docs)==null?void 0:P.source}}};var v,O,j;p.parameters={...p.parameters,docs:{...(v=p.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    tooltipPosition: TooltipPosition.BOTTOM,
    title: 'Important Info',
    text: 'This tooltip has both a title and description text.',
    children: <button style={{
      padding: '8px 16px'
    }}>Hover for details</button>
  }
}`,...(j=(O=p.parameters)==null?void 0:O.docs)==null?void 0:j.source}}};const w=["Bottom","Top","Left","Right","WithTitle"];export{s as Bottom,r as Left,a as Right,i as Top,p as WithTitle,w as __namedExportsOrder,_ as default};
