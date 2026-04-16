import{j as e}from"./jsx-runtime-CR8kToUD.js";import{p as l}from"./index-BHSVxysL.js";import"./index-D_eiCwOZ.js";try{let t=typeof window<"u"?window:typeof global<"u"?global:typeof globalThis<"u"?globalThis:typeof self<"u"?self:{},i=new t.Error().stack;i&&(t._sentryDebugIds=t._sentryDebugIds||{},t._sentryDebugIds[i]="dcb80f31-bd30-41f9-8410-9543635a7d0e",t._sentryDebugIdIdentifier="sentry-dbid-dcb80f31-bd30-41f9-8410-9543635a7d0e")}catch{}const r=({width:t="100%",height:i="100%",...S})=>e.jsx("div",{className:"ui-skeleton",role:"status",style:{width:t,height:i},...S});r.propTypes={width:l.string,height:l.string};const D={title:"System UI/Skeleton",component:r,tags:["autodocs"],argTypes:{width:{control:"text",description:"Width of the skeleton (CSS value)"},height:{control:"text",description:"Height of the skeleton (CSS value)"}}},s={args:{width:"200px",height:"20px"}},d={args:{width:"48px",height:"48px"},decorators:[t=>e.jsx("div",{style:{borderRadius:"50%",overflow:"hidden"},children:e.jsx(t,{})})]},o={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"12px",width:"300px"},children:[e.jsx(r,{width:"300px",height:"180px"}),e.jsx(r,{width:"200px",height:"16px"}),e.jsx(r,{width:"150px",height:"14px"}),e.jsx(r,{width:"80px",height:"32px"})]})},p={render:()=>e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"16px",width:"400px"},children:Array.from({length:4}).map((t,i)=>e.jsxs("div",{style:{display:"flex",gap:"12px",alignItems:"center"},children:[e.jsx(r,{width:"48px",height:"48px"}),e.jsxs("div",{style:{flex:1,display:"flex",flexDirection:"column",gap:"8px"},children:[e.jsx(r,{width:"60%",height:"14px"}),e.jsx(r,{width:"40%",height:"12px"})]})]},i))})};var n,a,h;s.parameters={...s.parameters,docs:{...(n=s.parameters)==null?void 0:n.docs,source:{originalSource:`{
  args: {
    width: '200px',
    height: '20px'
  }
}`,...(h=(a=s.parameters)==null?void 0:a.docs)==null?void 0:h.source}}};var x,c,g;d.parameters={...d.parameters,docs:{...(x=d.parameters)==null?void 0:x.docs,source:{originalSource:`{
  args: {
    width: '48px',
    height: '48px'
  },
  decorators: [Story => <div style={{
    borderRadius: '50%',
    overflow: 'hidden'
  }}>
        <Story />
      </div>]
}`,...(g=(c=d.parameters)==null?void 0:c.docs)==null?void 0:g.source}}};var f,m,u;o.parameters={...o.parameters,docs:{...(f=o.parameters)==null?void 0:f.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '300px'
  }}>
      <Skeleton width="300px" height="180px" />
      <Skeleton width="200px" height="16px" />
      <Skeleton width="150px" height="14px" />
      <Skeleton width="80px" height="32px" />
    </div>
}`,...(u=(m=o.parameters)==null?void 0:m.docs)==null?void 0:u.source}}};var y,w,v;p.parameters={...p.parameters,docs:{...(y=p.parameters)==null?void 0:y.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '400px'
  }}>
      {Array.from({
      length: 4
    }).map((_, i) => <div key={i} style={{
      display: 'flex',
      gap: '12px',
      alignItems: 'center'
    }}>
          <Skeleton width="48px" height="48px" />
          <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
            <Skeleton width="60%" height="14px" />
            <Skeleton width="40%" height="12px" />
          </div>
        </div>)}
    </div>
}`,...(v=(w=p.parameters)==null?void 0:w.docs)==null?void 0:v.source}}};const I=["Default","Circle","CardPlaceholder","ListPlaceholder"];export{o as CardPlaceholder,d as Circle,s as Default,p as ListPlaceholder,I as __namedExportsOrder,D as default};
