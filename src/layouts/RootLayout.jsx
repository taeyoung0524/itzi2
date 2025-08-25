import Footer from "../components/common/Footer"
import Nav from "../components/common/Nav"
import { Outlet } from "react-router-dom"

const RootLayout = () => {
  return (
    <div className="body">
      <Nav/>
      <main className="page-container">
        <Outlet/> 
      </main>
      <Footer/>
    </div>
  )
}

export default RootLayout
