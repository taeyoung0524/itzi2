import x from "../../assets/img/x.png"
import { useState } from "react";

const cooperationModal = ({onClose, onSend}) => {

  return (
    <div className="cooperationModal" onClick={onClose}>
      <div className="box" onClick={(e) => e.stopPropagation()}>
        <div className="header">
          <p>샤브온당</p>
          <img src={x} alt="" onClick={onClose}/>
        </div>
        <div className="content">
            <div className="content_left">
              <div className="content_container1">
                <h3>문의 목적</h3>
                <input type="text" placeholder="ex)예: 학과 행사 간식 제휴, 정기 할인 제휴 등"></input>
              </div>
              <div className="content_container2">
                <h3>희망 제휴 기간</h3>
                <input type="text" placeholder="희망 제휴 시간을 선택 및 작성해주세요"></input>
              </div>
              <div className="content_container2">
                <h3>우리 단체 정보</h3>
                <input type="text" placeholder="우리 단체 기본 정보를 간단히 작성해 주세요."></input>
              </div>
              <div className="content_container3">
                <h3>문의 내용 상세</h3>
                <textarea type="text" placeholder="어떤 혜택과 방식을 원하는지 자유롭게 작성해 주세요."></textarea>
              </div>
              <div className="content_container4">
                <div className="content_header">
                  <h3>AI 작성 요청 키워드 입력</h3>
                  <p>AI 작성 참고용 키워드를 입력해보세요!(10자 이내/최대 5개)</p>
                </div>
                <input type="text" placeholder="ex) 예: 친절함, 제목 필수, 기승전결"></input>
                <div className="ai_keyword_box">

                </div>
              </div>
            </div>
            <div className="content_center"></div>
            <div className="content_right">
                <h3>AI 문의 글 작성</h3>
                <div className="ai_box">
                    <div className="click">
                      <p>AI문의 글 변환</p>
                    </div>
                </div>
            </div>
        </div>
        <div className="Button">
          <div className="sendbutton" onClick={onSend} >
            보내기
          </div>
        </div>
      </div>
    </div>
  )
}

export default cooperationModal
