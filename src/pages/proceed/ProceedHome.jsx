import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import profileImage from "../../assets/img/profile2.png";
import step1 from "../../assets/img/step1.png";
import step2 from "../../assets/img/step2.png";
import step3 from "../../assets/img/step3.png";
import Banner1 from "../../assets/img/banner_1.png";
import Banner2 from "../../assets/img/banner_2.png";
import BookmarkOn from "../../assets/img/ic_bookmark_on.svg";
import BookmarkOff from "../../assets/img/ic_bookmark_off.svg";
import CooperationWriteModal from './modal/CooperationWriteModal';

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
const CardGrid = ({ initial }) => {
    const [posts, setPosts] = useState(initial);

    const toggleBookmark = (id) => {
        setPosts(prev =>
            prev.map(p =>
                p.id === id
                    ? { ...p, bookmarked: !p.bookmarked, bookmarkCount: p.bookmarkCount + (p.bookmarked ? -1 : 1) }
                    : p
            )
        );
    };

    if (posts.length === 0) {
        return (
            <div className="empty_message">
                아직 진행 중인 제휴 게시글이 없습니다.<br />
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

const ProceedHome = () => {
    const navigate = useNavigate();
    const [openWriteModal, setOpenWriteModal] = useState(false);

    // 진행 중 목록(더미)
    const dummy = [
        {
            id: 1,
            title: "성신여대 X 카페 스피호 - 상점 제휴",
            image: Banner1,
            target: "성신여대 재학생",
            period: "2025.09.01 ~ 2025.12.31",
            benefit: "아메리카노 20% 할인",
            bookmarkCount: 80,
            bookmarked: false,
            dday: 21,
            negotiable: { target: false, period: true, benefit: true },
        },
        {
            id: 2,
            title: "성신여대 X 요지트 - 상점제휴",
            image: Banner2,
            target: "성신여대 재학생 대상",
            period: "2025.08.01 ~ 2025.09.01",
            benefit: "요거트 300g 이상 구매 시, 과일 토핑 1종 무료 제공",
            bookmarkCount: 32,
            bookmarked: true,
            dday: 22,
            negotiable: { target: true, period: true, benefit: true },
        },
    ];

    const handleSelectFromModal = (path) => {
        setOpenWriteModal(false);
        navigate(path);
    };

    return (
        <div className='Proceedhome_wrap'>
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
                            <button className="list2">
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
                    <div className="subtitle">제휴 맺기</div>
                    <div className="title">
                        <img src={step3} alt="step3" />
                        <h3>진행하기</h3>
                    </div>
                </div>
                <div className="board_top">
                    <div className="tabs">
                        <button type='button' className='tab active' disabled>
                            제휴 게시글
                        </button>
                    </div>
                    <div className="right_tools">
                        <button
                            className="write_btn"
                            onClick={() => setOpenWriteModal(true)}
                        >
                            + 제휴 게시 글쓰기
                        </button>
                    </div>
                </div>
                {/* 탭 컨텐츠 */}
                <div className="board_body">
                    <CardGrid initial={dummy} />
                </div>
            </main >
            <CooperationWriteModal
                open={openWriteModal}
                onClose={() => setOpenWriteModal(false)}
                onSelect={handleSelectFromModal}
            />
        </div >
    )
}

export default ProceedHome