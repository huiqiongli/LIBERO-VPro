(() => {
  const $ = (selector) => document.querySelector(selector);
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));
  const models = [
    {id: 'pi0', label: 'π0', family: 'VLA'},
    {id: 'pi05', label: 'π0.5', family: 'VLA'},
    {id: 'openvla_oft', label: 'OpenVLA-OFT', family: 'VLA'},
    {id: 'fastwam', label: 'FastWAM', family: 'WAM'},
    {id: 'lingbot_va', label: 'LingBot-VA', family: 'WAM'},
    {id: 'lawam', label: 'LaWAM', family: 'WAM'}
  ];
  const comparisonModels = [{id: 'astra', label: 'Astra', family: 'Agent'}, ...models];
  const modelColors = {
    astra: '#D55E00',
    pi0: '#0072B2',
    pi05: '#56B4E9',
    openvla_oft: '#009E73',
    fastwam: '#E69F00',
    lingbot_va: '#CC79A7',
    lawam: '#4D4D4D'
  };
  const cleanLabels = {
    normal: 'Normal',
    A1_target_object_100pct: 'Target-Object Masking · 100%',
    A2_target_container_100pct: 'Target-Receptacle Masking · 100%',
    A3_gripper: 'Interaction-Cue Masking · Robot Gripper',
    A4_same_position: 'Task-Relevant Distractors · Same-Position Distractor',
    A5_adjacent_support_face: 'Task-Precondition Variation · Object Pose · Adjacent Support Face',
    A5_open_20pct: 'Task-Precondition Variation · Receptacle Openness · 20% Open',
    A5_open_50pct: 'Task-Precondition Variation · Receptacle Openness · 50% Open',
    A5_opposite_support_face: 'Task-Precondition Variation · Object Pose · Opposite Support Face',
    C3_existence_agentview: 'Cross-View Contradiction · Existence · Third-Person View',
    C3_existence_wrist: 'Cross-View Contradiction · Existence · Wrist View',
    C3_position_agentview: 'Cross-View Contradiction · Position · Third-Person View',
    C3_position_wrist: 'Cross-View Contradiction · Position · Wrist View',
    C3_state_agentview: 'Cross-View Contradiction · State · Third-Person View',
    C3_state_wrist: 'Cross-View Contradiction · State · Wrist View'
  };
  let data;

  function pct(value) {
    return value == null ? '—' : `${Number(value).toFixed(1)}%`;
  }

  function aggregateStats(conditions, modelId) {
    let successes = 0;
    let n = 0;
    conditions.forEach((condition) => {
      const stat = modelId === 'astra' ? condition.astra : condition.models?.[modelId];
      successes += Number(stat?.successes || 0);
      n += Number(stat?.n || 0);
    });
    return {successes, n, rate: n ? 100 * successes / n : null};
  }

  function conditionsFor(ids) {
    return ids.map((id) => data.conditions.find((condition) => condition.id === id));
  }

  function comparisonCell(stat, best, comparable) {
    if (!stat?.n) return '<span class="comparison-missing">—</span>';
    const classes = ['comparison-rate'];
    if (best && comparable) classes.push('best-result');
    if (!comparable) classes.push('not-comparable');
    return `<span class="${classes.join(' ')}">${pct(stat.rate)}</span>`;
  }

  function modelLegend() {
    return `<div class="chart-legend" aria-label="Models">
      ${comparisonModels.map((model) => `<span><i style="--legend-color:${modelColors[model.id]}"></i>${esc(model.label)}</span>`).join('')}
    </div>`;
  }

  function renderBarPanels(selector, panels, ariaLabel) {
    const target = $(selector);
    target.setAttribute('role', 'img');
    target.setAttribute('aria-label', ariaLabel);
    const panelClass = panels.length === 1 ? 'one' : panels.length === 3 ? 'three' : 'two';
    target.innerHTML = `${modelLegend()}<div class="bar-panels ${panelClass}">
      ${panels.map((panel) => {
        const conditions = conditionsFor(panel.ids);
        return `<section class="bar-panel">
          <h4>${esc(panel.label)}</h4>
          <div class="bar-axis" aria-hidden="true"><span>0</span><span>50</span><span>100%</span></div>
          ${comparisonModels.map((model) => {
            const stat = aggregateStats(conditions, model.id);
            const rate = stat.rate ?? 0;
            return `<div class="bar-row" title="${esc(model.label)}: ${pct(stat.rate)}">
              <span class="bar-model"><i style="--model-color:${modelColors[model.id]}"></i>${esc(model.label)}</span>
              <span class="bar-track"><span class="bar-fill" style="width:${Math.max(0, Math.min(100, rate))}%;--bar-color:${modelColors[model.id]}"></span></span>
              <span class="bar-stat"><strong>${pct(stat.rate)}</strong></span>
            </div>`;
          }).join('')}
        </section>`;
      }).join('')}
    </div>`;
  }

  function renderConflictTable() {
    const groups = [
      {
        label: 'Existence',
        columns: [
          {label: 'Third-person', ids: ['C3_existence_agentview']},
          {label: 'Wrist', ids: ['C3_existence_wrist']}
        ]
      },
      {
        label: 'Position',
        columns: [
          {label: 'Third-person', ids: ['C3_position_agentview']},
          {label: 'Wrist', ids: ['C3_position_wrist']}
        ]
      },
      {
        label: 'State',
        columns: [
          {label: 'Third-person', ids: ['C3_state_agentview']},
          {label: 'Wrist', ids: ['C3_state_wrist']}
        ]
      }
    ];
    const allIds = groups.flatMap((group) => group.columns.flatMap((column) => column.ids));
    const columns = [...groups.flatMap((group) => group.columns), {label: 'Overall', ids: allIds}];
    const bestRates = columns.map((column) => Math.max(...comparisonModels.map((model) => aggregateStats(conditionsFor(column.ids), model.id).rate ?? -Infinity)));
    const target = $('#conflict-table');
    target.innerHTML = `<table class="conflict-table">
      <thead>
        <tr>
          <th rowspan="2">Model</th>
          ${groups.map((group) => `<th colspan="2">${esc(group.label)}</th>`).join('')}
          <th rowspan="2">Overall</th>
        </tr>
        <tr>
          ${groups.flatMap((group) => group.columns).map((column) => `<th>${esc(column.label)}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${comparisonModels.map((model) => {
          const stats = columns.map((column) => aggregateStats(conditionsFor(column.ids), model.id));
          return `<tr>
            <td><span class="conflict-model"><i style="--model-color:${modelColors[model.id]}"></i><span><strong>${esc(model.label)}</strong><small>${esc(model.family)}</small></span></span></td>
            ${stats.map((stat, index) => `<td><span class="conflict-rate${stat.rate != null && Math.abs(stat.rate - bestRates[index]) < 1e-9 ? ' best-result' : ''}">${pct(stat.rate)}</span></td>`).join('')}
          </tr>`;
        }).join('')}
      </tbody>
    </table>`;
  }

  function renderComparisonTable(selector, rows, firstHeader) {
    const table = $(selector);
    table.querySelector('thead').innerHTML = `<tr><th>${esc(firstHeader)}</th>${comparisonModels.map((model) => `<th><span class="comparison-model">${esc(model.label)}</span><span class="comparison-family">${esc(model.family)}</span></th>`).join('')}</tr>`;
    table.querySelector('tbody').innerHTML = rows.map((row) => {
      const conditions = conditionsFor(row.ids);
      const stats = comparisonModels.map((model) => aggregateStats(conditions, model.id));
      const comparable = row.comparable !== false;
      const maxRate = comparable ? Math.max(...stats.map((stat) => stat.rate ?? -Infinity)) : null;
      return `<tr${row.baseline ? ' class="baseline-row"' : ''}>
        <td><span class="comparison-label">${esc(row.label)}</span></td>
        ${stats.map((stat) => `<td>${comparisonCell(stat, comparable && stat.rate != null && Math.abs(stat.rate - maxRate) < 1e-9, comparable)}</td>`).join('')}
      </tr>`;
    }).join('');
  }

  function renderAllComparisons() {
    const perturbationResultOrder = [
      'A1_target_object_100pct',
      'A2_target_container_100pct',
      'A3_gripper',
      'C3_existence_agentview',
      'C3_existence_wrist',
      'C3_position_agentview',
      'C3_position_wrist',
      'C3_state_agentview',
      'C3_state_wrist',
      'A4_same_position',
      'A5_adjacent_support_face',
      'A5_open_20pct',
      'A5_open_50pct',
      'A5_opposite_support_face'
    ];
    const fullResultOrder = ['normal', ...perturbationResultOrder];
    renderComparisonTable('#condition-comparison', fullResultOrder.map((id) => ({
      label: cleanLabels[id],
      ids: [id],
      baseline: id === 'normal'
    })), 'LIBERO-VPro setting');
    renderBarPanels('#overall-chart', [
      {label: 'All evaluated perturbations', ids: perturbationResultOrder}
    ], 'Overall success rates for seven systems across all evaluated perturbations.');
    renderBarPanels('#masking-chart', [
      {label: 'Target-Object Masking', ids: ['A1_target_object_100pct']},
      {label: 'Target-Receptacle Masking', ids: ['A2_target_container_100pct']},
      {label: 'Interaction-Cue Masking', ids: ['A3_gripper']}
    ], 'Success rates for seven systems under three Visual Evidence Degradation categories.');
    renderConflictTable();
    renderBarPanels('#scene-chart', [
      {label: 'Task-Relevant Distractors', ids: ['A4_same_position']},
      {label: 'Task-Precondition Variation', ids: ['A5_adjacent_support_face', 'A5_open_20pct', 'A5_open_50pct', 'A5_opposite_support_face']}
    ], 'Success rates for seven systems under Task-Relevant Distractors and Task-Precondition Variation.');
  }

  function activateVideos() {
    const videos = [...document.querySelectorAll('video[data-playback-rate]')];
    const prepare = (video) => {
      const rate = Number(video.dataset.playbackRate) || 2;
      video.playbackRate = rate;
      video.muted = true;
      video.loop = true;
    };
    videos.forEach(prepare);
    if (!('IntersectionObserver' in window)) {
      videos.forEach((video) => video.play().catch(() => {}));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          prepare(entry.target);
          entry.target.play().catch(() => {});
        } else {
          entry.target.pause();
        }
      });
    }, {rootMargin: '180px 0px', threshold: 0.01});
    videos.forEach((video) => observer.observe(video));
  }

  function activateToc() {
    const links = [...document.querySelectorAll('.toc a')];
    const targets = links.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (!visible) return;
      links.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${visible.target.id}`));
    }, {rootMargin: '-12% 0px -76% 0px', threshold: 0});
    targets.forEach((target) => observer.observe(target));
  }

  fetch('assets/data/astra-report.json')
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((json) => {
      data = json;
      renderAllComparisons();
      activateVideos();
      activateToc();
    })
    .catch((error) => {
      document.querySelectorAll('#condition-comparison,#overall-chart,#masking-chart,#conflict-table,#scene-chart').forEach((node) => {
        node.innerHTML = `<p class="sub">Results could not be loaded: ${esc(error.message)}</p>`;
      });
    });
})();
