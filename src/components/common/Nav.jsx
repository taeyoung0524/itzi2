import banner1 from "../../assets/img/banner.png"
import banner2 from "../../assets/img/banner2.png"
import alarm from "../../assets/img/alarm.png"
import profile from "../../assets/img/profile2.png"
import { useState } from "react"
import ProfileDropdown from "./ProfileDropdown"
import { NavLink } from "react-router-dom"


const Nav = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleProfile = () => {
        setIsOpen(v => !v);
    }

    return (
    <div className='nav'>
        <div className="container">
            <div className="nav_left">
                <div className="banner">
                    <img className="banner1" src={banner1} alt="" />
                    <img className="banner2" src={banner2} alt="" />
                </div>
                <div className="button_container">
                    <NavLink to="/benefits" className={({ isActive }) => `tab ${isActive ? "active" : ""}`}>혜택이 잇ZI</NavLink>
                    <p>|</p>
                    <NavLink to="/cooperation" className={({ isActive }) => `tab ${isActive ? "active" : ""}`}>제휴를 잇ZI</NavLink>
                </div>
            </div>
            <div className="nav_right">
                <div className="icon_container">
                    <img className="alarm" src={alarm} alt="" />
                    <img className="profile" src={profile} onClick={toggleProfile} alt="" />
                </div>
            </div>
        </div>
        <div className="toggle">
            {isOpen && <ProfileDropdown/>}
        </div>
    </div>
    )
}

export default Nav
