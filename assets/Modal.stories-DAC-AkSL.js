var W=Object.defineProperty;var $=(e,t,o)=>t in e?W(e,t,{enumerable:!0,configurable:!0,writable:!0,value:o}):e[t]=o;var i=(e,t,o)=>$(e,typeof t!="symbol"?t+"":t,o);import{j as c}from"./jsx-runtime-CR8kToUD.js";import{r as L,R as m}from"./index-D_eiCwOZ.js";import{d as Y}from"./index-BqxkDl-g.js";import{c as j}from"./index-PmWe_g6L.js";import{p as r}from"./index-BHSVxysL.js";import{b as H}from"./redux-DvQH5oc5.js";import{I as J}from"./index-DUXFFBFE.js";import{w as Q,c as V}from"./I18nProvider-C3sHuns_.js";import{c as X}from"./scrollBlocker-JlXEIk78.js";import"./i18next-TUbu9-IY.js";import"./context-BkADXMS_.js";import"./setPrototypeOf-DiOlr_ig.js";import"./hoist-non-react-statics.cjs-BtOrefUY.js";import"./index-CAcpzrYM.js";import"./react-router-CYZJUDQM.js";import"./tiny-invariant-DsAsvojH.js";import"./index-sjZFYpzB.js";import"./ProductPropTypes-Co0TfPHu.js";import"./CartPropTypes-BC0K_FgD.js";try{let e=typeof window<"u"?window:typeof global<"u"?global:typeof globalThis<"u"?globalThis:typeof self<"u"?self:{},t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]="6cafb0b7-fdbc-47ef-8e62-6acc7f6435f9",e._sentryDebugIdIdentifier="sentry-dbid-6cafb0b7-fdbc-47ef-8e62-6acc7f6435f9")}catch{}const Z={TOGGLE_MODAL:"TOGGLE_MODAL"};function ee(){return{type:Z.TOGGLE_MODAL}}var B={},E={};Object.defineProperty(E,"__esModule",{value:!0});E.FocusTrap=void 0;var p=te(L),C=r;function te(e){if(e&&e.__esModule)return e;var t={};if(e!=null){for(var o in e)if(Object.prototype.hasOwnProperty.call(e,o)){var a=Object.defineProperty&&Object.getOwnPropertyDescriptor?Object.getOwnPropertyDescriptor(e,o):{};a.get||a.set?Object.defineProperty(t,o,a):t[o]=e[o]}}return t.default=e,t}const oe=["a[href]","input:not([disabled])","select:not([disabled])","textarea:not([disabled])","button:not([disabled])",'[tabindex="0"]'],G=({active:e=!0,restoreFocus:t=!1,children:o})=>{const a=(0,p.useRef)(),n=(0,p.useRef)();(0,p.useEffect)(()=>{if(n.current=document.activeElement,!!t)return()=>{n.current.focus()}},[]),(0,p.useEffect)(()=>{e&&d()},[e]);const l=()=>a.current.querySelectorAll(oe.join(", ")),d=()=>{const s=l();s.length&&s[0].focus()},x=s=>{const u=l(),M=u[0],z=document.activeElement===M,T=u[u.length-1],U=document.activeElement===T;if(s.shiftKey&&z){s.preventDefault(),T.focus();return}!s.shiftKey&&U&&(s.preventDefault(),M.focus())},K=s=>{s.keyCode===9&&x(s)};return p.default.createElement("div",{ref:a,onKeyDown:K,className:"ui-focus-trap"},o)};E.FocusTrap=G;G.propTypes={active:C.bool,restoreFocus:C.bool,children:C.node.isRequired};(function(e){Object.defineProperty(e,"__esModule",{value:!0}),Object.defineProperty(e,"FocusTrap",{enumerable:!0,get:function(){return t.FocusTrap}});var t=E})(B);class D extends L.PureComponent{componentDidMount(){this.props.ariaFocus&&this.props.ariaFocus()}render(){const{onClose:t,title:o,children:a,ariaLabelModal:n,ariaLabelClose:l,t:d,showButtonModal:x=!1}=this.props;return c.jsxs("div",{className:"modal-content",role:"dialog","aria-label":d(n),children:[c.jsxs("div",{className:j("modal-content__header",{"modal-content__without-header":!t}),children:[x&&c.jsx("button",{type:"button","data-testid":"modal-close-button",className:"modal-content__close",onClick:t,"aria-label":d(l),children:c.jsx(J,{icon:"close"})}),o&&c.jsx("span",{className:"modal-content__title",children:d(o)})]}),a]})}}D.propTypes={title:r.string,children:r.node.isRequired,onClose:r.func,ariaLabelModal:r.string,ariaLabelClose:r.string,ariaFocus:r.func,t:r.func,showButtonModal:r.bool};D.defaultProps={ariaLabelClose:"dialog_close"};const re=Y.compose(Q)(D),h={SMALL:"small",MEDIUM:"medium",BIG:"big"};class _ extends L.Component{constructor(){super(...arguments);i(this,"scrollBlocker",null);i(this,"componentDidMount",()=>{this.scrollBlocker=X(),this.scrollBlocker.block(),this.props.actions.toggleModal(),document.addEventListener("keydown",this.handleKeyDown)});i(this,"componentWillUnmount",()=>{this.props.actions.toggleModal(),this.scrollBlocker.unBlock(),document.removeEventListener("keydown",this.handleKeyDown)});i(this,"handleKeyDown",o=>{const{onClose:a}=this.props;o.key==="Escape"&&a&&(a(o),o.stopPropagation())});i(this,"handleClickOutside",o=>{const{clickout:a,onClose:n}=this.props;!a||!n||n(o)});i(this,"render",()=>{const{datatest:o,type:a,className:n}=this.props,l=j("modal",{[`modal--${a}`]:a},{[n]:n});return c.jsx(B.FocusTrap,{restoreFocus:!0,children:c.jsxs("div",{className:l,"data-testid":o,children:[c.jsx("div",{"data-testid":"mask",className:"modal__click-outside",onClick:this.handleClickOutside}),c.jsx("div",{children:c.jsx(re,{...this.props})})]})})})}}const ae=e=>({actions:{toggleModal:H(ee,e)}});_.propTypes={children:r.node.isRequired,title:r.string,onClose:r.func,clickout:r.bool,blockScroll:r.bool,isFocusDisabled:r.bool,actions:r.shape({toggleModal:r.func.isRequired}).isRequired,datatest:r.string,type:r.oneOf([h.SMALL,h.MEDIUM,h.BIG]).isRequired,className:r.string};_.defaultProps={clickout:!0,blockScroll:!1,datatest:"modal",type:h.MEDIUM};const ne=V(null,ae)(_),Te={title:"Components / Modal",component:ne,tags:["autodocs"],parameters:{layout:"fullscreen"},args:{open:!0,title:"Confirmar acción",description:"¿Estás seguro de que quieres continuar con esta operación?",primaryLabel:"Confirmar",secondaryLabel:"Cancelar"}},f={},b={args:{title:"Dirección de entrega",description:"Introduce tu dirección para la entrega a domicilio.",primaryLabel:"Guardar",secondaryLabel:"Cancelar",children:m.createElement("div",{style:{display:"flex",flexDirection:"column",gap:12}},m.createElement("input",{placeholder:"Calle y número",style:{padding:"10px 12px",border:"1px solid #ccc",borderRadius:8,fontSize:14}}),m.createElement("input",{placeholder:"Código postal",style:{padding:"10px 12px",border:"1px solid #ccc",borderRadius:8,fontSize:14}}),m.createElement("input",{placeholder:"Ciudad",style:{padding:"10px 12px",border:"1px solid #ccc",borderRadius:8,fontSize:14}}))}},y={args:{title:"Información",description:"Tu pedido ha sido procesado correctamente.",primaryLabel:"Aceptar",secondaryLabel:void 0}},g={args:{title:"Eliminar producto",description:"¿Estás seguro de que quieres eliminar este producto de tu lista? Esta acción no se puede deshacer.",primaryLabel:"Eliminar",secondaryLabel:"Cancelar"}};var v,R,F;f.parameters={...f.parameters,docs:{...(v=f.parameters)==null?void 0:v.docs,source:{originalSource:"{}",...(F=(R=f.parameters)==null?void 0:R.docs)==null?void 0:F.source}}};var O,k,w;b.parameters={...b.parameters,docs:{...(O=b.parameters)==null?void 0:O.docs,source:{originalSource:`{
  args: {
    title: 'Dirección de entrega',
    description: 'Introduce tu dirección para la entrega a domicilio.',
    primaryLabel: 'Guardar',
    secondaryLabel: 'Cancelar',
    children: React.createElement('div', {
      style: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: 12
      }
    }, React.createElement('input', {
      placeholder: 'Calle y número',
      style: {
        padding: '10px 12px',
        border: '1px solid #ccc',
        borderRadius: 8,
        fontSize: 14
      }
    }), React.createElement('input', {
      placeholder: 'Código postal',
      style: {
        padding: '10px 12px',
        border: '1px solid #ccc',
        borderRadius: 8,
        fontSize: 14
      }
    }), React.createElement('input', {
      placeholder: 'Ciudad',
      style: {
        padding: '10px 12px',
        border: '1px solid #ccc',
        borderRadius: 8,
        fontSize: 14
      }
    }))
  }
}`,...(w=(k=b.parameters)==null?void 0:k.docs)==null?void 0:w.source}}};var S,I,q;y.parameters={...y.parameters,docs:{...(S=y.parameters)==null?void 0:S.docs,source:{originalSource:`{
  args: {
    title: 'Información',
    description: 'Tu pedido ha sido procesado correctamente.',
    primaryLabel: 'Aceptar',
    secondaryLabel: undefined
  }
}`,...(q=(I=y.parameters)==null?void 0:I.docs)==null?void 0:q.source}}};var P,A,N;g.parameters={...g.parameters,docs:{...(P=g.parameters)==null?void 0:P.docs,source:{originalSource:`{
  args: {
    title: 'Eliminar producto',
    description: '¿Estás seguro de que quieres eliminar este producto de tu lista? Esta acción no se puede deshacer.',
    primaryLabel: 'Eliminar',
    secondaryLabel: 'Cancelar'
  }
}`,...(N=(A=g.parameters)==null?void 0:A.docs)==null?void 0:N.source}}};const ve=["Default","WithContent","TitleOnly","Danger"];export{g as Danger,f as Default,y as TitleOnly,b as WithContent,ve as __namedExportsOrder,Te as default};
