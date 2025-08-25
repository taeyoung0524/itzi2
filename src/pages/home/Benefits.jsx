import React, { useEffect, useRef, useState } from 'react'
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Banner1 from '../../assets/img/benefits_banner_1.png';  // TODO: 추후 slick-dot 없는 버전으로 이미지 파일 변경 필요
import Banner2 from '../../assets/img/benefits_banner_2.png';  // TODO: 추후 slick-dot 없는 버전으로 이미지 파일 변경 필요
import SearchIcon from '../../assets/img/ic_search.svg';
import SearchingIcon from '../../assets/img/ic_searching.svg';
import BookmarkOn from '../../assets/img/ic_bookmark_on.svg';
import BookmarkOff from '../../assets/img/ic_bookmark_off.svg';
import PrevIcon from '../../assets/img/ic_prev.svg';
import NextIcon from '../../assets/img/ic_next.svg';
import CaretDown from '../../assets/img/ic_caret_down.svg';

const API_BASE = import.meta?.env?.VITE_API_BASE ?? "";

// ---- UI → API 파라미터 매핑 ----
const ORDER_MAP = {
  "마감임박순": "CLOSING",  // exposureEndDate 오름차순
  "인기순": "POPULAR",     // bookmarkCount 내림차순
  "최신순": "LATEST",      // publishedAt DESC
  "오래된순": "OLDEST",    // (promotion에선 보통 안 씀, 있으면 그대로 전달)
};

// 우리 UI 카테고리 → API enum
const CATEGORY_MAP = {
  "음식점 / 카페": "FOOD",
  "의류 / 패션": "FASHION",
  "뷰티 / 미용": "BEAUTY",
  "헬스 / 피트니스": "HEALTH",
  "문구 / 서점": "BOOK",
  "생활 / 잡화": "LIVING",
  "병원 / 약국": "HOSPITAL",
  "전자 / IT": "IT",
  "교통 / 이동": "TRANSPORTATION",
  "기타": "ETC",
};

// D-day 계산 (endDate 기준)
const ddayFrom = (yyyyMmDd) => {
  if (!yyyyMmDd) return 0;
  const end = new Date(yyyyMmDd + "T00:00:00");
  const now = new Date();
  const ms = end.setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0);
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
};

// API → 카드 데이터 변환
const mapItemToPost = (item) => ({
  id: item.postId,
  title: item.title,
  target: item.target,
  period: `${item.startDate} ~ ${item.endDate}`,
  benefit: item.benefit,
  dday: ddayFrom(item.endDate),            // 배지용
  bookmarked: false,                       // 서버에 없으면 로컬 기준
  bookmarkCount: item.bookmarkCount ?? 0,  // 정렬 POPULAR에 사용됨
  category: item.category ?? null,
  image: item.postImageUrl,
  audience: "대학생",                      // UI 탭 호환용(없으면 임시)
  univ: null,                              // UI 탭 호환용(없으면 null)
});

