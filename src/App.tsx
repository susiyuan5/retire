import { useMemo, useState } from "react";
import { defaultAssumptions, defaultInputs, defaultSources } from "./config/assumptions";
import { calculatePlan } from "./engine/calculator";
import type { ExpenseInputs, IncomeSourceSetting, PlannerInputs, PolicyAssumptions, ResidentStatus, RetirementCountry } from "./types";

const money = (value: number) => new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(value);
const cny = (value: number) => new Intl.NumberFormat("zh-CN", { style: "currency", currency: "CNY", maximumFractionDigits: 0 }).format(value);
const pct = (value: number) => `${(value * 100).toFixed(1)}%`;
const num = (value: string) => Number(value) || 0;

function Field({ label, value, onChange, step = "1" }: { label: string; value: number; onChange: (value: number) => void; step?: string }) {
  return <label><span>{label}</span><input type="number" step={step} value={value} onChange={(event) => onChange(num(event.target.value))} /></label>;
}

function Bar({ value, max, tone = "blue" }: { value: number; max: number; tone?: string }) {
  return <div className="bar-track"><i className={`bar ${tone}`} style={{ width: `${max ? Math.max(1, value / max * 100) : 0}%` }} /></div>;
}

function App() {
  const [inputs, setInputs] = useState<PlannerInputs>(defaultInputs);
  const [assumptions, setAssumptions] = useState<PolicyAssumptions>(defaultAssumptions);
  const [sources, setSources] = useState<IncomeSourceSetting[]>(defaultSources);
  const [tab, setTab] = useState<"dashboard" | "results" | "assumptions">("dashboard");
  const result = useMemo(() => calculatePlan(inputs, assumptions, sources), [inputs, assumptions, sources]);
  const compareCanada = useMemo(() => calculatePlan({ ...inputs, retirementCountry: "Canada", residentStatus: "Canadian Resident" }, assumptions, sources), [inputs, assumptions, sources]);
  const compareChina = useMemo(() => calculatePlan({ ...inputs, retirementCountry: "China", residentStatus: "Canadian Non-Resident" }, assumptions, sources), [inputs, assumptions, sources]);
  const update = <K extends keyof PlannerInputs>(key: K, value: PlannerInputs[K]) => setInputs((old) => ({ ...old, [key]: value }));
  const updateExpense = (key: keyof ExpenseInputs, value: number) => setInputs((old) => ({ ...old, expenses: { ...old.expenses, [key]: value } }));
  const updateSource = (id: string, patch: Partial<IncomeSourceSetting>) => setSources((old) => old.map((source) => source.id === id ? { ...source, ...patch } : source));
  const maxSource = Math.max(...result.sources.map((source) => source.netMonthly), 1);
  const maxExpense = Math.max(...Object.values(inputs.expenses), 1);
  const enabledCount = sources.filter((source) => source.enabled).length;

  return <main>
    <header>
      <div><p className="eyebrow">RETIREMENT PLANNER · CANADA</p><h1>退休计划 <b>Retirement Planner</b></h1></div>
      <nav>{(["dashboard", "results", "assumptions"] as const).map((item) => <button className={tab === item ? "active" : ""} onClick={() => setTab(item)} key={item}>{item === "dashboard" ? "规划仪表盘" : item === "results" ? "退休结果" : "政策参数"}</button>)}</nav>
    </header>

    {tab === "dashboard" && <div className="layout">
      <aside className="panel inputs">
        <div className="section-head"><h2>规划输入</h2><span>实时计算</span></div>
        <h3>基本资料</h3><div className="fields">
          <Field label="当前年龄" value={inputs.currentAge} onChange={(v) => update("currentAge", v)} />
          <Field label="退休年龄" value={inputs.retirementAge} onChange={(v) => update("retirementAge", v)} />
          <Field label="预期寿命" value={inputs.lifeExpectancy} onChange={(v) => update("lifeExpectancy", v)} />
          <Field label="加拿大工作年数" value={inputs.yearsWorkedInCanada} onChange={(v) => update("yearsWorkedInCanada", v)} />
          <Field label="18岁后居加年数" value={inputs.yearsInCanadaAfter18} onChange={(v) => update("yearsInCanadaAfter18", v)} />
          <Field label="CPP 缴费年数" value={inputs.cppContributionYears} onChange={(v) => update("cppContributionYears", v)} />
        </div>
        <h3>退休设置</h3><div className="fields">
          <label><span>省份</span><select value={inputs.province} onChange={(e) => update("province", e.target.value)}><option>Ontario</option><option>British Columbia</option><option>Alberta</option><option>Quebec</option><option>Other</option></select></label>
          <label><span>婚姻状态</span><select value={inputs.maritalStatus} onChange={(e) => update("maritalStatus", e.target.value as PlannerInputs["maritalStatus"])}><option>Single</option><option>Couple</option></select></label>
          <label><span>退休国家</span><select value={inputs.retirementCountry} onChange={(e) => update("retirementCountry", e.target.value as RetirementCountry)}><option>Canada</option><option>China</option><option>Other</option></select></label>
          <label><span>税务身份</span><select value={inputs.residentStatus} onChange={(e) => update("residentStatus", e.target.value as ResidentStatus)}><option>Canadian Resident</option><option>Canadian Non-Resident</option></select></label>
          <Field label="CPP 开始年龄" value={inputs.cppStartAge} onChange={(v) => update("cppStartAge", v)} />
          <Field label="OAS 开始年龄" value={inputs.oasStartAge} onChange={(v) => update("oasStartAge", v)} />
        </div>
        <h3>资产与投资</h3><div className="fields">
          <Field label="平均年收入" value={inputs.averageAnnualIncome} onChange={(v) => update("averageAnnualIncome", v)} />
          <Field label="RRSP 余额" value={inputs.rrspBalance} onChange={(v) => update("rrspBalance", v)} />
          <Field label="TFSA 余额" value={inputs.tfsaBalance} onChange={(v) => update("tfsaBalance", v)} />
          <Field label="非注册账户" value={inputs.nonRegisteredBalance} onChange={(v) => update("nonRegisteredBalance", v)} />
          <Field label="每月新增投资" value={inputs.monthlyInvestment} onChange={(v) => update("monthlyInvestment", v)} />
          <Field label="退休前回报率" value={inputs.expectedAnnualReturn} step=".001" onChange={(v) => update("expectedAnnualReturn", v)} />
          <Field label="退休后回报率" value={inputs.retirementReturn} step=".001" onChange={(v) => update("retirementReturn", v)} />
          <Field label="通胀率" value={inputs.inflationRate} step=".001" onChange={(v) => update("inflationRate", v)} />
        </div>
        <h3>每月支出</h3><div className="fields">
          {(Object.keys(inputs.expenses) as (keyof ExpenseInputs)[]).map((key) => <Field key={key} label={key} value={inputs.expenses[key]} onChange={(v) => updateExpense(key, v)} />)}
        </div>
      </aside>

      <section className="content">
        <div className="metrics">
          <article><span>退休净月收入</span><strong>{money(result.netMonthly)}</strong><small>{cny(result.netMonthly * inputs.cadToCnyExchangeRate)}</small></article>
          <article><span>每月生活支出</span><strong>{money(result.expensesMonthly)}</strong><small>年度 {money(result.expensesMonthly * 12)}</small></article>
          <article className={result.surplusMonthly >= 0 ? "positive" : "negative"}><span>每月结余</span><strong>{money(result.surplusMonthly)}</strong><small>{result.surplusMonthly >= 0 ? "计划有余量" : "需要补足资金"}</small></article>
          <article><span>退休时预计资产</span><strong>{money(result.assetsAtRetirement)}</strong><small>启用 {enabledCount} / {sources.length} 个来源</small></article>
        </div>
        <section className="panel"><div className="section-head"><div><h2>退休收入来源</h2><p>切换来源后，结果与图表会立即更新。</p></div><span>{enabledCount} enabled</span></div>
          <div className="source-table">
            {result.sources.map((source) => <div className={`source-row ${!source.enabled ? "muted" : ""}`} key={source.id}>
              <label className="switch"><input type="checkbox" checked={source.enabled} onChange={(e) => updateSource(source.id, { enabled: e.target.checked })} /><i /></label>
              <div className="source-title"><b>{source.label}</b><small>{source.eligible ? "Eligible" : "Not eligible"}{source.note ? ` · ${source.note}` : ""}</small></div>
              <select value={source.mode} onChange={(e) => updateSource(source.id, { mode: e.target.value as IncomeSourceSetting["mode"] })}><option value="auto">Auto</option><option value="percentage">Percentage</option><option value="manual">Manual</option></select>
              {source.mode === "percentage" ? <input className="mini" type="number" value={source.percentage} onChange={(e) => updateSource(source.id, { percentage: num(e.target.value) })} /> : source.mode === "manual" ? <input className="mini" type="number" value={source.manualMonthly} onChange={(e) => updateSource(source.id, { manualMonthly: num(e.target.value) })} /> : <span className="auto">规则计算</span>}
              <strong>{money(source.netMonthly)}</strong>
            </div>)}
          </div>
        </section>
        <div className="chart-grid">
          <section className="panel chart"><h2>净收入来源</h2>{result.sources.filter((s) => s.enabled && s.netMonthly > 0).map((s) => <div className="chart-row" key={s.id}><span>{s.label}</span><Bar value={s.netMonthly} max={maxSource} /><b>{money(s.netMonthly)}</b></div>)}</section>
          <section className="panel chart"><h2>支出构成</h2>{(Object.keys(inputs.expenses) as (keyof ExpenseInputs)[]).map((key) => <div className="chart-row" key={key}><span>{key}</span><Bar tone="orange" value={inputs.expenses[key]} max={maxExpense} /><b>{money(inputs.expenses[key])}</b></div>)}</section>
        </div>
      </section>
    </div>}

    {tab === "results" && <section className="results">
      <div className="hero panel"><div><p className="eyebrow">RETIREMENT RESULTS</p><h2>{result.surplusMonthly >= 0 ? "当前方案可覆盖预计支出" : "当前方案存在退休资金缺口"}</h2><p>基于当前输入与可编辑假设的教育用途估算。</p></div><div className="score"><span>资产充足度</span><strong>{Number.isFinite(result.sufficiencyRatio) ? pct(result.sufficiencyRatio) : "充足"}</strong></div></div>
      <div className="metrics six">
        <article><span>税前月收入</span><strong>{money(result.grossMonthly)}</strong></article><article><span>税款 / 预扣</span><strong>{money(result.taxMonthly)}</strong></article><article><span>税后月收入</span><strong>{money(result.netMonthly)}</strong></article><article><span>每月支出</span><strong>{money(result.expensesMonthly)}</strong></article><article><span>所需储蓄</span><strong>{money(result.requiredSavings)}</strong></article><article><span>预计可支撑</span><strong>{result.runwayYears.toFixed(1)} 年</strong></article>
      </div>
      <div className="chart-grid"><section className="panel"><h2>Canada vs China 对比</h2><table><thead><tr><th>退休场景</th><th>税前月收入</th><th>税款 / 预扣</th><th>税后月收入</th><th>月结余</th></tr></thead><tbody><tr><td>加拿大居民退休</td><td>{money(compareCanada.grossMonthly)}</td><td>{money(compareCanada.taxMonthly)}</td><td>{money(compareCanada.netMonthly)}</td><td>{money(compareCanada.surplusMonthly)}</td></tr><tr><td>中国退休 · 加拿大非居民</td><td>{money(compareChina.grossMonthly)}</td><td>{money(compareChina.taxMonthly)}</td><td>{money(compareChina.netMonthly)}</td><td>{money(compareChina.surplusMonthly)}</td></tr></tbody></table></section>
      <section className="panel"><h2>基础资产投影</h2><p className="projection">退休时资产 <b>{money(result.assetsAtRetirement)}</b></p><Bar value={result.assetsAtRetirement} max={Math.max(result.assetsAtRetirement, result.requiredSavings, 1)} /><p className="projection">估算所需储蓄 <b>{money(result.requiredSavings)}</b></p><Bar tone="orange" value={result.requiredSavings} max={Math.max(result.assetsAtRetirement, result.requiredSavings, 1)} /></section></div>
      <section className="panel"><h2>收益率场景</h2><table><thead><tr><th>场景</th><th>退休前回报率</th><th>退休时预计资产</th><th>预计可支撑</th></tr></thead><tbody>{([["保守", assumptions.projection.conservativeReturn], ["正常", assumptions.projection.normalReturn], ["乐观", assumptions.projection.optimisticReturn]] as const).map(([label, rate]) => { const scenario = calculatePlan({ ...inputs, expectedAnnualReturn: rate }, assumptions, sources); return <tr key={label}><td>{label}</td><td>{pct(rate)}</td><td>{money(scenario.assetsAtRetirement)}</td><td>{scenario.runwayYears.toFixed(1)} 年</td></tr>; })}</tbody></table></section>
    </section>}

    {tab === "assumptions" && <Assumptions assumptions={assumptions} setAssumptions={setAssumptions} inputs={inputs} update={update} />}
    <footer>This calculator is for educational planning only. It is NOT legal, tax, immigration, investment, or financial advice. Verify CPP, OAS, GIS, RRSP, RRIF, TFSA, CRA tax rules, treaty rules, and assumptions independently before making decisions.</footer>
  </main>;
}

