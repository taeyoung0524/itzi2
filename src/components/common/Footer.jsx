import instargram from "../../assets/img/instargram.png"
import blog from "../../assets/img/blog.png"

const Footer = () => {
  return (
    <div className='footer'>
      <div className="container">
        <div className="top">
            <p>이용가이드</p>
            <p>고객문의</p>
        </div>
        <div className="bottom">
            <img src={instargram} alt="" />
            <img src={blog} alt="" />
        </div>
      </div>
    </div>
  )
}

export default Footer