const SortDropdown = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const options = ['마감임박순', '인기순', '최신순', '오래된순'];

  // 바깥 클릭 닫기
  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  // Esc 키 닫기
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // 포커스가 드롭다운 컨테이너 밖으로 나가면 닫기
  const handleBlur = (e) => {
    if (!ref.current?.contains(e.relatedTarget)) setOpen(false);
  };

  return (
    <div className="sort_dropdown" ref={ref} onBlur={handleBlur}>
      <button
        className="sort_button"
        onClick={() => setOpen(true)}         // <-- 토글이 아닌 항상 열기
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {value}
        <img
          src={CaretDown}
          alt=""
          className={`caret ${open ? 'open' : ''}`}
          width={16}
          height={16}
        />
      </button>

      {open && (
        <ul className="sort_menu" role="listbox" aria-label="정렬 방식" tabIndex={-1}>
          {options.map((opt) => (
            <li
              key={opt}
              role="option"
              aria-selected={value === opt}
              className={`sort_option ${value === opt ? 'selected' : ''}`}
              tabIndex={0}
              onClick={() => { onChange(opt); setOpen(false); }}
              onKeyDown={(e) => { if (e.key === 'Enter') { onChange(opt); setOpen(false); } }}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const Benefits = () => {
  const userName = "시현";
  const userUniv = "성신여자대학교";

  // 탭 상태 (기본값: 전체)
  const [activeTab, setActiveTab] = useState("전체");

  // ▼ 추가: 검색 상태
  const [searchTerm, setSearchTerm] = useState("");     // 입력 중 텍스트
  const [query, setQuery] = useState("");               // 확정된 검색어(엔터 후)
  const [searching, setSearching] = useState(false);    // 입력/포커스 중인지
  const inputRef = useRef(null);

  // 입력 핸들러
  const onChangeSearch = (e) => {
    setSearchTerm(e.target.value);
    setSearching(true);           // 타이핑 시작 → searching 켜기
  };

  // 엔터/ESC 처리
  const onKeyDownSearch = (e) => {
    if (e.key === "Enter") {
      setQuery(searchTerm.trim()); // 검색어 확정
      setSearching(false);         // UI는 기본 상태로 복귀
      inputRef.current?.blur();    // 포커스 아웃
    }
    if (e.key === "Escape") {
      setSearching(false);
      inputRef.current?.blur();
    }
  };

  // 포커스/블러 시점
  const onFocusSearch = () => setSearching(true);
  const onBlurSearch = () => setSearching(false);

  const tabs = ["전체", "대학생", userUniv];

  // 정렬 (기본: 마감임박순)
  const [sortBy, setSortBy] = useState('마감임박순');

  // 게시물 필터링
  const filterOptions = [
    '전체',
    '음식점 / 카페',
    '의류 / 패션',
    '뷰티 / 미용',
    '헬스 / 피트니스',
    '문구 / 서점',
    '생활 / 잡화',
    '병원 / 약국',
    '전자 / IT',
    '교통 / 이동',
    '기타',
  ];

  // 기본값: 전체
  const [selectedFilters, setSelectedFilters] = useState(['전체']);

  const handleFilterClick = (opt) => {
    if (opt === '전체') {
      // 전체 클릭 시 → 전체만 남기고 다른 필터는 다 해제
      setSelectedFilters(['전체']);
    } else {
      let updated;
      if (selectedFilters.includes(opt)) {
        // 이미 선택된 경우 → 해제
        updated = selectedFilters.filter((f) => f !== opt);
      } else {
        // 새로 선택된 경우 → 추가
        updated = [...selectedFilters.filter((f) => f !== '전체'), opt];
      }

      // 아무것도 안 남으면 "전체" 자동 선택
      if (updated.length === 0) {
        updated = ['전체'];
      }

      setSelectedFilters(updated);
    }
  };

  // // ① 더미 데이터 (실데이터로 교체만 하면 동작)
  // const [posts, setPosts] = useState([
  //   {
  //     id: 1,
  //     title: '성신여대 X 라라면가 - 상권 제휴',
  //     target: '성신여대 재적생 및 교직원 대상',
  //     period: '2025.07.01 ~ 2025.08.31',
  //     benefit: '매장 식사 시, 음료 1인당 1캔 무료 제공',
  //     dday: 21,
  //     bookmarked: true,
  //     bookmarkCount: 80,        // ← 추가
  //     category: '음식점 / 카페',
  //     image: Banner1,
  //     audience: '대학생',
  //     univ: '성신여자대학교',
  //   },
  //   {
  //     id: 2,
  //     title: '헬스PT 할인 이벤트',
  //     target: '대학생 누구나',
  //     period: '2025.07.10 ~ 2025.09.15',
  //     benefit: '3개월 등록 시 20% 할인',
  //     dday: 45,
  //     bookmarked: false,
  //     bookmarkCount: 12,        // ← 추가
  //     category: '헬스 / 피트니스',
  //     image: Banner2,
  //     audience: '대학생',
  //     univ: null,
  //   },
  // ]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 선택된 필터들을 API filters 파라미터로 변환
  const buildFiltersParams = (selectedFilters) => {
    const params = [];
    if (!selectedFilters || selectedFilters.includes("전체")) return params;
    selectedFilters.forEach((label) => {
      const enumVal = CATEGORY_MAP[label];
      if (enumVal) params.push(["filters", enumVal]);  // ?filters=FOOD&filters=ETC ...
    });
    return params;
  };

  useEffect(() => {
  let aborted = false;
  const controller = new AbortController();

  const fetchList = async () => {
    try {
      setLoading(true);
      setError(null);

      // 하드코딩된 URL
      const url = `https://api.onlyoneprivate.store/promotion/all?orderBy=POPULAR&filters=FOOD`;
      console.debug("[GET]", url);

      const res = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });

      if (!res.ok) {
        const bodyText = await res.text();
        throw new Error(`HTTP ${res.status} ${res.statusText} — ${bodyText.slice(0, 200)}`);
      }

      const data = await res.json();
      if (aborted) return;

      if (!data?.isSuccess || !Array.isArray(data?.result)) {
        throw new Error(data?.error?.message || "목록을 가져오지 못했습니다.");
      }

      const mapped = data.result.map(mapItemToPost);
      setPosts(mapped);
      setPage(1);
    } catch (e) {
      if (aborted) return;
      setError(e.message || "목록을 가져오지 못했습니다.");
      setPosts([]);
    } finally {
      if (!aborted) setLoading(false);
    }
  };

  fetchList();
  return () => {
    aborted = true;
    controller.abort();
  };
}, []); // ✅ 정렬/필터 상태 무시, 최초 1회만 호출

  // 북마크 토글 핸들러
  const toggleBookmark = (id) => {
    setPosts(prev =>
      prev.map(p => {
        if (p.id !== id) return p;
        const turningOn = !p.bookmarked;
        return {
          ...p,
          bookmarked: turningOn,
          bookmarkCount: Math.max(0, p.bookmarkCount + (turningOn ? 1 : -1)),
        };
      })
    );
  };

  // 유틸
  const parsePeriodEnd = (period) => {
    // "YYYY.MM.DD ~ YYYY.MM.DD"의 끝 날짜를 Date로
    const end = period.split('~')[1]?.trim()?.replaceAll('.', '-');
    return end ? new Date(end) : new Date();
  };

  // ② 정렬 + 필터 + 탭 적용
  const filteredByTab = posts.filter(p => {
    if (activeTab === '전체') return true;
    if (activeTab === '대학생') return p.audience === '대학생';
    // 학교 탭
    return p.univ === activeTab;
  });

  const filteredByCategory = filteredByTab.filter(p => {
    if (selectedFilters.includes('전체')) return true;
    return selectedFilters.includes(p.category);
  });

  const sorted = [...filteredByCategory].sort((a, b) => {
    switch (sortBy) {
      case '마감임박순': // D-day 오름차순
        return a.dday - b.dday;
      case '인기순':      // 북마크 내림차순
        return b.bookmarkCount - a.bookmarkCount;
      case '최신순':      // 기간 종료일 최신순(가까운 과거/미래를 최신으로 간주 가능)
        return parsePeriodEnd(b.period) - parsePeriodEnd(a.period);
      case '오래된순':
        return parsePeriodEnd(a.period) - parsePeriodEnd(b.period);
      default:
        return 0;
    }
  });

  // 페이지네이션 상태
  const PAGE_SIZE = 12;               // 3 x 4
  const [page, setPage] = useState(1);

  // 탭/정렬/필터가 바뀌면 페이지 1로 리셋
  useEffect(() => {
    setPage(1);
  }, [activeTab, selectedFilters, sortBy]);

  // 페이지 번호 리스트(간단한 ... 처리)
  const getPageNumbers = (current, total) => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const result = [1];
    const left = Math.max(2, current - 1);
    const right = Math.min(total - 1, current + 1);
    if (left > 2) result.push('…');
    for (let i = left; i <= right; i++) result.push(i);
    if (right < total - 1) result.push('…');
    result.push(total);
    return result;
  };

  // 전체 개수/페이지 수
  const totalItems = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  // 현재 페이지 아이템
  const start = (safePage - 1) * PAGE_SIZE;
  const toRender = sorted.slice(start, start + PAGE_SIZE);

  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [safePage]);

  return (
    <div className='Benefits_wrap'>
      {/* 이미지 배너 */}
      <div className="banner_wrap">
        <Slider
          dots
          arrows={false}
          infinite
          autoplay
          autoplaySpeed={2000}   // 2초
          speed={500}
          slidesToShow={1}
          slidesToScroll={1}
          pauseOnHover
        >
          <div className="banner_slide">
            <img src={Banner1} alt="배너 1" className="banner_image" />
          </div>
          <div className="banner_slide">
            <img src={Banner2} alt="배너 2" className="banner_image" />
          </div>
        </Slider>
      </div>

      {/* 제목 및 검색창 */}
      <div className="here_itzi">
        <h3>{userName}님을 위한 제휴와 혜택, 여기 잇ZI🙌🏻</h3>
        <div className={`search_bar ${searching ? 'active' : ''}`}>
          <img src={searching ? SearchingIcon : SearchIcon} alt="" />
          <input
            ref={inputRef}
            className="search_input"
            type="text"
            placeholder="검색어를 입력해주세요"
            value={searchTerm}
            onChange={onChangeSearch}
            onKeyDown={onKeyDownSearch}
            onFocus={onFocusSearch}
            onBlur={onBlurSearch}
          />
        </div>
      </div>

      {/* 카테고리 및 정렬 */}
      <div className="category">
        <div className="category_tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`tab_btn ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="sort">
          <SortDropdown value={sortBy} onChange={setSortBy} />
        </div>
      </div>

      {/* 게시물 필터링 */}
      <div className="post_filters">
        <div className="filter_row">
          <span style={{ marginRight: 8 }}></span>
          <div className="filter_chips">
            {filterOptions.map((opt) => {
              const active = selectedFilters.includes(opt);
              return (
                <button
                  key={opt}
                  className={`chip ${active ? 'active' : ''}`}
                  onClick={() => handleFilterClick(opt)}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 선택된 탭에 따라 콘텐츠 표시 */}
      {/* <div className="category_content">
        {activeTab === "전체" && <p>전체 혜택 목록</p>}
        {activeTab === "대학생" && <p>대학생 혜택 목록</p>}
        {activeTab === "성신여자대학교" && <p>성신여자대학교 혜택 목록</p>}
      </div> */}
      <div className="category_content" ref={listRef}>
        {loading ? (
          <div className="loading">불러오는 중…</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <div className="grid">
            {toRender.length === 0 ? (
              <div className="no_posts">표시할 혜택이 없습니다.</div>
            ) : (
              toRender.map(post => (
                <div key={post.id} className="card">
                  <div className="thumb">
                    <div className="img_wrap">
                      <img src={post.image} alt={post.title} />
                    </div>
                    <div className="badge">D-{post.dday}</div>
                  </div>

                  <div className="card_body">
                    <div className="title_row">
                      <div className="title">{post.title}</div>
                      <div className="bookmark_wrap">
                        <span className="bookmark_count">{post.bookmarkCount}</span>
                        <button className="bookmark_btn" onClick={() => toggleBookmark(post.id)}>
                          <img src={post.bookmarked ? BookmarkOn : BookmarkOff} alt="bookmark" />
                        </button>
                      </div>
                    </div>

                    <div className="row">
                      <span className="label">대상</span>
                      <span className="section">|</span>
                      <span>{post.target}</span>
                    </div>
                    <div className="row">
                      <span className="label">기간</span>
                      <span className="section">|</span>
                      <span>{post.period}</span>
                    </div>
                    <div className="row">
                      <span className="label">혜택</span>
                      <span className="section">|</span>
                      <span>{post.benefit}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* 페이지네이션 */}
      <div className="pagination">
        <button
          className="icon_btn prev"
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={safePage === 1}
          aria-label="이전 페이지"
        >
          <img src={PrevIcon} alt="" />
        </button>

        {getPageNumbers(safePage, totalPages).map((n, idx) =>
          n === '…' ? (
            <span key={`ellipsis-${idx}`} className="ellipsis">…</span>
          ) : (
            <button
              key={n}
              className="page_btn"
              onClick={() => setPage(n)}
              aria-current={safePage === n ? 'page' : undefined}
              aria-label={`${n} 페이지로 이동`}
            >
              {n}
            </button>
          )
        )}

        <button
          className="icon_btn next"
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={safePage === totalPages}
          aria-label="다음 페이지"
        >
          <img src={NextIcon} alt="" />
        </button>
      </div>
    </div >
  )
}

export default Benefits
