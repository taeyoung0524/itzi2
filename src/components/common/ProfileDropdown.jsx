import { useNavigate } from "react-router-dom"
import profileImage from "../../assets/img/profile2.png"
import step1 from "../../assets/img/step1.png"
import step2 from "../../assets/img/step2.png"
import step3 from "../../assets/img/step3.png"

const ProfileDropdown = () => {
  const navigate = useNavigate();

  return (
    <div className="profiledropdown">
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
              onClick={() => navigate("cooperation/write")}
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
                <button className="list2" onClick={() => navigate("proceed/")}>
                    <img src={step3} alt="" />
                    <p>진행하기</p>
                </button>
            </div>
        </div>
      </div>
      <div className="logout">
            <button>로그아웃</button>
      </div>
    </div>
  )
}

export default ProfileDropdown
