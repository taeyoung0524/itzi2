import React, { useEffect, useState } from "react";
import ShareIcon from '../../../assets/img/share.png';
import BookmarkOn from '../../../assets/img/ic_bookmark_on.svg';
import BookmarkOff from '../../../assets/img/ic_bookmark_off.svg';

const PreviewModal = ({ open, onClose, data }) => {
    // 북마크 상태
    const [bookmarked, setBookmarked] = useState(false);
    const [bookmarkCount, setBookmarkCount] = useState(0);

    // data 들어올 때 초기값 세팅
    useEffect(() => {
        if (data) {
            setBookmarked(data.bookmarked ?? false);
            setBookmarkCount(data.bookmarkCount ?? 0);
        }
    }, [data]);

    // 모달 열렸을 때 바디 스크롤 잠금
    useEffect(() => {
        if (!open) return;
        const original = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = original; };
    }, [open]);

    if (!open) return null;

    // 안전 가드
    const info = data?.author ?? {};
    const kw = Array.isArray(data?.keywords) ? data.keywords : [];

    const toggleBookmark = () => {
        setBookmarked(prev => !prev);
        setBookmarkCount(prev => prev + (bookmarked ? -1 : 1));
    };

    return (
        <div className="previewmodal_backdrop" onClick={onClose}>
            <div
                className="previewmodal_dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="preview-title"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="previewmodal_header">
                    <h3 id="preview-title">미리보기</h3>
                </div>

                <div className="previewmodal_body">
                    <div className="pv_meta_row">
                        <div className="pv_badge">D-{data?.dday ?? 0} 제휴 모집 중</div>
                        <div className="pv_util" aria-hidden>
                            <div className="bookmark_num">{bookmarkCount}</div>
                            <button
                                type="button"
                                className={`pv_icon pv_bookmark ${bookmarked ? 'on' : ''}`}
                                onClick={toggleBookmark}
                                aria-pressed={bookmarked}
                                aria-label="북마크 토글"
                            >
                                <img
                                    src={bookmarked ? BookmarkOn : BookmarkOff}
                                    alt=""
                                    draggable="false"
                                />
                            </button>
                            <button
                                type="button"
                                className="pv_icon pv_share"
                                aria-label="공유"
                                onClick={() => console.log('공유 클릭')}
                            >
                                <img src={ShareIcon} alt="" draggable="false" />
                            </button>
                        </div>
                    </div>

                    <h2 className="pv_title">{data?.title || "제목 없음"}</h2>

                    <div className="pv_summary">
                        <div className="pv_summary_left">
                            <div className="pv_line">
                                <span className="pv_label">대상</span>
                                <span className="pv_sep">|</span>
                                <span className="pv_text">{data?.target || "-"}</span>
                            </div>
                            <div className="pv_line">
                                <span className="pv_label">기간</span>
                                <span className="pv_sep">|</span>
                                <span className="pv_text">
                                    {data?.period || data?.periodText || "-"}
                                </span>
                            </div>
                            <div className="pv_line">
                                <span className="pv_label">혜택</span>
                                <span className="pv_sep">|</span>
                                <span className="pv_text">{data?.benefit || "-"}</span>
                            </div>
                            <div className="pv_line">
                                <span className="pv_label">조건</span>
                                <span className="pv_sep">|</span>
                                <span className="pv_text">{data?.condition || "-"}</span>
                            </div>
                        </div>
                        <div className="pv_summary_right">
                            {data?.postImageUrl ? (
                                <img src={data.postImageUrl} alt="게시 이미지" />
                            ) : (
                                <div className="pv_img_placeholder">이미지 없음</div>
                            )}
                        </div>
                    </div>

                    <div className="pv_section">
                        <h3>상세 내용</h3>
                        <div className="pv_content">
                            {data?.content
                                ? data.content
                                : "상세 내용이 없습니다."}
                        </div>
                    </div>

                    <div className="pv_section">
                        <h3>정보</h3>
                        <div className="pv_info_box">
                            게시글에는 등록한 사용자의 정보가 함께 보여집니다.<br />(예: 매장 정보, 단체 정보 등)
                        </div>
                    </div>
                </div>

                <div className="previewmodal_footer">
                    <button type="button" className="pv_confirm" onClick={onClose}>
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PreviewModal;