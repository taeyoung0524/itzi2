import React, { useEffect } from "react";

const DeleteModal = ({ open, onClose, onConfirm, loading = false }) => {
    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const onKey = (e) => {
            if (e.key === "Escape") onClose?.();
        };
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = prev;
            window.removeEventListener("keydown", onKey);
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="delmodal_backdrop" onClick={onClose}>
            <div
                className="delmodal_dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="delmodal-title"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 id="delmodal-title" className="delmodal_title">글 삭제</h3>
                <div className="delmodal_divider" />

                <div className="delmodal_body">
                    <div className="delmodal_msg">글을 삭제하시겠습니까?</div>
                    <div className="delmodal_sub">삭제 후에는 되돌릴 수 없습니다</div>
                </div>

                <div className="delmodal_actions">
                    <button
                        type="button"
                        className="delmodal_btn delmodal_cancel"
                        onClick={onClose}
                    >
                        닫기
                    </button>
                    <button
                        type="button"
                        className="delmodal_btn delmodal_delete"
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? "삭제중..." : "삭제하기"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteModal;