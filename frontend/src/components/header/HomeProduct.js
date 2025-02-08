import React, { useEffect, useState } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./styles.css"; 
const HomeProduct = () => {
   const COUNTDOWN_DURATION_HOURS = 18; // 👈 Thay đổi giá trị ở đây
   const [hours, setHours] = useState(0);
   const [minutes, setMinutes] = useState(0);
   const [seconds, setSeconds] = useState(0);

   useEffect(() => {
     const getCurrentTimeInVN = () => {
       const now = new Date();
       return new Date(now.getTime() + 7 * 60 * 60 * 1000);
     };

     // Xóa countdown cũ nếu thời lượng thay đổi
     const savedDuration = localStorage.getItem("countdownDuration");
     if (savedDuration !== String(COUNTDOWN_DURATION_HOURS)) {
       localStorage.removeItem("countdown");
       localStorage.setItem("countdownDuration", COUNTDOWN_DURATION_HOURS);
     }

     let targetTime = localStorage.getItem("countdown");

     if (!targetTime) {
       const currentTimeVN = getCurrentTimeInVN();
       targetTime =
         currentTimeVN.getTime() + COUNTDOWN_DURATION_HOURS * 60 * 60 * 1000;
       localStorage.setItem("countdown", targetTime);
     } else {
       targetTime = parseInt(targetTime, 10);
     }

     const countdownInterval = setInterval(() => {
       const currentTimeVN = getCurrentTimeInVN().getTime();
       const remainingTime = targetTime - currentTimeVN;

       if (remainingTime <= 0) {
         clearInterval(countdownInterval);
         setHours(0);
         setMinutes(0);
         setSeconds(0);
         localStorage.removeItem("countdown");
       } else {
         const remainingHours = Math.floor(remainingTime / (1000 * 60 * 60));
         const remainingMinutes = Math.floor(
           (remainingTime / (1000 * 60)) % 60
         );
         const remainingSeconds = Math.floor((remainingTime / 1000) % 60);

         setHours(remainingHours);
         setMinutes(remainingMinutes);
         setSeconds(remainingSeconds);
       }
     }, 1000);

     return () => clearInterval(countdownInterval);
   }, [COUNTDOWN_DURATION_HOURS]);

  const formatTime = (time) => String(time).padStart(2, "0");

  return (
    <div className="home__product bg-pink py-5 d-flex justify-content-center">
      <div className="container content__wrapper">
        <div className="row mb-3">
          {/* Title - Flash sale */}
          <div className="col-12 col-md-6 col-lg-4 text-center text-md-start">
            <h4 className="Flash__sale">Giá Flash sale mỗi ngày</h4>
            <p className="lead__sale mx-5">Giảm giá cục sốc</p>
          </div>

          {/* Countdown Timer */}
          <div className="col-12 col-md-6 col-lg-4 text-center">
            <div className="countdown__home d-flex justify-content-center">
              <div className="countdown-wrap">
                <div className="countdown d-flex justify-content-center">
                  <div className="bloc-time hours mx-3">
                    <div className="figure">
                      <span className="top">{formatTime(hours)[0]}</span>
                      <span className="bottom">{formatTime(hours)[1]}</span>
                    </div>
                    <div className="mt-2">
                      <span className="count__title">Hours</span>
                    </div>
                  </div>

                  <div className="bloc-time min mx-3">
                    <div className="figure">
                      <span className="top">{formatTime(minutes)[0]}</span>
                      <span className="bottom">{formatTime(minutes)[1]}</span>
                    </div>
                    <div className="mt-2">
                      <span className="count__title">Minutes</span>
                    </div>
                  </div>

                  <div className="bloc-time sec mx-3">
                    <div className="figure">
                      <span className="top">{formatTime(seconds)[0]}</span>
                      <span className="bottom">{formatTime(seconds)[1]}</span>
                    </div>
                    <div className="mt-2">
                      <span className="count__title">Seconds</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product card */}
        <div className="row justify-content-center">
      
        </div>

        {/* Footer with button */}
        <div className="footer text-center mt-4">
          <button className="btn btn-lg">Xem tất cả &gt;</button>
        </div>
      </div>
    </div>
  );
};

export default HomeProduct;
