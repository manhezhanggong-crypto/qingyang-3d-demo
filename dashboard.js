'use strict';
const iframe=document.getElementById('viewer');
const play=document.getElementById('play');
const timeline=document.getElementById('timeline');
function syncTimelineTrack() {
  const min = Number(timeline.min);
  const span = Number(timeline.max) - min;
  const progress = span > 0 ? 100 * (Number(timeline.value) - min) / span : 0;
  timeline.style.setProperty('--timeline-progress', progress + '%');
}
timeline.addEventListener('input', syncTimelineTrack);
syncTimelineTrack();
let viewer=null;
let events=[];
let selected=null;
const storageKey='ai-project-monitor-demo-v1';
try{const saved=JSON.parse(localStorage.getItem(storageKey)||'null');if(saved){events=saved.events||[];document.getElementById('note').value=saved.note||'';}}catch{}
function renderEvents(){
 const list=document.getElementById('event-list');list.replaceChildren();
 if(!events.length){const e=document.createElement('div');e.className='empty';e.textContent='尚未运行模拟巡检';list.append(e);return;}
 events.forEach((item,index)=>{
  const b=document.createElement('button');b.className='point event';
  b.textContent=item.title+' · '+(item.reviewed?'已人工标记':'待复核')+'（模拟）';
  b.onclick=()=>{
   selected=index;
   const box=document.getElementById('detail');box.replaceChildren();
   const p=document.createElement('p');p.textContent=item.description;box.append(p);
   const hint=document.createElement('p');hint.textContent='模拟数据：不能据此认定现场存在问题。';box.append(hint);
   const action=document.createElement('button');action.textContent='标记已复核';
   action.onclick=()=>{events[index].reviewed=true;renderEvents();action.disabled=true;};box.append(action);
  };list.append(b);
 });
}
renderEvents();
document.getElementById('simulate').onclick=()=>{
 events=[
  {id:'DEMO-001',title:'材料堆放核查',description:'示例流程：核对堆场范围、通道占用及原始影像，必要时安排现场检查。',reviewed:false},
  {id:'DEMO-002',title:'作业面进度核查',description:'示例流程：关联施工计划及两期影像，人工确认作业面变化。',reviewed:false}
 ];renderEvents();
};
document.getElementById('clear').onclick=()=>{events=[];selected=null;renderEvents();document.getElementById('detail').textContent='选择模拟提示，查看核查说明。';};
function snapshot(){return {type:'模拟巡检演示记录',exportTime:new Date().toISOString(),events,note:document.getElementById('note').value};}
document.getElementById('save').onclick=()=>{try{localStorage.setItem(storageKey,JSON.stringify(snapshot()));document.getElementById('save-status').textContent='已保存到本机浏览器';}catch{document.getElementById('save-status').textContent='保存失败，请导出记录';}};
document.getElementById('download').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(snapshot(),null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='模拟巡检记录.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
function pause(){if(viewer){viewer.state.animationPaused=true;play.textContent='镜头巡览';}}
play.onclick = () => {
  if (!viewer?.state.loaded) return;
  if (!viewer.state.animationPaused) {
    pause();
    return;
  }
  const start = () => {
    viewer.state.cameraMode = 'anim';
    viewer.state.animationPaused = false;
    play.textContent = '暂停巡览';
  };
  if (viewer.state.cameraMode === 'anim') {
    start();
    return;
  }
  const [position, fov] = presetViews[0];
  viewer.focusProjectPoint(position, [0.046051, 0.655664, 0.026651], fov, () => {
    viewer.state.cameraMode = 'anim';
    viewer.seek(0);
    start();
  });
};
timeline.oninput=()=>{if(viewer){pause();viewer.seek(Number(timeline.value));}};
const presetViews = {
  0: [[4.175801, 6.775664, 5.924546], 55],
  9: [[4.628547, 3.645664, -0.374265], 52],
  19: [[-2.236088, 4.975664, -4.867411], 55]
};
function goToPreset(time) {
  if (!viewer?.state.loaded || !viewer.focusProjectPoint) return;
  const [position, fov] = presetViews[time];
  pause();
  viewer.focusProjectPoint(position, [0.046051, 0.655664, 0.026651], fov);
  timeline.value = time;
  syncTimelineTrack();

  document.querySelectorAll('[data-time]').forEach(button =>
    button.classList.toggle('active', Number(button.dataset.time) === time));
}
document.getElementById('reset').onclick = () => goToPreset(0);
document.querySelectorAll('[data-time]').forEach(button => {
  button.onclick = () => goToPreset(Number(button.dataset.time));
});
document.getElementById('fullscreen').onclick=()=>{const scene=document.querySelector('.scene');if(!document.fullscreenElement)scene.requestFullscreen().catch(()=>{});else document.exitFullscreen();};
let attempts=0;
const timer=setInterval(()=>{
 if (!iframe.hasAttribute('src')) return;
 attempts++;
 try{viewer=iframe.contentWindow.projectViewer;if(viewer?.state.loaded){
  clearInterval(timer);play.disabled=false;timeline.disabled=false;document.getElementById('reset').disabled=false;
  document.getElementById('load-status').textContent='模型已就绪 · 官方 SuperSplat Viewer';
  viewer.app.graphicsDevice.on('devicelost',()=>{
   document.getElementById('load-status').textContent='图形设备连接中断，请点击重新加载场景。';
   play.disabled=true;timeline.disabled=true;
  });
  viewer.events.on('animationTime:changed',time=>{timeline.value=time;syncTimelineTrack();});
  if (iframe.dataset.autoplayTour === 'true') {
    delete iframe.dataset.autoplayTour;
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      viewer.state.cameraMode = 'anim';
      viewer.state.animationPaused = false;
      play.textContent = '暂停巡览';
    }
  }
 }}catch{}
 if(attempts>=240){clearInterval(timer);if(iframe.hasAttribute('src'))document.getElementById('load-status').textContent='加载较久，请检查模型地址、内存或浏览器硬件加速。';}
},1000);
function clock(){document.getElementById('clock').textContent=new Date().toLocaleString('zh-CN',{hour12:false});}clock();setInterval(clock,1000);

document.getElementById('reload-scene').onclick=()=>{
 const url=new URL(location.href);url.searchParams.set('reload',Date.now());location.replace(url.href);
};






