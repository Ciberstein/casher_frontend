import Swal from "sweetalert2"
import appError from "./appError"
import api from "../api/axios"

const reSendAuthCode = async (email) => {
    const url = `/api/v1/auth/code`;
    await api.post(url, { email })
      .then(res => { 
        Swal.fire({
          toast: true,
          position: 'bottom-right',
          icon: 'success',
          text: res.data.message,
          showConfirmButton: false,
          timer: 5000,
          timerProgressBar: true,
        })
      })
      .catch(err => { 
        appError(err)
        Swal.fire({
          toast: true,
          position: 'bottom-right',
          icon: 'error',
          text: err.response.data.message,
          showConfirmButton: false,
          timer: 5000,
          timerProgressBar: true,
        });
    })
}

export default reSendAuthCode;