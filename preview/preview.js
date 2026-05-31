const policy={cpp:{max:1433,ympe:71300,years:39},oas:{max:728,residentMin:10,overseasMin:20,fullYears:40},gis:{max:1086,threshold:22000,reduction:.5},tax:{resident:.16,nonResident:.15}};
const state={cpp:true,oas:true,gis:true,rrif:true,tfsa:true,nonRegistered:true,employer:false,rental:false,partTime:false,chinaPension:false,other:false};
const labels={cpp:"CPP",oas:"OAS",gis:"GIS",rrif:"RRSP / RRIF",tfsa:"TFSA",nonRegistered:"Non-registered Investments",employer:"Employer Pension",rental:"Rental Income",partTime:"Part-time Work Income",chinaPension:"China Pension",other:"Other Income"};
const money=v=>new Intl.NumberFormat("en-CA",{style:"currency",currency:"CAD",maximumFractionDigits:0}).format(v);
const val=id=>Number(document.getElementById(id).value)||0;
function calculate(status=document.getElementById("status").value){
 const years=val("years"),resident=status==="Canadian Resident",rate=resident?policy.tax.resident:policy.tax.nonResident;
 const cpp=policy.cpp.max*Math.min(1,val("income")/policy.cpp.ympe)*Math.min(1,val("cppYears")/policy.cpp.years);
 const oas=years>=(resident?policy.oas.residentMin:policy.oas.overseasMin)?policy.oas.max*Math.min(1,years/policy.oas.fullYears):0;
 const gis=resident?Math.max(0,policy.gis.max-(cpp+oas)*12*policy.gis.reduction/12):0;
 const amounts={cpp,oas,gis,rrif:800,tfsa:300,nonRegistered:150,employer:0,rental:0,partTime:0,chinaPension:0,other:0};
 let gross=0,tax=0;Object.keys(state).forEach(k=>{if(state[k]){gross+=amounts[k];if(!["gis","tfsa"].includes(k))tax+=amounts[k]*rate}});
 const expense=[...document.querySelectorAll(".expense")].reduce((sum,e)=>sum+Number(e.value),0);
 return{amounts,gross,tax,net:gross-tax,expense,surplus:gross-tax-expense};
}
function render(){
 const r=calculate();document.getElementById("net").textContent=money(r.net);document.getElementById("expense").textContent=money(r.expense);document.getElementById("surplus").textContent=money(r.surplus);document.getElementById("tax").textContent=money(r.tax);document.getElementById("cny").textContent="¥"+Math.round(r.net*val("exchange")).toLocaleString();
 document.getElementById("count").textContent=Object.values(state).filter(Boolean).length+" enabled";
 document.getElementById("sources").innerHTML=Object.keys(state).map(k=>`<div class="source"><button class="toggle ${state[k]?"on":""}" data-id="${k}"></button><div><b>${labels[k]}</b><small>${k==="gis"&&document.getElementById("status").value!=="Canadian Resident"?"Not eligible outside Canada":"Auto mode · rule calculated"}</small></div><b>${money(state[k]?r.amounts[k]:0)}</b></div>`).join("");
 const enabled=Object.keys(state).filter(k=>state[k]&&r.amounts[k]>0),max=Math.max(...enabled.map(k=>r.amounts[k]),1);document.getElementById("bars").innerHTML=enabled.map(k=>`<div class="bar-row"><span>${labels[k]}</span><div class="track"><i class="fill" style="width:${r.amounts[k]/max*100}%"></i></div><b>${money(r.amounts[k])}</b></div>`).join("");
 const ca=calculate("Canadian Resident"),cn=calculate("Canadian Non-Resident");document.getElementById("compare").innerHTML=`<tr><td>加拿大居民退休</td><td>${money(ca.net)}</td><td>${money(ca.surplus)}</td></tr><tr><td>中国退休 · 加拿大非居民</td><td>${money(cn.net)}</td><td>${money(cn.surplus)}</td></tr>`;
 document.querySelectorAll(".toggle").forEach(b=>b.onclick=()=>{state[b.dataset.id]=!state[b.dataset.id];render()});
}
document.querySelectorAll("input,select").forEach(e=>e.oninput=render);render();
