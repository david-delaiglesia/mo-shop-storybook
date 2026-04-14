import{j as n}from"./jsx-runtime-CR8kToUD.js";import{r as c}from"./index-D_eiCwOZ.js";try{let e=typeof window<"u"?window:typeof global<"u"?global:typeof globalThis<"u"?globalThis:typeof self<"u"?self:{},t=new e.Error().stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]="d3d46be3-c34e-4704-9c37-02d3185c6109",e._sentryDebugIdIdentifier="sentry-dbid-d3d46be3-c34e-4704-9c37-02d3185c6109")}catch{}const X=({src:e,alt:t="Product image",width:s=400,height:p=400,showBadge:M=!0})=>{const[o,R]=c.useState(!1),[h,k]=c.useState({x:0,y:0}),[E,P]=c.useState("center center"),u=c.useRef(null),L=r=>{if(!u.current)return;const a=u.current.getBoundingClientRect(),f=r.clientX-a.left,x=r.clientY-a.top;k({x:f,y:x});const Z=(f/a.width*100).toFixed(1),T=(x/a.height*100).toFixed(1);P(`${Z}% ${T}%`)},O=()=>R(r=>!r),W=`data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${p}" viewBox="0 0 ${s} ${p}">
      <rect fill="#f0f0f0" width="${s}" height="${p}"/>
      <text fill="#bbb" font-family="Arial" font-size="48" x="50%" y="50%" text-anchor="middle" dy=".35em">&#x1F50D;</text>
    </svg>`)}`;return n.jsxs("div",{ref:u,className:`image-zoomer${o?" image-zoomer--zoomed":""}`,style:{width:s,maxWidth:"100%"},onClick:O,onMouseMove:L,children:[n.jsx("img",{className:"image-zoomer__img",src:e||W,alt:t,style:{transformOrigin:o?E:"center center"},draggable:!1}),!o&&n.jsx("div",{className:"image-zoomer__lens",style:{left:h.x,top:h.y}}),M&&n.jsx("span",{className:"image-zoomer__badge",children:o?"Click to zoom out":"Click to zoom"})]})},U={title:"Components / ImageZoomer",component:X,tags:["autodocs"],parameters:{layout:"centered"},args:{alt:"Producto Mercadona",width:400,height:400,showBadge:!0}},d={},i={args:{src:"https://picsum.photos/seed/mercadona/400/400",alt:"Foto del producto"}},m={args:{width:250,height:250}},g={args:{showBadge:!1}},l={args:{src:"https://picsum.photos/seed/grocery/600/600",width:600,height:600}};var y,w,b;d.parameters={...d.parameters,docs:{...(y=d.parameters)==null?void 0:y.docs,source:{originalSource:"{}",...(b=(w=d.parameters)==null?void 0:w.docs)==null?void 0:b.source}}};var S,z,I;i.parameters={...i.parameters,docs:{...(S=i.parameters)==null?void 0:S.docs,source:{originalSource:`{
  args: {
    src: 'https://picsum.photos/seed/mercadona/400/400',
    alt: 'Foto del producto'
  }
}`,...(I=(z=i.parameters)==null?void 0:z.docs)==null?void 0:I.source}}};var _,v,$;m.parameters={...m.parameters,docs:{...(_=m.parameters)==null?void 0:_.docs,source:{originalSource:`{
  args: {
    width: 250,
    height: 250
  }
}`,...($=(v=m.parameters)==null?void 0:v.docs)==null?void 0:$.source}}};var B,D,j;g.parameters={...g.parameters,docs:{...(B=g.parameters)==null?void 0:B.docs,source:{originalSource:`{
  args: {
    showBadge: false
  }
}`,...(j=(D=g.parameters)==null?void 0:D.docs)==null?void 0:j.source}}};var C,N,F;l.parameters={...l.parameters,docs:{...(C=l.parameters)==null?void 0:C.docs,source:{originalSource:`{
  args: {
    src: 'https://picsum.photos/seed/grocery/600/600',
    width: 600,
    height: 600
  }
}`,...(F=(N=l.parameters)==null?void 0:N.docs)==null?void 0:F.source}}};const q=["Default","WithImage","SmallSize","NoBadge","LargeImage"];export{d as Default,l as LargeImage,g as NoBadge,m as SmallSize,i as WithImage,q as __namedExportsOrder,U as default};
