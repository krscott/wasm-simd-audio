var De=Object.defineProperty;var We=(t,e,n)=>e in t?De(t,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):t[e]=n;var M=(t,e,n)=>(We(t,typeof e!="symbol"?e+"":e,n),n);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))_(o);new MutationObserver(o=>{for(const r of o)if(r.type==="childList")for(const s of r.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&_(s)}).observe(document,{childList:!0,subtree:!0});function n(o){const r={};return o.integrity&&(r.integrity=o.integrity),o.referrerpolicy&&(r.referrerPolicy=o.referrerpolicy),o.crossorigin==="use-credentials"?r.credentials="include":o.crossorigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function _(o){if(o.ep)return;o.ep=!0;const r=n(o);fetch(o.href,r)}})();var te,a,xe,O,se,X={},Ae=[],je=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;function H(t,e){for(var n in e)t[n]=e[n];return t}function Se(t){var e=t.parentNode;e&&e.removeChild(t)}function qe(t,e,n){var _,o,r,s={};for(r in e)r=="key"?_=e[r]:r=="ref"?o=e[r]:s[r]=e[r];if(arguments.length>2&&(s.children=arguments.length>3?te.call(arguments,2):n),typeof t=="function"&&t.defaultProps!=null)for(r in t.defaultProps)s[r]===void 0&&(s[r]=t.defaultProps[r]);return j(t,s,_,o,null)}function j(t,e,n,_,o){var r={type:t,props:e,key:n,ref:_,__k:null,__:null,__b:0,__e:null,__d:void 0,__c:null,__h:null,constructor:void 0,__v:o==null?++xe:o};return o==null&&a.vnode!=null&&a.vnode(r),r}function D(t){return t.children}function q(t,e){this.props=t,this.context=e}function L(t,e){if(e==null)return t.__?L(t.__,t.__.__k.indexOf(t)+1):null;for(var n;e<t.__k.length;e++)if((n=t.__k[e])!=null&&n.__e!=null)return n.__e;return typeof t.type=="function"?L(t):null}function Ce(t){var e,n;if((t=t.__)!=null&&t.__c!=null){for(t.__e=t.__c.base=null,e=0;e<t.__k.length;e++)if((n=t.__k[e])!=null&&n.__e!=null){t.__e=t.__c.base=n.__e;break}return Ce(t)}}function ce(t){(!t.__d&&(t.__d=!0)&&O.push(t)&&!Y.__r++||se!==a.debounceRendering)&&((se=a.debounceRendering)||setTimeout)(Y)}function Y(){for(var t;Y.__r=O.length;)t=O.sort(function(e,n){return e.__v.__b-n.__v.__b}),O=[],t.some(function(e){var n,_,o,r,s,l;e.__d&&(s=(r=(n=e).__v).__e,(l=n.__P)&&(_=[],(o=H({},r)).__v=r.__v+1,oe(l,r,o,n.__n,l.ownerSVGElement!==void 0,r.__h!=null?[s]:null,_,s==null?L(r):s,r.__h),Ee(_,r),r.__e!=s&&Ce(r)))})}function Ne(t,e,n,_,o,r,s,l,f,p){var i,h,u,c,d,S,m,v=_&&_.__k||Ae,k=v.length;for(n.__k=[],i=0;i<e.length;i++)if((c=n.__k[i]=(c=e[i])==null||typeof c=="boolean"?null:typeof c=="string"||typeof c=="number"||typeof c=="bigint"?j(null,c,null,null,c):Array.isArray(c)?j(D,{children:c},null,null,null):c.__b>0?j(c.type,c.props,c.key,c.ref?c.ref:null,c.__v):c)!=null){if(c.__=n,c.__b=n.__b+1,(u=v[i])===null||u&&c.key==u.key&&c.type===u.type)v[i]=void 0;else for(h=0;h<k;h++){if((u=v[h])&&c.key==u.key&&c.type===u.type){v[h]=void 0;break}u=null}oe(t,c,u=u||X,o,r,s,l,f,p),d=c.__e,(h=c.ref)&&u.ref!=h&&(m||(m=[]),u.ref&&m.push(u.ref,null,c),m.push(h,c.__c||d,c)),d!=null?(S==null&&(S=d),typeof c.type=="function"&&c.__k===u.__k?c.__d=f=Fe(c,f,t):f=Te(t,c,u,v,d,f),typeof n.type=="function"&&(n.__d=f)):f&&u.__e==f&&f.parentNode!=t&&(f=L(u))}for(n.__e=S,i=k;i--;)v[i]!=null&&(typeof n.type=="function"&&v[i].__e!=null&&v[i].__e==n.__d&&(n.__d=L(_,i+1)),He(v[i],v[i]));if(m)for(i=0;i<m.length;i++)$e(m[i],m[++i],m[++i])}function Fe(t,e,n){for(var _,o=t.__k,r=0;o&&r<o.length;r++)(_=o[r])&&(_.__=t,e=typeof _.type=="function"?Fe(_,e,n):Te(n,_,_,o,_.__e,e));return e}function Te(t,e,n,_,o,r){var s,l,f;if(e.__d!==void 0)s=e.__d,e.__d=void 0;else if(n==null||o!=r||o.parentNode==null)e:if(r==null||r.parentNode!==t)t.appendChild(o),s=null;else{for(l=r,f=0;(l=l.nextSibling)&&f<_.length;f+=2)if(l==o)break e;t.insertBefore(o,r),s=r}return s!==void 0?s:o.nextSibling}function Be(t,e,n,_,o){var r;for(r in n)r==="children"||r==="key"||r in e||Z(t,r,null,n[r],_);for(r in e)o&&typeof e[r]!="function"||r==="children"||r==="key"||r==="value"||r==="checked"||n[r]===e[r]||Z(t,r,e[r],n[r],_)}function le(t,e,n){e[0]==="-"?t.setProperty(e,n):t[e]=n==null?"":typeof n!="number"||je.test(e)?n:n+"px"}function Z(t,e,n,_,o){var r;e:if(e==="style")if(typeof n=="string")t.style.cssText=n;else{if(typeof _=="string"&&(t.style.cssText=_=""),_)for(e in _)n&&e in n||le(t.style,e,"");if(n)for(e in n)_&&n[e]===_[e]||le(t.style,e,n[e])}else if(e[0]==="o"&&e[1]==="n")r=e!==(e=e.replace(/Capture$/,"")),e=e.toLowerCase()in t?e.toLowerCase().slice(2):e.slice(2),t.l||(t.l={}),t.l[e+r]=n,n?_||t.addEventListener(e,r?ae:fe,r):t.removeEventListener(e,r?ae:fe,r);else if(e!=="dangerouslySetInnerHTML"){if(o)e=e.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if(e!=="href"&&e!=="list"&&e!=="form"&&e!=="tabIndex"&&e!=="download"&&e in t)try{t[e]=n==null?"":n;break e}catch{}typeof n=="function"||(n!=null&&(n!==!1||e[0]==="a"&&e[1]==="r")?t.setAttribute(e,n):t.removeAttribute(e))}}function fe(t){this.l[t.type+!1](a.event?a.event(t):t)}function ae(t){this.l[t.type+!0](a.event?a.event(t):t)}function oe(t,e,n,_,o,r,s,l,f){var p,i,h,u,c,d,S,m,v,k,x,P,C,b=e.type;if(e.constructor!==void 0)return null;n.__h!=null&&(f=n.__h,l=e.__e=n.__e,e.__h=null,r=[l]),(p=a.__b)&&p(e);try{e:if(typeof b=="function"){if(m=e.props,v=(p=b.contextType)&&_[p.__c],k=p?v?v.props.value:p.__:_,n.__c?S=(i=e.__c=n.__c).__=i.__E:("prototype"in b&&b.prototype.render?e.__c=i=new b(m,k):(e.__c=i=new q(m,k),i.constructor=b,i.render=ze),v&&v.sub(i),i.props=m,i.state||(i.state={}),i.context=k,i.__n=_,h=i.__d=!0,i.__h=[]),i.__s==null&&(i.__s=i.state),b.getDerivedStateFromProps!=null&&(i.__s==i.state&&(i.__s=H({},i.__s)),H(i.__s,b.getDerivedStateFromProps(m,i.__s))),u=i.props,c=i.state,h)b.getDerivedStateFromProps==null&&i.componentWillMount!=null&&i.componentWillMount(),i.componentDidMount!=null&&i.__h.push(i.componentDidMount);else{if(b.getDerivedStateFromProps==null&&m!==u&&i.componentWillReceiveProps!=null&&i.componentWillReceiveProps(m,k),!i.__e&&i.shouldComponentUpdate!=null&&i.shouldComponentUpdate(m,i.__s,k)===!1||e.__v===n.__v){i.props=m,i.state=i.__s,e.__v!==n.__v&&(i.__d=!1),i.__v=e,e.__e=n.__e,e.__k=n.__k,e.__k.forEach(function(N){N&&(N.__=e)}),i.__h.length&&s.push(i);break e}i.componentWillUpdate!=null&&i.componentWillUpdate(m,i.__s,k),i.componentDidUpdate!=null&&i.__h.push(function(){i.componentDidUpdate(u,c,d)})}if(i.context=k,i.props=m,i.__v=e,i.__P=t,x=a.__r,P=0,"prototype"in b&&b.prototype.render)i.state=i.__s,i.__d=!1,x&&x(e),p=i.render(i.props,i.state,i.context);else do i.__d=!1,x&&x(e),p=i.render(i.props,i.state,i.context),i.state=i.__s;while(i.__d&&++P<25);i.state=i.__s,i.getChildContext!=null&&(_=H(H({},_),i.getChildContext())),h||i.getSnapshotBeforeUpdate==null||(d=i.getSnapshotBeforeUpdate(u,c)),C=p!=null&&p.type===D&&p.key==null?p.props.children:p,Ne(t,Array.isArray(C)?C:[C],e,n,_,o,r,s,l,f),i.base=e.__e,e.__h=null,i.__h.length&&s.push(i),S&&(i.__E=i.__=null),i.__e=!1}else r==null&&e.__v===n.__v?(e.__k=n.__k,e.__e=n.__e):e.__e=Ve(n.__e,e,n,_,o,r,s,f);(p=a.diffed)&&p(e)}catch(N){e.__v=null,(f||r!=null)&&(e.__e=l,e.__h=!!f,r[r.indexOf(l)]=null),a.__e(N,e,n)}}function Ee(t,e){a.__c&&a.__c(e,t),t.some(function(n){try{t=n.__h,n.__h=[],t.some(function(_){_.call(n)})}catch(_){a.__e(_,n.__v)}})}function Ve(t,e,n,_,o,r,s,l){var f,p,i,h=n.props,u=e.props,c=e.type,d=0;if(c==="svg"&&(o=!0),r!=null){for(;d<r.length;d++)if((f=r[d])&&"setAttribute"in f==!!c&&(c?f.localName===c:f.nodeType===3)){t=f,r[d]=null;break}}if(t==null){if(c===null)return document.createTextNode(u);t=o?document.createElementNS("http://www.w3.org/2000/svg",c):document.createElement(c,u.is&&u),r=null,l=!1}if(c===null)h===u||l&&t.data===u||(t.data=u);else{if(r=r&&te.call(t.childNodes),p=(h=n.props||X).dangerouslySetInnerHTML,i=u.dangerouslySetInnerHTML,!l){if(r!=null)for(h={},d=0;d<t.attributes.length;d++)h[t.attributes[d].name]=t.attributes[d].value;(i||p)&&(i&&(p&&i.__html==p.__html||i.__html===t.innerHTML)||(t.innerHTML=i&&i.__html||""))}if(Be(t,u,h,o,l),i)e.__k=[];else if(d=e.props.children,Ne(t,Array.isArray(d)?d:[d],e,n,_,o&&c!=="foreignObject",r,s,r?r[0]:n.__k&&L(n,0),l),r!=null)for(d=r.length;d--;)r[d]!=null&&Se(r[d]);l||("value"in u&&(d=u.value)!==void 0&&(d!==t.value||c==="progress"&&!d||c==="option"&&d!==h.value)&&Z(t,"value",d,h.value,!1),"checked"in u&&(d=u.checked)!==void 0&&d!==t.checked&&Z(t,"checked",d,h.checked,!1))}return t}function $e(t,e,n){try{typeof t=="function"?t(e):t.current=e}catch(_){a.__e(_,n)}}function He(t,e,n){var _,o;if(a.unmount&&a.unmount(t),(_=t.ref)&&(_.current&&_.current!==t.__e||$e(_,null,e)),(_=t.__c)!=null){if(_.componentWillUnmount)try{_.componentWillUnmount()}catch(r){a.__e(r,e)}_.base=_.__P=null,t.__c=void 0}if(_=t.__k)for(o=0;o<_.length;o++)_[o]&&He(_[o],e,typeof t.type!="function");n||t.__e==null||Se(t.__e),t.__=t.__e=t.__d=void 0}function ze(t,e,n){return this.constructor(t,n)}function Ge(t,e,n){var _,o,r;a.__&&a.__(t,e),o=(_=typeof n=="function")?null:n&&n.__k||e.__k,r=[],oe(e,t=(!_&&n||e).__k=qe(D,null,[t]),o||X,X,e.ownerSVGElement!==void 0,!_&&n?[n]:o?null:e.firstChild?te.call(e.childNodes):null,r,!_&&n?n:o?o.__e:e.firstChild,_),Ee(r,t)}te=Ae.slice,a={__e:function(t,e,n,_){for(var o,r,s;e=e.__;)if((o=e.__c)&&!o.__)try{if((r=o.constructor)&&r.getDerivedStateFromError!=null&&(o.setState(r.getDerivedStateFromError(t)),s=o.__d),o.componentDidCatch!=null&&(o.componentDidCatch(t,_||{}),s=o.__d),s)return o.__E=o}catch(l){t=l}throw t}},xe=0,q.prototype.setState=function(t,e){var n;n=this.__s!=null&&this.__s!==this.state?this.__s:this.__s=H({},this.state),typeof t=="function"&&(t=t(H({},n),this.props)),t&&H(n,t),t!=null&&this.__v&&(e&&this.__h.push(e),ce(this))},q.prototype.forceUpdate=function(t){this.__v&&(this.__e=!0,t&&this.__h.push(t),ce(this))},q.prototype.render=D,O=[],Y.__r=0;var Ke=0;function T(t,e,n,_,o){var r,s,l={};for(s in e)s=="ref"?r=e[s]:l[s]=e[s];var f={type:t,props:l,key:n,ref:r,__k:null,__:null,__b:0,__e:null,__d:void 0,__c:null,__h:null,constructor:void 0,__v:--Ke,__source:o,__self:_};if(typeof t=="function"&&(r=t.defaultProps))for(s in r)l[s]===void 0&&(l[s]=r[s]);return a.vnode&&a.vnode(f),f}const Je=({onUpload:t})=>T("input",{className:"\r block\r h-full\r w-full\r cursor-pointer\r rounded-full\r border\r border-gray-300\r bg-gray-50\r p-4\r align-middle\r text-sm\r text-gray-900\r file:hidden\r dark:border-gray-600\r dark:bg-gray-700\r dark:text-gray-400\r dark:placeholder-gray-400\r ",type:"file",onChange:n=>{var r;const _=(r=n.target)==null?void 0:r.files;if(!_)return;const o=_[0];!o||t(o)}});var ne,g,_e,ue,ee=0,Me=[],B=[],de=a.__b,he=a.__r,pe=a.diffed,ye=a.__c,me=a.unmount;function ie(t,e){a.__h&&a.__h(g,t,ee||e),ee=0;var n=g.__H||(g.__H={__:[],__h:[]});return t>=n.__.length&&n.__.push({__V:B}),n.__[t]}function Qe(t){return ee=1,Xe(Le,t)}function Xe(t,e,n){var _=ie(ne++,2);if(_.t=t,!_.__c&&(_.__=[n?n(e):Le(void 0,e),function(r){var s=_.__N?_.__N[0]:_.__[0],l=_.t(s,r);s!==l&&(_.__N=[l,_.__[1]],_.__c.setState({}))}],_.__c=g,!g.u)){g.u=!0;var o=g.shouldComponentUpdate;g.shouldComponentUpdate=function(r,s,l){if(!_.__c.__H)return!0;var f=_.__c.__H.__.filter(function(i){return i.__c});if(f.every(function(i){return!i.__N}))return!o||o.call(this,r,s,l);var p=!1;return f.forEach(function(i){if(i.__N){var h=i.__[0];i.__=i.__N,i.__N=void 0,h!==i.__[0]&&(p=!0)}}),!!p&&(!o||o.call(this,r,s,l))}}return _.__N||_.__}function Ye(t,e){var n=ie(ne++,3);!a.__s&&Ue(n.__H,e)&&(n.__=t,n.i=e,g.__H.__h.push(n))}function ve(t){return ee=5,Ze(function(){return{current:t}},[])}function Ze(t,e){var n=ie(ne++,7);return Ue(n.__H,e)?(n.__V=t(),n.i=e,n.__h=t,n.__V):n.__}function et(){for(var t;t=Me.shift();)if(t.__P&&t.__H)try{t.__H.__h.forEach(V),t.__H.__h.forEach(re),t.__H.__h=[]}catch(e){t.__H.__h=[],a.__e(e,t.__v)}}a.__b=function(t){typeof t.type!="function"||t.o||t.type===D?t.o||(t.o=t.__&&t.__.o?t.__.o:""):t.o=(t.__&&t.__.o?t.__.o:"")+(t.__&&t.__.__k?t.__.__k.indexOf(t):0),g=null,de&&de(t)},a.__r=function(t){he&&he(t),ne=0;var e=(g=t.__c).__H;e&&(_e===g?(e.__h=[],g.__h=[],e.__.forEach(function(n){n.__N&&(n.__=n.__N),n.__V=B,n.__N=n.i=void 0})):(e.__h.forEach(V),e.__h.forEach(re),e.__h=[])),_e=g},a.diffed=function(t){pe&&pe(t);var e=t.__c;e&&e.__H&&(e.__H.__h.length&&(Me.push(e)!==1&&ue===a.requestAnimationFrame||((ue=a.requestAnimationFrame)||tt)(et)),e.__H.__.forEach(function(n){n.i&&(n.__H=n.i),n.__V!==B&&(n.__=n.__V),n.i=void 0,n.__V=B})),_e=g=null},a.__c=function(t,e){e.some(function(n){try{n.__h.forEach(V),n.__h=n.__h.filter(function(_){return!_.__||re(_)})}catch(_){e.some(function(o){o.__h&&(o.__h=[])}),e=[],a.__e(_,n.__v)}}),ye&&ye(t,e)},a.unmount=function(t){me&&me(t);var e,n=t.__c;n&&n.__H&&(n.__H.__.forEach(function(_){try{V(_)}catch(o){e=o}}),n.__H=void 0,e&&a.__e(e,n.__v))};var ge=typeof requestAnimationFrame=="function";function tt(t){var e,n=function(){clearTimeout(_),ge&&cancelAnimationFrame(e),setTimeout(t)},_=setTimeout(n,100);ge&&(e=requestAnimationFrame(n))}function V(t){var e=g,n=t.__c;typeof n=="function"&&(t.__c=void 0,n()),g=e}function re(t){var e=g;t.__c=t.__(),g=e}function Ue(t,e){return!t||t.length!==e.length||e.some(function(n,_){return n!==t[_]})}function Le(t,e){return typeof e=="function"?e(t):e}const Pe=()=>{if(!(typeof window>"u"))return window._audiovis_audioContext||(window._audiovis_audioContext=new AudioContext),window._audiovis_audioContext},nt=t=>{const e=Pe();if(typeof window>"u"||!e)return;window._audiovis_audioSourceNodes||(window._audiovis_audioSourceNodes=[]);const n=window._audiovis_audioSourceNodes.find(([o])=>o===t);if(n){const[,o]=n;return o}const _=e.createMediaElementSource(t);return window._audiovis_audioSourceNodes.push([t,_]),_};let y;const E=new Array(32).fill(void 0);E.push(void 0,null,!0,!1);function Oe(t){return E[t]}let R=E.length;function _t(t){t<36||(E[t]=R,R=t)}function rt(t){const e=Oe(t);return _t(t),e}const Re=new TextDecoder("utf-8",{ignoreBOM:!0,fatal:!0});Re.decode();let z=new Uint8Array;function G(){return z.byteLength===0&&(z=new Uint8Array(y.memory.buffer)),z}function be(t,e){return Re.decode(G().subarray(t,t+e))}let K=new Float32Array;function U(){return K.byteLength===0&&(K=new Float32Array(y.memory.buffer)),K}let w=0;function A(t,e){const n=e(t.length*4);return U().set(t,n/4),w=t.length,n}function ot(t){R===E.length&&E.push(E.length+1);const e=R;return R=E[e],E[e]=t,e}const J=new TextEncoder("utf-8"),it=typeof J.encodeInto=="function"?function(t,e){return J.encodeInto(t,e)}:function(t,e){const n=J.encode(t);return e.set(n),{read:t.length,written:n.length}};function st(t,e,n){if(n===void 0){const l=J.encode(t),f=e(l.length);return G().subarray(f,f+l.length).set(l),w=l.length,f}let _=t.length,o=e(_);const r=G();let s=0;for(;s<_;s++){const l=t.charCodeAt(s);if(l>127)break;r[o+s]=l}if(s!==_){s!==0&&(t=t.slice(s)),o=n(o,_,_=s+t.length*3);const l=G().subarray(o+s,o+_);s+=it(t,l).written}return w=s,o}let Q=new Int32Array;function we(){return Q.byteLength===0&&(Q=new Int32Array(y.memory.buffer)),Q}class I{static __wrap(e){const n=Object.create(I.prototype);return n.ptr=e,n}__destroy_into_raw(){const e=this.ptr;return this.ptr=0,e}free(){const e=this.__destroy_into_raw();y.__wbg_wasmfft_free(e)}static new(){const e=y.wasmfft_new();return I.__wrap(e)}static with_capcity(e){const n=y.wasmfft_with_capcity(e);return I.__wrap(n)}lib_fft(e,n){try{const r=A(e,y.__wbindgen_malloc),s=w;var _=A(n,y.__wbindgen_malloc),o=w;y.wasmfft_lib_fft(this.ptr,r,s,_,o)}finally{n.set(U().subarray(_/4,_/4+o)),y.__wbindgen_free(_,o*4)}}dft(e,n){try{const r=A(e,y.__wbindgen_malloc),s=w;var _=A(n,y.__wbindgen_malloc),o=w;y.wasmfft_dft(this.ptr,r,s,_,o)}finally{n.set(U().subarray(_/4,_/4+o)),y.__wbindgen_free(_,o*4)}}cooley_tukey(e,n){try{const r=A(e,y.__wbindgen_malloc),s=w;var _=A(n,y.__wbindgen_malloc),o=w;y.wasmfft_cooley_tukey(this.ptr,r,s,_,o)}finally{n.set(U().subarray(_/4,_/4+o)),y.__wbindgen_free(_,o*4)}}simd_cooley_tukey(e,n){try{const r=A(e,y.__wbindgen_malloc),s=w;var _=A(n,y.__wbindgen_malloc),o=w;y.wasmfft_simd_cooley_tukey(this.ptr,r,s,_,o)}finally{n.set(U().subarray(_/4,_/4+o)),y.__wbindgen_free(_,o*4)}}simd_cooley_tukey2(e,n){try{const r=A(e,y.__wbindgen_malloc),s=w;var _=A(n,y.__wbindgen_malloc),o=w;y.wasmfft_simd_cooley_tukey2(this.ptr,r,s,_,o)}finally{n.set(U().subarray(_/4,_/4+o)),y.__wbindgen_free(_,o*4)}}}async function ct(t,e){if(typeof Response=="function"&&t instanceof Response){if(typeof WebAssembly.instantiateStreaming=="function")try{return await WebAssembly.instantiateStreaming(t,e)}catch(_){if(t.headers.get("Content-Type")!="application/wasm")console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n",_);else throw _}const n=await t.arrayBuffer();return await WebAssembly.instantiate(n,e)}else{const n=await WebAssembly.instantiate(t,e);return n instanceof WebAssembly.Instance?{instance:n,module:t}:n}}function lt(){const t={};return t.wbg={},t.wbg.__wbg_new_abda76e883ba8a5f=function(){const e=new Error;return ot(e)},t.wbg.__wbg_stack_658279fe44541cf6=function(e,n){const _=Oe(n).stack,o=st(_,y.__wbindgen_malloc,y.__wbindgen_realloc),r=w;we()[e/4+1]=r,we()[e/4+0]=o},t.wbg.__wbg_error_f851667af71bcfc6=function(e,n){try{console.error(be(e,n))}finally{y.__wbindgen_free(e,n)}},t.wbg.__wbindgen_object_drop_ref=function(e){rt(e)},t.wbg.__wbindgen_throw=function(e,n){throw new Error(be(e,n))},t}function ft(t,e){return y=t.exports,Ie.__wbindgen_wasm_module=e,K=new Float32Array,Q=new Int32Array,z=new Uint8Array,y}async function Ie(t){typeof t>"u"&&(t=new URL("/assets/wasm_audio_bg.0ae1bc0d.wasm",self.location));const e=lt();(typeof t=="string"||typeof Request=="function"&&t instanceof Request||typeof URL=="function"&&t instanceof URL)&&(t=fetch(t));const{instance:n,module:_}=await ct(await t,e);return ft(n,_)}class at{constructor(e){M(this,"_buffer");M(this,"_w",0);M(this,"_r",0);M(this,"_count",0);this._buffer=new Array(e)}inc(e){return(e+1)%this._buffer.length}fullSize(){return this._buffer.length}count(){return this._count}isFull(){return this._count===this._buffer.length}clear(){this._count=0,this._r=0,this._w=0;for(let e=0;e<this._buffer.length;++e)this._buffer[e]=void 0}put(e){this._buffer[this._w]=e,this._w=this.inc(this._w),this._w===this._r&&(this._r=this.inc(this._r)),this._count=Math.min(this._count+1,this._buffer.length)}take(){if(this._count===0)return;const e=this._buffer[this._r];if(e===void 0)throw new Error("expected value");return this._buffer[this._r]=void 0,this._r=this.inc(this._r),this._count-=1,e}reduce(e,n){if(this._count===0)return n;let _=n;for(let o=0;o<this._count;++o){const r=this._buffer[(o+this._r)%this._buffer.length];if(r===void 0)throw new Error("expected value");_=e(_,r,o)}return _}}class ut extends at{sum(){return this.reduce((e,n)=>e+n,0)}average(){const e=this.count();return e===0?void 0:this.sum()/e}}class W{constructor(){M(this,"buf");M(this,"avg");this.buf=new ut(100)}put(e){this.buf.put(e),this.buf.isFull()&&(this.avg=this.buf.average(),this.buf.clear())}}function dt(){const t=ve(null),e=ve(null),[n,_]=Qe();return Ye(()=>{const o=t.current,r=e.current,s=o==null?void 0:o.getContext("2d");if(!r||!n||!o||!s)return;const l=Pe(),f=nt(r);if(!l||!f)return;let p=!1;const i=I.new(),h=l.createAnalyser();h.fftSize=1024,h.smoothingTimeConstant=.1,f.connect(h),h.connect(l.destination);const u=new Float32Array(h.fftSize),c=new Float32Array(h.frequencyBinCount);new W;const d=new W,S=new W,m=new W,v=3,k=0,x=(C,b=0,N=1)=>{const $=performance.now();C(u,c);const F=performance.now()-$;return ke(s,c,0,k-b*v,o.width/c.length,v*N),F},P=()=>{var C,b,N;if(p){f.disconnect(),i.free();return}requestAnimationFrame(P),s.clearRect(0,0,o.width,o.height),h.getFloatTimeDomainData(u),s.strokeStyle="lightskyblue",ke(s,u,0,o.height*.5,o.width/u.length,o.height*.5),s.font="12px monospace",s.strokeStyle="white",x(($,F)=>h.getFloatFrequencyData(F)),s.strokeStyle=s.fillStyle="orange",d.put(x(($,F)=>i.cooley_tukey($,F),-36.50907-30,19.57467)),s.fillText(`naive: ${(C=d.avg)==null?void 0:C.toFixed(3)} ms`,0,20),s.strokeStyle=s.fillStyle="pink",S.put(x(($,F)=>i.simd_cooley_tukey($,F),-36.50907-30,19.57467)),s.fillText(`simd: ${(b=S.avg)==null?void 0:b.toFixed(3)} ms`,0,30),s.strokeStyle=s.fillStyle="lightgreen",m.put(x(($,F)=>i.simd_cooley_tukey2($,F),-36.50907-30,19.57467)),s.fillText(`simd2: ${(N=m.avg)==null?void 0:N.toFixed(3)} ms`,0,40)};return requestAnimationFrame(P),()=>{p=!0}},[e.current,n,t.current]),T("div",{className:"flex h-screen flex-col items-center justify-center gap-2",children:[T("div",{className:"flex items-center gap-4",children:[T(Je,{onUpload:o=>_(URL.createObjectURL(o))}),T("div",{children:T("audio",{ref:e,src:n,controls:!0})})]}),T("div",{className:"border border-slate-600",children:T("canvas",{ref:t,height:400,width:700})})]})}const ke=(t,e,n,_,o,r)=>{t.beginPath();for(let s=0,l=e.length;s<l;++s){const f=n+s*o,p=_-e[s]*r;s===0?t.moveTo(f,p):t.lineTo(f,p)}t.stroke()};Ie().then(()=>{Ge(T(dt,{}),document.getElementById("app"))});