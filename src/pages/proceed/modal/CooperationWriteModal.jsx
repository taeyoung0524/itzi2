import React, { useEffect } from "react";

export default function CooperationWriteModal({ open, onClose, onSelect }) {
    // 모달 열릴 때 스크롤 잠금 (선택)
    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => (document.body.style.overflow = prev);
    }, [open]);

    if (!open) return null;

    const options = [
        { id: "pilot", label: "사브온당", path: "/proceed/write/new" },
    ];

    return (
        <div
            className="cw_overlay"
            onClick={onClose}
            role="presentation"
            aria-modal="true"
        >
            <div
                className="cw_modal"
                onClick={(e) => e.stopPropagation()} // 바닥 클릭만 닫히게
            >
                <div className="cw_header">
                    <h4>제휴 게시 글쓰기</h4>
                    <button className="cw_close" onClick={onClose} aria-label="닫기">
                        ×
                    </button>
                </div>

                <div className="cw_list">
                    {options.map((opt) => (
                        <button
                            key={opt.id}
                            className="cw_item"
                            onClick={() => onSelect(opt.path)}
                        >
                            {opt.label}
                            <span className="cw_chevron">›</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}