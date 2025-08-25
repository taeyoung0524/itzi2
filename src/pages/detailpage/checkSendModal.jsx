const CheckSendModal = ({onClose, onSend}) => {
  return (
    <div className="checkSendModal">
      <div className="box">
        <div className="header">
            <h3>제휴 문의하기</h3>
        </div>
        <div className="center">
            <h3>샤브온당에게 문의 글을 전송하시겠습니끼?</h3>
            <p>전송 후에는 수정이 불가능합니다.</p>
        </div>
        <div className="bottom">
            <div className="button1" onClick={onClose}>닫기</div>
            <div className="button2" onClick={onSend}>전송하기</div>
        </div>
      </div>
    </div>
  )
}

export default CheckSendModal
