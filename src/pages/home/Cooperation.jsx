import React, { useEffect, useRef, useState, useMemo } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Banner1 from '../../assets/img/coop_banner_1.png';
import Banner2 from '../../assets/img/coop_banner_2.png';
import SearchIcon from '../../assets/img/ic_search.svg';
import SearchingIcon from '../../assets/img/ic_searching.svg';
import BookmarkOn from '../../assets/img/ic_bookmark_on.svg';
import BookmarkOff from '../../assets/img/ic_bookmark_off.svg';
import PrevIcon from '../../assets/img/ic_prev.svg';
import NextIcon from '../../assets/img/ic_next.svg';
import CaretDown from '../../assets/img/ic_caret_down.svg';

const API_BASE = 'https://api.onlyoneprivate.store';
const PAGE_SIZE = 12;

const ORDER_BY_MAP = {
  '마감임박순': 'CLOSING',
  '인기순': 'POPULAR',
  '최신순': 'LATEST',
  '오래된순': 'OLDEST',
};

const TAB_TO_ORGTYPE = {
  '매장': 'STORE',
  '학교': 'SCHOOL',
  '학과': 'DEPARTMENT',
  '동아리/소모임': 'CLUB',
};

const FILTER_TO_KEYWORD = {
  '할인 혜택': '할인',
  '간식 행사': '간식',
  '쿠폰 제공': '쿠폰',
  '체험 부스': '체험',
  '굿즈 증정': '굿즈',
  '설문 참여 리워드': '설문',
  // '협찬'은 명세상 benefit 키워드로 보장되지 않아 서버 전송 생략
};

