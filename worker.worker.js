!function(){"use strict";class e extends Error{}class t extends SyntaxError{constructor(){super("The function syntax is erred")}}const n=(e,t,n=0)=>{for(let r=n+1;r<e.length;r++)if(!t.includes(e[r]))return{char:e[r],index:r};return{char:null,index:null}},r=(e,{cache:r}={cache:null})=>{let o=(e=>(e=>{let t;for(let n=0;n<e.length;n++)t=Math.imul(31,t)+e.charCodeAt(n)|0;return t})(e).toString())(e);if(r&&r[o])return r[o];const{args:s,isGenerator:i}=(e=>{const n=e.indexOf("(")+1;if(!n)throw new t;const r=e.indexOf(")",n);if(-1===r)throw new t;let o=!1;const s=e.indexOf("*");return-1!==s&&(o=s<n),{isGenerator:o,args:e.substring(n,r)}})(e),a=(e=>{let r,o,s=!1;const i=(e=e.trim()).indexOf("function");if(i){r=e.indexOf("=>")+2;const t=n(e,[" "],r);if("("===t.char)s=!0,r=t.index+1,o=e.lastIndexOf(")");else{let t=n(e,[" "],r);"{"===t.char?(r=t.index+1,o=e.lastIndexOf("}")):(s=!0,o=e.length)}}else{if(r=e.indexOf("{",i)+1,!r)throw new t;o=e.lastIndexOf("}")}let a=e.substring(r,o).trim();return s&&a&&(a=` return ${a}`),a})(e),c=i?((e,t)=>(0,Object.getPrototypeOf((function*(){})).constructor)(e,t))(s,a):new Function(s,a);return r&&(r[o]=c),c};var o;!function(e){e.FUNCTION="f"}(o||(o={}));const s=[Date,RegExp,Blob,File,FileList],i=(e,t)=>{if(e.length<2)return[];const[n,r]=e;return n===o.FUNCTION?t(r):(e=>null===e||s.some((t=>"number"==typeof e||"string"==typeof e||"boolean"==typeof e||e instanceof t)))(r)?r:Array.isArray(r)?r.map((e=>i(e,t))):Object.keys(r).reduce(((e,n)=>(e[n]=i(r[n],t),e)),{})};var a;!function(e){e.SENT="sent",e.STARTED="started",e.COMPLETED="completed",e.NEXT="next",e.ERROR="error"}(a||(a={})),Worker;const c=self,l={};let u,f=null,d=null;function T(e){return r(e,{cache:l})}function m(e,{startTime:t=null,resolveEventName:n=a.COMPLETED}){e.then((e=>h(n,{startTime:t},e))).catch((e=>h(a.ERROR,{startTime:t},e)))}function h(e,{startTime:t=null}={},n=null){c.postMessage(Object.assign({eventName:e,result:n,taskRunId:u},t&&{tookTime:performance.now()-t}))}c.onmessage=t=>{const{data:n}=t;if(u=n.taskRunId,n.next||n.return||n.throw){if(!d)throw new e("Generator function is already finished or was not initiated");h(a.STARTED);const t=performance.now();let r;r=n.next?d.next(...n.args):n.return?d.return(n.args[0]):d.throw(n.args[0]),(r.done||n.throw)&&(d=null);const o=n.throw||r.done?a.COMPLETED:a.NEXT;return!n.throw&&r.value instanceof Promise?void r.value.then((e=>h(o,{startTime:t},e))).catch((e=>h(a.ERROR,{startTime:t},e))):void h(o,{startTime:t},r.value)}if(null===f&&(f=(n.deps||[]).length>0,f))try{importScripts(...n.deps)}catch(e){console.error(e)}const r=T(n.func),o=i(n.args||[],T),s={reply:(e,t)=>h(e,{startTime:c},t)};h(a.STARTED);const c=performance.now(),l=r.apply(s,o);if("GeneratorFunction"===r.constructor.name){const e=l.next(...o);return e.done||(d=l),e.value instanceof Promise?void m(e.value,{startTime:c,resolveEventName:e.done?a.COMPLETED:a.NEXT}):void h(e.done?a.COMPLETED:a.NEXT,{startTime:c},e.value)}l instanceof Promise?m(l,{startTime:c}):h(a.COMPLETED,{startTime:c},l)},c.onerror=e=>{h(a.ERROR,{},e)},(()=>c).bind(c)}();
//# sourceMappingURL=worker.worker.js.map