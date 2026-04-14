import{j as e}from"./jsx-runtime-CR8kToUD.js";import{c as T}from"./index-PmWe_g6L.js";import"./index-D_eiCwOZ.js";try{let r=typeof window<"u"?window:typeof global<"u"?global:typeof globalThis<"u"?globalThis:typeof self<"u"?self:{},n=new r.Error().stack;n&&(r._sentryDebugIds=r._sentryDebugIds||{},r._sentryDebugIds[n]="ddfb3a77-ebb7-44dc-8114-5b74eb6dd326",r._sentryDebugIdIdentifier="sentry-dbid-ddfb3a77-ebb7-44dc-8114-5b74eb6dd326")}catch{}const t=({as:r="div",children:n,className:b,hover:j=!1,...C})=>e.jsx(r,{className:T("card",b,j&&"card--hover"),...C,children:n}),I={title:"System UI/Card",component:t,tags:["autodocs"],argTypes:{hover:{control:"boolean",description:"Enables hover effect on the card"},as:{control:"select",options:["div","section","article","li"],description:"Polymorphic HTML element to render"}}},s={args:{children:e.jsxs("div",{style:{padding:"24px"},children:[e.jsx("h3",{children:"Card Title"}),e.jsx("p",{children:"This is a basic card component used as a container."})]})}},d={args:{hover:!0,children:e.jsxs("div",{style:{padding:"24px"},children:[e.jsx("h3",{children:"Hoverable Card"}),e.jsx("p",{children:"This card has a hover effect. Try hovering over it."})]})}},i={args:{as:"article",children:e.jsxs("div",{style:{padding:"24px"},children:[e.jsx("h3",{children:"Article Card"}),e.jsx("p",{children:"This card renders as an <article> element."})]})}},a={render:()=>e.jsxs("div",{style:{display:"flex",gap:"16px"},children:[e.jsx(t,{hover:!0,children:e.jsxs("div",{style:{padding:"16px"},children:[e.jsx("h4",{children:"Product 1"}),e.jsx("p",{children:"Description"})]})}),e.jsx(t,{hover:!0,children:e.jsxs("div",{style:{padding:"16px"},children:[e.jsx("h4",{children:"Product 2"}),e.jsx("p",{children:"Description"})]})}),e.jsx(t,{hover:!0,children:e.jsxs("div",{style:{padding:"16px"},children:[e.jsx("h4",{children:"Product 3"}),e.jsx("p",{children:"Description"})]})})]})};var c,o,l;s.parameters={...s.parameters,docs:{...(c=s.parameters)==null?void 0:c.docs,source:{originalSource:`{
  args: {
    children: <div style={{
      padding: '24px'
    }}>
        <h3>Card Title</h3>
        <p>This is a basic card component used as a container.</p>
      </div>
  }
}`,...(l=(o=s.parameters)==null?void 0:o.docs)==null?void 0:l.source}}};var p,h,v;d.parameters={...d.parameters,docs:{...(p=d.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    hover: true,
    children: <div style={{
      padding: '24px'
    }}>
        <h3>Hoverable Card</h3>
        <p>This card has a hover effect. Try hovering over it.</p>
      </div>
  }
}`,...(v=(h=d.parameters)==null?void 0:h.docs)==null?void 0:v.source}}};var x,u,g;i.parameters={...i.parameters,docs:{...(x=i.parameters)==null?void 0:x.docs,source:{originalSource:`{
  args: {
    as: 'article',
    children: <div style={{
      padding: '24px'
    }}>
        <h3>Article Card</h3>
        <p>This card renders as an &lt;article&gt; element.</p>
      </div>
  }
}`,...(g=(u=i.parameters)==null?void 0:u.docs)==null?void 0:g.source}}};var m,y,f;a.parameters={...a.parameters,docs:{...(m=a.parameters)==null?void 0:m.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: '16px'
  }}>
      <Card hover>
        <div style={{
        padding: '16px'
      }}>
          <h4>Product 1</h4>
          <p>Description</p>
        </div>
      </Card>
      <Card hover>
        <div style={{
        padding: '16px'
      }}>
          <h4>Product 2</h4>
          <p>Description</p>
        </div>
      </Card>
      <Card hover>
        <div style={{
        padding: '16px'
      }}>
          <h4>Product 3</h4>
          <p>Description</p>
        </div>
      </Card>
    </div>
}`,...(f=(y=a.parameters)==null?void 0:y.docs)==null?void 0:f.source}}};const _=["Default","WithHover","AsArticle","MultipleCards"];export{i as AsArticle,s as Default,a as MultipleCards,d as WithHover,_ as __namedExportsOrder,I as default};
