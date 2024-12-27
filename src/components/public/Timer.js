import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const Timer = ({ mobile }) => {
  const [minutes, setMinutes] = useState(2);
  const [seconds, setSeconds] = useState(0);
  const [resend, setResend] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1);
      }

      if (seconds === 0) {
        if (minutes === 0) {
          clearInterval(interval);
        } else {
          setSeconds(59);
          setMinutes(minutes - 1);
        }
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [seconds, resend]);

  const resendOTP = async () => {
    try {
      const res = await axios.post("auth/get-otp", {
        mobile: mobile
      });
      toast.success(res.data.message)
      setMinutes(2);
      setSeconds(0);
      setResend(true);
    } catch (error) {
      toast.error(error.response.data.message, { autoClose: 2000 })
    }
  };

  return (
    <div className="mt-8 dir-rtl">
      <div className="text-main-blue font-bold text-sm font-[iran-sans] ">
        {seconds > 0 || minutes > 0 ? (
          <p>
            {minutes < 10 ? `0${minutes}` : minutes}:
            {seconds < 10 ? `0${seconds}` : seconds}
          </p>
        ) : (
          <p
            disabled={seconds > 0 || minutes > 0}
            style={{
              color: seconds > 0 || minutes > 0 ? "#DFE3E8" : "#0095ff",
            }}
            onClick={resendOTP}>کد رو نگرفتی؟</p>
        )}
      </div>
    </div>
  );
}

export default Timer;

