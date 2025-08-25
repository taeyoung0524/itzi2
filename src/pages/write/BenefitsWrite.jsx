import React, { useEffect, useRef, useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import BackIcon from '../../assets/img/ic_back.svg';
import ImageIcon from '../../assets/img/ic_image.svg';
import ToggleIcon from '../../assets/img/ic_toggle.svg'
import { useNavigate } from 'react-router-dom';
import UploadModal from './modal/UploadModal';
import PreviewModal from './modal/PreviewModal';
import DeleteModal from './modal/DeleteModal';

const ToggleImgIcon = (props) => (
    <img
        src={ToggleIcon}
        alt="toggle"
        style={{ width: 12, height: 6, display: 'block', paddingRight: '2px' }}
        {...props}
    />
);

const MAX_SIZE_MB = 5;

const BenefitsWrite = () => {
    const navigate = useNavigate();

    // 삭제 모달
    const [openDelete, setOpenDelete] = useState(false);
    const [delLoading, setDelLoading] = useState(false);
    const handleDelete = async () => {
        try {
            setDelLoading(true);
            // TODO: API 호출
            // await api.deletePost(postId);
            setOpenDelete(false);
        } finally {
            setDelLoading(false);
        }
    };

    const [endDate, setEndDate] = useState(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [openPreview, setOpenPreview] = useState(false);
    const [detailContent, setDetailContent] = useState("");
    const [storeImageUrl, setStoreImageUrl] = useState("");

    // 기본 정보 입력값 (controlled)
    const [title, setTitle] = useState("");
    const [target, setTarget] = useState("");
    const [period, setPeriod] = useState("");
    const [benefit, setBenefit] = useState("");
    const [condition, setCondition] = useState("");

    // 모두 입력되었는지 체크 (공백 제거)
    const isAIReady = [title, target, period, benefit, condition].every(v => v.trim().length > 0);

    // 포토피커 상태
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [dragOver, setDragOver] = useState(false);
    const inputRef = useRef(null);

    const openPicker = () => inputRef.current?.click();

    const onFileChange = (e) => {
        const f = e.target.files?.[0];
        if (!f) return;

        if (!f.type.startsWith('image/')) {
            alert('이미지 파일만 업로드할 수 있어요.');
            return;
        }
        if (f.size > MAX_SIZE_MB * 1024 * 1024) {
            alert(`파일 크기가 큽니다. 최대 ${MAX_SIZE_MB}MB까지 가능합니다.`);
            return;
        }

        setFile(f);
        setPreviewUrl(URL.createObjectURL(f));
    };

    // 드래그&드롭
    const onDragOver = (e) => { e.preventDefault(); setDragOver(true); };
    const onDragLeave = () => setDragOver(false);
    const onDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files?.[0];
        if (!f) return;
        if (!f.type.startsWith('image/')) { alert('이미지 파일만 업로드할 수 있어요.'); return; }
        if (f.size > MAX_SIZE_MB * 1024 * 1024) { alert(`파일 크기가 큽니다. 최대 ${MAX_SIZE_MB}MB까지 가능합니다.`); return; }
        setFile(f);
        setPreviewUrl(URL.createObjectURL(f));
    };

    // 미리보기 URL 정리
    useEffect(() => {
        return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
    }, [previewUrl]);

    const previewData = {
        dday: 18,
        title,
        target,
        period,            // "2025.09.01 ~ 2025.09.14" 등
        benefit,
        condition,
        content: detailContent, // 상세 내용
        postImageUrl: previewUrl, // 업로드 미리보기
        keywords: ["학생 할인", "이벤트"], // 선택적으로
    };

    return (
        <div className='BenWrite_wrap'>
            <div className="write_header">
                <img src={BackIcon} alt="BackIcon" onClick={() => navigate(-1)} />
                <h3>혜택 홍보 글쓰기</h3>
            </div>
            <div className="write_body">
                <h4>사진 업로드</h4>
                {/* 포토피커 */}
                <div
                    className={`img_section ${previewUrl ? 'has-preview' : ''} ${dragOver ? 'dragging' : ''}`}
                    onClick={!previewUrl ? openPicker : undefined}     // 미리보기일 땐 클릭=변경 방지(버튼만)
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => (!previewUrl && (e.key === 'Enter' || e.key === ' ')) && openPicker()}
                >
                    {!previewUrl ? (
                        <>
                            <img src={ImageIcon} alt="이미지 업로드" />
                            <div className="discription">사진 불러오기</div>
                        </>
                    ) : (
                        <div className="preview_wrap">
                            <img className="preview_img" src={previewUrl} alt="미리보기" />
                            {/* 호버 시 나타나는 오버레이 */}
                            <div className="preview_overlay">
                                <button
                                    type="button"
                                    className="btn_change"
                                    onClick={(e) => { e.stopPropagation(); openPicker(); }}
                                >
                                    변경하기
                                </button>
                            </div>
                        </div>
                    )}

                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={onFileChange}
                    />
                </div>

                <h4>기본 정보</h4>
                <input type="text" className="board_title" placeholder='모집 글 제목' />
                <div className="coop">
                    <input type="text" className="board_input" placeholder='제휴 대상' />
                    <div className="check">
                        <input type='checkbox' id='checkbox' />
                        <div className="able">협의 가능</div>
                    </div>
                </div>
                <div className="coop">
                    <input type="text" className="board_input" placeholder='제휴 기간' />
                    <div className="check">
                        <input type='checkbox' id='checkbox' />
                        <div className="able">협의 가능</div>
                    </div>
                </div>
                <div className="coop">
                    <input type="text" className="board_input" placeholder='제휴 혜택' />
                    <div className="check">
                        <input type='checkbox' id='checkbox' />
                        <div className="able">협의 가능</div>
                    </div>
                </div>
                <div className="coop">
                    <input type="text" className="board_input" placeholder='제휴 조건' />
                    <div className="check">
                        <input type='checkbox' id='checkbox' />
                        <div className="able">협의 가능</div>
                    </div>
                </div>

                <div className="detail_header">
                    <h4>상세 내용</h4>
                    <div className="ai_auto_write">AI 자동 작성</div>
                </div>
                <div className="ai_section">
                    <div className="ai_auto">AI 자동 작성</div>
                    <div className="ai_desc">기본 정보를 입력하신 후 작성할 수 있습니다</div>
                </div>

                <h4>모집 글 노출 기간</h4>
                <div className="date_section">
                    <DatePicker
                        label="모집 글 노출 마감일을 선택해 주세요."
                        value={endDate}
                        onChange={(newValue) => setEndDate(newValue)}
                        format="YYYY.MM.DD"
                        slots={{
                            openPickerIcon: ToggleImgIcon,
                        }}
                        slotProps={{
                            textField: {
                                fullWidth: true,
                                placeholder: "모집 글 노출 마감일을 선택해 주세요.",
                                inputProps: { placeholder: "모집 글 노출 마감일을 선택해 주세요." },
                            },
                        }}
                    />
                </div>
            </div>
            <div className="write_footer">
                <div className="footer_left">
                    <button className='delete' onClick={() => setOpenDelete(true)}>삭제</button>
                    <button className='upload' onClick={() => setShowUploadModal(true)}>업로드</button>
                </div>
                <div className="footer_right">
                    <button className='draft'>임시 저장</button>
                    <button className='preview' onClick={() => setOpenPreview(true)}>미리보기</button>
                </div>
            </div>

            <UploadModal
                open={showUploadModal}
                onClose={() => setShowUploadModal(false)}
            />
            <PreviewModal
                open={openPreview}
                onClose={() => setOpenPreview(false)}
                data={previewData}
            />
            <DeleteModal
                open={openDelete}
                onClose={() => setOpenDelete(false)}
                onConfirm={handleDelete}
                loading={delLoading}
            />
        </div>
    )
}

export default BenefitsWrite
