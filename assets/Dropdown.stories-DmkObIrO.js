import{j as e}from"./jsx-runtime-CR8kToUD.js";import{r as f}from"./index-D_eiCwOZ.js";import{D as m}from"./Dropdown-RdZOhib1.js";import"./ClickOutHandler-DdM9KlaA.js";import"./index-BHSVxysL.js";try{let n=typeof window<"u"?window:typeof global<"u"?global:typeof globalThis<"u"?globalThis:typeof self<"u"?self:{},r=new n.Error().stack;r&&(n._sentryDebugIds=n._sentryDebugIds||{},n._sentryDebugIds[r]="5c30e282-dd29-462a-987d-dc95f738b549",n._sentryDebugIdIdentifier="sentry-dbid-5c30e282-dd29-462a-987d-dc95f738b549")}catch{}const h=n=>{const[r,y]=f.useState(!1);return e.jsx(m,{...n,open:r,toggleDropdown:()=>y(!r)})},v={title:"Components / Dropdown",component:m,tags:["autodocs"],parameters:{layout:"padded"}},s={render:()=>e.jsx(h,{header:e.jsx("span",{children:"Tipo de vehículo"}),content:e.jsxs("ul",{style:{listStyle:"none",margin:0,padding:"8px 0"},children:[e.jsx("li",{style:{padding:"8px 16px",cursor:"pointer"},children:"Turismo"}),e.jsx("li",{style:{padding:"8px 16px",cursor:"pointer"},children:"Furgoneta"}),e.jsx("li",{style:{padding:"8px 16px",cursor:"pointer"},children:"Camión"})]}),ariaLabel:"Seleccionar tipo de vehículo"})},o={args:{header:e.jsx("span",{children:"Opciones no disponibles"}),content:e.jsx("div",{children:"Contenido"}),open:!1,toggleDropdown:()=>{},disabled:!0}},a={args:{header:e.jsx("span",{children:"País"}),content:e.jsxs("ul",{style:{listStyle:"none",margin:0,padding:"8px 0"},children:[e.jsx("li",{style:{padding:"8px 16px"},children:"España"}),e.jsx("li",{style:{padding:"8px 16px"},children:"Portugal"}),e.jsx("li",{style:{padding:"8px 16px"},children:"Francia"})]}),open:!0,toggleDropdown:()=>{}}};var t,d,p;s.parameters={...s.parameters,docs:{...(t=s.parameters)==null?void 0:t.docs,source:{originalSource:`{
  render: () => <DropdownStateful header={<span>Tipo de vehículo</span>} content={<ul style={{
    listStyle: 'none',
    margin: 0,
    padding: '8px 0'
  }}>
          <li style={{
      padding: '8px 16px',
      cursor: 'pointer'
    }}>Turismo</li>
          <li style={{
      padding: '8px 16px',
      cursor: 'pointer'
    }}>Furgoneta</li>
          <li style={{
      padding: '8px 16px',
      cursor: 'pointer'
    }}>Camión</li>
        </ul>} ariaLabel="Seleccionar tipo de vehículo" />
}`,...(p=(d=s.parameters)==null?void 0:d.docs)==null?void 0:p.source}}};var i,l,c;o.parameters={...o.parameters,docs:{...(i=o.parameters)==null?void 0:i.docs,source:{originalSource:`{
  args: {
    header: <span>Opciones no disponibles</span>,
    content: <div>Contenido</div>,
    open: false,
    toggleDropdown: () => {},
    disabled: true
  }
}`,...(c=(l=o.parameters)==null?void 0:l.docs)==null?void 0:c.source}}};var u,g,x;a.parameters={...a.parameters,docs:{...(u=a.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    header: <span>País</span>,
    content: <ul style={{
      listStyle: 'none',
      margin: 0,
      padding: '8px 0'
    }}>
        <li style={{
        padding: '8px 16px'
      }}>España</li>
        <li style={{
        padding: '8px 16px'
      }}>Portugal</li>
        <li style={{
        padding: '8px 16px'
      }}>Francia</li>
      </ul>,
    open: true,
    toggleDropdown: () => {}
  }
}`,...(x=(g=a.parameters)==null?void 0:g.docs)==null?void 0:x.source}}};const E=["Default","Disabled","OpenByDefault"];export{s as Default,o as Disabled,a as OpenByDefault,E as __namedExportsOrder,v as default};
