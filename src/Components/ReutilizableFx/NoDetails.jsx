import { useNavigate } from "react-router-dom";

import Btn from "./Btn";

export default function NoDetails(){
    const navigate= useNavigate();

    return(
        <div className="noDetailContainer">
            <h2>Ops! No details available.</h2>
            <h3>Try another anime</h3>
            <img 
                className="noDetailImg" 
                src="/NoDetailImg/AnyaLupa.jpg"
            />
            <Btn className="noDetailBtn"
                onHomeClick={() => navigate("/")}
            />
        </div>
    )
}