import prior from "../../assets/img/priorbutton.png"
import colorScrab from "../../assets/img/colorscrab.png"
import share from "../../assets/img/share.png"
import filledStar from "../../assets/img/star.png"
import emptyStar from "../../assets/img/emptystar.png"
import Modal from "./cooperationModal"
import SendModal from "./sendModal";
import CheckSendModal from "./checkSendModal"
import { useState, useEffect } from "react"
import axios from "axios"

const Cooperationlist = () => {

  const [modal, setModal] = useState(null);
  const [data, setData] = useState(null);

  // API 호출 함수 
  const callApi = () => {
    axios.get(`https://api.onlyoneprivate.store/recruiting/${postId}`).then((res) => {
      console.log("res : ", res);
      console.log("res.data : ", res.data);
      setData(res.data);
    })
    .catch((err) => {
      console.log("에러:", err);
    })
  }
  
  const postId = 33;

  const keywords = data?.result?.author?.keywords ?? [];
  const rating = Math.max(0, Math.min(Number(data?.result?.author?.rating ?? 0), 5));
  const filledCount = Math.floor(rating);

  console.log(keywords);
  

  useEffect(() => {
    callApi();
  },[postId]);


  const openCooperation = () => {
    setModal("cooperation");
  }
  const openSend = () => {
    setModal("send");
  }
  const openCheck = () => {
    setModal("check");
  }
  const closeAll = () => {
    setModal(null);
  }

  return (
    <div className="cooperationlist">
      <div className="header">
        <img src={prior} alt="" />
      </div>
      <div className="total">
        <div className="container">
          <div className="inner_header">
            <div className="inner_header_left">
              <div className="day">D-18 제휴 모집 중</div>
              <div className="category">{data?.result?.author?.category}</div>
            </div>
            <div className="inner_header_right">
              <p className="count">{data?.result?.bookmarkCount}</p>
              <img className = "colorscrab" src={colorScrab} alt="" />
              <img className="share" src={share} alt="" />
            </div>
          </div>
          <div className="title">
            <h3>{data?.result?.title}</h3>
          </div>
          <div className="box1">
            <div className="box1_left">
              <div className="line">
                <p className="title">대상</p>
                <p>|</p>
                <p>{data?.result?.target}</p>
              </div>
              <div className="line">
                <p className="title">기간</p>
                <p>|</p>
                <p>2025.09.01 ~ 2025.09.14</p>
              </div>
              <div className="line">
                <p className="title">혜택</p>
                <p>|</p>
                <p>{data?.result?.benefit}</p>
              </div>
              <div className="line">
                <p className="title">조건</p>
                <p>|</p>
                <p>{data?.result?.condition}</p>
              </div>
            </div>
            <div className="box1_right">
              <img src={data?.result?.postImageUrl} alt="" />
            </div>
          </div>
          <div className="detail">
            <h3>상세 내용</h3>
            <div className="content">
              {data?.result?.content}
            </div>
          </div>
          <div className="box2">  
            <h3>정보</h3>
            <div className="shop_detailbox">
              <div className="box2_left">
                <div className="top">
                  <div className="top_left">
                    <img className="storeImage" src={data?.result?.author?.image} alt="" />
                  </div>
                  <div className="top_right">
                    <div className="star">
                        {Array.from({ length: 5 }, (_, i) => (
                          <img
                            key={i}
                            src={i < filledCount ? filledStar : emptyStar}
                            alt={i < filledCount ? "별 채움" : "별 비움"}
                          />
                        ))}
                    </div>
                    <div className="store_name">{data?.result?.author?.name}</div>
                  </div>
                </div>
                <div className="center">
                  <p>{data?.result?.author?.info}</p>
                </div>
                <div className="bottom">
                  {keywords.length>0? (
                    keywords.map((kw,i) => (
                      <div className="tag" key={`${kw}-${i}`}>{kw}</div>
                    ))
                  ) : (
                    <div className="tag">키워드 없음</div>
                  )}
                </div>
              </div>
              <div className="box2_center">

              </div>
              <div className="box2_right">
                <div className="line">
                  <div className="line_title">
                    <p>업종</p>
                    <p>|</p>
                  </div>
                  <p>{data?.result?.author?.category}</p>
                </div>
                <div className="line">
                  <div className="line_title">
                    <p>운영시간</p>
                    <p>|</p>
                  </div>
                  <p>{data?.result?.author?.operatingHours}</p>
                </div>
                <div className="line">
                  <div className="line_title">
                    <p>전화번호</p>
                    <p>|</p>
                  </div>
                  <p>{data?.result?.author?.phone}</p>
                </div>
                <div className="line">
                  <div className="line_title">
                    <p>주소</p>
                    <p>|</p>
                  </div>
                  <p>{data?.result?.author?.address}</p>
                </div>
                <div className="line">
                  <div className="line_title">
                    <p>대표자명</p>
                    <p>|</p>
                  </div>
                  <p>{data?.result?.author?.ownerName}</p>
                </div>
                <div className="line">
                  <div className="line_title">
                    <p>링크</p>
                    <p>|</p>
                  </div>
                  <p>{data?.result?.author?.linkUrl}</p>
                </div>

              </div>
            </div>
          </div>
        </div>
        <div className="cooperation_button" onClick={openCooperation}>
          <p>제휴</p>
          <p>문의하기</p>
        </div>
        {modal === "cooperation" && (
          <Modal onClose={closeAll} onSend={openCheck}/>
        )}
        {modal === "check" && (
          <CheckSendModal onClose={closeAll} onSend={openSend}/>
        )}
        {modal === "send" && <SendModal onClose={closeAll}/>}
      </div>
    </div>
  )
}

export default Cooperationlist
