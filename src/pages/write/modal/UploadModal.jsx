import React from "react";

const UploadModal = ({ open, onClose }) => {
    if (!open) return null;

    return (
        <div className="uploadmodal_backdrop" onClick={onClose}>
            <div
                className="uploadmodal_dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="uploadmodal-title"
                aria-describedby="uploadmodal-desc"
                onClick={(e) => e.stopPropagation()} // 배경 클릭만 닫힘
            >
                <h3 id="uploadmodal-title" className="uploadmodal_title">
                    게시글이 업로드 되었습니다!
                </h3>
                <p id="uploadmodal-desc" className="uploadmodal_desc">
                    업로드된 게시글은 언제든지 수정 가능합니다
                </p>
            </div>
        </div>
    );
};

export default UploadModal;