const board = document.getElementById("board");
const dialog = document.getElementById("detail");
const liked = JSON.parse(localStorage.getItem("liked") || "[]");
// 포스터 경로, 크기 ⇒ 이미지 주소
function posterUrl(path, size) { return "https://image.tmdb.org/t/p/" + size + path; }
// 영화 목록, 검색어 ⇒ 검색 결과
function search(list, keyword) { return list.filter(m => m.title.toLowerCase().includes(keyword.trim().toLowerCase())); }
// 목록, 기준, 방향 ⇒ 정렬한 새 배열
function sortBy(list, key, desc) {
  return [...list].sort((a,b) => (key === "title" ? a.title.localeCompare(b.title,"ko") : a[key]-b[key]) * (desc ? -1 : 1));
}
// 입력 없음 ⇒ 검색, 필터, 정렬 결과
function getView() {
  let list = search(movies, document.getElementById("q").value);
  const type = document.querySelector('input[name="type"]:checked').value;
  const key = document.getElementById("sort").value;
  if (type !== "all") list = list.filter(m => m.type === type);
  return sortBy(list,key,key !== "title");
}
// 영화, 크기 ⇒ 포스터 또는 대체 표지
function poster(m,size) { return m.poster ? '<img class="poster" src="'+posterUrl(m.poster,size)+'" alt="'+m.title+' 포스터">' : '<div class="poster-fallback">'+m.title[0]+'</div>'; }
// 영화 목록 ⇒ 카드와 개수 표시
function renderCards(list) {
  board.innerHTML = "";
  for (const m of list) {
    const card = document.createElement("article");
    card.className = "card";
    if (m.rating >= 8) card.classList.add("hot");
    if (!m.poster) card.classList.add("no-poster");
    card.dataset.type=m.type; card.dataset.title=m.title;
    card.innerHTML = '<div class="poster-wrap">'+poster(m,"w342")+'<span class="badge">'+(m.rating || "미확인")+'</span>'+(m.type==="boxoffice"?'<span class="rank">'+m.rank+'</span>':"")+'</div><div class="info"><h3>'+m.title+'</h3><p>'+m.year+'</p><button type="button" class="'+(liked.includes(m.title)?"like liked":"like")+'" aria-pressed="'+liked.includes(m.title)+'">♥ 찜</button></div>';
    board.appendChild(card);
  }
  board.classList.toggle("is-empty",list.length === 0);
  document.getElementById("count").textContent = list.length + "편";
  document.getElementById("likeCount").textContent = liked.length;
}
// 입력 없음 ⇒ 화면 갱신
function refresh() { renderCards(getView()); }
// 입력 없음 ⇒ 찜 배열 저장
function saveLiked() { localStorage.setItem("liked",JSON.stringify(liked)); }
// 영화 제목 ⇒ 상세 대화상자
function openDetail(title) {
  const m = movies.find(m => m.title === title);
  if (!m) return;
  document.getElementById("detailBody").innerHTML = poster(m,"w500")+'<h2>'+m.title+'</h2><p>개봉일: '+(m.date||"미확인")+'</p><p>평점: '+(m.rating||"미확인")+'</p><p>'+m.overview+'</p>';
  dialog.showModal();
}
document.getElementById("q").addEventListener("input",refresh);
document.getElementById("sort").addEventListener("change",refresh);
document.getElementById("typeFilter").addEventListener("change",refresh);
board.addEventListener("click",e => {
  const card = e.target.closest(".card");
  if (!card) return;
  const title = card.dataset.title;
  if (e.target.closest(".like")) {
    const i = liked.indexOf(title);
    if (i === -1) liked.push(title); else liked.splice(i,1);
    saveLiked(); refresh(); return;
  }
  openDetail(title);
});
document.getElementById("closeDetail").addEventListener("click",() => dialog.close());
document.body.classList.toggle("light",localStorage.getItem("theme") === "light");
document.getElementById("theme").addEventListener("click",() => {
  document.body.classList.toggle("light");
  localStorage.setItem("theme",document.body.classList.contains("light") ? "light" : "dark");
});
refresh();