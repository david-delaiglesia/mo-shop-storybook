import{j as e}from"./jsx-runtime-CR8kToUD.js";import{r as j}from"./index-D_eiCwOZ.js";import{w as S}from"./ClickOutHandler-DdM9KlaA.js";import{p as r}from"./index-BHSVxysL.js";try{let n=typeof window<"u"?window:typeof global<"u"?global:typeof globalThis<"u"?globalThis:typeof self<"u"?self:{},o=new n.Error().stack;o&&(n._sentryDebugIds=n._sentryDebugIds||{},n._sentryDebugIds[o]="597fdba1-991c-4899-8ab1-1b6ee99855e8",n._sentryDebugIdIdentifier="sentry-dbid-597fdba1-991c-4899-8ab1-1b6ee99855e8")}catch{}const _=S,O="dropdown__content",s=({header:n,content:o,open:i,toggleDropdown:b,datatest:f,ariaLabel:w,disabled:D})=>e.jsxs("div",{className:"drop-down","data-testid":f,children:[e.jsx("button",{type:"button",className:"drop-down__trigger","aria-haspopup":!0,onClick:b,"data-testid":"dropdown-button","aria-label":w,disabled:D,children:n}),i&&e.jsx("div",{className:O,"data-testid":"dropdown-content",children:o})]});s.defaultProps={datatest:"drop-down"};s.propTypes={content:r.node.isRequired,header:r.node.isRequired,open:r.bool.isRequired,toggleDropdown:r.func.isRequired,datatest:r.string,ariaLabel:r.string,disabled:r.bool};_(s);const C=n=>{const[o,i]=j.useState(!1);return e.jsx(s,{...n,open:o,toggleDropdown:()=>i(!o)})},P={title:"Components / Dropdown",component:s,tags:["autodocs"],parameters:{layout:"padded"}},t={render:()=>e.jsx(C,{header:e.jsx("span",{children:"Tipo de vehículo"}),content:e.jsxs("ul",{style:{listStyle:"none",margin:0,padding:"8px 0"},children:[e.jsx("li",{style:{padding:"8px 16px",cursor:"pointer"},children:"Turismo"}),e.jsx("li",{style:{padding:"8px 16px",cursor:"pointer"},children:"Furgoneta"}),e.jsx("li",{style:{padding:"8px 16px",cursor:"pointer"},children:"Camión"})]}),ariaLabel:"Seleccionar tipo de vehículo"})},a={args:{header:e.jsx("span",{children:"Opciones no disponibles"}),content:e.jsx("div",{children:"Contenido"}),open:!1,toggleDropdown:()=>{},disabled:!0}},d={args:{header:e.jsx("span",{children:"País"}),content:e.jsxs("ul",{style:{listStyle:"none",margin:0,padding:"8px 0"},children:[e.jsx("li",{style:{padding:"8px 16px"},children:"España"}),e.jsx("li",{style:{padding:"8px 16px"},children:"Portugal"}),e.jsx("li",{style:{padding:"8px 16px"},children:"Francia"})]}),open:!0,toggleDropdown:()=>{}}};var p,l,c;t.parameters={...t.parameters,docs:{...(p=t.parameters)==null?void 0:p.docs,source:{originalSource:`{
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
}`,...(c=(l=t.parameters)==null?void 0:l.docs)==null?void 0:c.source}}};var u,g,x;a.parameters={...a.parameters,docs:{...(u=a.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    header: <span>Opciones no disponibles</span>,
    content: <div>Contenido</div>,
    open: false,
    toggleDropdown: () => {},
    disabled: true
  }
}`,...(x=(g=a.parameters)==null?void 0:g.docs)==null?void 0:x.source}}};var m,y,h;d.parameters={...d.parameters,docs:{...(m=d.parameters)==null?void 0:m.docs,source:{originalSource:`{
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
}`,...(h=(y=d.parameters)==null?void 0:y.docs)==null?void 0:h.source}}};const R=["Default","Disabled","OpenByDefault"];export{t as Default,a as Disabled,d as OpenByDefault,R as __namedExportsOrder,P as default};