function Assumptions({ assumptions: a, setAssumptions, inputs, update }: { assumptions: PolicyAssumptions; setAssumptions: (value: PolicyAssumptions) => void; inputs: PlannerInputs; update: <K extends keyof PlannerInputs>(key: K, value: PlannerInputs[K]) => void }) {
  const patch = <K extends keyof PolicyAssumptions>(group: K, key: keyof PolicyAssumptions[K], value: number) => setAssumptions({ ...a, [group]: { ...a[group], [key]: value } });
  return <section className="results"><div className="panel hero"><div><p className="eyebrow">EDITABLE POLICY CONFIG</p><h2>政策与规划参数</h2><p>这些是示例默认值，请在正式使用前按适用年份核实。</p></div></div><div className="assumption-grid">
    <section className="panel"><h2>CPP</h2><Field label="65岁最高月金额" value={a.cpp.maxMonthlyAt65} onChange={(v) => patch("cpp", "maxMonthlyAt65", v)} /><Field label="YMPE" value={a.cpp.ympe} onChange={(v) => patch("cpp", "ympe", v)} /><Field label="标准缴费年数" value={a.cpp.standardContributionYears} onChange={(v) => patch("cpp", "standardContributionYears", v)} /><Field label="提前每月扣减" value={a.cpp.earlyReductionPerMonth} step=".001" onChange={(v) => patch("cpp", "earlyReductionPerMonth", v)} /></section>
    <section className="panel"><h2>OAS / GIS</h2><Field label="OAS 最高月金额" value={a.oas.maxMonthly} onChange={(v) => patch("oas", "maxMonthly", v)} /><Field label="居民最低年数" value={a.oas.residentMinimumYears} onChange={(v) => patch("oas", "residentMinimumYears", v)} /><Field label="海外最低年数" value={a.oas.overseasMinimumYears} onChange={(v) => patch("oas", "overseasMinimumYears", v)} /><Field label="GIS 最高月金额" value={a.gis.maxMonthly} onChange={(v) => patch("gis", "maxMonthly", v)} /></section>
    <section className="panel"><h2>税务与汇率</h2><Field label="居民估算有效税率" value={a.tax.residentEffectiveRate} step=".01" onChange={(v) => patch("tax", "residentEffectiveRate", v)} /><Field label="默认非居民预扣率" value={inputs.defaultWithholdingRate} step=".01" onChange={(v) => update("defaultWithholdingRate", v)} /><Field label="条约预扣率" value={inputs.treatyWithholdingRate} step=".01" onChange={(v) => update("treatyWithholdingRate", v)} /><Field label="CAD / CNY 汇率" value={inputs.cadToCnyExchangeRate} step=".01" onChange={(v) => update("cadToCnyExchangeRate", v)} /><label className="check"><input type="checkbox" checked={inputs.enableSection217Simulation} onChange={(e) => update("enableSection217Simulation", e.target.checked)} /><span>启用 Section 217 估算</span></label></section>
    <section className="panel"><h2>RRIF</h2><Field label="转换年龄" value={a.rrif.conversionAge} onChange={(v) => patch("rrif", "conversionAge", v)} /><Field label="默认提款率" value={a.rrif.defaultWithdrawalRate} step=".001" onChange={(v) => patch("rrif", "defaultWithdrawalRate", v)} /><p>按年龄提款表保存在 <code>src/config/assumptions.ts</code>，可继续扩展为界面编辑器。</p></section>
  </div></section>;
}
export default App;
