import React, { useState } from 'react';
import { useNavigate, NavLink, Outlet, useLocation } from "react-router-dom";
import profileImage from "../../assets/img/profile2.png";
import step1 from "../../assets/img/step1.png";
import step2 from "../../assets/img/step2.png";
import step3 from "../../assets/img/step3.png";
import Banner1 from "../../assets/img/coop_banner_1.png";
import Banner2 from "../../assets/img/coop_banner_2.png";
import BookmarkOn from "../../assets/img/ic_bookmark_on.svg";
import BookmarkOff from "../../assets/img/ic_bookmark_off.svg";

const API_BASE = 'https://api.onlyoneprivate.store';

const calcDDay = (exposureEndDate, endDate) => {
    const raw = exposureEndDate || endDate;
    if (!raw) return 0;
    const end = new Date(raw);
    const today = new Date();
    end.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return Math.ceil((end - today) / (1000 * 60 * 60 * 24));
};

const Card = ({ post, onToggleBookmark }) => {
    return (
        <div className="card">
            <div className="thumb">
                <div className="img_wrap">
                    <img src={post.image} alt={post.title} />
                </div>
                <div className="badge">D-{post.dday} 제휴 모집 중</div>
            </div>

            <div className="card_body">
                <div className="title_row">
                    <div className="title">{post.title}</div>
                    <div className="bookmark_wrap">
                        <span className="bookmark_count">{post.bookmarkCount}</span>
                        <button className="bookmark_btn" onClick={() => onToggleBookmark(post.id)}>
                            <img src={post.bookmarked ? BookmarkOn : BookmarkOff} alt="bookmark" />
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
    );
};

/* ---------- 그리드 래퍼 ---------- */
const CardGrid = ({ initial, posts: controlledPosts, onToggleBookmark: controlledToggle }) => {
    const [uncontrolled, setUncontrolled] = useState(initial || []);
    const posts = controlledPosts ?? uncontrolled;

    const toggleBookmark = controlledToggle ?? ((id) => {
        setUncontrolled(prev =>
            prev.map(p =>
                p.id === id
                    ? { ...p, bookmarked: !p.bookmarked, bookmarkCount: Math.max(0, (p.bookmarkCount ?? 0) + (p.bookmarked ? -1 : 1)) }
                    : p
            )
        );
    });

    if (posts.length === 0) {
        return (
            <div className="empty_message">
                아직 작성한 홍보 게시글이 없습니다.<br />
                제휴 외에도 자체 혜택과 이벤트를 자유롭게 홍보해 보세요!
            </div>
        );
    }

    return (
        <div className="category_content">
            <div className="grid">
                {posts.map(p => (
                    <Card key={p.id} post={p} onToggleBookmark={toggleBookmark} />
                ))}
            </div>
        </div>
    );
};

