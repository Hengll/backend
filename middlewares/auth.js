import passport from 'passport'
import { StatusCodes } from 'http-status-codes'
import jsonwebtoken from 'jsonwebtoken'

export const login = (req, res, next) => {
  // 使用 passport 的 login 驗證方法
  // passport.authenticate(驗證方式名稱, 選項, 處理的function)
  // session: false 停用 cookie
  // (err, user, info) 對應 done() 的三個東西
  passport.authenticate('login', { session: false }, (err, user, info) => {
    // 如果沒有資料或發生錯誤
    if (!user || err) {
      // Local 驗證策略的錯誤，缺少指定欄位的資料
      // 修改訊息為 requestFormatError
      if (info.message === 'Missing credentials') {
        info.message = 'requestFormatError'
      }
      // 對不同的訊息使用不同的狀態碼回應
      if (info.message === 'serverError') {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: info.message,
        })
      } else {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: info.message,
        })
      }
    }
    // 將查詢到的登入使用者放入 req 中給後續的 controller 或 middleware 使用
    req.user = user
    // 繼續下一步
    next()
  })(req, res, next)
}

export const jwt = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, data, info) => {
    console.log(err, data, info)
    if (err || !data) {
      // 是不是 JWT 錯誤，可能是過期、格式不對、secret 驗證失敗
      if (info instanceof jsonwebtoken.JsonWebTokenError) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'userTokenInvalid',
        })
        // 伺服器錯誤，可能是打錯字或出 bug
      } else if (info.message === 'serverError') {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: info.message,
        })
        // 其他錯誤，可能是找不到使用者、使用者沒有這個 jwt
      } else {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: info.message,
        })
      }
    }
    // 將查詢到的使用者放入 req 中給後續的 controller 或 middleware 使用
    req.user = data.user
    req.token = data.token
    // 繼續
    next()
  })(req, res, next)
}