const SortDropdown = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const options = ['마감임박순', '인기순', '최신순', '오래된순'];

  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const handleBlur = (e) => {
    if (!ref.current?.contains(e.relatedTarget)) setOpen(false);
  };

  return (
    <div className="sort_dropdown" ref={ref} onBlur={handleBlur}>
      <button
        className="sort_button"
        onClick={() => setOpen(true)}
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

const Cooperation = () => {
  const userName = '시현';
  const userUniv = '성신여자대학교';

  const [activeTab, setActiveTab] = useState('전체');

  const [searchTerm, setSearchTerm] = useState('');
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const inputRef = useRef(null);

  const onChangeSearch = (e) => {
    setSearchTerm(e.target.value);
    setSearching(true);
  };
  const onKeyDownSearch = (e) => {
    if (e.key === 'Enter') {
      setQuery(searchTerm.trim());
      setSearching(false);
      inputRef.current?.blur();
    }
    if (e.key === 'Escape') {
      setSearching(false);
      inputRef.current?.blur();
    }
  };
  const onFocusSearch = () => setSearching(true);
  const onBlurSearch = () => setSearching(false);

  const tabs = ['전체', '매장', '학교', '학과', '동아리/소모임'];

  const [sortBy, setSortBy] = useState('마감임박순');

  const filterOptions = [
    '전체',
    '제휴 모집 중',    // 서버 전송X (type=RECRUITING로 이미 필터됨)
    '제휴 요청 가능',  // 서버 전송X (명세 없음)
    '간식 행사',
    '협찬',           // 서버 전송X (명세상 benefit 키워드 불명)
    '행사/이벤트',     // 서버 전송X (명세 없음)
    '할인 혜택',
    '쿠폰 제공',
    '체험 부스',
    '굿즈 증정',
    '설문 참여 리워드',
  ];
  const [selectedFilters, setSelectedFilters] = useState(['전체']);

  const handleFilterClick = (opt) => {
    if (opt === '전체') {
      setSelectedFilters(['전체']);
    } else {
      let updated;
      if (selectedFilters.includes(opt)) {
        updated = selectedFilters.filter((f) => f !== opt);
      } else {
        updated = [...selectedFilters.filter((f) => f !== '전체'), opt];
      }
      if (updated.length === 0) updated = ['전체'];
      setSelectedFilters(updated);
    }
  };

  // ---- 서버 데이터 상태 ----
  const [serverItems, setServerItems] = useState([]); // 표준화된 포맷으로 보관
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 페이지 (UI는 1-base, 서버는 0-base)
  const [page, setPage] = useState(1);

  // 탭/정렬/필터 변경 시 페이지 리셋
  useEffect(() => {
    setPage(1);
  }, [activeTab, selectedFilters, sortBy]);

  // 서버 파라미터 생성
  const orderByParam = ORDER_BY_MAP[sortBy] ?? 'CLOSING';
  const orgTypeParam = TAB_TO_ORGTYPE[activeTab]; // undefined면 전체

  // 서버에 보낼 filters (benefit 키워드만)
  const benefitKeywords = useMemo(() => {
    if (selectedFilters.includes('전체')) return [];
    return selectedFilters
      .map((f) => FILTER_TO_KEYWORD[f])
      .filter(Boolean); // 매핑된 것만
  }, [selectedFilters]);

  // 서버 호출
  useEffect(() => {
    const controller = new AbortController();
    const fetchList = async () => {
      setLoading(true);
      setErrorMsg('');

      try {
        const params = new URLSearchParams();
        params.set('type', 'RECRUITING');
        params.set('orderBy', orderByParam);
        params.set('page', String(Math.max(0, page - 1))); // 0-based
        params.set('size', String(PAGE_SIZE));
        if (orgTypeParam) params.set('orgType', orgTypeParam);
        // filters는 복수 전송
        benefitKeywords.forEach((kw) => params.append('filters', kw));

        const url = `${API_BASE}/recruiting?${params.toString()}`;
        const res = await fetch(url, { signal: controller.signal });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();

        if (data?.isSuccess === false || data?.error) {
          throw new Error(data?.message || data?.error?.message || '목록을 가져오지 못했습니다.');
        }

        // 응답 형태: result가 배열이거나, 페이지 객체일 수 있음
        let content = [];
        let totalPagesFromServer = 1;

        if (Array.isArray(data?.result)) {
          // 참고용 응답 (배열)
          content = data.result;
          totalPagesFromServer = 1;
        } else if (data?.result?.content) {
          // 페이지 객체
          content = data.result.content;
          totalPagesFromServer = Math.max(1, data.result.totalPages ?? 1);
        } else {
          // 방어
          content = [];
          totalPagesFromServer = 1;
        }

        // 표준화: UI가 쓰는 필드로 변환
        const normalized = content.map((item) => {
          const exposureEnd = item.exposureEndDate || item.endDate; // D-day 기준
          const dday = (() => {
            if (!exposureEnd) return 0;
            const end = new Date(exposureEnd);
            const today = new Date();
            // 시간 제거 (현지 자정 기준)
            end.setHours(0, 0, 0, 0);
            today.setHours(0, 0, 0, 0);
            const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
            return diff;
          })();

          return {
            id: item.postId,
            title: item.title,
            image: item.postImageUrl || (Math.random() > 0.5 ? Banner1 : Banner2), // 임시 대체
            target: item.target,
            period: `${item.startDate || ''} ~ ${item.endDate || ''}`,
            benefit: item.benefit,
            bookmarkCount: item.bookmarkCount ?? 0,
            bookmarked: false, // 토글 API 미정 → 로컬 제어
            dday,
            negotiable: {
              target: !!item.targetNegotiable,
              period: !!item.periodNegotiable,
              benefit: !!item.benefitNegotiable,
            },
            raw: item,
          };
        });

        setServerItems(normalized);
        setTotalPages(totalPagesFromServer);
      } catch (err) {
        // 의도된 취소는 에러로 취급하지 않기
        if (err?.name === 'AbortError' || err?.message?.includes('aborted')) {
          return;
        }
        setErrorMsg(err?.message || '목록을 가져오지 못했습니다.');
        setServerItems([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchList();
    return () => controller.abort();
  }, [orderByParam, orgTypeParam, benefitKeywords, page]);

  // 검색어가 있으면 클라이언트 필터링 (명세에 검색 파라미터가 없으므로)
  const filteredByQuery = useMemo(() => {
    if (!query) return serverItems;
    const q = query.toLowerCase();
    return serverItems.filter((p) =>
      [p.title, p.benefit, p.target].some((v) => (v || '').toLowerCase().includes(q))
    );
  }, [serverItems, query]);

  // 현재 페이지 UI용 숫자 목록 (서버 totalPages 사용)
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

  const listRef = useRef(null);
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [page]);

  const toggleBookmark = (id) => {
    setServerItems((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const turningOn = !p.bookmarked;
        return {
          ...p,
          bookmarked: turningOn,
          bookmarkCount: Math.max(0, (p.bookmarkCount ?? 0) + (turningOn ? 1 : -1)),
        };
      })
    );
  };

  return (
    <div className="Cooperation_wrap">
      {/* 이미지 배너 */}
      <div className="banner_wrap">
        <Slider
          dots
          arrows={false}
          infinite
          autoplay
          autoplaySpeed={2000}
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
        <h3>잇ZI와 함께 제휴를 시작해보세요 🙌🏻</h3>
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
              className={`tab_btn ${activeTab === tab ? 'active' : ''}`}
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
          <span style={{ marginRight: 8 }} />
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

      {/* 서버/검색 상태 */}
      <div className="category_content" ref={listRef}>
        {loading && <div className="loading">불러오는 중...</div>}
        {errorMsg && !loading && <div className="error">{errorMsg}</div>}

        {!loading && !errorMsg && (
          <div className="grid">
            {filteredByQuery.length === 0 ? (
              <div className="no_posts">표시할 혜택이 없습니다.</div>
            ) : (
              filteredByQuery.map((post) => (
                <div key={post.id} className="card">
                  <div className="thumb">
                    <div className="img_wrap">
                      <img src={post.image} alt={post.title} />
                    </div>
                    <div className="badge">
                      D-{post.dday} 제휴 모집 중
                    </div>
                  </div>

                  <div className="card_body">
                    <div className="title_row">
                      <div className="title">{post.title}</div>
                      <div className="bookmark_wrap">
                        <span className="bookmark_count">{post.bookmarkCount}</span>
                        <button
                          className="bookmark_btn"
                          onClick={() => toggleBookmark(post.id)}
                        >
                          <img
                            src={post.bookmarked ? BookmarkOn : BookmarkOff}
                            alt="bookmark"
                          />
                        </button>
                      </div>
                    </div>

                    <div className="row">
                      <span className="label">대상</span>
                      <span className="section">|</span>
                      <span>{post.target}</span>
                      {post.negotiable?.target && <span className="tag">협의 가능</span>}
                    </div>
                    <div className="row">
                      <span className="label">기간</span>
                      <span className="section">|</span>
                      <span>{post.period}</span>
                      {post.negotiable?.period && <span className="tag">협의 가능</span>}
                    </div>
                    <div className="row">
                      <span className="label">혜택</span>
                      <span className="section">|</span>
                      <span>{post.benefit}</span>
                      {post.negotiable?.benefit && <span className="tag">협의 가능</span>}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* 페이지네이션 (서버 totalPages 사용) */}
      <div className="pagination">
        <button
          className="icon_btn prev"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          aria-label="이전 페이지"
        >
          <img src={PrevIcon} alt="" />
        </button>

        {getPageNumbers(page, totalPages).map((n, idx) =>
          n === '…' ? (
            <span key={`ellipsis-${idx}`} className="ellipsis">…</span>
          ) : (
            <button
              key={n}
              className={`page_btn ${page === n ? 'active' : ''}`}
              onClick={() => setPage(n)}
              aria-current={page === n ? 'page' : undefined}
              aria-label={`${n} 페이지로 이동`}
            >
              {n}
            </button>
          )
        )}

        <button
          className="icon_btn next"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          aria-label="다음 페이지"
        >
          <img src={NextIcon} alt="" />
        </button>
      </div>
    </div>
  );
};

export default Cooperation;
