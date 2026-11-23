(() => {
  const drawer = document.getElementById('agent-drawer');
  const toggle = document.getElementById('toggle-agent');
  const setOpen = open => {
    drawer.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
  };
  toggle.onclick = () => setOpen(drawer.hidden);
  document.getElementById('close-agent').onclick = () => {
    setOpen(false);
    toggle.focus();
  };
  document.getElementById('overview-view').onclick = () =>
    document.getElementById('reset').click();
  if (matchMedia('(max-width: 640px)').matches) setOpen(false);
  document.getElementById('agent-photos').addEventListener('change', event => {
    const files = Array.from(event.target.files);
    const list = document.getElementById('agent-files');
    list.replaceChildren();
    for (const file of files) {
      const row = document.createElement('li');
      row.textContent = file.name;
      list.append(row);
    }
    document.getElementById('agent-status').textContent =
      files.length ? '已选择 ' + files.length + ' 张照片 · 待接入' : '等待接入照片';
  });
})();

(() => {
  const main = document.querySelector('body > main');
  const project = main.querySelector(':scope > aside:first-child');
  const review = main.querySelector(':scope > aside.right');
  const drawer = document.getElementById('agent-drawer');
  const projectToggle = document.getElementById('toggle-project');
  const agentToggle = document.getElementById('toggle-agent');
  const narrow = matchMedia('(max-width: 900px)');
  project.classList.add('project-glass');
  project.id = 'project-glass';
  projectToggle.setAttribute('aria-controls', project.id);
  const legacyViews = project.querySelector('article:nth-child(3)');
  if (legacyViews) legacyViews.hidden = true;
  for (const card of Array.from(review.children)) drawer.append(card);
  const setProject = open => {
    project.hidden = !open;
    projectToggle.setAttribute('aria-expanded', String(open));
  };
  const setLayout = () => {
    setProject(!narrow.matches);
    drawer.hidden = narrow.matches;
    agentToggle.setAttribute('aria-expanded', String(!drawer.hidden));
  };
  setLayout();
  narrow.addEventListener('change', setLayout);
  projectToggle.onclick = () => {
    setProject(project.hidden);
    if (narrow.matches && !project.hidden) {
      drawer.hidden = true;
      agentToggle.setAttribute('aria-expanded', 'false');
    }
  };
  agentToggle.addEventListener('click', () => {
    if (narrow.matches && !drawer.hidden) setProject(false);
  });
})();