/* ---------- 탭: 제휴 모집 게시글 ---------- */
export const RecruitTab = () => {
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [posts, setPosts] = useState([]);

    // 낙관적 북마크 토글
    const onToggleBookmark = (id) => {
        setPosts(prev =>
            prev.map(p =>
                p.id === id
                    ? { ...p, bookmarked: !p.bookmarked, bookmarkCount: Math.max(0, (p.bookmarkCount ?? 0) + (p.bookmarked ? -1 : 1)) }
                    : p
            )
        );
    };

    React.useEffect(() => {
        const controller = new AbortController();
        const fetchMine = async () => {
            setLoading(true);
            setErrorMsg('');
            try {
                const params = new URLSearchParams();
                params.set('type', 'RECRUITING');
                params.set('userId', '1'); // 요구사항: userId 고정

                const res = await fetch(`${API_BASE}/recruiting/mine?${params.toString()}`, {
                    signal: controller.signal,
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();

                if (data?.error || data?.isSuccess === false) {
                    throw new Error(data?.message || data?.error?.message || '목록을 가져오지 못했습니다.');
                }

                // 명세: result가 배열
                const list = Array.isArray(data?.result) ? data.result : [];
                const normalized = list
                    // DRAFT / PUBLISHED만 온다고 했지만, 혹시 몰라 가드
                    .filter(item => item?.status === 'PUBLISHED' || item?.status === 'DRAFT')
                    .map(item => ({
                        id: item.postId,
                        title: item.title,
                        image: item.postImageUrl || Banner1, // 이미지 없으면 대체 배너
                        target: item.target,
                        period: `${item.startDate || ''} ~ ${item.endDate || ''}`,
                        benefit: item.benefit,
                        bookmarkCount: item.bookmarkCount ?? 0,
                        bookmarked: false, // 서버 토글 API 미정 → 로컬만
                        dday: calcDDay(item.exposureEndDate, item.endDate),
                        negotiable: {
                            target: !!item.targetNegotiable,
                            period: !!item.periodNegotiable,
                            benefit: !!item.benefitNegotiable,
                        },
                        raw: item,
                    }));

                setPosts(normalized);
            } catch (err) {
                if (err?.name === 'AbortError' || err?.message?.includes('aborted')) return;
                setErrorMsg(err?.message || '목록을 가져오지 못했습니다.');
                setPosts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchMine();
        return () => controller.abort();
    }, []);

    if (loading) {
        return <div className="category_content"><div className="loading">불러오는 중...</div></div>;
    }
    if (errorMsg) {
        return <div className="category_content"><div className="error">{errorMsg}</div></div>;
    }

    return <CardGrid posts={posts} onToggleBookmark={onToggleBookmark} />;
};

/* ---------- 탭: 혜택 홍보 게시글 (예시 더미) ---------- */
export const BenefitTab = () => {
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [posts, setPosts] = useState([]);

    const onToggleBookmark = (id) => {
        setPosts(prev =>
            prev.map(p =>
                p.id === id
                    ? { ...p, bookmarked: !p.bookmarked, bookmarkCount: Math.max(0, (p.bookmarkCount ?? 0) + (p.bookmarked ? -1 : 1)) }
                    : p
            )
        );
    };

    React.useEffect(() => {
        const controller = new AbortController();
        const fetchMine = async () => {
            setLoading(true);
            setErrorMsg('');
            try {
                const params = new URLSearchParams();
                params.set('type', 'PROMOTION');
                params.set('userId', '1');

                const res = await fetch(`${API_BASE}/promotion/mine?${params.toString()}`, {
                    signal: controller.signal,
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();

                if (data?.error || data?.isSuccess === false) {
                    throw new Error(data?.message || data?.error?.message || '목록을 가져오지 못했습니다.');
                }

                const list = Array.isArray(data?.result) ? data.result : [];
                const normalized = list
                    .filter(item => item?.status === '' || item?.status === 'DRAFT')
                    .map(item => ({
                        id: item.postId,
                        title: item.title,
                        image: item.postImage || Banner2, // 없으면 배너 대체
                        target: item.target,
                        period: `${item.startDate || ''} ~ ${item.endDate || ''}`,
                        benefit: item.benefit,
                        bookmarkCount: item.bookmarkCount ?? 0,
                        bookmarked: false,
                        dday: calcDDay(item.exposureEndDate, item.endDate),
                        negotiable: {}, // 명세엔 협의 가능 필드 없음
                        raw: item,
                    }));

                setPosts(normalized);
            } catch (err) {
                if (err?.name === 'AbortError' || err?.message?.includes('aborted')) return;
                setErrorMsg(err?.message || '목록을 가져오지 못했습니다.');
                setPosts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchMine();
        return () => controller.abort();
    }, []);

    if (loading) {
        return <div className="category_content"><div className="loading">불러오는 중...</div></div>;
    }
    if (errorMsg) {
        return <div className="category_content"><div className="error">{errorMsg}</div></div>;
    }

    return <CardGrid posts={posts} onToggleBookmark={onToggleBookmark} />;
};

const WriteHome = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const isRecruitTab = location.pathname.includes("/cooperation/write/recruit");
    const isBenefitTab = location.pathname.includes("/cooperation/write/benefit");

    const ctaLabel = isBenefitTab ? "+ 혜택 홍보 글쓰기" : "+ 제휴 모집 글쓰기";
    const ctaTarget = isBenefitTab ? "/cooperation/write/benefit/new" : "/cooperation/write/new";


    // 제휴 요청 가능 on/off
    const [requestable, setRequestable] = useState(true);

    return (
        <div className='Writehome_wrap'>
            <aside className='profile'>
                <div className="myname">
                    <div className="myname_img">
                        <img className="img" src={profileImage} alt="" />
                    </div>
                    <div className="myname_name">
                        <h3>성신총학_소망이랑</h3>
                        <p>성신여자대학교 총학생회</p>
                    </div>
                </div>
                <div className="correction">
                    <button>프로필 수정</button>
                </div>
                <div className="home">
                    <button>홈</button>
                </div>
                <div className="cooperation">
                    <div className="write">
                        <p>게시판 글쓰기</p>
                        <button
                            className="list1"
                            onClick={() => navigate("/cooperation/write/recruit")}
                        >
                            제휴 모집/ 혜택 홍보 글쓰기
                        </button>
                    </div>
                    <div className="step_container">
                        <p>제휴 맺기</p>
                        <div className="step">
                            <button className="list2">
                                <img src={step1} alt="" />
                                <p>선택하기</p>
                            </button>
                            <button className="list2">
                                <img src={step2} alt="" />
                                <p>제휴 맺기</p>
                            </button>
                            <button className="list2" onClick={() => navigate("/proceed")}>
                                <img src={step3} alt="" />
                                <p>진행하기</p>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="logout">
                    <button>로그아웃</button>
                </div>
            </aside>
            <main className='board'>
                <div className="board_head">
                    <div className="subtitle">게시판 글쓰기</div>
                    <h3 className="title">제휴 모집 / 혜택 홍보 글쓰기</h3>
                </div>
                <div className="board_top">
                    <div className="tabs">
                        <NavLink to="/cooperation/write/recruit" className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}>
                            제휴 모집 게시글
                        </NavLink>
                        <NavLink to="/cooperation/write/benefit" className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}>
                            혜택 홍보 게시글
                        </NavLink>
                    </div>
                    <div className="right_tools">
                        <div className="switch_row">
                            <span>제휴 요청 가능 상태</span>
                            <button
                                className={`seg_toggle ${requestable ? 'on' : 'off'}`}
                                onClick={() => setRequestable(v => !v)}
                                aria-pressed={requestable}
                                aria-label={`제휴 요청 가능 ${requestable ? 'on' : 'off'}`}
                                type="button"
                            >
                                <span className="opt off">off</span>
                                <span className="opt on">on</span>
                                <span className="knob" />
                            </button>
                        </div>

                        <button
                            className="write_btn"
                            onClick={() => navigate(ctaTarget)}
                        >
                            {ctaLabel}
                        </button>
                    </div>
                </div>
                {/* 탭 컨텐츠 */}
                <div className="board_body">
                    <Outlet />
                </div>
            </main >
        </div >
    )
}

export default WriteHome
