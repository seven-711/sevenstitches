class r{static show(e,n="info"){const a=document.getElementById("toast-container")||this.createContainer(),t=document.createElement("div");t.className=`
            flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 translate-y-full opacity-0
            ${n==="success"?"bg-green-500 text-white":""}
            ${n==="error"?"bg-red-500 text-white":""}
            ${n==="info"?"bg-blue-500 text-white":""}
        `;const s=n==="success"?"check_circle":n==="error"?"error":"info";t.innerHTML=`
            <span class="material-symbols-outlined">${s}</span>
            <span class="font-medium text-sm">${e}</span>
        `,a.appendChild(t),requestAnimationFrame(()=>{t.classList.remove("translate-y-full","opacity-0")}),setTimeout(()=>{t.classList.add("translate-y-full","opacity-0"),setTimeout(()=>t.remove(),300)},3e3)}static createContainer(){const e=document.createElement("div");return e.id="toast-container",e.className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none items-center",document.body.appendChild(e),e}}export{r as T};
