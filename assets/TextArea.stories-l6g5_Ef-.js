var L=Object.defineProperty;var N=(e,s,t)=>s in e?L(e,s,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[s]=t;var m=(e,s,t)=>N(e,typeof s!="symbol"?s+"":s,t);import{j as a}from"./jsx-runtime-CR8kToUD.js";import{r as y}from"./index-D_eiCwOZ.js";import{p as r}from"./index-BHSVxysL.js";import{u as T}from"./useTranslation-jnQkdB0s.js";import"./context-BkADXMS_.js";try{let e=typeof window<"u"?window:typeof global<"u"?global:typeof globalThis<"u"?globalThis:typeof self<"u"?self:{},s=new e.Error().stack;s&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[s]="7f9578d2-3933-4bce-a236-0dae600772e4",e._sentryDebugIdIdentifier="sentry-dbid-7f9578d2-3933-4bce-a236-0dae600772e4")}catch{}class c extends y.PureComponent{constructor(){super();m(this,"statuses",{ACTIVE:"text-area--active",INACTIVE:""});m(this,"counter",{HAS_ERRORS:"text-area__counter--error",IS_FINE:""});this.state={isActive:!1},this.onFocus=this.onFocus.bind(this),this.onBlur=this.onBlur.bind(this)}onFocus(){this.props.onFocus&&this.props.onFocus(),this.setState({isActive:!0})}onBlur(){const t=!!this.props.value;this.setState({isActive:t})}getStatusClassName(){return this.state.isActive||this.props.value?this.statuses.ACTIVE:this.statuses.INACTIVE}getCounterErrorClassName(){const{value:t,maxLength:n}=this.props;return t.length===n?this.counter.HAS_ERRORS:this.counter.IS_FINE}getCounterText(){const{value:t,maxLength:n,t:o}=this.props;return t.length===0?o("comments_max_length_hint",{maxLength:n}):o("comments_current_length_hint",{currentLength:t.length,maxLength:n})}render(){const{label:t,name:n,rows:o,onChange:w,reference:I,value:S,maxLength:E,t:h}=this.props,A=this.getCounterText();return a.jsxs("div",{className:`text-area ${this.getStatusClassName()}`,children:[a.jsx("label",{className:"text-area__label",htmlFor:"text-area",children:h(t)}),a.jsx("textarea",{id:"text-area",className:"text-area__input ym-hide-content","data-testid":"text-area",value:S,"aria-label":h(t),name:n,rows:o,maxLength:E,onFocus:this.onFocus,onBlur:this.onBlur,onChange:w,ref:I}),a.jsx("span",{className:`text-area__counter ${this.getCounterErrorClassName()}`,children:A})]})}}c.propTypes={label:r.string,name:r.string.isRequired,value:r.any,maxLength:r.number.isRequired,rows:r.number,onChange:r.func.isRequired,onFocus:r.func,reference:r.object,t:r.func.isRequired};c.defaultProps={rows:1,value:"",label:""};const j=e=>{const{t:s}=T();return a.jsx(c,{...e,t:s})},W={title:"System UI/TextArea",component:j,tags:["autodocs"],argTypes:{label:{control:"text",description:"Label text"},maxLength:{control:"number",description:"Maximum character length"},rows:{control:"number",description:"Number of visible rows"}},decorators:[e=>a.jsx("div",{style:{width:"400px"},children:a.jsx(e,{})})]},i={args:{label:"Comments",name:"comments",maxLength:200,rows:4,value:"",onChange:()=>{}}},u={args:{label:"Comments",name:"comments",maxLength:200,rows:4,value:"This is some pre-filled text in the textarea.",onChange:()=>{}}},l={render:()=>{const[e,s]=y.useState(""),{t}=T();return a.jsx("div",{style:{width:"400px"},children:a.jsx(c,{label:"Write your feedback",name:"feedback",maxLength:150,rows:4,value:e,onChange:n=>s(n.target.value),t})})}};var d,p,x;i.parameters={...i.parameters,docs:{...(d=i.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    label: 'Comments',
    name: 'comments',
    maxLength: 200,
    rows: 4,
    value: '',
    onChange: () => {}
  }
}`,...(x=(p=i.parameters)==null?void 0:p.docs)==null?void 0:x.source}}};var g,b,f;u.parameters={...u.parameters,docs:{...(g=u.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    label: 'Comments',
    name: 'comments',
    maxLength: 200,
    rows: 4,
    value: 'This is some pre-filled text in the textarea.',
    onChange: () => {}
  }
}`,...(f=(b=u.parameters)==null?void 0:b.docs)==null?void 0:f.source}}};var v,C,_;l.parameters={...l.parameters,docs:{...(v=l.parameters)==null?void 0:v.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('');
    const {
      t
    } = useTranslation();
    return <div style={{
      width: '400px'
    }}>
        <TextArea label="Write your feedback" name="feedback" maxLength={150} rows={4} value={value} onChange={(e: any) => setValue(e.target.value)} t={t} />
      </div>;
  }
}`,...(_=(C=l.parameters)==null?void 0:C.docs)==null?void 0:_.source}}};const q=["Default","WithValue","Interactive"];export{i as Default,l as Interactive,u as WithValue,q as __namedExportsOrder,W as default};
