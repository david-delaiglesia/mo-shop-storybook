import{j as e}from"./jsx-runtime-CR8kToUD.js";import"./index-D_eiCwOZ.js";try{let s=typeof window<"u"?window:typeof global<"u"?global:typeof globalThis<"u"?globalThis:typeof self<"u"?self:{},d=new s.Error().stack;d&&(s._sentryDebugIds=s._sentryDebugIds||{},s._sentryDebugIds[d]="50b0563a-d418-4ce8-b48e-f8557697c37b",s._sentryDebugIdIdentifier="sentry-dbid-50b0563a-d418-4ce8-b48e-f8557697c37b")}catch{}const j=[{id:"1",name:"Leche entera Hacendado",price:"0,89 €",badge:"Oferta"},{id:"2",name:"Pan de molde integral",price:"1,15 €"},{id:"3",name:"Aceite de oliva virgen extra",price:"5,99 €",badge:"Top venta"},{id:"4",name:"Yogur natural Hacendado",price:"1,20 €"},{id:"5",name:"Huevos camperos (12ud)",price:"2,79 €"},{id:"6",name:"Agua mineral 6x1,5L",price:"1,98 €"}],y=({title:s="Productos destacados",linkText:d="Ver todos",onLinkClick:x,items:N=j})=>e.jsxs("div",{className:"highlighted-group",children:[e.jsxs("div",{className:"highlighted-group__header",children:[e.jsx("h3",{className:"highlighted-group__title",children:s}),d&&e.jsxs("a",{className:"highlighted-group__link",onClick:x,role:"button",tabIndex:0,children:[d," →"]})]}),e.jsx("div",{className:"highlighted-group__grid",children:N.map(a=>e.jsxs("div",{className:"highlighted-group__card",children:[a.image?e.jsx("img",{className:"highlighted-group__card-img",src:a.image,alt:a.name}):e.jsx("div",{className:"highlighted-group__card-placeholder",children:"🛒"}),e.jsx("div",{className:"highlighted-group__card-name",children:a.name}),a.price&&e.jsx("div",{className:"highlighted-group__card-price",children:a.price}),a.badge&&e.jsx("span",{className:"highlighted-group__card-badge",children:a.badge})]},a.id))})]}),D={title:"Components / HighlightedGroup",component:y,tags:["autodocs"],parameters:{layout:"padded"}},r={},i={args:{title:"Novedades",items:[{id:"1",name:"Kombucha Hacendado",price:"2,10 €",badge:"Nuevo"},{id:"2",name:"Quinoa ecológica",price:"3,49 €"},{id:"3",name:"Tofu ahumado",price:"2,25 €",badge:"Nuevo"}]}},n={args:{title:"Los más vendidos",items:[{id:"1",name:"Producto A",price:"1,50 €",image:"https://picsum.photos/seed/a/120/120"},{id:"2",name:"Producto B",price:"2,30 €",image:"https://picsum.photos/seed/b/120/120"},{id:"3",name:"Producto C",price:"3,99 €",image:"https://picsum.photos/seed/c/120/120",badge:"Oferta"},{id:"4",name:"Producto D",price:"0,99 €",image:"https://picsum.photos/seed/d/120/120"}]}},o={args:{title:"Ofertas de la semana",linkText:void 0}};var t,c,p;r.parameters={...r.parameters,docs:{...(t=r.parameters)==null?void 0:t.docs,source:{originalSource:"{}",...(p=(c=r.parameters)==null?void 0:c.docs)==null?void 0:p.source}}};var m,g,l;i.parameters={...i.parameters,docs:{...(m=i.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    title: 'Novedades',
    items: [{
      id: '1',
      name: 'Kombucha Hacendado',
      price: '2,10 €',
      badge: 'Nuevo'
    }, {
      id: '2',
      name: 'Quinoa ecológica',
      price: '3,49 €'
    }, {
      id: '3',
      name: 'Tofu ahumado',
      price: '2,25 €',
      badge: 'Nuevo'
    }]
  }
}`,...(l=(g=i.parameters)==null?void 0:g.docs)==null?void 0:l.source}}};var h,u,b;n.parameters={...n.parameters,docs:{...(h=n.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    title: 'Los más vendidos',
    items: [{
      id: '1',
      name: 'Producto A',
      price: '1,50 €',
      image: 'https://picsum.photos/seed/a/120/120'
    }, {
      id: '2',
      name: 'Producto B',
      price: '2,30 €',
      image: 'https://picsum.photos/seed/b/120/120'
    }, {
      id: '3',
      name: 'Producto C',
      price: '3,99 €',
      image: 'https://picsum.photos/seed/c/120/120',
      badge: 'Oferta'
    }, {
      id: '4',
      name: 'Producto D',
      price: '0,99 €',
      image: 'https://picsum.photos/seed/d/120/120'
    }]
  }
}`,...(b=(u=n.parameters)==null?void 0:u.docs)==null?void 0:b.source}}};var _,f,v;o.parameters={...o.parameters,docs:{...(_=o.parameters)==null?void 0:_.docs,source:{originalSource:`{
  args: {
    title: 'Ofertas de la semana',
    linkText: undefined
  }
}`,...(v=(f=o.parameters)==null?void 0:f.docs)==null?void 0:v.source}}};const T=["Default","FewItems","WithImages","NoLink"];export{r as Default,i as FewItems,o as NoLink,n as WithImages,T as __namedExportsOrder,D as default};
