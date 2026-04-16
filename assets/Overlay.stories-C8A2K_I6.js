var k=Object.defineProperty;var C=(e,n,o)=>n in e?k(e,n,{enumerable:!0,configurable:!0,writable:!0,value:o}):e[n]=o;var l=(e,n,o)=>C(e,typeof n!="symbol"?n+"":n,o);import{j as t}from"./jsx-runtime-CR8kToUD.js";import{r as O}from"./index-D_eiCwOZ.js";import{p}from"./index-BHSVxysL.js";import{c as I}from"./scrollBlocker-JlXEIk78.js";import"./index-CAcpzrYM.js";import"./index-PmWe_g6L.js";import"./index-sjZFYpzB.js";import"./index-DUXFFBFE.js";import"./index-BqxkDl-g.js";import"./i18next-TUbu9-IY.js";import"./context-BkADXMS_.js";import"./setPrototypeOf-DiOlr_ig.js";import"./hoist-non-react-statics.cjs-BtOrefUY.js";import"./ProductPropTypes-Co0TfPHu.js";import"./CartPropTypes-BC0K_FgD.js";try{let e=typeof window<"u"?window:typeof global<"u"?global:typeof globalThis<"u"?globalThis:typeof self<"u"?self:{},n=new e.Error().stack;n&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[n]="a3815731-4997-4de7-9c84-082ef91fc919",e._sentryDebugIdIdentifier="sentry-dbid-a3815731-4997-4de7-9c84-082ef91fc919")}catch{}const w={OVERLAY_SHOW:"overlay--show"};class d extends O.Component{constructor(){super(...arguments);l(this,"state",{showClass:""});l(this,"overlayBlocker",null)}componentDidMount(){this.scrollBlocker=I(),this.changeOverlayState(this.props.open)}componentDidUpdate(o){const{open:a}=o,{open:c}=this.props;c!==a&&this.changeOverlayState(c)}componentWillUnmount(){this.scrollBlocker.unBlock()}changeOverlayState(o){return o?(this.scrollBlocker.block(),this.setState({showClass:w.OVERLAY_SHOW})):(this.scrollBlocker.unBlock(),this.setState({showClass:""}))}render(){const{onClick:o,children:a}=this.props;return t.jsxs("div",{className:"overlay "+this.state.showClass,"data-testid":"overlay-container",children:[t.jsx("div",{className:"overlay__background","data-testid":"overlay",onClick:o}),a]})}}d.propTypes={children:p.node.isRequired,open:p.bool.isRequired,onClick:p.func};const H={title:"Components/Overlay",component:d,tags:["autodocs"],argTypes:{open:{control:"boolean",description:"Controls overlay visibility"}},parameters:{layout:"fullscreen"}},r={args:{open:!1,children:t.jsx("div",{style:{padding:"20px",background:"white",zIndex:2,position:"relative"},children:"Overlay content"})}},s={args:{open:!0,children:t.jsxs("div",{style:{padding:"40px",background:"white",borderRadius:"8px",zIndex:2,position:"relative",margin:"100px auto",maxWidth:"400px",textAlign:"center"},children:[t.jsx("h3",{children:"Modal Content"}),t.jsx("p",{children:"This content sits on top of the overlay"})]})}},i={render:()=>{const[e,n]=O.useState(!1);return t.jsxs("div",{style:{padding:"20px"},children:[t.jsx("button",{onClick:()=>n(!0),style:{padding:"8px 16px"},children:"Open Overlay"}),t.jsx(d,{open:e,onClick:()=>n(!1),children:t.jsxs("div",{style:{padding:"40px",background:"white",borderRadius:"8px",zIndex:2,position:"relative",margin:"100px auto",maxWidth:"400px",textAlign:"center"},children:[t.jsx("h3",{children:"Click the overlay to close"}),t.jsx("p",{children:"Or click this button:"}),t.jsx("button",{onClick:()=>n(!1),style:{padding:"8px 16px",marginTop:"12px"},children:"Close"})]})})]})}};var h,u,x;r.parameters={...r.parameters,docs:{...(h=r.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    open: false,
    children: <div style={{
      padding: '20px',
      background: 'white',
      zIndex: 2,
      position: 'relative'
    }}>Overlay content</div>
  }
}`,...(x=(u=r.parameters)==null?void 0:u.docs)==null?void 0:x.source}}};var m,g,y;s.parameters={...s.parameters,docs:{...(m=s.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    open: true,
    children: <div style={{
      padding: '40px',
      background: 'white',
      borderRadius: '8px',
      zIndex: 2,
      position: 'relative',
      margin: '100px auto',
      maxWidth: '400px',
      textAlign: 'center'
    }}>
        <h3>Modal Content</h3>
        <p>This content sits on top of the overlay</p>
      </div>
  }
}`,...(y=(g=s.parameters)==null?void 0:g.docs)==null?void 0:y.source}}};var v,f,b;i.parameters={...i.parameters,docs:{...(v=i.parameters)==null?void 0:v.docs,source:{originalSource:`{
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return <div style={{
      padding: '20px'
    }}>
        <button onClick={() => setIsOpen(true)} style={{
        padding: '8px 16px'
      }}>
          Open Overlay
        </button>
        <Overlay open={isOpen} onClick={() => setIsOpen(false)}>
          <div style={{
          padding: '40px',
          background: 'white',
          borderRadius: '8px',
          zIndex: 2,
          position: 'relative',
          margin: '100px auto',
          maxWidth: '400px',
          textAlign: 'center'
        }}>
            <h3>Click the overlay to close</h3>
            <p>Or click this button:</p>
            <button onClick={() => setIsOpen(false)} style={{
            padding: '8px 16px',
            marginTop: '12px'
          }}>
              Close
            </button>
          </div>
        </Overlay>
      </div>;
  }
}`,...(b=(f=i.parameters)==null?void 0:f.docs)==null?void 0:b.source}}};const N=["Closed","Open","Interactive"];export{r as Closed,i as Interactive,s as Open,N as __namedExportsOrder,H as default};
