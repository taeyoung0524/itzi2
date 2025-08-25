import { Route, Routes, Navigate} from "react-router-dom"
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import RootLayout from "./layouts/RootLayout"
import Benefits from "./pages/home/Benefits"
import Cooperation from "./pages/home/Cooperation"
import BenefitList from "./pages/detailpage/benefitList"
import Cooperationlist from "./pages/detailpage/cooperationlist"
import WriteHome, { BenefitTab, RecruitTab } from "./pages/write/WriteHome"
import CooperationWrite from "./pages/write/CooperationWrite"
import BenefitWrite from "./pages/write/BenefitsWrite";
import ProceedHome from "./pages/proceed/ProceedHome";
import ProceedWrite from "./pages/proceed/ProceedWrite";

const App = () => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Routes>
        <Route element={<RootLayout/>}>
          <Route index element={<Navigate to="/benefits" replace />}/>
          <Route path="benefits" element={<Benefits/>}/>
          <Route path="cooperation" element={<Cooperation/>}/>
          <Route path="promotion/:postId" element={<BenefitList/>}/>
          <Route path="recruiting/:postId" element={<Cooperationlist/>}/>
          <Route path="cooperation/write" element={<WriteHome />}>
            <Route index element={<Navigate to="recruit" replace />} />
            <Route path="recruit" element={<RecruitTab />} />
            <Route path="benefit" element={<BenefitTab />} />
          </Route>
          <Route path="/cooperation/write/new" element={<CooperationWrite />} />
          <Route path="/cooperation/write/benefit/new" element={<BenefitWrite />} />
          <Route path="proceed/" element={<ProceedHome />} />
          <Route path="proceed/write/new" element={<ProceedWrite />} />
        </Route>
      </Routes>
    </LocalizationProvider>
  )
}

export default App
